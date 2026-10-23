#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Hanya proses node backend Alfilaha yang boleh dibunuh:
#   - "node server.js" / "node server-update.cjs" (dipanggil relatif, mis. dari ~/alfilaha-backend)
#   - ".../alfilaha*/server.js" atau ".../alfilaha*/server-update.(cjs|js)"
# Server lain (mis. psb-santri) dan vite dev server TIDAK ikut tersentuh.
BACKEND_PATTERN='(^node server\.js$)|(alfilaha.*/server(-update)?\.(cjs|js)$)|(^node server-update\.(cjs|js)$)'

collect_pids() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti :5000 2>/dev/null || true
  elif command -v fuser >/dev/null 2>&1; then
    fuser 5000/tcp 2>/dev/null || true
  elif command -v pgrep >/dev/null 2>&1; then
    pgrep -f "$BACKEND_PATTERN" || true
  fi
}

port_pids="$(collect_pids)"

if [ -n "$port_pids" ]; then
  echo "[ganti_backend] Mematikan backend lama (pid: $(echo "$port_pids" | tr '\n' ' '))..."
  # shellcheck disable=SC2086
  kill $port_pids 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    sleep 1
    [ -z "$(collect_pids)" ] && break
  done
  # shellcheck disable=SC2086
  kill -9 $(collect_pids) 2>/dev/null || true
  sleep 1
fi

if curl -fsS --max-time 2 http://localhost:5000/api/test >/dev/null 2>&1; then
  cat >&2 <<'EOF'
[ganti_backend] GAGAL: port 5000 masih dipakai proses yang tidak dikenali.
Jalankan manual di terminal Anda, lalu ulangi script ini:

  pkill -f 'alfilaha.*/server' ; pkill -f '^node server\.js$'
  sleep 2 ; ./ganti_backend.sh
EOF
  exit 1
fi

node scripts/db-migrate.cjs
exec node server-update.cjs