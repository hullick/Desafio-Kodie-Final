#!/usr/bin/env bash
# Instala as dependências (raiz e web/) só quando o package-lock muda.
# Os node_modules ficam em volumes do Docker, separados dos do host.
set -euo pipefail

instalar() {
  local dir="$1"
  local marca="$dir/node_modules/.lock-hash"
  local hash
  hash="$(sha256sum "$dir/package-lock.json" | cut -d' ' -f1)"
  if [[ ! -f "$marca" || "$(cat "$marca")" != "$hash" ]]; then
    echo "app: instalando dependências de $dir"
    npm ci --prefix "$dir" --no-audit --no-fund
    echo "$hash" > "$marca"
  fi
}

instalar /app
instalar /app/web

exec "$@"
