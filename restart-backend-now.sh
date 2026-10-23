#!/usr/bin/env bash
# Restart backend Alfilaha ke kode terbaru (server-update.cjs) + verifikasi.
# Jalankan di TERMINAL HOST:   bash ~/alfilaha-react/restart-backend-now.sh
set -uo pipefail

PORT="${PORT:-5000}"
REPO_DIR="/home/fauzan/alfilaha-react"
LOG="/tmp/alfilaha-backend.log"

echo "==> 1/4 Mematikan backend lama (port $PORT) ..."
pkill -9 -f 'node server\.js' 2>/dev/null && echo "   pkill 'node server.js' OK" || true
pkill -9 -f 'server-update\.cjs' 2>/dev/null && echo "   pkill 'server-update.cjs' OK" || true
pkill -9 -f 'server-update\.js' 2>/dev/null && echo "   pkill 'server-update.js' OK" || true

if command -v lsof >/dev/null 2>&1; then
  pids="$(lsof -ti "tcp:$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then kill -9 $pids 2>/dev/null && echo "   lsof kill PID: $pids" || true; fi
fi
if command -v ss >/dev/null 2>&1; then
  pids="$(ss -ltnp 2>/dev/null | awk -v p=":$PORT" '$4 ~ p"$" {match($0,/pid=[0-9]+/); if (RSTART) print substr($0,RSTART+4,RLENGTH-4)}' | sort -u)"
  if [ -n "$pids" ]; then kill -9 $pids 2>/dev/null && echo "   ss kill PID: $pids" || true; fi
fi
if command -v fuser >/dev/null 2>&1; then
  fuser -k -9 "${PORT}/tcp" >/dev/null 2>&1 || true
fi

echo "==> 2/4 Menunggu port kosong (maks 20 detik) ..."
tersambung=""
for _ in $(seq 1 20); do
  if ! curl -s -o /dev/null -m 1 "http://localhost:$PORT/api/test"; then
    tersambung="1"
    break
  fi
  sleep 1
done
if [ -z "$tersambung" ]; then
  echo "GAGAL: port $PORT masih dipakai proses yang tidak bisa dibunuh dari sini."
  echo "Cari prosesnya manual, lalu kill -9 <PID>:"
  echo "   lsof -iTCP:$PORT -sTCP:LISTEN   atau   ss -ltnp | grep $PORT"
  exit 1
fi
echo "   Port kosong."

echo "==> 3/4 Menjalankan backend terbaru (log: $LOG) ..."
cd "$REPO_DIR" || exit 1
nohup node server-update.cjs > "$LOG" 2>&1 &
disown 2>/dev/null || true

echo "==> 4/4 Verifikasi ..."
sleep 3
test_out="$(curl -s -m 3 "http://localhost:$PORT/api/test" || true)"
kelas_code="$(curl -s -m 3 -o /dev/null -w '%{http_code}' "http://localhost:$PORT/api/kelas" || true)"
echo "   /api/test : $test_out"
echo "   /api/kelas: HTTP $kelas_code (harus 200)"
if [ "$kelas_code" = "200" ]; then
  echo "SUKSES — backend baru aktif dan route kelas sudah terdaftar."
else
  echo "BELUM BERHASIL — cek log: tail -50 $LOG"
  exit 1
fi
