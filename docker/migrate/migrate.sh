#!/usr/bin/env bash
# Aplica db/migrations/*.sql em ordem alfabética, uma vez cada.
# Idempotente: as já aplicadas ficam em public._migracoes e são puladas.
# Usado pelo serviço migrate, pelo runner de testes e, no futuro, pelo GitHub Actions.
set -euo pipefail

URL="${DATABASE_URL_MIGRACOES:?defina DATABASE_URL_MIGRACOES}"
DIR="${MIGRACOES_DIR:-/migrations}"

psql_() { PGOPTIONS="-c client_min_messages=warning" psql "$URL" -v ON_ERROR_STOP=1 -q "$@"; }

psql_ <<'SQL'
create table if not exists public._migracoes (
  nome text primary key,
  aplicada_em timestamptz not null default now()
);
revoke all on public._migracoes from public;
SQL

aplicadas=0
shopt -s nullglob
for arquivo in "$DIR"/*.sql; do
  nome="$(basename "$arquivo")"
  if [[ ! "$nome" =~ ^[0-9]{14}_[a-z0-9_]+\.sql$ ]]; then
    echo "migrate: nome inválido '$nome' (use AAAAMMDDHHMMSS_descricao.sql)" >&2
    exit 1
  fi
  if [[ -n "$(psql_ -tA -c "select 1 from public._migracoes where nome = '$nome'")" ]]; then
    continue
  fi
  echo "migrate: aplicando $nome"
  psql_ --single-transaction -f "$arquivo" \
    -c "insert into public._migracoes (nome) values ('$nome')"
  aplicadas=$((aplicadas + 1))
done

echo "migrate: $aplicadas migração(ões) aplicada(s)"
