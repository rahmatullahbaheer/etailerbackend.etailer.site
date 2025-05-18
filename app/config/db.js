const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: "localhost",
  //liver db
  //  user: "etaixrxs_rbtech",
  //    password: "OaX&,M19Bh,3",
  //local db
  user: "root",
  password: "root",
  database: "etaixrxs_eTailer",
  port: 3306,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to database successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to database:", err);
  }
})();

module.exports = pool;
