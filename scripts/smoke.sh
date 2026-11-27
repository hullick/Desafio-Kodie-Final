#!/usr/bin/env bash
# Verifica se o ambiente do docker compose está de pé. Sai com código ≠ 0 se algo falhar.
# Uso: ./scripts/smoke.sh   (com o compose no ar: docker compose up -d)
set -uo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "smoke: .env não encontrado (cp .env.example .env)" >&2
  exit 1
fi
set -a; source .env; set +a

APP="http://localhost:${APP_PORTA:-8888}"
MAIL="http://localhost:${MAIL_PORTA:-8025}"
APP_URL="postgresql://nubanko_app:${NUBANKO_APP_PASSWORD}@localhost/nubanko"
falhas=0

check() {
  local descricao="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "  ok    $descricao"
  else
    echo "  FALHA $descricao"
    falhas=$((falhas + 1))
  fi
}

sql() { docker compose exec -T db psql "$APP_URL" -tA -v ON_ERROR_STOP=1 -c "$1"; }
igual() { [[ "$(eval "$1")" == "$2" ]]; }

echo "smoke: banco"
check "nubanko_app conecta" sql "select 1"
check "app.usuario_id() existe e é nulo sem sessão" igual "sql 'select app.usuario_id() is null'" "t"
check "migração base registrada" igual "sql \"select count(*) from pg_namespace where nspname = 'app'\"" "1"

echo "smoke: e-mail"
check "Mailpit responde" curl -fsS "$MAIL/api/v1/messages"

echo "smoke: app (netlify dev)"
check "GET /api/saude → ok" igual "curl -fsS $APP/api/saude" '{"ok":true}'
check "GET /api/nao-existe → 404 JSON" igual "curl -sS -o /dev/null -w %{http_code}:%{content_type} $APP/api/nao-existe" "404:application/json"
check "GET /inicio → index.html do Angular" bash -c "curl -fsS $APP/inicio | grep -q '<nb-root'"

if [[ $falhas -gt 0 ]]; then
  echo "smoke: $falhas verificação(ões) falharam"
  exit 1
fi
echo "smoke: tudo certo"
