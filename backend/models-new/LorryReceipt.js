const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LorryReceipt = new Schema(
  {
    branch: {
      type: String,
      // required: true,
    },
    lrNo: {
      type: String,
      unique: true,
    },
    date: {
      type: String,
    },
    invoiceNo: {
      type: String,
    },
    eWayBillNo: {
      type: String,
    },
    vehicleNo: {
      type: String,
    },
    foNum: {
      type: String,
    },
    consignorGst: {
      type: String,
    },
    consignor: {
      type: String,
      // required: true,
    },
    consignorName: {
      type: String,
      // required: true,
    },
    consignorAddress: {
      type: String,
      // required: true,
    },
    consignorPhone: {
      type: String,
    },
    consignorEmail: {
      type: String,
    },
    consignee: {
      type: String,
      // required: true,
    },
    consigneeGst: {
      type: String,
    },
    consigneeName: {
      type: String,
      // required: true,
    },
    consigneeAddress: {
      type: String,
    },
    consigneePhone: {
      type: String,
    },
    consigneeEmail: {
      type: String,
    },
    from: {
      type: String,
      // required: true,
    },
    to: {
      type: String,
      // required: true,
    },
    deliveryAt: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    deliveryCity: {
      type: String,
    },
    totalFreight: {
      type: Number,
      required: true,
    },
    osc: {
      type: Number,
    },
    otherCharges: {
      type: Number,
    },
    statistical: {
      type: Number,
    },
    hamali: {
      type: Number,
    },
    deliveryCharges: {
      type: Number,
    },
    lrCharges: {
      type: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    materialCost: {
      type: Number,
    },
    deliveryType: {
      type: String,
    },
    deliveryInDays: {
      type: Number,
    },
    serviceTaxBy: {
      type: String,
    },
    payType: {
      type: String,
    },
    toBilled: {
      type: String,
    },
    collectAt: {
      type: String,
    },
    payMode: {
      type: String,
    },
    bankName: {
      type: String,
    },
    chequeNo: {
      type: String,
    },
    chequeDate: {
      type: String,
    },
    remark: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
      /*0 = new, 1 = loading slip generated, 2 = delivered*/
    },
    transactions: [
      {
        article: {
          type: String,
          required: true,
        },
        articleNo: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
        },
        weight: {
          type: Number,
        },
        chargeWeight: {
          type: Number,
        },
        rateType: {
          type: String,
        },
        rate: {
          type: Number,
        },
        freight: {
          type: Number,
          required: true,
        },
        foNum: {
          type: Number,
        },
      },
    ],
    unloadDate: {
      type: String,
      default: null,
    },
    unloadTo: {
      type: String,
    },
    unloadBranch: {
      type: String,
    },
    deliveredTo: {
      type: String,
      default: "",
    },
    close: {
      type: Boolean,
      default: false,
    },
    closeReason: {
      type: String,
    },
    deliveryDate: {
      type: String,
      default: null,
    },
    associatedLS: {
      type: String,
      default: "",
    },
    billGenerated: {
      type: Boolean,
      default: false,
    },
    assoBill: {
      type: String,
      default: "",
    },
    serviceType: {
      type: String,
    },
    ack: {
      type: String,
    },
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
    collection: "lorryReceipt",
    timestamps: true,
  }
);

LorryReceipt.index({ vehicleNo: "text" });

module.exports = mongoose.model("LorryReceipt", LorryReceipt);
