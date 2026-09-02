const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1, role: 'Santri' }, 'rahasia_negara_jangan_disebar_123', { expiresIn: '1h' });
console.log(token);
