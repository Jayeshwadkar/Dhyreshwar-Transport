const mongoose = require("mongoose");
const path = require("path");
const { db } = require("../database/db");
const csv = require("csvtojson");
const Vehicle = require("../models/Vehicle");
const { find } = require("lodash");
const VehicleType = require("../models/VehicleType");
const Supplier = require("../models/Supplier");

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", true);

function isAlphanumeric(inputString) {
  // Regular expression to match both letters and numbers
  const regex = /[a-zA-Z]/.test(inputString) && /\d/.test(inputString);
  return regex;
}

async function init() {
  mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await Vehicle.deleteMany({});
    console.log("Removed existing Vehicles");
    const filePath = path.resolve(process.cwd(), "dumpData", "vehicle.csv");
    const vehicleData = await csv().fromFile(filePath);

   
    let records = 0;
    for (let index = 0; index < vehicleData.length; index++) {
      let param = vehicleData[index];
      
      param = {
        ...param,       
      };
      if (isAlphanumeric(param.vehicleNo)) {
        records += 1;
        await Vehicle.create(param);
      }
    }
    console.log(records + " records");
    console.log("Finished creating Vehicles");
    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (e) {
    console.log("errrrrrrr" + e.message);
  }
}

init();
