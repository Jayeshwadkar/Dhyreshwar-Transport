const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Vehicle = new Schema(
  {
    owner: {
      type: String,
      required: false,
    },
    vehicleType: {
      type: String,
      required: false,
    },
    vehicleNo: {
      type: String,
      required: false,
      unique: false,
    },
    make: {
      type: String,
    },
    capacity: {
      type: String,
    },
    regDate: {
      type: String,
    },
    chassisNo: {
      type: String,
    },
    engineNo: {
      type: String,
    },
    description: {
      type: String,
    },
    expDate: {
      type: String,
    },
    pucNo: {
      type: String,
    },
    pucExpDate: {
      type: String,
    },
    body: {
      type: String,
    },
    taxDetails: [
      {
        taxType: {
          type: String,
          required: false,
        },
        amount: {
          type: String,
          required: false,
        },
        startDate: {
          type: String,
          required: false,
        },
        endDate: {
          type: String,
          required: false,
        },
        description: {
          type: String,
        },
      },
    ],
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
    collection: "vehicle",
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", Vehicle);
