#!/usr/bin/env bash
# Recria o banco de teste do zero, aplica as migrações e roda os testes pgTAP.
# Uso: docker compose --profile test run --rm dbtest [db/tests/arquivo.test.sql ...]
set -euo pipefail

: "${POSTGRES_PASSWORD:?defina POSTGRES_PASSWORD}"
: "${NUBANKO_OWNER_PASSWORD:?defina NUBANKO_OWNER_PASSWORD}"
export PGHOST="${PGHOST:-db}" PGUSER=postgres PGPASSWORD="$POSTGRES_PASSWORD"
BANCO=nubanko_teste

psql -d postgres -v ON_ERROR_STOP=1 -q \
  -c "drop database if exists $BANCO with (force)" \
  -c "create database $BANCO owner nubanko_owner"
psql -d "$BANCO" -v ON_ERROR_STOP=1 -q \
  -c "alter schema public owner to nubanko_owner" \
  -c "revoke create on schema public from public" \
  -c "create extension pgtap"

DATABASE_URL_MIGRACOES="postgresql://nubanko_owner:${NUBANKO_OWNER_PASSWORD}@${PGHOST}/${BANCO}" \
MIGRACOES_DIR=db/migrations \
  migrate.sh

psql -d "$BANCO" -v ON_ERROR_STOP=1 -q -f db/tests/_helpers.sql

if [[ $# -eq 0 ]]; then
  set -- db/tests/*.test.sql
fi
exec pg_prove -d "$BANCO" --failures "$@"
