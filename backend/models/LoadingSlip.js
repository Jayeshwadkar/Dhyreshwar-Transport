const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LoadingSlip = new Schema(
  {
    branch: {
      type: String,
      required: true,
    },
    lsNo: {
      type: Number,
      unique: false,
    },
    date: {
      type: String,
      required: true,
    },
    vehicleNo: {
      type: String,
      required: true,
    },
    vehicleOwner: {
      type: String,
      required: true,
    },
    supplier: {
      type: String,
    },
    vehicleOwnerAddress: {
      type: String,
      required: true,
    },
    vehicleOwnerPhone: {
      type: String,
    },
    driverName: {
      type: String,
      required: true,
    },
    licenseNo: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    from: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
    },
    to: {
      type: String,
      required: true,
    },
    toName: {
      type: String,
    },
    lrList: [
      {
        lrNo: String,
      },
    ],
    toPay: {
      type: Number,
      required: true,
      default: 0,
    },
    billed: {
      type: Number,
      default: 0,
    },
    hire: {
      type: Number,
      default: 0,
    },
    advance: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
    },
    hamali: {
      type: Number,
      default: 0,
    },
    stacking: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    ackBranch: {
      type: String,
      required: false,
    },
    remark: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
      /*0 = un-assigned, 1 = assigned*/
    },
    isLocalMemo: {
      type: Boolean,
      default: false,
    },
    supplierPayments: [],
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
    collection: "loadingSlip",
    timestamps: true,
  }
);

LoadingSlip.index({ vehicleNo: "text" });

module.exports = mongoose.model("LoadingSlip", LoadingSlip);

// to increment the LR no.
// check https://www.npmjs.com/package/mongoose-auto-increment
