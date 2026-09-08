with open('/home/fauzan/alfilaha-backend/server.js', 'r') as f:
    content = f.read()

content = content.replace(r"\'Sehat\'", "'Sehat'")

with open('/home/fauzan/alfilaha-backend/server.js', 'w') as f:
    f.write(content)

print("Fixed server.js")
