const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});
db.connect((err) => {
  if (err) throw err;
  db.query("DELETE FROM log_perawatan WHERE gambar IS NULL OR gambar = ''", (e, result) => {
    if (e) console.error(e);
    else console.log(`Deleted ${result.affectedRows} old logs without photos.`);
    
    // Also let's check if there are any remaining logs
    db.query("SELECT * FROM log_perawatan", (e2, rows) => {
        if(e2) console.error(e2);
        else console.log(`Remaining logs: ${rows.length}`);
        process.exit(0);
    });
  });
});
