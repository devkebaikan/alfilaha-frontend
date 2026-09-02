const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected.");
  
  // Try to drop foreign key if exists
  db.query(`SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'log_perawatan' AND COLUMN_NAME = 'santri_id' AND REFERENCED_TABLE_NAME IS NOT NULL`, (err, results) => {
    if (results && results.length > 0) {
      const fk = results[0].CONSTRAINT_NAME;
      db.query(`ALTER TABLE log_perawatan DROP FOREIGN KEY ${fk}`, (err) => {
        if(err) console.log(err.message);
        alterTable();
      });
    } else {
      alterTable();
    }
  });

  function alterTable() {
    db.query(`ALTER TABLE log_perawatan MODIFY santri_id INT NULL`, (err) => {
      if(err) console.log(err.message);
      console.log("santri_id made NULLABLE");
      
      // Also add nama_perawat if not exists
      db.query(`ALTER TABLE log_perawatan ADD COLUMN nama_perawat VARCHAR(100)`, (err) => {
        if(err && err.code !== 'ER_DUP_FIELDNAME') console.log(err.message);
        console.log("nama_perawat checked");
        process.exit(0);
      });
    });
  }
});
