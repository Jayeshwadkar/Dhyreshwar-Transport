const mongoose = require("mongoose");
const path = require("path");
const { db } = require("../database/db");
const csv = require("csvtojson");
const Employee = require("../models/Employee");

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", true);

async function init() {
  mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await Employee.deleteMany({});
    console.log("Removed existing Employees");
    const filePath = path.resolve(process.cwd(), "dumpData", "employee.csv");
    const data = await csv().fromFile(filePath);
    console.log(data.length + " records");
    await Employee.insertMany(data);
    console.log("Finished creating Employees");
    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (e) {
    console.log(e);
  }
}

init();
