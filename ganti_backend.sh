#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

port_pids=""
if command -v lsof >/dev/null 2>&1; then
  port_pids="$(lsof -ti :5000 2>/dev/null || true)"
elif command -v fuser >/dev/null 2>&1; then
  port_pids="$(fuser 5000/tcp 2>/dev/null || true)"
fi
if [ -z "$port_pids" ] && command -v pgrep >/dev/null 2>&1; then
  port_pids="$(pgrep -f 'node .*server-update\.cjs|node .*alfilaha-backend/server\.js' || true)"
fi

if [ -n "$port_pids" ]; then
  kill $port_pids 2>/dev/null || true
  sleep 2
fi

if curl -fsS --max-time 2 http://localhost:5000/api/test >/dev/null 2>&1; then
  printf '%s\n' 'Port 5000 masih terisi dan tidak dapat dihentikan dari environment ini.' >&2
  exit 1
fi

node scripts/db-migrate.cjs
exec node server-update.cjs