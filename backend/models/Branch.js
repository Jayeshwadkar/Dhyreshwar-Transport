const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Branch = new Schema(
  {
    branchCode: {
      type: String,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    openingBalance: {
      type: Number,
    },
    place: {
      type: String,
      required: true,
    },
    printer: {
      type: String,
    },
    balanceType: {
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
    collection: "branch",
    timestamps: true,
  }
);

module.exports = mongoose.model("Branch", Branch);
