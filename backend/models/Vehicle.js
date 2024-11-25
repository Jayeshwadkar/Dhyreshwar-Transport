const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Vehicle = new Schema(
  {
    owner: {
      type: String,
    },
    vehicleType: {
      type: String,
    },
    vehicleNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
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
          required: true,
        },
        amount: {
          type: String,
          required: true,
        },
        startDate: {
          type: String,
          required: true,
        },
        endDate: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          trim: true
        },
      },
    ],
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
    collection: "vehicle",
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", Vehicle);
