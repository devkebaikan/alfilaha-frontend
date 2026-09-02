const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});
db.connect((err) => {
  if (err) throw err;
  db.query("DROP TABLE IF EXISTS petugas_kebun", (e) => {
    if (e) console.error("Error dropping table:", e);
    else console.log("Table petugas_kebun successfully deleted.");
    process.exit(0);
  });
});
