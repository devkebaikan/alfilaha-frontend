#!/usr/bin/env bash
# Jalankan backend Alfilaha (port 5000) dari repo ini.
# Aman dipanggil berkali-kali: proses backend lama dimatikan dulu.
# Pola di bawah hanya menyasar backend Alfilaha (vite/psb-santri tidak ikut).
BACKEND_PATTERN='(^node server\.js$)|(alfilaha.*/server(-update)?\.(cjs|js)$)|(^node server-update\.(cjs|js)$)'

cd "$(dirname "$0")" || exit 1
pkill -f "$BACKEND_PATTERN" 2>/dev/null
sleep 2
pkill -9 -f "$BACKEND_PATTERN" 2>/dev/null
sleep 1
exec node server-update.cjs