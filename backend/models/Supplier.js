const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Supplier = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    panNo: {
      type: String,
    },
    vendorCode: {
      type: String,
    },
    vatNo: {
      type: String,
    },
    cstNo: {
      type: String,
    },
    eccNo: {
      type: String,
    },
    openingBalance: {
      type: Number,
    },
    openingBalanceType: {
      type: String,
    },
    openingBalanceDate: {
      type: String,
    },
    closingBalance: {
      type: Number,
    },
    closingBalanceType: {
      type: String,
    },
    closingBalanceDate: {
      type: String,
    },
    contactPerson: [
      {
        name: {
          type: String,
        },
        type: {
          type: String,
        },
        designation: {
          type: String,
        },
        email: {
          type: String,
        },
        phone: {
          type: String,
        },
        primaryContact: {
          type: Boolean,
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
    collection: "supplier",
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", Supplier);
