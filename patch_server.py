import re
import sys

with open('/home/fauzan/alfilaha-backend/server.js', 'r') as f:
    content = f.read()

# 1. Update createTanamanQuery
content = re.sub(
    r'(jadwal_siram VARCHAR\(100\),)',
    r'\1\n      jadwal_pupuk VARCHAR(100),\n      jadwal_panen VARCHAR(100),',
    content
)

# 2. Update ALTER TABLE migration
content = re.sub(
    r'(ADD COLUMN IF NOT EXISTS jadwal_siram VARCHAR\(100\),)',
    r'\1\n        ADD COLUMN IF NOT EXISTS jadwal_pupuk VARCHAR(100),\n        ADD COLUMN IF NOT EXISTS jadwal_panen VARCHAR(100),',
    content
)

# 3. Update POST /api/tanaman
content = re.sub(
    r'const \{ nama, jenis, lokasi, deskripsi, kondisi, usia, jadwal_siram, penanggung_jawab, kebutuhan_air, terakhir_dipupuk \} = req\.body;',
    r'const { nama, jenis, lokasi, deskripsi, kondisi, usia, jadwal_siram, jadwal_pupuk, jadwal_panen, penanggung_jawab, kebutuhan_air, terakhir_dipupuk } = req.body;',
    content
)

content = re.sub(
    r'VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)", \[nama, jenis, lokasi, deskripsi, kondisi \|\| \'Sehat\', gambar, usia, jadwal_siram, penanggung_jawab, kebutuhan_air, terakhir_dipupuk\]',
    r'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [nama, jenis, lokasi, deskripsi, kondisi || \'Sehat\', gambar, usia, jadwal_siram, jadwal_pupuk, jadwal_panen, penanggung_jawab, kebutuhan_air, terakhir_dipupuk]',
    content
)

content = re.sub(
    r'kondisi, gambar, usia, jadwal_siram, penanggung_jawab',
    r'kondisi, gambar, usia, jadwal_siram, jadwal_pupuk, jadwal_panen, penanggung_jawab',
    content
)

# 4. Update PUT /api/tanaman/:id (with file)
content = re.sub(
    r'gambar=\?, usia=\?, jadwal_siram=\?, penanggung_jawab=\?, kebutuhan_air=\?, terakhir_dipupuk=\? WHERE id=\?", \[nama, jenis, lokasi, deskripsi, kondisi \|\| \'Sehat\', req\.file\.filename, usia, jadwal_siram, penanggung_jawab, kebutuhan_air, terakhir_dipupuk, req\.params\.id\]',
    r'gambar=?, usia=?, jadwal_siram=?, jadwal_pupuk=?, jadwal_panen=?, penanggung_jawab=?, kebutuhan_air=?, terakhir_dipupuk=? WHERE id=?", [nama, jenis, lokasi, deskripsi, kondisi || \'Sehat\', req.file.filename, usia, jadwal_siram, jadwal_pupuk, jadwal_panen, penanggung_jawab, kebutuhan_air, terakhir_dipupuk, req.params.id]',
    content
)

# Update PUT /api/tanaman/:id (without file)
content = re.sub(
    r'kondisi=\?, usia=\?, jadwal_siram=\?, penanggung_jawab=\?, kebutuhan_air=\?, terakhir_dipupuk=\? WHERE id=\?", \[nama, jenis, lokasi, deskripsi, kondisi \|\| \'Sehat\', usia, jadwal_siram, penanggung_jawab, kebutuhan_air, terakhir_dipupuk, req\.params\.id\]',
    r'kondisi=?, usia=?, jadwal_siram=?, jadwal_pupuk=?, jadwal_panen=?, penanggung_jawab=?, kebutuhan_air=?, terakhir_dipupuk=? WHERE id=?", [nama, jenis, lokasi, deskripsi, kondisi || \'Sehat\', usia, jadwal_siram, jadwal_pupuk, jadwal_panen, penanggung_jawab, kebutuhan_air, terakhir_dipupuk, req.params.id]',
    content
)

with open('/home/fauzan/alfilaha-backend/server.js', 'w') as f:
    f.write(content)

print("Patched server.js")
