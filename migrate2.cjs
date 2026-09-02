const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});

db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
  const addCols = `
    ALTER TABLE log_perawatan 
    ADD COLUMN gambar VARCHAR(255);
  `;
  db.query(addCols, (e) => {
    if (e && e.code !== 'ER_DUP_FIELDNAME') {
        console.log("Migration result:", e.message);
    } else {
        console.log("Migration successful.");
    }
    process.exit(0);
  });
});
