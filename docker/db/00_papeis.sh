#!/usr/bin/env bash
# Roda uma vez, quando o volume do Postgres é criado.
# Cria os papéis da aplicação e entrega o banco ao dono do schema.
# Em produção (Netlify DB/Neon), os mesmos papéis são criados à mão; ver DESENVOLVIMENTO.md.
set -euo pipefail

: "${NUBANKO_OWNER_PASSWORD:?defina NUBANKO_OWNER_PASSWORD no .env}"
: "${NUBANKO_APP_PASSWORD:?defina NUBANKO_APP_PASSWORD no .env}"
: "${NUBANKO_AUTH_PASSWORD:?defina NUBANKO_AUTH_PASSWORD no .env}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v owner_senha="$NUBANKO_OWNER_PASSWORD" \
  -v app_senha="$NUBANKO_APP_PASSWORD" \
  -v auth_senha="$NUBANKO_AUTH_PASSWORD" <<'SQL'
create role nubanko_owner login password :'owner_senha';
create role nubanko_app login nobypassrls password :'app_senha';
-- Só o Better Auth (/api/auth/*) usa este papel; é o único com acesso ao schema auth.
create role nubanko_auth login nobypassrls password :'auth_senha';

alter database nubanko owner to nubanko_owner;
alter schema public owner to nubanko_owner;
revoke create on schema public from public;
SQL
