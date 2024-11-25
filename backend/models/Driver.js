const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Driver = new Schema(
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
    },
    telephone: {
      type: String,
      trim: true
    },
    mobile: {
      type: String,
      trim: true
    },
    fatherName: {
      type: String,
      trim: true
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
      required: true,
      trim: true
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
      trim: true
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
    collection: "driver",
    timestamps: true,
  }
);

module.exports = mongoose.model("Driver", Driver);
