const pool = require('./database/db')

const express = require("express"),
  path = require("path"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  dbConfig = require("./database/db"),
  engines = require("consolidate");

const app = express();
mongoose.set("strictQuery", true);
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/public", express.static("public"));
app.use("/bills", express.static("bills"));
app.engine("html", engines.mustache);
app.set("view engine", "html");

const userRoutes = require("./routes/user-routes");
const masterRoutes = require("./routes/master-routes");
const transactionRoutes = require("./routes/transactions-routes");
app.use("/api/user", userRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/transactions", transactionRoutes);

// mongoose.Promise = global.Promise;
// mongoose
//   .connect(dbConfig.db, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(
//     () => {
//       console.log("Database sucessfully connected");
//     },
//     (error) => {
//       console.log("Database could not connected: " + error);
//     }
//   );

async function connectToDatabase() {
  try {
    await pool.getConnection();
    console.log("Database connected successfully !!");
  } catch (error) {
    console.error("DB Error: ", error);
  }
}

connectToDatabase();

//const port = process.env.PORT || 6901;
//<------------------For Testing---------------->
 const port = 7500
//<--------------------------------------------->
//<------------For Production------------------>
//const port = 50004
//<--------------------------------------------->
const server = app.listen(port, () => {
  console.log(`Connected to port ${port}`);
});
