const fs = require('fs');

let content = fs.readFileSync('server-update.js', 'utf8');

const tableCreation = "`CREATE TABLE IF NOT EXISTS layanan (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`";

// Add to tables array
if (!content.includes('CREATE TABLE IF NOT EXISTS layanan')) {
  content = content.replace(
    /const tables = \[([\s\S]*?)\];/,
    (match, p1) => `const tables = [${p1},\n    ${tableCreation}\n  ];`
  );
}

// Add API endpoints
const apiEndpoints = `
// LAYANAN
app.get('/api/layanan', (req, res) => {
  db.query("SELECT * FROM layanan ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});
app.post('/api/layanan', upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;
  db.query("INSERT INTO layanan (title, description, image) VALUES (?, ?, ?)", [title, description, image], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/layanan/:id', upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  if (req.file) {
    db.query("UPDATE layanan SET title=?, description=?, image=? WHERE id=?", [title, description, req.file.filename, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE layanan SET title=?, description=? WHERE id=?", [title, description, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  }
});
app.delete('/api/layanan/:id', (req, res) => {
  db.query("DELETE FROM layanan WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});
`;

if (!content.includes('/api/layanan')) {
  content = content.replace('// APPOINTMENTS', apiEndpoints + '\n// APPOINTMENTS');
}

fs.writeFileSync('server-update.js', content, 'utf8');
console.log('Server updated');
