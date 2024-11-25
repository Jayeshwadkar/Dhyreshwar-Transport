const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Customer = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },    
    address: {
      type: String,
      trim: true
    },
    telephone: {
      type: String,
      trim: true
    },
    fax: {
      type: String,
    },
    cstNo: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
      trim: true
    },
    email: {
      type: String,
    },
    vendorCode: {
      type: String,
    },
    vatNo: {
      type: String,
    },
    eccNo: {
      type: String,
    },
    closingBalance: {
      type: Number,
    },
    closingBalanceType: {
      type: String,
    },
    openingBalanceType: {
      type: String,
    },
    openingBalance: {
      type: Number,
    },
    contactPerson: [
      {
        name: {
          type: String,
        },
        address: {
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
    collection: "customer",
    timestamps: true,
  }
);

Customer.index({ name: "text", phone: "text", fax: "text", email: "text" });

module.exports = mongoose.model("Customer", Customer);
