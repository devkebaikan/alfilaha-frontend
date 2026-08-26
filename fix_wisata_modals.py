import re

file_path = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Strip out everything from {/* EDIT WISATA MODAL */} to just before {/* DELETE PAKET WISATA MODAL */}
content = re.sub(r'\{\/\* EDIT WISATA MODAL \*\/\}[\s\S]*?(?=\{\/\* DELETE PAKET WISATA MODAL \*\/})', '', content)

with open(file_path, 'w') as f:
    f.write(content)
print("Stripped Wisata Modals")
