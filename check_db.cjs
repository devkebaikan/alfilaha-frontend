const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});
db.connect((err) => {
  db.query("DESCRIBE tanaman", (err, results) => {
    console.log(results);
    process.exit(0);
  });
});
