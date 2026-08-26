const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find and remove from {/* EDIT WISATA MODAL */} to just before {/* DELETE WISATA MODAL */}
// Find and remove from {/* ADD WISATA MODAL */} to just before {/* DELETE WISATA MODAL */}
// Wait, my previous script changed the comment for DELETE WISATA MODAL.
content = content.replace(/\{\/\* EDIT WISATA MODAL \*\/\}[\s\S]*?\{\/\* DELETE WISATA MODAL \*\/\}/, '{/* DELETE WISATA MODAL */}');
content = content.replace(/\{\/\* ADD WISATA MODAL \*\/\}[\s\S]*?\{\/\* DELETE WISATA MODAL \*\/\}/, '{/* DELETE WISATA MODAL */}');
content = content.replace(/\{\/\* EDIT EVENT MODAL \*\/\}[\s\S]*?\{\/\* DELETE EVENT MODAL \*\/\}/, '{/* DELETE EVENT MODAL */}');
content = content.replace(/\{\/\* ADD EVENT MODAL \*\/\}[\s\S]*?\{\/\* DELETE EVENT MODAL \*\/\}/, '{/* DELETE EVENT MODAL */}');

fs.writeFileSync(file, content);
console.log("Modals deleted.");
