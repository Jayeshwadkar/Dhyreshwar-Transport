
const mysql = require("mysql2/promise");

// const pool = mysql.createPool({
//   host: "63.250.52.212",
//   user: "dhayresh_admin",
//   password: "Dhayresh@2024#",
//   database: "dhayresh_db",
//   connectionLimit: 10,
//   multipleStatements: true
// });
//<-------------------For Testing---------------------------------> 
const pool = mysql.createPool({
  host: "63.250.52.212",
  user: "newdhayr_admin",
  password: "NewDhayr_2024#",
  database: "newdhayr_db",
  connectionLimit: 10,
  multipleStatements: true
});
//<------------------------------------------------------->
//<----------------For Production------------------------>
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "dhayresh_admin",
//   password: "NewDhayr_2024#",
//   database: "dhayresh_db",
//   connectionLimit: 10,
//   multipleStatements: true
// });

//<------------------------------------------------------->
// async function connectToDatabase() {
//   try {
//     await pool.getConnection();
//     console.log("Database connected successfully !!");
//   } catch (error) {
//     console.error("DB Error: ", error);
//   }
// }

// connectToDatabase();

module.exports = pool;
