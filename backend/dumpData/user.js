const mongoose = require("mongoose");
const path = require("path");
const { db } = require("../database/db");
const csv = require("csvtojson");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Branch = require("../models/Branch");
const { find } = require("lodash");

function isAlphanumeric(inputString) {
  // Regular expression to match both letters and numbers
  const regex = /[a-zA-Z]/.test(inputString) && /\d/.test(inputString);
  return regex;
}

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", true);

async function init() {
  mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await User.deleteMany({});
    console.log("Removed existing user");
    const employeeFilePath = path.resolve(process.cwd(), "dumpData", "employee.csv");
    const branchFilePath = path.resolve(process.cwd(), "dumpData", "branch.csv");
    const employeeData = await csv().fromFile(employeeFilePath);
    const branchData = await csv().fromFile(branchFilePath);
    const employees = await Employee.find({}, "_id name").lean();
    const branches = await Branch.find({}, "_id name").lean();

    const filePath = path.resolve(process.cwd(), "dumpData", "user.csv");
    const data = await csv().fromFile(filePath);
    console.log(data.length + " records");

    for (let index = 0; index < data.length; index++) {
      let param = data[index];
     
      const oldEmployee = find(
        employeeData,
        ({EmployeeID}) => EmployeeID === param.employee
      );

      const employee = find(
        employees,
        (sup) => sup.name == (oldEmployee && oldEmployee.name)
      );

      const oldBranch = find(
        branchData,
        ({BranchID}) => BranchID === param.branch
      );

      const branch = find(
        branches,
        (sup) => sup.name == (oldBranch && oldBranch.name)
      );
     

      param = {
        ...param,
        employee: employee?._id,
        branch: branch?._id,
      };
      
      await User.create(param);
      
    }
    
    // await User.insertMany(data);
    console.log("Finished creating Places");
    // mongoose.connection.close();
    console.log("Database connection closed");
  } catch (e) {
    console.log(e);
  }
}

init();
