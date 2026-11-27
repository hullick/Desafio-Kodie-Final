#!/usr/bin/env bash
# Prepara um Netlify DB (Neon) para o NuBanko: cria os papéis (uma vez) e aplica as migrações.
# Idempotente: pode rodar de novo a cada release; papéis existentes só têm a senha atualizada.
#
# Uso (as URLs são as *diretas*, não pooled; pegue no painel do Neon ou em `netlify env:get`):
#   NEON_URL_ADMIN='postgresql://neondb_owner:...@ep-xxx.../neondb?sslmode=require' \
#   NUBANKO_OWNER_PASSWORD=... NUBANKO_APP_PASSWORD=... NUBANKO_AUTH_PASSWORD=... \
#   ./scripts/preparar-banco-netlify.sh
#
# Roda o psql num container postgres:17, então só precisa de Docker. Ver DESENVOLVIMENTO.md, seção 14.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${NEON_URL_ADMIN:?defina NEON_URL_ADMIN (URL direta do dono do banco, com sslmode=require)}"
: "${NUBANKO_OWNER_PASSWORD:?}" ; : "${NUBANKO_APP_PASSWORD:?}" ; : "${NUBANKO_AUTH_PASSWORD:?}"

psql_() { docker run --rm -i --network host -e PGOPTIONS="-c client_min_messages=warning" postgres:17 psql "$@"; }

echo "banco: criando papéis"
psql_ "$NEON_URL_ADMIN" -v ON_ERROR_STOP=1 -q \
  -v owner_senha="$NUBANKO_OWNER_PASSWORD" -v app_senha="$NUBANKO_APP_PASSWORD" -v auth_senha="$NUBANKO_AUTH_PASSWORD" <<'SQL'
select format('create role %I login', r) from unnest(array['nubanko_owner','nubanko_app','nubanko_auth']) r
 where not exists (select 1 from pg_roles where rolname = r) \gexec
alter role nubanko_owner login nobypassrls password :'owner_senha';
alter role nubanko_app   login nobypassrls password :'app_senha';
alter role nubanko_auth  login nobypassrls password :'auth_senha';
select format('grant create, connect on database %I to nubanko_owner', current_database()) \gexec
grant usage, create on schema public to nubanko_owner;
-- O dono de public no Neon é o neondb_owner; por isso este grant sai daqui, não das migrações.
grant usage on schema public to nubanko_app, nubanko_auth;
revoke create on schema public from public;
SQL

# A URL do dono do schema é a mesma, trocando usuário e senha.
OWNER_URL="$(python3 - "$NEON_URL_ADMIN" "$NUBANKO_OWNER_PASSWORD" <<'PY'
import sys, urllib.parse as u
p = u.urlsplit(sys.argv[1])
host = p.hostname + (f":{p.port}" if p.port else "")
print(u.urlunsplit((p.scheme, f"nubanko_owner:{u.quote(sys.argv[2], safe='')}@{host}", p.path, p.query, "")))
PY
)"

echo "banco: aplicando migrações"
docker run --rm --network host -e DATABASE_URL_MIGRACOES="$OWNER_URL" \
  -v "$PWD/docker/migrate/migrate.sh:/migrate.sh:ro" -v "$PWD/db/migrations:/migrations:ro" \
  --entrypoint /migrate.sh postgres:17
