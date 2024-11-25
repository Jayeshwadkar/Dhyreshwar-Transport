const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Driver = new Schema(
  {
    code: {
      type: String,
    },
    name: {
      type: String,
      required: false,
    },
    correspondenceAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    qualification: {
      type: String,
    },
    telephone: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
    },
    fatherName: {
      type: String,
    },
    joiningDate: {
      type: String,
    },
    referencedBy: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    eyeSight: {
      type: String,
    },
    licenseNo: {
      type: String,
      required: false,
    },
    renewDate: {
      type: String,
    },
    licenseType: {
      type: String,
    },
    expiryDate: {
      type: String,
    },
    remark: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      // required: function () {
      //   return !this.updatedBy;
      // },
    },
    updatedBy: {
      type: String,
      // required: function () {
      //   return !this.createdBy;
      // },
    },
  },
  {
    collection: "driver",
    timestamps: true,
  }
);

module.exports = mongoose.model("Driver", Driver);
