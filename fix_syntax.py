with open('/home/fauzan/alfilaha-backend/server.js', 'r') as f:
    content = f.read()

content = content.replace("      jadwal_pupuk VARCHAR(100),\n      jadwal_panen VARCHAR(100),\n        ADD COLUMN IF NOT EXISTS penanggung_jawab VARCHAR(100),", "        ADD COLUMN IF NOT EXISTS penanggung_jawab VARCHAR(100),")

with open('/home/fauzan/alfilaha-backend/server.js', 'w') as f:
    f.write(content)

print("Fixed syntax")
