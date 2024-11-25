const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Supplier = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    type: {
      type: String,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
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
          required: false,
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
          required: false,
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
        // return !this.updatedBy;
      },
    },
    updatedBy: {
      type: String,
      required: function () {
        // return !this.createdBy;
      },
    },
  },
  {
    collection: "supplier",
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", Supplier);
