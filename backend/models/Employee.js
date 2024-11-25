const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Employee = new Schema(
  {
    code: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    correspondenceAddress: {
      type: String,
      trim: true
    },
    permanentAddress: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: String,
    },
    qualification: {
      type: String,
      trim: true
    },
    telephone: {
      type: String,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    email: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    joiningDate: {
      type: String,
    },
    designation: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: function () {
        return !this.updatedBy;
      },
    },
    updatedBy: {
      type: String,
      required: function () {
        return !this.createdBy;
      },
    },
  },
  {
    collection: "employee",
    timestamps: true,
  }
);

Employee.index({
  name: "text",
  mobile: "text",
  email: "text",
  designation: "text",
});

module.exports = mongoose.model("Employee", Employee);
