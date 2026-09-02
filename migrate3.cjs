const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});
db.connect((err) => {
  const addCols = `ALTER TABLE log_perawatan ADD COLUMN nama_perawat VARCHAR(100);`;
  db.query(addCols, (e) => {
    if (e && e.code !== 'ER_DUP_FIELDNAME') console.log("Migration error:", e.message);
    else console.log("Added nama_perawat.");
    
    // update existing records so GET query doesn't break if we drop the joins
    const updateQuery = `
      UPDATE log_perawatan l
      LEFT JOIN pendaftar_santri s ON l.perawat_id = s.id AND l.role_perawat = 'Santri'
      LEFT JOIN petugas_kebun p ON l.perawat_id = p.id AND l.role_perawat = 'Petani'
      SET l.nama_perawat = COALESCE(s.nama, p.nama, 'Tanpa Nama')
      WHERE l.nama_perawat IS NULL;
    `;
    db.query(updateQuery, (e2) => {
        if(e2) console.log(e2.message);
        console.log("Migration successful.");
        process.exit(0);
    });
  });
});
