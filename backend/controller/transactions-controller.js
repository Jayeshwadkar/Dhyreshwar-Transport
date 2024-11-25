const pdf = require("html-pdf");
const db = require('../database/db')
const pool = require('../database/db')
const nodemailer = require("nodemailer");
const options2 = {
  format: "A4",
  orientation: "portrait",
  height: "11.69in",
  width: "8.27in",
  timeout: 240000,
  paginationOffset: 1,
  footer: {
    height: "15mm",
    contents: {
      default:
        '<p><span>Software By: Vspace</span><span style="color: #444; float: right;">{{page}}/{{pages}}</span></p>', // fallback value
    },
  },
};
const numWords = require("num-words");
var fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const LorryReceipt = require("../models/LorryReceipt");
const Place = require("../models/Place");
const LoadingSlip = require("../models/LoadingSlip");
const Customer = require("../models/Customer");
const MoneyTransfer = require("../models/MoneyTransfer");
const PettyTransaction = require("../models/PettyTransaction");
const Supplier = require("../models/Supplier");
const Bill = require("../models/Bill");
const Branch = require("../models/Branch");
const Vehicle = require("../models/Vehicle");
const SuppliersBill = require("../models/SuppliersBill");
const Quotation = require("../models/Quotation");
const sendEmail = require("../controller/email");
const { ObjectId } = require("mongodb");
const { some, isNumber, map } = require("lodash");
const dayjs = require("dayjs");

const getLorryReceipts = (req, res, next) => {
  return res.status(200).json({})
  // const query = { active: true };

  // if (req.body.branch) {
  //   query.branch = req.body.branch;
  // }

  // if (req.body.type === "localMemoLS") {
  //   query.status = { $ne: 0 };
  // }

  // LorryReceipt.find(query)
  //   .sort("-lrNo")
  //   .exec((lrError, lorryReceipts) => {
  //     if (lrError) {
  //       return res.status(200).json({
  //         message: "Error fetching lorry receipts!",
  //       });
  //     } else {
  //       res.json(lorryReceipts);
  //     }
  //   });
};

const getLorryReceiptsForLS = async (req, res, next) => {
  try {
    const { branch } = req.body;
    const { filterLR, startDate, endDate, consignee, click } = req.body.freightDetails.filterData;
    let formattedStartDate = null;
    let formattedEndDate = null;

    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistfordc(?,?,?,?,?)';

    let result;
    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [branch, filterLR, formattedStartDate, formattedEndDate, consignee?.customer_id]);
    } else {

      result = await db.query(query, [branch, filterLR, null, null, consignee?.customer_id]);
    }
    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }
    return res.json({
      lorryReceipts: result[0][0],
      isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};

const getLorryReceiptsForLocalMemo = async (req, res, next) => {
  // console.log(req.body)
  try {
    const { branch } = req.body;
    const { filterLR, startDate, endDate, consignee, click } = req.body.freightDetails.filterData;
    let formattedStartDate = null;
    let formattedEndDate = null;

    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistforlm(?,?,?,?,?)';

    let result;
    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [branch, filterLR, formattedStartDate, formattedEndDate, consignee?.customer_id]);
    } else {

      result = await db.query(query, [branch, filterLR, null, null, consignee?.customer_id]);
    }
    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }
    return res.json({
      lorryReceipts: result[0][0],
      isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};



const getlrforloadingsheetedit = async (req, res) => {
  try {
    const { branch, id } = req.body;
    const { filterLR, startDate, endDate, click } = req.body.freightDetails.filterData;
    let formattedStartDate = null;
    let formattedEndDate = null;
    let consignee = req.body.freightDetails.filterData.consignee || '';
    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistfordcedit(?,?,?,?,?,?)';

    let result;
    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [branch, id, filterLR, formattedStartDate, formattedEndDate, consignee.customer_id]);
    } else {

      result = await db.query(query, [branch, id, filterLR, null, null, consignee.customer_id]);
    }
    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }

    return res.json({
      lorryReceipts: result[0][0],
      isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};

const getlrforlocalmemoedit = async (req, res) => {
  try {
    const { branch, id } = req.body;
    const { filterLR, startDate, endDate, click } = req.body.freightDetails.filterData;
    let formattedStartDate = null;
    let formattedEndDate = null;
    let consignee = req.body.freightDetails.filterData.consignee || '';
    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistforlmedit(?,?,?,?,?,?)';

    let result;
    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [branch, id, filterLR, formattedStartDate, formattedEndDate, consignee.customer_id]);
    } else {

      result = await db.query(query, [branch, id, filterLR, null, null, consignee.customer_id]);
    }
    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }

    return res.json({
      lorryReceipts: result[0][0],
      isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};

const fetchAndFormatLrNos = (lrIds) => {
  return new Promise((resolve, reject) => {
    const lrNoQuery =
      'SELECT lm.id, CONCAT((SELECT branch_abbreviation FROM branch WHERE branch_id = lm.branch), "-", lm.lr_no) AS lr_no FROM lorry_reciept_master lm WHERE lm.id IN (?)';

    db.query(lrNoQuery, [lrIds], (err, lrNoResults) => {
      if (err) {
        console.error("Error executing lrNoQuery:", err);
        reject("Server error");
        return;
      }

      resolve(lrNoResults);
    });
  });
};

const getLorryReceiptsForLSdetials = async (req, res) => {
  try {
    const selectedIds = req.body.join(",");

    const query = "CALL getlrdetailsforbill(?)";

    const [results] = await db.query(query, [selectedIds]);
    const formattedResults = results[0].map(item => ({
      ...item,
      // lrno: `${item.branch_code}-${item.lr_no}`
      lrno: item.lrNo
    }));

    return res.json(formattedResults);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Server error");
  }
};



const getLorryReceiptsBySearch = async (req, res, next) => {
  try {
    if (
      !req.body.branch &&
      req.userData &&
      req.userData.type &&
      req.userData.type !== "0"
    ) {
      return res.status(200).json({ message: "Branch ID is required!" });
    }

    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    // const offset = page * pageSize;
    const start_index = page + 1;
    const counts = pageSize;
    const { branch, filterData } = req.body

    if (branch) {
      const query = 'CALL getalllorryreceiptsearchbybranch(?,?,?,?)'
      const result = await db.query(query, [branch, filterData.trim(), start_index, counts])
      const lrdata = result[0][0].map((row) => ({
        ...row,
        total: parseFloat(row.total).toFixed(2)
      }));
      const total = lrdata.length > 0 ? lrdata[0].total_count : 0
      if (result) {
        // const paginatedarticles = lrdata.slice(offset, offset + pageSize)
        return res.status(200).json({
          lorryReceipts: lrdata,
          total: total
        })
      }
      return res.status(200).json({ message: "No Data Found" })
    } else {
      const query = 'CALL getalllorryreceiptsbysearch(?,?,?)'
      const result = await db.query(query, [filterData.trim(), start_index, counts])
      const lrdata = result[0][0].map((row) => ({
        ...row,
        total: parseFloat(row.total).toFixed(2)
      }));
      const total = lrdata.length > 0 ? lrdata[0].total_count : 0
      if (result) {
        // const paginatedarticles = lrdata.slice(offset, offset + pageSize)
        return res.status(200).json({
          lorryReceipts: lrdata,
          total: total
        })
      }
      return res.status(200).json({ message: "No Data Found" })
    }
  } catch (error) {
    console.log("Internal Server Error : ", error);
  }
}

const getLorryReceiptsWithCount = async (req, res, next) => {
  try {
    if (
      !req.body.branch &&
      req.userData &&
      req.userData.type &&
      req.userData.type !== "0"
    ) {
      return res.status(200).json({ message: "Branch ID is required!" });
    }

    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;
    const branch = req.body.branch

    if (branch) {
      const query = 'CALL getalllorryreceiptsbybranchid(?,?,?)'
      const result = await db.query(query, [branch, start_index, counts])
      const lrdata = result[0][0].map((row) => ({
        ...row,
        total: parseFloat(row.total).toFixed(2)
      }));
      const total = lrdata.length > 0 ? lrdata[0].total_count : 0
      if (result[0][0].length) {
        return res.status(200).json({
          lorryReceipts: lrdata,
          total: total
        })
      }
      return res.status(200).json({
        lorryReceipts: [],
        total: 0
      })
    } else {
      const query = 'CALL getalllorryreceipts(?,?)'
      const result = await db.query(query, [start_index, counts])
      const lrdata = result[0][0].map((row) => ({
        ...row,
        total: parseFloat(row.total).toFixed(2)
      }));
      const total = lrdata.length > 0 ? lrdata[0].total_count : 0
      if (result) {
        return res.status(200).json({
          lorryReceipts: lrdata,
          total: total
        })
      }
      return res.status(200).json({
        lorryReceipts: [],
        total: 0
      })
    }
  } catch (error) {
    console.log("Internal Server Error : ", error);
  }
  // try {
  //   if (
  //     !req.body.branch &&
  //     req.userData &&
  //     req.userData.type &&
  //     req.userData.username?.toLowerCase() !== "superadmin"
  //   ) {
  //     return res.status(200).json({ message: "Branch ID is required!" });
  //   }

  //   const limit = req.body.pagination.limit || 1000;
  //   const skip = req.body.pagination.page * limit - limit;

  //   const params = {
  //     active: true,
  //   };

  //   if (req.body.filterData && !isNaN(Number(req.body.filterData))) {
  //     params.lrNo = Number(req.body.filterData);
  //   } else {
  //     params.$or = [
  //       {
  //         consignorName: {
  //           $regex: new RegExp(req.body.filterData || "", "i"),
  //         },
  //       },
  //       {
  //         consigneeName: {
  //           $regex: new RegExp(req.body.filterData || "", "i"),
  //         },
  //       },
  //       {
  //         from: {
  //           $regex: new RegExp(req.body.filterData || "", "i"),
  //         },
  //       },
  //       {
  //         to: {
  //           $regex: new RegExp(req.body.filterData || "", "i"),
  //         },
  //       },
  //       {
  //         date: {
  //           $regex: new RegExp(req.body.filterData || "", "i"),
  //         },
  //       },
  //     ];
  //   }

  //   if (req.body.branch) {
  //     params.branch = req.body.branch;
  //   }

  //   const count = await LorryReceipt.count(params);
  //   const lorryReceipts = await LorryReceipt.find(params)
  //     .sort("-lrNo")
  //     .limit(limit)
  //     .skip(skip);

  //   res.json({
  //     lorryReceipts,
  //     count,
  //     isLastPage: false,
  //   });
  // } catch {
  //   return res.status(200).json({
  //     message: "Error fetching lorry receipts!",
  //   });
  // }
};

const getLRAckWithCount = async (req, res, next) => {
  // if ( 
  //   !req.body.branch ||
  //   !req.body.pagination.page ||
  //   !req.body.pagination.limit
  // ) {
  //   return res
  //     .status(200)
  //     .json({ message: "Branch ID & pagination is required!" });
  // }
  try {
    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    let { startDate, endDate, lrNo, type, searchStr } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    lrNo = lrNo || "";
    type = type || "";
    if (startDate) {
      formattedStartDate = new Date(startDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    }
    const query = 'CALL getlrlistforack(?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [lrNo, formattedStartDate, formattedEndDate, searchStr, start_index, counts]);
    } else {
      result = await db.query(query, [lrNo, null, null, searchStr, start_index, counts])
    }
    if (result) {
      const updateStatus = result[0][0].map((row, index) => ({
        ...row,
        srNo: index + 1,
        payType: (row.pay_type === "0" || row.pay_type === "TBB") ? "TBB" :
          (row.pay_type === "1" || row.pay_type === "To Pay") ? "ToPay" :
            (row.pay_type === "2" || row.pay_type === "Paid") ? "PAID" :
              "",
        deliveryType: (row.delivery_type === "0" || row.delivery_type === "Door") ? "Door" :
          (row.delivery_type === "1" || row.delivery_type === "Godown") ? "Godown" :
            (row.delivery_type === "2" || row.delivery_type === "Office") ? "Office" :
              "",
        unloadTo: (row.unloadTo === "0" || row.unloadTo === "Door") ? "Door" :
          (row.unloadTo === "1" || row.unloadTo === "Godown") ? "Godown" :
            (row.unloadTo === "2" || row.unloadTo === "Office") ? "Office" :
              "",
        total: parseFloat(row.total).toFixed(2)
      }))
      return res.json({
        lorryReceipts: updateStatus,
        count: result[0][1][0].total_count,
        isLastPage: false,
      });
    }

  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({ message: "Internal Server Error" })
  }


  // return

  // const limit = req.body.pagination.limit || 100;
  // const skip = req.body.pagination.page * limit - limit;
  // const start = (req.body.pagination.page - 1) * limit;
  // const end = req.body.pagination.page * limit;

  // const query = {
  //   active: true,
  //   ack: { $nin: ["", null, undefined] },
  // };

  // if (req.body.branch) {
  //   query.branch = req.body.branch;
  // }

  // if (req.body.query.startDate) {
  //   const date = new Date(req.body.query.startDate);
  //   const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //   const newDate = new Date(updatedDate)?.setUTCHours(0, 0, 0, 000);
  //   query.createdAt = {
  //     ...query.createdAt,
  //     $gte: new Date(newDate)?.toISOString(),
  //   };
  // }
  // if (req.body.query.endDate) {
  //   const date = new Date(req.body.query.endDate);
  //   const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //   const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //   query.createdAt = {
  //     ...query.createdAt,
  //     $lte: new Date(newDate)?.toISOString(),
  //   };
  // }

  // if (req.body.query.type === "loaded") {
  //   query.status = 1;
  // }
  // if (req.body.query.type === "unloaded") {
  //   query.unloadDate = { $exists: true, $ne: null };
  // }

  // if (req.body.query.lrNo) {
  //   query.lrNo = new RegExp(req.body.query.lrNo?.toUpperCase());
  // }

  // LorryReceipt.find(query)
  //   .limit(limit)
  //   .skip(skip)
  //   .sort("-createdAt")
  //   .exec(async (lrError, lorryReceipts) => {
  //     if (lrError) {
  //       return res.status(200).json({
  //         message: "Error fetching lorry receipts!",
  //       });
  //     } else {
  //       return res.json({
  //         lorryReceipts: lorryReceipts,
  //         count: lorryReceipts?.length,
  //         isLastPage: false,
  //       });
  //     }
  //   });
};

const getAllLorryReceiptsWithCount = (req, res, next) => {
  if (!req.body.pagination.page || !req.body.pagination.limit) {
    return res.status(200).json({ message: "Pagination inputs not provided!" });
  }

  const limit = req.body.pagination.limit || 100;
  const start = (req.body.pagination.page - 1) * limit;
  const end = req.body.pagination.page * limit;

  const params = {
    active: true,
    // $or: [
    //   {"vehicleNo": {
    //     "$regex": new RegExp(req.body.filterData || "", "i")
    //   }}
    // ]
  };

  LorryReceipt.aggregate([
    { $match: params },
    { $limit: limit },
    { $skip: skip },
    { $sort: { createdAt: -1 } },
  ]).exec((lrError, lorryReceipts) => {
    if (lrError) {
      return res.status(200).json({
        message: "Error fetching lorry receipts!",
      });
    } else {
      const isLastPage = count - (skip + limit) <= 0;
      res.json({
        lorryReceipts: lorryReceipts.slice(start, end),
        count: lorryReceipts?.length,
        isLastPage: false,
      });
    }
  });
};

const getLorryReceiptsByConsignor = async (req, res, next) => {
  if (!req.body.consignor) {
    return res.status(200).json({ message: "Consignor ID is required!" });
  }
  try {
    const { consignor, Branch } = req.body;
    let filterLR, startDate, endDate, consignee, click;
    if (req.body.freightDetails && req.body.freightDetails.filterData) {
      ({ filterLR, startDate, endDate, consignee, click } = req.body.freightDetails.filterData);
    }
    let formattedStartDate = null;
    let formattedEndDate = null;

    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistforbill(?,?,?,?,?,?)';

    let result;
    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [consignor?.customer_id, filterLR, formattedStartDate, formattedEndDate, consignee?.customer_id, Branch.branch_id]);
    } else {

      result = await db.query(query, [consignor?.customer_id, filterLR, null, null, consignee?.customer_id, Branch.branch_id]);

    }
    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }
    return res.json({
      lorryReceipts: result[0][0],
      // isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }

};

const getLorryReceiptsByConsignorEdit = async (req, res, next) => {

  if (!req.body.consignor) {
    return res.status(200).json({ message: "Consignor ID is required!" });
  }
  try {
    const { consignor, id, Branch } = req.body;
    let filterLR, startDate, endDate, consignee, click;
    if (req.body.freightDetails && req.body.freightDetails.filterData) {
      ({ filterLR, startDate, endDate, consignee, click } = req.body.freightDetails.filterData);
    }
    const consn = consignee?.customer_id || null
    let formattedStartDate = null;
    let formattedEndDate = null;

    if (startDate) {
      formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
    }

    if (endDate) {
      formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
    }
    const query = 'CALL lorrymasterlistforbillforedit(?,?,?,?,?,?,?)';

    let result;

    if (formattedStartDate && formattedEndDate) {

      result = await db.query(query, [consignor?.customer_id, id, filterLR, formattedStartDate, formattedEndDate, consn, Branch.branch_id]);
    } else {

      result = await db.query(query, [consignor?.customer_id, id, filterLR, null, null, consn, Branch.branch_id]);

    }

    let checkbox = 0
    if (click && result[0][0].length == 1) {
      checkbox = 1
    } else {
      checkbox = 0
    }
    return res.json({
      lorryReceipts: result[0][0],
      // isLastPage: true,
      checkbox
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }

};
// const getLorryReceiptsForLS = async (req, res, next) => {
//   try {
//     const { branch } = req.body;
//     const { filterLR, startDate, endDate, consignee, click } = req.body.freightDetails.filterData;
//     let formattedStartDate = null;
//     let formattedEndDate = null;

//     if (startDate) {
//       formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
//     }

//     if (endDate) {
//       formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
//     }
//     const query = 'CALL lorrymasterlistfordc(?,?,?,?,?)';

//     let result;
//     if (formattedStartDate && formattedEndDate) {

//       result = await db.query(query, [branch, filterLR, formattedStartDate, formattedEndDate, consignee?.customer_id]);
//     } else {

//       result = await db.query(query, [branch, filterLR, null, null, consignee?.customer_id]);
//     }
//     let checkbox = 0
//     if (click && result[0][0].length == 1) {
//       checkbox = 1
//     } else {
//       checkbox = 0
//     }
//     return res.json({
//       lorryReceipts: result[0][0],
//       isLastPage: true,
//       checkbox
//     });
//   } catch (error) {
//     console.log("Error : ", error);
//     return res.status(500).send(error);
//   }
// };

const sendMailToCustomer = async (res, lr, isUpdate = false) => {
  if (lr.consigneeEmail?.trim?.() || lr.consignorEmail?.trim?.()) {
    let LRData;
    let fetchedConsignor;
    let fetchedConsignee;

    LRData = lr;
    let totalFreight = 0;
    LRData.transactions.forEach((transaction, index) => {
      if (transaction.rate) {
        transaction.rate = parseInt(transaction.rate, 10);
        transaction.rate = transaction.rate?.toFixed?.(2);
      }
      if (transaction.freight) {
        transaction.freight = parseInt(transaction.freight, 10);
        transaction.freight = transaction.freight?.toFixed?.(2);
        totalFreight = totalFreight + parseInt(transaction.freight, 10);
      }
      transaction.hasDesc = transaction.description.trim() !== "";
    });
    LRData.transactions.forEach((transaction, index) => {
      if (index === 0) {
        transaction.totalFreight = totalFreight?.toFixed?.(2);
        transaction.length = LRData.transactions.length;
        transaction.hasValue = true;
      } else {
        transaction.hasValue = false;
      }
    });
    LRData.totalFreight = LRData.totalFreight || totalFreight?.toFixed?.(2);
    LRData.date = getFormattedDate(LRData.date);
    LRData.LRNo = LRData.lrNo;
    LRData.total = LRData.total?.toFixed?.(2);
    LRData.hamali = LRData.hamali?.toFixed?.(2);
    LRData.osc = LRData.osc?.toFixed?.(2);
    LRData.deliveryCharges = LRData.deliveryCharges?.toFixed?.(2);
    LRData.otherCharges = LRData.otherCharges?.toFixed?.(2);
    LRData.statistical = LRData.statistical?.toFixed?.(2);
    LRData.totalWeight = getTotalWeight(LRData.transactions);
    LRData.totalArticles = getTotalArticles(LRData.transactions);
    Customer.findById(LRData.consignee, (consigneeError, consignee) => {
      if (consigneeError) {
        res.json({ message: consigneeError.message });
      }
      fetchedConsignee = consignee;
      Customer.findById(LRData.consignor, (consignorError, consignor) => {
        if (consignorError) {
          res.json({ message: consignorError.message });
        }
        fetchedConsignor = consignor;
        const templatePath =
          path.join(__dirname, "../bills/") + "LR-Receipt-A4.html";
        res.render(
          templatePath,
          {
            info: {
              lr: LRData,
              lrNo: LRData.lrNo,
              consignee: fetchedConsignee,
              consignor: fetchedConsignor,
              createdDate: converDateFormat(LRData.createdAt),
              printDate: converDateFormat(Date.now()),
            },
          },
          (err, HTML) => {
            const fileName = LRData.lrNo;
            var isWin = process.platform === "win32";
            let htmlRaw = HTML;
            if (isWin) {
              htmlRaw = htmlRaw.replace("0.55", "1");
            }
            pdf.create(htmlRaw, options2).toBuffer((buffErr, buffer) => {
              if (buffErr) {
                return res.status(500).json({ message: buffErr.message });
              }
              const base64String = buffer.toString("base64");
              if (lr.consigneeEmail?.trim?.()) {
                sendEmail(
                  lr.consigneeEmail?.trim?.(),
                  base64String,
                  `${fileName}.pdf`,
                  `DTC - Lorry receipt no. ${lr.lrNo}`,
                  `DTC - Lorry receipt no. ${lr.lrNo}`,
                  `<p><b>Hello</b></p><p>Please check ${isUpdate ? "updated" : "created"
                  } lorry receipt</p>`
                );
              }
              if (lr.consignorEmail?.trim?.()) {
                sendEmail(
                  lr.consignorEmail?.trim?.(),
                  base64String,
                  `${fileName}.pdf`,
                  `DTC - Lorry receipt no. ${lr.lrNo}`,
                  `DTC - Lorry receipt no. ${lr.lrNo}`,
                  `<p><b>Hello</b></p><p>Please check ${isUpdate ? "updated" : "created"
                  } lorry receipt</p>`
                );
              }
            });
          }
        );
      });
    });
  }
};
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const addLorryReceipt = async (req, res, next) => {
  // console.log(req.body)
  try {
    const {
      lrNo, date, branch, invoiceNo, eWayBillNo, vehicleNo, consignor, consignorGst, consignorAddress, from,
      consignee, consigneeGst, consigneeAddress, to, deliveryAt, deliveryAddress, deliveryCity,
      totalFreight, hamali, osc, deliveryCharges, otherCharges, statistical, total, materialCost,
      deliveryType, deliveryInDays, payType, toBilled, collectAt, serviceTaxBy, bankName, chequeNo,
      chequeDate, paidPay, remark, user, transactions
    } = req.body

    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // const formattedDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : currentTime;
    const in_lr_no = lrNo ? lrNo : null;
    const currentDate = new Date();

    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const query = 'CALL insert_lr_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message)'

      const result = await connection.query(query, [
        in_lr_no, formattedDate, branch, invoiceNo, eWayBillNo, vehicleNo, consignor, consignorGst, consignorAddress, from,
        consignee, consigneeGst, consigneeAddress, to, deliveryAt || null, deliveryAddress || null, deliveryCity || null,
        totalFreight || null, hamali || null, osc || null, deliveryCharges || null, otherCharges || null, statistical || null, total || null, materialCost || null,
        deliveryType ?? null, deliveryInDays || null, payType ?? null, toBilled ?? null, collectAt || null, serviceTaxBy ?? null, bankName || null, chequeNo || null,
        chequeDate, remark, paidPay || null, user || null, formattedCurrentDate
      ])

      //  console.log(result[0][0][0].message)
      const message = result[0][0][0].message
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message OR handle the error CASE AS needed
      } else {
        if (result) {
          try {
            const { inserted_id } = result[0][0][0]

            const transactionData = transactions.map((row) => [row.srNo, row.article, row.articleNo,
            row.description, row.weight, row.chargeWeight, row.rateType, row.rate, row.freight, inserted_id])

            const query2 = `INSERT INTO transactions_lr (sr_no, articles, no_of_articles,
                  description,actual_wt, char_wt, rate_per, rate, inv_amt, lr_master_id) VALUES ?`;

            const transResult = connection.query(query2, [transactionData])

            await connection.commit();
            connection.release();
            return res.status(200).json(result[0][0])
          } catch (error) {
            await connection.rollback();
            console.error("Error in executing the transaction: ", error);
            return res.status(500).json({ message: 'Error in Add LR', error });
          }
        } else {
          await connection.rollback();
          console.error("Error in executing the add stored procedure: ", error);
          return res.status(500).json({ message: 'Error in Add LR', error });
        }
      }
      // return res.json({ message: "Error in Add LR" })
    } catch (error) {
      await connection.rollback();
      console.error("Error in executing the add LR: ", error);
      return res.status(500).json({ message: 'Error in Add LR', error });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.log("Error in add lr master : ", error);
    return res.status(500).json(error)
  }
};

const checkDuplicateLR = async (req, res) => {
  try {
    const { lrNo, branch } = req.body
    const query = 'CALL checkduplicatelr(?,?)'

    const result = await db.query(query, [lrNo, branch])
    const { message } = result[0][0][0]
    if (message.length > 0) {
      return res.status(200).json({
        message: message,
        status: false,
      });
    } else {
      return res.status(200).json({
        status: true,
      });
    }
  } catch (error) {
    console.log("Error in check duplicate LR : ", error);
    return res.status(500).send(error)
  }
};

const removeLorryReceipt = async (req, res, next) => {
  try {
    const { id } = req.params

    const query = `CALL delete_lr_master(?,@message)`

    const result = await db.query(query, id);
    console.log(result[0][0][0].message)
    if (result) {
      return res.status(200).json(result[0][0])
    }
  } catch (error) {

  }
  // if (!req.params.id) {
  //   return res.status(200).json({ message: "Lorry receipt ID is required!" });
  // }
  // const query = {
  //   lrList: {
  //     $elemMatch: {
  //       _id: req.params.id,
  //     },
  //   },
  //   active: true,
  // };
  // LoadingSlip.findOne(query).exec((lrError, found) => {
  //   if (lrError) {
  //     return res.status(200).json({
  //       message: "Error fetching lorry receipts!",
  //     });
  //   } else {
  //     // if (found) {
  //     //   return res.status(200).json({
  //     //     message: `This LR is used in Challan ${found.lsNo}. First, delete the challan.`,
  //     //   });
  //     // }

  //     LorryReceipt.findByIdAndDelete(req.params.id, (error, data) => {
  //       if (error) {
  //         res.status(200).json({ message: error.message });
  //       } else {
  //         res.json({ id: data._id });
  //       }
  //     });
  //   }
  // });
};

const viewLorryReceipt = async (req, res, next) => {
  const DELIVERY_TYPES = [
    { label: "Door", value: 0 },
    { label: "Godown", value: 1 },
    { label: "Office", value: 2 },
  ];
  const PAY_TYPES = [
    { label: "TBB", value: 0 },
    { label: "ToPay", value: 1 },
    { label: "Paid", value: 2 },
    { label: "FOC", value: 3 },
  ];
  const TO_BILLED = [
    { label: "Consignor", value: 0 },
    { label: "Consignee", value: 1 },
    { label: "Third party", value: 2 },
  ];
  const SERVICE_TAX_BY = [
    { label: "Consignor", value: 0 },
    { label: "Consignee", value: 1 },
    { label: "NA", value: 2 },
  ];

  try {
    const lrid = req.params.id;
    const query = `CALL getlorryreceiptforprint(?)`;
    const query2 = `CALL get_transactionlrbyid(?)`;
    const LRDataObj = await db.query(query, lrid);
    let fileName;

    if (LRDataObj) {
      const TransactionData = await db.query(query2, lrid);

      const {
        lr_number, id, lr_date, invoiceNo, eWayBillNo, truck_tempo_number, consigner, consigner_address,
        consignee, consignee_address, deliveryAt, deliveryAddress, deliveryCity, loc_from, loc_to,
        freight, hamali, osc, deliveryCharges, other_charges, statatical, material_cost, total, delivery_type,
        pay_type, to_billed, serviceTaxBy, branch, remarks, consignorgst, consigneegst,
      } = LRDataObj[0][0][0];

      const payT = (label) => {
        if (!isNaN(label) && typeof label === 'string') {
          return label;
        }
        const deliveryType = PAY_TYPES.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null;
      };

      const deliveryT = (label) => {
        if (!isNaN(label) && typeof label === 'string') {
          return label;
        }
        const deliveryType = DELIVERY_TYPES.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null;
      };

      const toobT = (label) => {
        if (!isNaN(label) && typeof label === 'string') {
          return label;
        }
        const deliveryType = TO_BILLED.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null;
      };

      const serviceT = (label) => {
        if (!isNaN(label) && typeof label === 'string') {
          return label;
        }
        const deliveryType = SERVICE_TAX_BY.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null;
      };

      const transactions = TransactionData[0][0].map((row) => ({
        article: row.articles || "",
        articleNo: parseInt(row.no_of_articles),
        description: row.description || "",
        weight: row.actual_wt || "",
        chargeWeight: row.char_wt || 0,
        rateType: row.rate_per || null,
        rate: row.rate || 0,
        freight: row.inv_amt || 0,
        _id: row.sr_no,
      }));

      let totalFreight = 0;
      transactions.forEach((transaction) => {
        if (transaction.rate) {
          transaction.rate = parseFloat(transaction.rate).toFixed(2);
        }
        if (transaction.freight) {
          transaction.freight = parseFloat(transaction.freight).toFixed(2);
          totalFreight += parseFloat(transaction.freight);
        }
        transaction.hasDesc = transaction.description.trim() !== "";
      });

      transactions.forEach((transaction, index) => {
        if (index === 0) {
          transaction.totalFreight = totalFreight > 0 ? totalFreight.toFixed(2) : "";
          transaction.length = transactions.length;
          transaction.hasValue = true;
        } else {
          transaction.hasValue = false;
        }
      });

      let LRData = {
        _id: id,
        branch: branch,
        lrNo: lr_number,
        date: lr_date,
        invoiceNo: invoiceNo,
        eWayBillNo: eWayBillNo,
        vehicleNo: truck_tempo_number,
        consignorGst: consignorgst,
        consignor: consigner,
        consignorAddress: consigner_address,
        consignee: consignee,
        consigneeGst: consigneegst,
        consigneeAddress: consignee_address,
        from: loc_from || "",
        to: loc_to || "",
        deliveryAt: deliveryAt || DELIVERY_TYPES[deliveryT(delivery_type)].label,
        deliveryAddress: deliveryAddress,
        deliveryCity: deliveryCity,
        totalFreight: freight || "",
        osc: osc || "",
        otherCharges: other_charges || "",
        statistical: statatical || "",
        hamali: hamali || "",
        deliveryCharges: deliveryCharges || "",
        total: total || "",
        materialCost: parseFloat(material_cost) || 0,
        payType: PAY_TYPES[payT(pay_type)].label || "",
        toBilled: TO_BILLED[toobT(to_billed)].label || "",
        deliveryType: DELIVERY_TYPES[deliveryT(delivery_type)].label || "",
        serviceTaxBy: SERVICE_TAX_BY[serviceT(serviceTaxBy)].label || "",
        remark: remarks || "",
        transactions: transactions || [],
        totalWeight: getTotalWeight(transactions) || "",
        totalArticles: getTotalArticles(transactions) || "",
      };

      LRData.totalFreight = LRData.totalFreight && !isNaN(LRData.totalFreight) && parseInt(LRData.totalFreight) !== 0 ? parseFloat(LRData.totalFreight).toFixed(2) : "";
      // LRData.totalFreight =
      //   LRData.totalFreight || totalFreight
      //     ? (LRData.totalFreight || totalFreight)?.toFixed?.(2)
      //     : "";
      LRData.date = getFormattedDate(LRData.date);
      LRData.total = LRData.total && !isNaN(LRData.total) && parseInt(LRData.total) !== 0 ? parseFloat(LRData.total).toFixed(2) : "";
      LRData.hamali = LRData.hamali && !isNaN(LRData.hamali) && parseInt(LRData.hamali) !== 0 ? parseFloat(LRData.hamali).toFixed(2) : "";
      LRData.osc = LRData.osc && !isNaN(LRData.osc) && parseInt(LRData.osc) !== 0 ? parseFloat(LRData.osc).toFixed(2) : "";
      LRData.deliveryCharges = LRData.deliveryCharges && !isNaN(LRData.deliveryCharges) && parseInt(LRData.deliveryCharges) !== 0 ? parseFloat(LRData.deliveryCharges).toFixed(2) : "";
      LRData.otherCharges = LRData.otherCharges && !isNaN(LRData.otherCharges) && parseInt(LRData.otherCharges) !== 0 ? parseFloat(LRData.otherCharges).toFixed(2) : "";
      LRData.statistical = LRData.statistical && !isNaN(LRData.statistical) && parseInt(LRData.statistical) !== 0 ? parseFloat(LRData.statistical).toFixed(2) : "";
      LRData.totalWeight = getTotalWeight(LRData.transactions) || "";
      LRData.totalArticles = getTotalArticles(LRData.transactions) || "";
      if (req.body.sendmail && req.body.email && req.body.email.trim() !== "") {
        const toEmail = req.body.email;
        const queryCustomer = 'CALL getaddressbook(?)';
        const queryInsert = 'CALL insertaddressbook(?)';

        // Check if the email already exists in the address book
        const [customerResults] = await db.query(queryCustomer, [toEmail]);
        if (customerResults[0].length === 0) {
          // Email doesn't exist, so insert it
          await db.query(queryInsert, [toEmail]);
          console.log("Email successfully added to address book");
        } else {
          console.log('Email already exists in the address book');
        }
      }
      const templatePath = path.join(__dirname, "../bills/") + "LR-Receipt-A4.html";
      res.render(
        templatePath,
        {
          info: {
            lr: LRData,
            printDate: converDateFormat(Date.now()),
          },
        },
        (err, HTML) => {
          fileName = LRData.lrNo;
          if (err) {
            console.log(err.message)
            return res.status(500).json({ message: err.message });
          }

          var isWin = process.platform === "win32";
          let htmlRaw = HTML;
          if (isWin) {
            htmlRaw = htmlRaw.replace("0.55", "1");
          }
          pdf.create(htmlRaw, options2).toBuffer((buffErr, buffer) => {
            if (buffErr) {
              console.log(buffErr.message)
              return res.status(500).json({ message: buffErr.message });
            }
            const base64String = buffer.toString("base64");
            if (req.body.email && req.body.email.trim() !== "") {

              sendEmail(
                req.body.email,
                base64String,
                `${fileName}.pdf`,
                `DTC - Lorry receipt no. ${fileName}`,
                `DTC - Bill no. ${fileName}`,
                // `<p><b>Hello</b></p><p>Please find attached lorry receipt.</p>`
                `${req.body.message ?
                  `<p>${req.body.message}</p>` :
                  `<p><b>Hello</b></p><p>Please find attached lorry receipt.</p>`
                }`
              )

                .then(() => res.json({ success: true }))
                .catch((err) => res.status(401).json({ message: err.message }));
            } else {

              return res.json({ file: base64String, lrnum: LRData.lrNo });
            }
          });
        }
      );
    }
  } catch (error) {
    console.log("Error in view lr: ", error);
    return res.status(500).json(error);
  }
};
const sendMail = (toEmail) => {
  return new Promise((resolve, reject) => {
    console.log("toEmail", toEmail);
    const queryCustomer = 'CALL getaddressbook(?)';
    const queryInsert = 'CALL insertaddressbook(?)';

    // Check if the email already exists in the address book
    db.query(queryCustomer, [toEmail], (err, customerResults) => {
      if (err) {
        console.error('Error executing customer query:', err);
        return reject(err); // Reject promise if there's an error
      }

      // Ensure that customerResults[0] exists and is an array
      if (customerResults && customerResults[0] && customerResults[0].length === 0) {
        // Email doesn't exist, so insert it
        db.query(queryInsert, [toEmail], (err) => {
          if (err) {
            console.error('Error executing insert query:', err);
            return reject(err); // Reject if error occurs during insert
          } else {
            console.log("Email successfully added to address book");
            return resolve(); // Resolve promise after successful insertion
          }
        });
      } else {
        console.log('Email already exists in the address book');
        return resolve(); // Resolve if email already exists
      }
    });
  });
};


// const transporter = nodemailer.createTransport({
//   host: 'dhayreshwartransport.com',
//   port: 587,
//   secure: false, 
//   auth: {
//     user: 'support@dhayreshwartransport.com', 
//     pass: 'Support@2023#' 
//   },
//   tls: {
//     rejectUnauthorized: false 
//   },

// });

// const sendEmails = (to, base64Content, fileName, subject, text, html) => {
//   console.log(to);

//   const mailOptions = {
//     from: '"DTC Support" <support@dhayreshwartransport.com>',
//         to: to,
//         subject: subject,
//         text: text,
//         html: html,
//         attachments: [
//           {
//             filename: fileName,
//             content: base64Content,
//             encoding: "base64",
//           },
//         ],
//   };

//   // Return a new Promise
//   return new Promise((resolve, reject) => {
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error.message);  // Log the actual error message
//         return reject(error);  // Reject the Promise with error
//       } else {
//         console.log('Email sent successfully:', info.response);  // Log success
//         return resolve(info);  // Resolve the Promise with info
//       }
//     });
//   });
// };

const getLorryReceipt = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Lorry receipt ID is required!" });
  }

  const DELIVERY_TYPES = [
    { label: "Door", value: 0 },
    { label: "Godown", value: 1 },
    { label: "Office", value: 2 },
  ];
  const PAY_TYPES = [
    { label: "TBB", value: 0 },
    { label: "ToPay", value: 1 },
    { label: "Paid", value: 2 },
    { label: "FOC", value: 3 },
  ];
  const TO_BILLED = [
    { label: "Consignor", value: 0 },
    { label: "Consignee", value: 1 },
    { label: "Third party", value: 2 },
  ];
  const SERVICE_TAX_BY = [
    { label: "Consignor", value: 0 },
    { label: "Consignee", value: 1 },
    { label: "NA", value: 2 },
  ];
  try {
    const query1 = `CALL getlrmasterbyid(?)`
    const query2 = `CALL getcustomerbyid(?)`
    const query3 = `CALL get_transactionlrbyid(?)`

    const data = await db.query(query1, req.params.id)
    const transData = await db.query(query3, req.params.id)

    const transaction = transData[0][0]?.map((row, index) => ({
      article: row.articles || "",
      articleNo: row.no_of_articles || "",
      description: row.description || "",
      weight: row.actual_wt || "",
      chargeWeight: row.char_wt || "",
      rateType: row.rate_per || "",
      rate: row.rate || "",
      freight: row.inv_amt || "",
      id: index + 1
    }))

    let deliveryAt;
    let deliveryAtData;
    if (data) {
      const consignor = await db.query(query2, data[0][0][0].consigner)
      const consignee = await db.query(query2, data[0][0][0].consignee)
      if (data[0][0][0].deliveryAt) {
        deliveryAt = await db.query(query2, data[0][0][0].deliveryAt)
      }

      // const { customer_id, customer_name, address, gstno, city } = consignee[0][0][0]
      const consignorData = {
        customer_id: consignor[0][0][0].customer_id || null,
        customer_name: consignor[0][0][0].customer_name || "",
        gstNo: consignor[0][0][0].gstno || "",
        address: consignor[0][0][0].address || "",
        city: consignor[0][0][0].city || "",
        emailid: consignor[0][0][0].emailid || "",
      }

      const consigneeData = {
        customer_id: consignee[0][0][0].customer_id || null,
        customer_name: consignee[0][0][0].customer_name || "",
        gstNo: consignee[0][0][0].gstno || "",
        address: consignee[0][0][0].address || "",
        city: consignee[0][0][0].city || "",
        emailid: consignee[0][0][0].emailid || "",
      }

      if (deliveryAt) {
        deliveryAtData = {
          customer_id: deliveryAt[0][0][0].customer_id || null,
          customer_name: deliveryAt[0][0][0].customer_name || "",
          gstNo: deliveryAt[0][0][0].gstno || "",
          address: deliveryAt[0][0][0].address || "",
          city: deliveryAt[0][0][0].city || ""
        }
      }

      const {
        // upper data
        id, branch, lr_no, lr_date, truck_tempo_number, deliveryAddress, deliveryCity, invoiceNo,
        eWayBillNo, loc_from, loc_to, consigner_address, consignee_address,
        // middle data
        freight, hamali, osc, deliveryCharges, other_charges, statatical, total, lrNo,
        // bottom data
        material_cost, delivery_type, delivery_days, pay_type, to_billed, collect_at_branch, serviceTaxBy,
        remarks, paidPay
      } = data[0][0][0]

      // console.log(data[0][0])

      const getValueDT = (label) => {
        // Check if label is a string that represents a number
        if (!isNaN(label) && typeof label === 'string') {
          return label; // Return the string number directly
        }

        // If it's not a number, find the corresponding value for the label
        const deliveryType = DELIVERY_TYPES.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null; // Return value or null if not found
      };

      const getValuePT = (label) => {
        // Check if label is a string that represents a number
        if (!isNaN(label) && typeof label === 'string') {
          return label; // Return the string number directly
        }

        // If it's not a number, find the corresponding value for the label
        const deliveryType = PAY_TYPES.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null; // Return value or null if not found
      };

      const getValueTB = (label) => {
        // Check if label is a string that represents a number
        if (!isNaN(label) && typeof label === 'string') {
          return label; // Return the string number directly
        }

        // If it's not a number, find the corresponding value for the label
        const deliveryType = TO_BILLED.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null; // Return value or null if not found
      };

      const getValueST = (label) => {
        // Check if label is a string that represents a number
        if (!isNaN(label) && typeof label === 'string') {
          return label; // Return the string number directly
        }

        // If it's not a number, find the corresponding value for the label
        const deliveryType = SERVICE_TAX_BY.find((type) => type.label === label);
        return deliveryType ? deliveryType.value : null; // Return value or null if not found
      };

      // console.log("DT : ", getValueDT(delivery_type))
      // console.log("PT : ", getValuePT(pay_type))
      // console.log("TB : ", getValueTB(to_billed))
      // console.log("ST : ", getValueST(serviceTaxBy))


      const finalObject = {
        _id: id,
        branch: branch || "",
        vehicleNo: truck_tempo_number || null,
        deliveryAt: deliveryAtData || null,
        deliveryAddress: deliveryAddress || "",
        deliveryCity: deliveryCity || "",
        lrNo: lrNo || "",
        paidPay: paidPay,
        date: lr_date || new Date(),
        invoiceNo: invoiceNo || "",
        eWayBillNo: eWayBillNo || "",
        foNum: "",
        consignor: consignorData,
        consignorAddress: consigner_address || "",
        consignee: consigneeData || null,
        consigneeAddress: consignee_address || "",
        from: loc_from || "",
        to: loc_to || "",
        totalFreight: freight || "",
        hamali: hamali || "",
        deliveryCharges: deliveryCharges || "",
        otherCharges: other_charges || "",
        lrCharges: "",
        osc: osc || "",
        statistical: statatical || "",
        total: total || "",
        materialCost: material_cost || "",
        deliveryInDays: delivery_days || "",
        deliveryType: String(getValueDT(delivery_type)),
        collectAt: collect_at_branch || null,
        payMode: null,
        bankName: "",
        chequeNo: "",
        chequeDate: null,
        remark: remarks || "",
        transactions: [],
        payType: String(getValuePT(pay_type)),
        toBilled: String(getValueTB(to_billed)),
        serviceTaxBy: String(getValueST(serviceTaxBy)),
        transactions: transaction || []
      }
      return res.status(200).json(finalObject)
    }
  } catch (error) {
    console.log("Error in fetch LR by id : ", error)
    return res.status(500).json(error)
  }
};

const updateLorryReceipt = async (req, res, next) => {
  // console.log(req.body)
  try {
    const id = req.body._id;

    if (!req.params.id || !id) {
      return res.status(200).json({ message: "Lorry receipt ID is required!" });
    }
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');

    const {
      lrNo, date, branch, invoiceNo, eWayBillNo, vehicleNo, consignor, consignorGst, consignorAddress, from,
      consignee, consigneeGst, consigneeAddress, to, deliveryAt, deliveryAddress, deliveryCity,
      totalFreight, hamali, osc, deliveryCharges, otherCharges, statistical, total, materialCost,
      deliveryType, deliveryInDays, payType, toBilled, collectAt, serviceTaxBy, bankName, chequeNo,
      chequeDate, remark, paidPay, user, transactions
    } = req.body

    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // const formattedDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : currentTime;

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const query = 'CALL update_lr_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, @message)'

      const result = await connection.query(query, [
        id, lrNo, formattedDate, branch, invoiceNo, eWayBillNo, vehicleNo, consignor, consignorGst, consignorAddress, from,
        consignee, consigneeGst, consigneeAddress, to, deliveryAt || null, deliveryAddress || null, deliveryCity || null,
        totalFreight || null, hamali || null, osc || null, deliveryCharges || null, otherCharges || null, statistical || null, total || null, materialCost || null,
        deliveryType ?? null, deliveryInDays || null, payType ?? null, toBilled ?? null, collectAt || null, serviceTaxBy ?? null, bankName, chequeNo,
        chequeDate, remark || "", paidPay || null, user || null, formattedCurrentDate
      ])

      console.log(result[0][0][0].message)
      const message = result[0][0][0].message
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message OR handle the error CASE AS needed
      } else {
        if (result) {
          try {

            const transactionData = transactions.map((row) => [row?._id || row.srNo, row.article, row.articleNo,
            row.description, row.weight, row.chargeWeight, row.rateType, row.rate, row.freight, id])

            const query2 = `INSERT INTO transactions_lr (sr_no, articles, no_of_articles,
                  description,actual_wt, char_wt, rate_per, rate, inv_amt, lr_master_id) VALUES ?`;

            const transResult = connection.query(query2, [transactionData])

            await connection.commit();
            connection.release();
            return res.status(200).json(result[0][0])
          } catch (error) {
            await connection.rollback();
            console.error("Error in executing the transaction: ", error);
            return res.status(500).json({ message: 'Error in update LR', error });
          }
        } else {
          await connection.rollback();
          console.error("Error in executing the update stored procedure: ", error);
          return res.status(500).json({ message: 'Error in update LR', error });
        }
      }
      // return res.json({ message: "Error in Add LR" })
    } catch (error) {
      await connection.rollback();
      console.error("Error in executing the update LR: ", error);
      return res.status(500).json({ message: 'Error in update LR', error });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.log("Error in add lr master : ", error);
    return res.status(500).json(error)
  }

  let model = {
    branch: req.body.branch,
    paidPay: req.body.payType === "Paid" ? req.body.paidPay : "",
    lrNo: req.body.lrNo?.trim?.(),
    date: req.body.date,
    invoiceNo: req.body.invoiceNo?.trim?.(),
    eWayBillNo: req.body.eWayBillNo?.trim?.(),
    foNum: req.body.foNum?.trim?.(),
    consignor: req.body.consignor?.trim?.(),
    consignorName: req.body.consignorName?.trim?.(),
    consignorAddress: req.body.consignorAddress?.trim?.(),
    consignorPhone: req.body.consignorPhone?.trim?.(),
    consignorEmail: req.body.consignorEmail?.trim?.(),
    from: req.body.from?.trim?.(),
    consignee: req.body.consignee?.trim?.(),
    consigneeName: req.body.consigneeName?.trim?.(),
    consigneeAddress: req.body.consigneeAddress?.trim?.(),
    consigneePhone: req.body.consigneePhone?.trim?.(),
    consigneeEmail: req.body.consigneeEmail?.trim?.(),
    to: req.body.to?.trim?.(),
    materialCost: req.body.materialCost?.trim?.(),
    deliveryType: req.body.deliveryType?.trim?.(),
    deliveryInDays: req.body.deliveryInDays?.trim?.(),
    serviceTaxBy: req.body.serviceTaxBy?.trim?.(),
    payType: req.body.payType,
    toBilled: req.body.toBilled,
    collectAt: req.body.collectAt,
    payMode: req.body.payMode,
    bankName: req.body.bankName?.trim?.(),
    chequeNo: req.body.chequeNo,
    chequeDate: req.body.chequeDate,
    remark: req.body.remark,
    transactions: req.body.transactions,
    totalFreight: req.body.totalFreight,
    hamali: req.body.hamali,
    deliveryCharges: req.body.deliveryCharges,
    lrCharges: req.body.lrCharges,
    total: req.body.total,
    unloadDate: req.body.unloadDate,
    deliveryDate: req.body.deliveryDate,
    deliveredTo: req.body.deliveredTo,
    close: req.body.close,
    updatedBy: req.body.updatedBy,
    otherCharges: req.body.otherCharges,
    vehicleNo: req.body.vehicleNo,
    deliveryAt: req.body.deliveryAt,
    deliveryAddress: req.body.deliveryAddress,
    deliveryCity: req.body.deliveryCity,
    consignorGst: req.body.consignorGst,
    consigneeGst: req.body.consigneeGst,
    osc: req.body.osc,
    statistical: req.body.statistical,
  };

  const updateLorryReceipt = (_model) => {
    LorryReceipt.findByIdAndUpdate(
      _id,
      {
        $set: _model,
      },
      { new: true },
      (error, data) => {
        if (error) {
          return res.status(200).json({ message: error.message });
        } else {
          data.user = req.body.user;
          sendMailToCustomer(res, data, true);
          return res.json(data);
        }
      }
    );
  };

  try {
    const query = {
      lrList: {
        $elemMatch: {
          _id: req.params.id,
        },
      },
      active: true,
    };
    LoadingSlip.findOne(query).exec(async (lrError, found) => {
      if (lrError) {
        return res.status(200).json({
          message: "Error fetching lorry receipts!",
        });
      } else {
        // if (found) {
        //   return res.status(200).json({
        //     message: `This LR is used in Challan ${found.lsNo}. First, delete the challan.`,
        //   });
        // }
        updateLorryReceipt(model);
      }
    });
  } catch (e) {
    return res.status(200).json({ message: e.message });
  }
};

const getAcknowledgeById = async (req, res, next) => {
  try {
    const lrid = req.params.id;
    const query = 'CALL getackbyid(?)';
    const result = await db.query(query, lrid)
    if (result) {
      const updateAck = {
        ...result[0][0][0],
        deliveryDate: result[0][0][0].delivery_date,
        deliveryType: (result[0][0][0].delivery_type === "0" || result[0][0][0].delivery_type === "Door") ? "Door" :
          (result[0][0][0].delivery_type === "1" || result[0][0][0].delivery_type === "Godown") ? "Godown" :
            (result[0][0][0].delivery_type === "2" || result[0][0][0].delivery_type === "Office") ? "Office" :
              "",
        payType: (result[0][0][0].pay_type === "0" || result[0][0][0].pay_type === "TBB") ? "TBB" :
          (result[0][0][0].pay_type === "1" || result[0][0][0].pay_type === "To Pay") ? "ToPay" :
            (result[0][0][0].pay_type === "2" || result[0][0][0].pay_type === "Paid") ? "PAID" :
              "",
        toBilled: (result[0][0][0].to_billed === "0" || result[0][0][0].to_billed === "Consignor") ? "Consignor" :
          (result[0][0][0].to_billed === "1" || result[0][0][0].to_billed === "Consignee") ? "Consignee" :
            (result[0][0][0].to_billed === "2" || result[0][0][0].to_billed === "NA") ? "NA" :
              "",
        collectAt: result[0][0][0].collect_at_branch
      }
      // console.log("1 : ", result[0][0][0].to_billed)
      // console.log("2 : ", updateAck.toBilled)
      return res.send(updateAck)
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
  return
  const _id = req.params.id;

  LorryReceipt.aggregate([
    { $match: { _id: ObjectId(_id) } },
    {
      $addFields: {
        loadingSlipId: {
          $cond: {
            if: {
              $ne: ["$associatedLS", null],
            },
            then: { $toObjectId: "$associatedLS" },
            else: "abcd",
          },
        },
      },
    },
    {
      $addFields: {
        branchId: {
          $cond: {
            if: {
              $ne: ["$unloadBranch", null],
            },
            then: { $toObjectId: "$unloadBranch" },
            else: "yuyttt",
          },
        },
      },
    },
    {
      $lookup: {
        from: "loadingSlip",
        localField: "loadingSlipId",
        foreignField: "_id",
        as: "loadingSlip",
      },
    },
    { $unwind: { path: "$loadingSlip", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "branch",
        localField: "branchId",
        foreignField: "_id",
        as: "unloadBranch",
      },
    },
    { $unwind: { path: "$unloadBranch", preserveNullAndEmptyArrays: true } },
  ]).exec((error, lr) => {
    if (error) {
      return res.status(200).json({
        message: "Error fetching Lorry Receipt!",
      });
    } else {
      return res.send(lr[0] || {});
    }
  });
};

const updateLorryReceiptAck = async (req, res, next) => {
  try {
    const { id, deliveryDate, unloadTo, unloadDate, unloadBranch, close, closeReason } = req.body;
    const branch = unloadBranch?.branch_id ? unloadBranch.branch_id : null
    let delDate = null;
    let unlDate = null;
    if (deliveryDate) {
      delDate = new Date(deliveryDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    }
    if (unloadDate) {
      unlDate = new Date(unloadDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
    }
    const close1 = close ? 1 : 0;

    const query = 'CALL updateAck(?,?,?,?,?,?,?,@message)'
    const result = await db.query(query, [id, delDate, unloadTo, unlDate, branch, close1, closeReason])
    if (result) {
      return res.json(result[0][0])
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({ message: "Internal Server Error" })
  }
  return
  const id = req.body.id;

  if (!req.params.id || !id) {
    return res.status(500).json({ message: "Lorry receipt ID is required!" });
  }

  let status;
  if (req.body.unloadDate) {
    status = 2;
  }
  if (req.body.deliveryDate) {
    status = 3;
  }
  if (req.body.close) {
    status = 4;
  }
  if (!req.body.unloadDate && !req.body.deliveryDate && !req.body.close) {
    status = 1;
  }

  LorryReceipt.findByIdAndUpdate(
    _id,
    {
      $set: {
        unloadTo: req.body.unloadTo,
        unloadDate: req.body.unloadDate,
        unloadBranch:
          req.body.unloadBranch && req.body.unloadBranch._id
            ? req.body.unloadBranch._id
            : req.body.unloadBranch,
        deliveryDate: req.body.deliveryDate,
        close: req.body.close,
        closeReason: req.body.closeReason,
        status: status,
        updatedBy: req.body.updatedBy,
        ack: _id,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
};

const removeLorryReceiptAck = async (req, res) => {
  console.log(req.params)
  try {
    const ackId = req.params.id

    const query = 'CALL remove_lr_ack(?,@message)'
    const result = await db.query(query, ackId);
    if (result) {
      return res.status(200).json(result[0][0])
    }

  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json(error)
  }
  return
  const _id = req.params.id;
  if (!_id) {
    return res.status(200).json({ message: "Lorry receipt ID is required!" });
  }

  LorryReceipt.findById(_id, (foundLRErr, foundLRData) => {
    if (foundLRErr) {
      return res.status(200).json({ message: foundLRErr.message });
    }

    if (foundLRData && foundLRData.ack) {
      // const filePath = foundLRData.ack;
      // const parts = filePath.split("/");
      // const fileName = parts[parts.length - 1];
      // const fileToRemove = path.join(
      //   __dirname,
      //   "../acknowledgement/",
      //   fileName
      // );
      // fs.unlinkSync(fileToRemove);

      LorryReceipt.findByIdAndUpdate(
        _id,
        {
          $set: {
            ack: "",
            updatedBy: req.body.updatedBy,
          },
        },
        { new: true },
        (error, data) => {
          if (error) {
            res.status(200).json({ message: error.message });
          } else {
            res.json(data);
          }
        }
      );
    }
    if (!foundLRData) {
      return res.status(200).json({ message: "Lorry receipt not found!" });
    }
  });
};

const getLocalMemos = async (req, res) => {
  // if (
  //   !req.body.branch ||
  //   !req.body.pagination.page ||
  //   !req.body.pagination.limit
  // ) {
  //   return res
  //     .status(400)
  //     .json({ message: "Branch ID & pagination is required!" });
  // }

  // console.log(req.body)
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }

  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  try {
    if (branch) {
      const query = "CALL getalllocalmemospage(?,?,?)"
      const result = await db.query(query, [branch, start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date, // Update date
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      // console.log(result[0][0])

      if (result) {
        if (updatedLS.length > 0) {
          res.json({
            loadingSlips: updatedLS,
            total: total,
          });
        } else {
          res.json({
            message: "No Data Found"
          });
        }
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
    else {
      const query = "CALL getalllocalmemos(?,?)"
      const result = await db.query(query, [start_index, counts])


      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });

      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0
      if (result) {
        if (updatedLS.length > 0) {
          res.json({
            loadingSlips: updatedLS,
            total: total,
          });
        } else {
          res.json({
            message: "No Data Found"
          });
        }
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }
};

const getLocalMemoSearch = async (req, res, next) => {
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }
  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  const filterData = req.body.filterData
  try {
    if (branch && (filterData || filterData == "")) {
      const query = "CALL getalllmbysearchbybranch(?,?,?,?)"
      const result = await db.query(query, [filterData.trim(), branch, start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      if (result) {
        if (updatedLS.length > 0) {
          res.json({
            loadingSlips: updatedLS,
            total: total,
          });
        } else {
          res.json({
            message: "No Data Found"
          });
        }
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
    else {
      const query = "CALL getalllmbysearch(?,?,?)"
      const result = await db.query(query, [filterData.trim(), start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      if (result) {
        if (updatedLS.length > 0) {
          res.json({
            loadingSlips: updatedLS,
            total: total,
          });
        } else {
          res.json({
            message: "No Data Found"
          });
        }
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }
};


const getLoadingSlips = async (req, res, next) => {
  // console.log(req.body)
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }

  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  try {
    if (branch) {
      const query = "CALL getallloadingshetspage(?,?,?)"
      const result = await db.query(query, [branch, start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date, // Update date
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      // console.log(result[0][0])

      if (result) {
        res.json({
          loadingSlips: updatedLS,
          total: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
    else {
      const query = "CALL getallloadingslips(?,?)"
      const result = await db.query(query, [start_index, counts])


      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });

      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0
      if (result) {
        res.json({
          loadingSlips: updatedLS,
          total: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }
};

const getLoadingSlipsSearch = async (req, res, next) => {
  // console.log(req.body)
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }
  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  const filterData = req.body.filterData
  try {
    if (branch && (filterData || filterData == "")) {
      const query = "CALL getalllsbysearchbybranch(?,?,?,?)"
      const result = await db.query(query, [filterData.trim(), branch, start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      if (result) {
        res.json({
          loadingSlips: updatedLS,
          total: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
    else {
      const query = "CALL getalllsbysearch(?,?,?)"
      const result = await db.query(query, [filterData.trim(), start_index, counts])
      const updatedLS = result[0][0]?.map?.((ls) => {
        return {
          ...ls, // Spread the current object to create a new updated object
          date: ls.dc_date,
          hire: ls.hire ? parseFloat(ls.hire).toFixed(2) : 0, // Update hire value
          total: ls.total ? parseFloat(ls.total).toFixed(2) : 0, // Update total value
        };
      });
      const total = updatedLS.length > 0 ? updatedLS[0].total_count : 0

      if (result) {
        res.json({
          loadingSlips: updatedLS,
          total: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }
};

const getLoadingSlipsById = (req, res, next) => {
  LoadingSlip.find(
    {
      _id: { $in: req.body.lsList },
      active: true,
    },
    (error, loadingSlips) => {
      if (error) {
        res.send(error);
      }
      res.send(loadingSlips);
    }
  );
};

const addLoadingSlip = async (req, res, next) => {
  // console.log(req.body)
  try {
    const {
      lsNo, branch, date, vehicle, supplier, driver, from, to, lrList,
      toPay, hire, advance, commission, hamali, total, remark, currentTime
    } = req.body

    // const lrIds = lrList.map((row) => row.id);
    const in_dc_data = lrList.map((lr_id) => `(${lr_id},0,@@)`).join(", ");
    const in_lr_data = `(${lrList.join(", ")})`;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');
    const dcDate = new Date(date);
    const connection = await db.getConnection();

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    try {
      await connection.beginTransaction();

      const query = 'CALL add_dc_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id,?,?)'

      const result = await connection.query(query, [
        lsNo || null, formattedDate, vehicle, driver, supplier, from, to, hire,
        hamali, commission, advance, total, remark,
        in_dc_data, in_lr_data, branch, "NULL", "NULL", toPay, formattedCurrentDate
      ])
      const message = result[0][0][0].message
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message OR handle the error CASE AS needed
      } else {
        if (result) {
          await connection.commit();
          connection.release();
          return res.status(200).json(result[0])
        } else {
          await connection.rollback();
          console.log("Error in Add Loading Slip : ", error);
          return res.status(500).send(error)
        }
      }
    } catch (error) {
      await connection.rollback();
      console.log("Error in Add Loading Slip : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Add Loading Slip : ", error);
    return res.status(500).send(error)
  }
};

const removeLoadingSlip = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ message: "Loading slip ID is required!" });
    }
    const id = req.params.id;
    const query = "CALL delete_dc_master(?,@message)"
    const result = await db.query(query, id)
    if (result) { return res.status(200).json(result[0][0]) }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error)
  }
};

const updateLoadingSlip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lsNo, branch, date, vehicle, supplier, driver, from, to, lrList,
      toPay, hire, advance, commission, hamali, total, remark, currentTime, vehicleOwner, preLR
    } = req.body

    const in_dc_data = lrList.map((lr_id) => `(${lr_id},0,@@)`).join(", ");
    const in_lr_data = `(${lrList.join(", ")})`;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');
    const connection = await db.getConnection();

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    try {
      await connection.beginTransaction();

      const query = 'CALL update_dc_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id,?,?)'
      console.log("id : ", id)
      const result = await connection.query(query, [
        id, formattedDate, vehicle, driver, vehicleOwner, from, to, hire, hamali, commission, advance, total, remark,
        in_dc_data, in_lr_data, branch, "NULL", toPay, formattedCurrentDate
      ])
      const message = result[0][0][0].message
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message OR handle the error CASE AS needed
      } else {
        if (result) {
          await connection.commit();
          connection.release();
          const data = result[0][0][0].message
          const inserted_id = result[0][1][0].inserted_id
          return res.status(200).json({ data: data, inserted_id: inserted_id })
        } else {
          await connection.rollback();
          console.log("Error in Update Loading Slip : ", error);
          return res.status(500).send(error)
        }
      }
    } catch (error) {
      await connection.rollback();
      console.log("Error in Update Loading Slip : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Update Loading Slip : ", error);
    return res.status(500).json(error)
  }
};

const getLoadingSlip = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(200).json({ message: "Loading slip ID is required!" });
    }
    const lsid = req.params.id
    const query = "CALL getloadingsheetbyid(?)"
    const result = await db.query(query, lsid)
    // console.log(result[0])

    const {
      id, dc_no, branchid, dc_date, from_loc, to_loc, vehicle_id, supplier_id,
      supplier_address, supplier_phone, driver_id, licenseno, mobileno,
      hire, adv_amt, commission, hamali, total, remarks, total_pay_amount
    } = result[0][0][0]

    const { lr_id } = result[0][1][0]
    const lrIdArray = lr_id.split(',').map(Number);

    // console.log("ls get data : ", result[0][0])

    const query1 = "CALL getlrdetailsforloadsheet(?)";

    const [results] = await db.query(query1, [lr_id]);
    const formattedResults = results[0].map(item => ({
      ...item,
      lrno: item.lrNo
    }));

    const finalObject = {
      id: id,
      lsNo: dc_no,
      branch: branchid,
      date: dc_date,
      from: parseInt(from_loc) || null,
      to: parseInt(to_loc) || null,
      vehicleNo: parseInt(vehicle_id) || null,
      supplier: supplier_id || null,
      vehicleOwnerAddress: supplier_address || "",
      vehicleOwnerPhone: supplier_phone || "",
      driver_id: parseInt(driver_id) || null,
      licenseNo: licenseno || "",
      phone: mobileno || "",
      hire: hire || "",
      advance: adv_amt || "",
      commission: commission || "",
      hamali: hamali || "",
      total: total || "",
      toPay: total_pay_amount || "",
      remark: remarks || "",
      lrList: lrIdArray || [],
      rowDetails: formattedResults || []
    }


    if (result) {
      return res.status(200).json(finalObject)
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json(error);
  }
};

const printLoadingSlip = async (req, res) => {
  let LSData = {};
  let vehicle;
  let owner = {};
  let lrList = [];
  try {
    const lsid = req.params.id
    const query = 'CALL get_dcforprint(?)'
    const LSDataObj = await db.query(query, lsid)
    // console.log(LSDataObj[0][0][0])
    if (LSDataObj) {
      const {
        id, dc_no, dc_date, hire, hamali, commission, adv_amt, total, branch, branch_name,
        fileloc, total_pay_amount, vehicleno, name, city, state, remarks,
        address, fromplace, toplace, driver_name, lts_no, lr_ids
      } = LSDataObj[0][0][0]


      LSData.from = fromplace || "";
      LSData.to = toplace || "";
      LSData.branch = branch_name || "";
      LSData.total = parseFloat(total) || "",
        // +parseFloat(hire) -
        // +parseFloat(adv_amt) -
        // +parseFloat(commission) +
        // +parseFloat(hamali) //-
        // +LSData.stacking;
        LSData.balance = parseFloat(total) > 0 ? parseFloat(total) : "";
      // LSData.total = parseFloat(total_pay_amount) > 0 ? parseFloat(total_pay_amount) : "";
      LSData.vehicleNo = vehicleno || ""
      LSData.driverName = driver_name || "",
        LSData.date = dc_date || ""
      LSData.hire = hire || "",
        LSData.advance = adv_amt || "",
        LSData.commission = commission || ""
      LSData.hamali = hamali || "",
        LSData.remark = remarks || ""


      owner.name = name || ""
      owner.fullAddress = address;
      if (city) { owner.fullAddress = `${owner.fullAddress}, ${city}` }
      if (state) { owner.fullAddress = `${owner.fullAddress}, ${state}` }

      const lrids = lr_ids?.split(',').map(Number);

      const query2 = 'CALL get_lrfordcprint(?)'
      const lrData = await db.query(query2, id)

      lrList = lrData[0][0].map((row) => ({
        noOfPackages: row.articleNo,
        lrBranch: row.branch_name,
        lrFrom: row.loc_from,
        lrTo: row.loc_to,
        consignorName: row.consigner_name,
        consigneeName: row.consignee_name,
        consignorFullAddress: row.loc_from,
        consigneeFullAddress: row.loc_to,
        total: row.total,
        wayBillNo: row.lrNo
      }))

      const infoData = {
        LSData: LSData,
        LSNo: lts_no,
        owner: owner,
        lrList: lrList
          .sort((a, b) =>
            b.consigneeName.localeCompare(a.consigneeName)
          )
          .map((el, key) => ({ srNo: key + 1, ...el })),
      }


      LSData.pTitle = LSData.isLocalMemo
        ? "LOCAL <br/> MEMO"
        : "REPORT / MEMO<br />PUNE";

      const templatePath =
        path.join(__dirname, "../bills/") + "LoadingSlip.html";
      res.render(
        templatePath,
        {
          info: {
            LSData: LSData,
            LSNo: lts_no,
            // vehicle: vehicle,
            owner: owner,
            lrList: lrList
              .sort((a, b) =>
                b.consigneeName.localeCompare(a.consigneeName)
              )
              .map((el, key) => ({ srNo: key + 1, ...el })),
            // createdDate: converDateFormat(data.createdAt),
            // printDate: converDateFormat(Date.now()),
          },
        },
        (err, HTML) => {
          const fileName = getFormattedLSNumber(lts_no);
          var isWin = process.platform === "win32";
          let htmlRaw = HTML;
          if (isWin) {
            htmlRaw = htmlRaw.replace("0.55", "1");
          }
          pdf
            .create(htmlRaw, options2)
            .toBuffer(async (buffErr, buffer) => {
              try {
                if (buffErr) {
                  console.log(buffErr);
                  return res
                    .status(500)
                    .json({ message: buffErr?.message });
                }
                const base64String = buffer?.toString("base64");
                if (req.body.email && req.body.email.trim() !== "") {
                  sendEmail(
                    req.body.email,
                    base64String,
                    `${fileName}.pdf`,
                    `DTC - Loading slip no. ${fileName}`,
                    `DTC - Bill no. ${fileName}`,
                    `<p><b>Hello</b></p><p>Please find attached Loading Slip.</p>`
                  )
                    .then(() => {
                      return res.json({ success: true });
                    })
                    .catch((err) => {
                      return res.status(401).json({ message: err });
                    });
                } else {
                  return res.json({ lts_no: lts_no, file: base64String });
                }
              } catch (err) {
                console.log(err);
              }
            });
        }
      );
    }
  } catch (error) {
    console.log("Error in fetch dc master for print: ", error)
    return res.status(500).send(error)
  }
};

const addLoaclMemo = async (req, res, next) => {
  // console.log(req.body)
  try {
    const {
      lsNo, branch, date, vehicle, supplier, driver, from, to, lrList,
      toPay, hire, advance, commission, hamali, total, remark, currentTime
    } = req.body

    // const lrIds = lrList.map((row) => row.id);
    const in_dc_data = lrList.map((lr_id) => `(${lr_id},0,@@)`).join(", ");
    const in_lr_data = `(${lrList.join(", ")})`;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const query = 'CALL add_local_memo_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id,?,?)'

      const result = await connection.query(query, [
        lsNo || null, formattedDate, vehicle, driver, supplier, from, to, hire,
        hamali, commission, advance, total, remark,
        in_dc_data, in_lr_data, branch, "NULL", "NULL", toPay, formattedCurrentDate
      ])
      console.log(result[0][0])
      if (result) {
        await connection.commit();
        connection.release();
        return res.status(200).json(result[0])
      } else {
        await connection.rollback();
        console.log("Error in Add Local Memo : ", error);
        return res.status(500).send(error)
      }
    } catch (error) {
      await connection.rollback();
      console.log("Error in Add Local Memo : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Add Local Memo : ", error);
    return res.status(500).send(error)
  }
}

const getLocalMemo = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(200).json({ message: "Local Memo ID is required!" });
    }
    const lsid = req.params.id
    const query = "CALL getlocalmemobyid(?)"
    const result = await db.query(query, lsid)
    // console.log(result[0])

    const {
      id, dc_no, branchid, dc_date, from_loc, to_loc, vehicle_id, supplier_id,
      supplier_address, supplier_phone, driver_id, licenseno, mobileno,
      hire, adv_amt, commission, hamali, total, remarks, total_pay_amount
    } = result[0][0][0]

    const { lr_id } = result[0][1][0]
    const lrIdArray = lr_id.split(',').map(Number);

    // console.log("ls get data : ", result[0][0])

    const query1 = "CALL getlrdetailsforloadsheet(?)";

    const [results] = await db.query(query1, [lr_id]);
    const formattedResults = results[0].map(item => ({
      ...item,
      lrno: item.lrNo
    }));

    const finalObject = {
      id: id,
      lsNo: dc_no,
      branch: branchid,
      date: dc_date,
      from: parseInt(from_loc) || null,
      to: parseInt(to_loc) || null,
      vehicleNo: parseInt(vehicle_id) || null,
      supplier: supplier_id || null,
      vehicleOwnerAddress: supplier_address || "",
      vehicleOwnerPhone: supplier_phone || "",
      driver_id: parseInt(driver_id) || null,
      licenseNo: licenseno || "",
      phone: mobileno || "",
      hire: hire || "",
      advance: adv_amt || "",
      commission: commission || "",
      hamali: hamali || "",
      total: total || "",
      toPay: total_pay_amount || "",
      remark: remarks || "",
      lrList: lrIdArray || [],
      rowDetails: formattedResults || []
    }


    if (result) {
      return res.status(200).json(finalObject)
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json(error);
  }
};

const updateLocalMemo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lsNo, branch, date, vehicle, supplier, driver, from, to, lrList,
      toPay, hire, advance, commission, hamali, total, remark, currentTime, vehicleOwner
    } = req.body

    const in_dc_data = lrList.map((lr_id) => `(${lr_id},0,@@)`).join(", ");
    const in_lr_data = `(${lrList.join(", ")})`;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const query = 'CALL update_lm_master(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@message,@inserted_id,?,?)'
      console.log("id : ", id)
      const result = await connection.query(query, [
        id, formattedDate, vehicle, driver, vehicleOwner, from, to, hire, hamali, commission, advance, total, remark,
        in_dc_data, in_lr_data, branch, "NULL", toPay, formattedCurrentDate
      ])

      if (result) {
        await connection.commit();
        connection.release();
        const data = result[0][0][0].message
        const inserted_id = result[0][1][0].inserted_id
        return res.status(200).json({ data: data, inserted_id: inserted_id })
      } else {
        await connection.rollback();
        console.log("Error in Update Local Memo: ", error);
        return res.status(500).send(error)
      }
    } catch (error) {
      await connection.rollback();
      console.log("Error in Update Local Memo : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Update Local Memo : ", error);
    return res.status(500).json(error)
  }
};

const printLocalMemo = async (req, res) => {
  console.log(req.body)
  let LSData = {};
  let vehicle;
  let owner = {};
  let lrList = [];
  try {
    const lsid = req.params.id
    const query = 'CALL get_localmemoforprint(?)'
    const LSDataObj = await db.query(query, lsid)
    // console.log(LSDataObj[0][0][0])
    if (LSDataObj) {
      const {
        id, dc_no, dc_date, hire, hamali, commission, adv_amt, total, branch, branch_name,
        fileloc, total_pay_amount, vehicleno, name, city, state, remarks,
        address, fromplace, toplace, driver_name, lts_no, lr_ids
      } = LSDataObj[0][0][0]


      LSData.from = fromplace || "";
      LSData.to = toplace || "";
      LSData.branch = branch_name || "";
      LSData.total = parseFloat(total) || "",
        // +parseFloat(hire) -
        // +parseFloat(adv_amt) -
        // +parseFloat(commission) +
        // +parseFloat(hamali) //-
        // +LSData.stacking;
        LSData.balance = parseFloat(total) > 0 ? parseFloat(total) : "";
      // LSData.total = parseFloat(total_pay_amount) > 0 ? parseFloat(total_pay_amount) : "";
      LSData.vehicleNo = vehicleno || ""
      LSData.driverName = driver_name || "",
        LSData.date = dc_date || ""
      LSData.hire = hire || "",
        LSData.advance = adv_amt || "",
        LSData.commission = commission || "",
      LSData.hamali = hamali || "",
        LSData.remark = remarks || ""


      owner.name = name || ""

      if (city) { owner.fullAddress = `${address}, ${city}` }
      if (state) { owner.fullAddress = `${address}, ${state}` }

      const lrids = lr_ids.split(',').map(Number);

      const query2 = 'CALL get_lrforlocalmemoprint(?)'
      const lrData = await db.query(query2, id)

      lrList = lrData[0][0].map((row) => ({
        noOfPackages: row.articleNo,
        lrBranch: row.branch_name,
        lrFrom: row.loc_from,
        lrTo: row.loc_to,
        consignorName: row.consigner_name,
        consigneeName: row.consignee_name,
        consignorFullAddress: row.consigner_address,
        consigneeFullAddress: row.consignee_address,
        total: row.total,
        wayBillNo: row.lrNo
      }))

      const infoData = {
        LSData: LSData,
        LSNo: lts_no,
        owner: owner,
        lrList: lrList
          .sort((a, b) =>
            b.consigneeName.localeCompare(a.consigneeName)
          )
          .map((el, key) => ({ srNo: key + 1, ...el })),
      }


      LSData.pTitle = "LOCAL <br/> MEMO"

      const templatePath =
        path.join(__dirname, "../bills/") + "LoadingSlip.html";
      res.render(
        templatePath,
        {
          info: {
            LSData: LSData,
            LSNo: lts_no,
            // vehicle: vehicle,
            owner: owner,
            lrList: lrList
              .sort((a, b) =>
                b.consigneeName.localeCompare(a.consigneeName)
              )
              .map((el, key) => ({ srNo: key + 1, ...el })),
            // createdDate: converDateFormat(data.createdAt),
            // printDate: converDateFormat(Date.now()),
          },
        },
        (err, HTML) => {
          const fileName = getFormattedLSNumber(lts_no);
          var isWin = process.platform === "win32";
          let htmlRaw = HTML;
          if (isWin) {
            htmlRaw = htmlRaw.replace("0.55", "1");
          }
          pdf
            .create(htmlRaw, options2)
            .toBuffer(async (buffErr, buffer) => {
              try {
                if (buffErr) {
                  console.log(buffErr);
                  return res
                    .status(500)
                    .json({ message: buffErr?.message });
                }
                const base64String = buffer?.toString("base64");
                if (req.body.email && req.body.email.trim() !== "") {
                  sendEmail(
                    req.body.email,
                    base64String,
                    `${fileName}.pdf`,
                    `DTC - Local memo no. ${fileName}`,
                    `DTC - Bill no. ${fileName}`,
                    `<p><b>Hello</b></p><p>Please find attached Local Memo.</p>`
                  )
                    .then(() => {
                      return res.json({ success: true });
                    })
                    .catch((err) => {
                      return res.status(401).json({ message: err });
                    });
                } else {
                  return res.json({ lts_no: lts_no, file: base64String });
                }
              } catch (err) {
                console.log(err);
              }
            });
        }
      );
    }
  } catch (error) {
    console.log("Error in fetch dc master for print: ", error)
    return res.status(500).send(error)
  }
};

const removeLocalMemo = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(401).json({ message: "Local Memo ID is required!" });
    }
    const id = req.params.id;
    const query = "CALL delete_lm_master(?,@message)"
    const result = await db.query(query, id)
    if (result) { return res.status(200).json(result[0][0]) }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error)
  }
};

const getMoneyTransfers = (req, res, next) => {
  if (!req.body.branch) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }

  MoneyTransfer.find({ branch: req.body.branch, active: true })
    .limit(1000)
    .sort("-createdAt")
    .exec((error, moneyTransfers) => {
      if (error) {
        return res.status(200).json({
          message: "Error fetching money transfer list!",
        });
      } else {
        res.json(moneyTransfers);
      }
    });
};

const addMoneyTransfer = (req, res, next) => {
  const moneyTransfer = new MoneyTransfer({
    branch: req.body.branch,
    transferToBranch: req.body.transferToBranch,
    date: req.body.date,
    amount: req.body.amount,
    remark: req.body.remark,
    createdBy: req.body.createdBy,
  });

  MoneyTransfer.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
    function (err, foundMT) {
      if (foundMT) {
        moneyTransfer.pettyCashNo = foundMT.pettyCashNo + 1;
      } else {
        moneyTransfer.pettyCashNo = 1;
      }
      MoneyTransfer.create(moneyTransfer, (error, data) => {
        if (error) {
          if (error.code === 11000) {
            return res.status(200).json({
              message: `Money Transfer with petty cash no (${moneyTransfer.pettyCashNo}) already exist!`,
            });
          }
          return res.status(200).json({ message: error.message });
        } else {
          res.send(data);
        }
      });
    }
  );
};

const removeMoneyTransfer = (req, res, next) => {
  if (!req.params.id || !req.body.id) {
    return res.status(200).json({ message: "Money transfer ID is required!" });
  }
  const _id = req.body.id || req.params.id;
  MoneyTransfer.findByIdAndUpdate(
    _id,
    {
      $set: {
        active: false,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        res.status(200).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
};

const updateMoneyTransfer = (req, res, next) => {
  const _id = req.body._id;

  if (!req.params.id || !_id) {
    return res.status(200).json({ message: "Money transfer ID is required!" });
  }

  MoneyTransfer.findByIdAndUpdate(
    _id,
    {
      $set: {
        branch: req.body.branch,
        transferToBranch: req.body.transferToBranch,
        date: req.body.date,
        amount: req.body.amount,
        remark: req.body.remark,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        res.status(200).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
};

const getMoneyTransfer = (req, res, next) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Money transfer ID is required!" });
  }
  MoneyTransfer.findById(req.params.id, (error, data) => {
    if (error) {
      return res.status(200).json({ message: error.message });
    }
    res.send(data);
  });
};

const getPettyTransactions = (req, res, next) => {
  if (!req.body.branch) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }

  PettyTransaction.find({ branch: req.body.branch, active: true })
    .limit(1000)
    .sort("-createdAt")
    .exec((error, pettyTransactions) => {
      if (error) {
        return res.status(200).json({
          message: "Error fetching petty cash transactions!",
        });
      } else {
        res.json(pettyTransactions);
      }
    });
};

const addPettyTransaction = (req, res, next) => {
  const pettyTransaction = new PettyTransaction({
    branch: req.body.branch,
    transactionType: req.body.transactionType,
    transactionName: req.body.transactionName,
    type: req.body.type,
    lsNo: req.body.lsNo,
    amount: +req.body.amount,
    availableBal: +req.body.availableBal,
    date: req.body.date,
    bank: req.body.bank,
    bankAccountNumber: req.body.bankAccountNumber,
    description: req.body.description,
    createdBy: req.body.createdBy,
  });

  PettyTransaction.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
    function (err, foundPT) {
      if (foundPT) {
        pettyTransaction.transactionNo = foundPT.transactionNo + 1;
        if (pettyTransaction.type?.toLowerCase() === "credit") {
          pettyTransaction.availableBal =
            pettyTransaction.amount + foundPT.availableBal;
        }
        if (pettyTransaction.type?.toLowerCase() === "debit") {
          pettyTransaction.availableBal =
            foundPT.availableBal - pettyTransaction.amount;
        }
      } else {
        pettyTransaction.transactionNo = 1;
        if (pettyTransaction.type?.toLowerCase() === "credit") {
          pettyTransaction.availableBal = pettyTransaction.amount;
        }
        if (pettyTransaction.type?.toLowerCase() === "debit") {
          pettyTransaction.availableBal =
            pettyTransaction.availableBal - pettyTransaction.amount;
        }
      }
      PettyTransaction.create(pettyTransaction, (error, data) => {
        if (error) {
          if (error.code === 11000) {
            return res.status(200).json({
              message: `Petty Transaction with transaction no. (${pettyTransaction.transactionNo}) already exist!`,
            });
          }
          return res.status(200).json({ message: error.message });
        } else {
          res.send(data);
        }
      });
    }
  );
};

const getPettyCashBalance = (req, res, next) => {
  PettyTransaction.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
    function (error, foundPT) {
      if (error) {
        res.send(error);
      }
      if (foundPT && foundPT.availableBal) {
        res.send({ balance: foundPT.availableBal });
      } else {
        res.send({ balance: 0 });
      }
    }
  );
};

const getPettyTransactionsByDate = (req, res, next) => {
  if (!req.body.startDate || !req.body.endDate) {
    return res
      .status(200)
      .json({ message: "Start and end dates are required!" });
  }
  PettyTransaction.find(
    {
      createdAt: {
        $gte: new Date(req.body.startDate),
        $lte: new Date(req.body.endDate),
      },
      active: true,
    },
    (error, data) => {
      if (error) {
        res.status(200).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
};

const getLorryReceiptsByDate = (req, res, next) => {
  if (!req.body.startDate || !req.body.endDate) {
    return res
      .status(200)
      .json({ message: "Start and end dates are required!" });
  }
  if (!req.body.pagination.page || !req.body.pagination.limit) {
    return res.status(200).json({ message: "Pagination inputs not provided!" });
  }

  const limit = req.body.pagination.limit || 100;
  const start = (req.body.pagination.page - 1) * limit;
  const end = req.body.pagination.page * limit;
  const query = {
    active: true,
  };
  if (req.body.startDate) {
    const date = new Date(req.body.startDate);
    const updatedDate = new Date(date).setDate(date?.getDate() + 1);
    const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
    query.date = {
      ...query.date,
      $gte: new Date(newDate)?.toISOString(),
    };
  }
  if (req.body.endDate) {
    const date = new Date(req.body.endDate);
    const updatedDate = new Date(date).setDate(date?.getDate() + 1);
    const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
    query.date = {
      ...query.date,
      $lte: new Date(newDate)?.toISOString(),
    };
  }

  if (req.body.type === "loaded") {
    query.status = 1;
  }
  if (req.body.type === "unloaded") {
    query.unloadDate = { $exists: true, $ne: null };
  }

  LorryReceipt.find(query)
    // .limit(limit)
    // .skip(skip)
    .sort("-createdAt")
    .exec((err, data) => {
      if (err) {
        return res.status(200).json({ message: err.message });
      } else {
        return res.json({
          lorryReceipts: data.slice(start, end),
          count: data?.length,
        });
      }
    });
};

const getBills = (req, res, next) => {
  if (
    !req.body.branch ||
    !req.body.pagination ||
    !req.body.pagination.page ||
    !req.body.pagination.limit
  ) {
    return res
      .status(200)
      .json({ message: "Branch ID & pagination is required!" });
  }

  const limit = req.body.pagination.limit || 100;
  const start = (req.body.pagination.page - 1) * limit;
  const end = req.body.pagination.page * limit;

  Bill.aggregate([
    { $match: { branch: req.body.branch, active: true } },
    {
      $addFields: {
        customerId: { $toObjectId: "$customer" },
      },
    },
    {
      $lookup: {
        from: "customer",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
  ]).exec((error, bills) => {
    if (error) {
      return res.status(200).json({
        message: "Error fetching bills!",
      });
    } else {
      return res.json({
        bills: bills.slice(start, end),
        count: bills?.length,
      });
    }
  });
};

const getBillsByBranch = async (req, res, next) => {
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }
  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  try {
    if (branch) {
      const query = "CALL getallbillsbybranch(?,?,?)"
      const result = await db.query(query, [branch, start_index, counts])
      const bills = result[0][0];
      const total = bills.length > 0 ? bills[0].total_count : 0

      if (result) {
        res.json({
          bills: bills,
          count: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching bills!",
        });
      }
    }
    else {
      const query = "CALL getallbills(?,?)"
      const result = await db.query(query, [start_index, counts])
      const bills = result[0][0];
      const total = bills.length > 0 ? bills[0].total_count : 0

      if (result) {
        res.json({
          bills: bills,
          count: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching bills!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }
}

const getBillsBySearch = async (req, res, next) => {
  if (
    !req.body.branch &&
    req.userData &&
    req.userData.type &&
    req.userData.type !== "0"
  ) {
    return res.status(200).json({ message: "Branch ID is required!" });
  }

  const page = parseInt(req.body.page) || 0;
  const pageSize = parseInt(req.body.pageSize) || 10;
  const start_index = page + 1;
  const counts = pageSize;
  const branch = req.body.branch
  const filterData = req.body.filterData
  try {
    if (branch && (filterData || filterData == "")) {
      const query = "CALL getallbillsbysearchbybranch(?,?,?,?)"
      const result = await db.query(query, [filterData.trim(), branch, start_index, counts])
      const bills = result[0][0];
      const total = bills.length > 0 ? bills[0].total_count : 0

      if (result) {
        res.json({
          bills: bills,
          count: total,
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
    else {
      const query = "CALL getallbillsbysearch(?,?,?)"
      const result = await db.query(query, [filterData.trim(), start_index, counts])
      const bills = result[0][0];
      const total = bills.length > 0 ? bills[0].total_count : 0

      if (result) {
        res.json({
          bills: bills,
          count: total
        });
      } else {
        return res.status(200).json({
          message: "Error fetching loading slips!",
        });
      }
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).json(error)
  }

  // const limit = req.body.pagination.limit || 100;
  // const start = (req.body.pagination.page - 1) * limit;
  // const end = req.body.pagination.page * limit;
  // const params = {
  //   active: true,
  //   $or: [
  //     {
  //       billNo: {
  //         $regex: new RegExp(req.body.filterData || "", "i"),
  //       },
  //     },
  //     {
  //       customer: {
  //         $regex: new RegExp(req.body.filterData || "", "i"),
  //       },
  //     },
  //     {
  //       date: {
  //         $regex: new RegExp(req.body.filterData || "", "i"),
  //       },
  //     },
  //   ],
  // };

  // if (req.body.branch) {
  //   params.branch = req.body.branch;
  // }

  // Bill.aggregate([
  //   {
  //     $addFields: {
  //       customerId: { $toObjectId: "$customer" },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "customer",
  //       localField: "customerId",
  //       foreignField: "_id",
  //       as: "customer",
  //     },
  //   },
  //   { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  //   { $match: params },
  //   { $sort: { createdAt: -1 } },
  // ]).exec((error, bills) => {
  //   if (error) {
  //     return res.status(200).json({
  //       message: "Error fetching bills!",
  //     });
  //   } else {
  //     return res.json({
  //       bills: bills.slice(start, end),
  //       count: bills?.length,
  //     });
  //   }
  // });
};

const getBillsByCustomer = (req, res, next) => {
  if (!req.body.customer) {
    return res.status(200).json({ message: "Customer ID is required!" });
  }

  Bill.find({ customer: req.body.customer, branch: req.body.branch })
    .limit(1000)
    .exec((error, bills) => {
      if (error) {
        return res.status(200).json({
          message: "Error fetching bills!",
        });
      } else {
        res.json(bills);
      }
    });
};

const addBill = async (req, res, next) => {
  console.log(req.body)
  try {
    const {
      branch, date, lrList, customer, totalAmount, serviceTax, total, dueDate, remark
    } = req.body

    const validTotTax = serviceTax ? serviceTax : "0";
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');;
    const dueDateFormat = new Date(dueDate);
    const formattedDueDate = dueDateFormat.toISOString().split('T')[0];
    const connection = await db.getConnection();
    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');
    try {
      await connection.beginTransaction();

      const query = 'CALL add_bill_master_auto(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?,?,@message, @inserted_id);'

      const result = await connection.query(query, [
        null,
        formattedDate,
        null,
        customer,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        validTotTax,
        totalAmount,
        remark,
        null,
        branch,
        null,
        total,
        formattedDueDate,
        formattedCurrentDate
      ])
      console.log("add bill result message:", result[0][0][0].message);
      const message = result[0][0][0].message
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message or handle the error case as needed
      } else {
        if (result) {
          const insertedId = result[0][1][0].inserted_id;
          if (insertedId) {
            // Prepare an array of promises for adding bill details
            const promises = lrList.map(async (lr) => {
              const lrId = lr; // Assuming each item in lrList has an 'id'
              const queryDetail = `CALL add_bill_details(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @message);`;
              const detailResult = await connection.query(queryDetail, [
                insertedId, // The bill ID we just inserted
                lrId, // The LR ID
                null, // Placeholder for missing parameters
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
              ]);
              const detailMessage = detailResult[0][0][0].message;
              console.log("add bill detail result message:", detailMessage);

              // Check if the details procedure returned an error
              if (detailMessage === "Something Went Wrong!") {
                throw new Error("Error in adding bill detail for LR ID: " + lrId);
              }

              return detailResult;

            });

            // Execute all promises concurrently
            await Promise.all(promises);

            await connection.commit();
            return res.status(200).json(result[0]);
          } else {
            await connection.rollback();
            const error = new Error("Failed to insert the bill.");
            console.error("Error in Add: ", error);
            return res.status(500).send(error);
          }
        } else {
          await connection.rollback();
          console.log("Error in Add  : ", error);
          return res.status(500).send(error)
        }
      }

    } catch (error) {
      await connection.rollback();
      console.log("Error in Add  : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Add  : ", error);
    return res.status(500).send(error)
  }
};

const getLorryReceiptsForBilldetials = async (req, res) => {
  try {
    const selectedIds = req.body.join(",");

    const query = "CALL getlrdetailsforbill(?)";

    const [results] = await db.query(query, [selectedIds]);
    const formattedResults = results[0].map(item => ({
      ...item,
      lrno: `${item.branch_code}-${item.lr_no}`
    }));

    return res.json(formattedResults);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Server error");
  }
};

const removeBill = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Bill ID is required!" });
  }
  try {
    const { id } = req.params
    const query = 'CALL deletebills(?, @message)'
    const result = await db.query(query, id)
    console.log(result[0][0]);
    if (result) {
      const message = result[0][0][0]
      return res.json(message)
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Server error");
  }

  // Bill.findById(req.params.id, (err, foundBill) => {
  //   if (err) {
  //     return res.status(200).json({ message: err.message });
  //   } else {
  //     const allLR = foundBill.lrList.map((lr) => lr._id);

  //     Bill.deleteOne({ _id: req.params.id }, (billError) => {
  //       if (billError) {
  //         return res.status(200).json({ message: billError.message });
  //       } else {
  //         LorryReceipt.updateMany(
  //           { _id: { $in: allLR } },
  //           {
  //             $set: {
  //               billGenerated: false,
  //               assoBill: "",
  //               updatedBy: req.body.updatedBy,
  //             },
  //           },
  //           { multi: true },
  //           (lrError, updatedLR) => {
  //             if (!lrError) {
  //               res.status(200).json({ id: req.params.id });
  //             } else {
  //               res.send(lrError);
  //             }
  //           }
  //         );
  //       }
  //     });
  //   }
  // });
};

const getBill = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Bill ID is required!" });
  }
  try {
    const { id } = req.params
    const query = 'CALL getbillbyid(?)'
    const query2 = 'CALL getbilldetailsbyid(?)'
    const result = await db.query(query, id)
    // console.log(result[0][0])
    if (result) {
      const {
        id, bill_no, bill_date, due_date, customer_id, tot_tax, tot_amount, remarks, branch, customer_name, emailid
      } = result[0][0][0]

      const { lr_id } = result[0][1][0]
      const lrIdArray = lr_id.split(',').map(Number);

      const result2 = await db.query(query2, id)
      // console.log("bill lr details : ", result2[0][0])

      const finalObject = {
        id: id,
        bill_no: bill_no,
        dueDate: due_date,
        branch: Number(branch),
        date: bill_date || null,
        customer: Number(customer_id),
        customer_name: customer_name || "",
        customer_email: emailid || "",
        totalAmount: tot_amount || "",
        lrList: lrIdArray || [],
        // grandTotal: "",
        remark: remarks || "",
        // total: "",
        serviceTax: tot_tax || "",
        rowDetails: result2[0][0]
      }
      res.json({ ...finalObject });
    }
  } catch (error) {
    console.log("Error in get bill data : ", error)
    return res.status(500).json("Server Error")
  }
  // Bill.findById(req.params.id, async (error, data) => {
  //   if (error) {
  //     return res.status(200).json({ message: error.message });
  //   }

  //   const customer = await Customer.findById(data.customer).lean();
  //   res.send({ ...data._doc, customer });
  // });
};

const updateBill = async (req, res, next) => {
  const id = req.body.id;

  if (!req.params.id || !id) {
    return res.status(200).json({ message: "Bill ID is required!" });
  }
  try {
    const {
      id, branch, date, lrList, customer, totalAmount, serviceTax, total, dueDate, remark, bill_no
    } = req.body

    // const lrIds = lrList.map((row) => row.id);
    // const in_dc_data = lrList.map((lr_id) => `(${lr_id},0,@@)`).join(", ");
    // const in_lr_data = `(${lrList.join(", ")})`;
    const validTotTax = serviceTax ? serviceTax : "0";
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-IN').split('/').reverse().join('-');
    const dueDateFormat = new Date(dueDate);
    const formattedDueDate = dayjs.utc(dueDate).local().format('YYYY-MM-DD');

    const formattedDate = new Date(date).toLocaleDateString('en-IN').split('/').reverse().join('-');

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const query = ' CALL update_bill_master(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @message, @inserted_id, ?,?,?,?)'

      const result = await connection.query(query, [
        bill_no,
        formattedDate,
        null,
        customer,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        validTotTax,
        totalAmount,
        remark,
        null,
        branch,
        null,
        id,
        total,
        formattedDueDate,
        formattedCurrentDate
      ])
      console.log("update bill result : ", result[0][1][0].inserted_id)
      const message = result[0][0][0].message
      console.log(message)
      if (message === "Something Went Wrong!") {
        return res.status(200).json(result[0]);
        // Send an error message or handle the error case as needed
      } else {
        if (result) {
          const insertedId = result[0][1][0].inserted_id;
          if (insertedId) {
            // Prepare an array of promises for adding bill details
            const promises = lrList.map(async (lr) => {
              const lrId = lr; // Assuming each item in lrList has an 'id'
              const queryDetail = `CALL add_bill_details(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @message);`;
              const detailResult = await connection.query(queryDetail, [
                insertedId, // The bill ID we just inserted
                lrId, // The LR ID
                null, // Placeholder for missing parameters
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
              ]);
              const detailMessage = detailResult[0][0][0].message;
              console.log("add bill detail result message:", detailMessage);

              // Check if the details procedure returned an error
              if (detailMessage === "Something Went Wrong!") {
                throw new Error("Error in adding bill detail for LR ID: " + lrId);
              }

              return detailResult;

            });

            // Execute all promises concurrently
            await Promise.all(promises);

            await connection.commit();
            return res.status(200).json({ inserted_id: insertedId, message: result[0]?.[0]?.[0].message });
          } else {
            await connection.rollback();
            const error = new Error("Failed to insert the bill.");
            console.error("Error in Add: ", error);
            return res.status(500).send(error);
          }
        } else {
          await connection.rollback();
          console.log("Error in Add  : ", error);
          return res.status(500).send(error)
        }
      }
    } catch (error) {
      await connection.rollback();
      console.log("Error in Add  : ", error);
      return res.status(500).send(error)
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Error in Add  : ", error);
    return res.status(500).send(error)
  }

};

const printBill = async (req, res) => {
  // console.log("print bill : ", req.body)
  if (!req.params.id) {
    return res.status(400).json({ message: "Bill ID is required!" });
  }

  try {
    const billId = req.params.id;
    const queryBill = "CALL getbillprintbyid(?)";
    const queryBillDetails = "CALL getbilldetailsprintbyid(?)";

    const billResult = await db.query(queryBill, billId);
    // console.log(billResult[0][0])
    if (billResult) {
      const {
        id, bill_no, billNo, bill_date, customer_name, customer_address, customer_city,
        customer_telephone, customer_gst, tot_amount
      } = billResult[0][0][0]

      const billDetailResult = await db.query(queryBillDetails, billId)

      // console.log("Bill details : ", billDetailResult[0][0])

      const lrList = billDetailResult[0][0].map((row) => ({
        formattedDate: row.lrdate,
        lrNo2: row.lrwithcode,
        from: row.loc_from,
        to: row.loc_to,
        totalArticles: row.no_of_articles,
        vehicleNo: row.vehicleno,
        formattedTotal: parseFloat(row.total).toFixed(2)
      }))

      const printData = {
        billNo: bill_no,
        customerName: customer_name?.toUpperCase(),
        customerAddress: customer_city
          ? `${customer_address}, ${customer_city}`
          : customer_address || "",
        customerPhone: customer_telephone || "",
        customerGst: customer_gst || "",
        // from: lrList[0].from
        //   ? lrList[0].from.toUpperCase()
        //   : lrList[0].from,
        // to: lrList[0].to ? lrList[0].to.toUpperCase() : lrList[0].to,
        // date: getFormattedDate(bill_date),
        date: bill_date,
        // createdDate: converDateFormat(data.createdAt),
        // printDate: converDateFormat(Date.now()),
        // bill: data,
        customer: {
          name: customer_name,
          address: customer_city
            ? `${customer_address}, ${customer_city}`
            : customer_address || "",
          gstNo: customer_gst || "",
          phone: customer_telephone || ""
        },
        lrList: lrList
          .sort((a, b) => {
            const dateA = a.lrNo;
            const dateB = b.lrNo;

            // Compare dates
            if (dateA < dateB) {
              return -1;
            }
            if (dateA > dateB) {
              return 1;
            }
            return a.lrNo - b.lrNo;
          })
          .map((lr, key) => ({ ...lr, sr: key + 1 })),
        // updatedLRList: updatedLRList,
        // totalWeight: totalWeight.toFixed(2),
        // totalArticles: totalArticles.toFixed(2),
        // freight: (+data.totalFreight).toFixed(2),
        grandTotal: parseFloat(tot_amount).toFixed(2),
        totalInWords: getWordNumber(parseFloat(tot_amount)),
      };

      const templatePath = path.join(__dirname, "../bills/") + "Bill.html";
      res.render(
        templatePath,
        {
          info: {
            ...printData,
          },
        },
        (err, HTML) => {
          const fileName = bill_no;
          var isWin = process.platform === "win32";
          let htmlRaw = HTML;
          if (isWin) {
            htmlRaw = htmlRaw.replace("0.55", "1");
          }
          pdf.create(htmlRaw, options2).toBuffer((buffErr, buffer) => {
            if (buffErr) {
              return res.status(500).json({ message: buffErr.message });
            }
            const base64String = buffer.toString("base64");
            if (req.body.email && req.body.email.trim() !== "") {
              sendEmail(
                req.body.email,
                base64String,
                `${fileName}.pdf`,
                `DTC - Bill no. ${fileName}`,
                `DTC - Bill no. ${fileName}`,
                `<p><b>Hello</b></p><p>Please find attached bill.</p>`
              )
                .then((response) => {
                  return res.json({ success: true });
                })
                .catch((err) => {
                  return res.status(401).json({ message: err });
                });
            } else {
              return res.json({ bill_no: bill_no, file: base64String });
            }
          });
        }
      );

    }
  } catch (error) {
    console.log("Error in Print Bill : ", error);
    return res.status(500).json(error)
  }


  // Bill.findById(req.params.id, async (findBillErr, data) => {
  //   if (findBillErr) {
  //     return res.status(401).json(findBillErr);
  //   }
  //   let totalCustomCount = 0;
  //   const branchProp = await Branch.findOne({ _id: data.branch });

  //   Customer.findById(data.customer, (findCustErr, custData) => {
  //     if (findCustErr) {
  //       return res.status(401).json(findCustErr);
  //     }
  //     const lrList = [];

  //     data.lrList.forEach(async (lorryReceipt, lrIndex) => {
  //       const foundLR = await LorryReceipt.findById(lorryReceipt._id);
  //       const foundLrBr = await Branch.findById(foundLR.branch);
  //       const foundLrFrom = await Place.findById(foundLR.from);
  //       const foundLrTo = await Place.findById(foundLR.to);

  //       const lr = JSON.parse(JSON.stringify(foundLR));
  //       lr.formattedDate = getFormattedDate(lr.date);

  //       lr.formattedLRNo = lr.lrNo;
  //       lr.lrNo2 = foundLrBr?.branchCode + "-" + lr.lrNo;
  //       lr.from = foundLrFrom?.name;
  //       lr.to = foundLrTo?.name;
  //       const updatedLRList = [];
  //       let totalWeight = 0;
  //       let totalArticles = 0;

  //       lr.transactions.forEach((tr, index) => {
  //         totalWeight = totalWeight + +tr.weight;
  //         totalArticles = totalArticles + +tr.articleNo;
  //       });
  //       lr.totalArticles = totalArticles;
  //       lr.totalWeight = totalWeight;
  //       lr.formattedDate = getFormattedDate(lr.date);
  //       lr.formattedTotal = lr.total.toFixed(2);
  //       totalCustomCount += lr.total;
  //       lrList.push(lr);
  //       if (data.lrList.length === lrList.length) {
  //         const printData = {
  //           billNo: branchProp.branchCode + "-" + data.billNo,
  //           customerName: custData?.name?.toUpperCase(),
  //           customerAddress: custData?.city
  //             ? `${custData?.address}, ${custData?.city}`
  //             : custData?.address,
  //           customerPhone: custData?.telephone,
  //           customerGst: custData?.gstNo,
  //           from: lrList[0].from
  //             ? lrList[0].from.toUpperCase()
  //             : lrList[0].from,
  //           to: lrList[0].to ? lrList[0].to.toUpperCase() : lrList[0].to,
  //           date: getFormattedDate(data.date),
  //           createdDate: converDateFormat(data.createdAt),
  //           printDate: converDateFormat(Date.now()),
  //           bill: data,
  //           customer: custData,
  //           lrList: lrList
  //             .sort((a, b) => {
  //               const dateA = a.lrNo;
  //               const dateB = b.lrNo;

  //               // Compare dates
  //               if (dateA < dateB) {
  //                 return -1;
  //               }
  //               if (dateA > dateB) {
  //                 return 1;
  //               }
  //               return a.lrNo - b.lrNo;
  //             })
  //             .map((lr, key) => ({ ...lr, sr: key + 1 })),
  //           updatedLRList: updatedLRList,
  //           totalWeight: totalWeight.toFixed(2),
  //           totalArticles: totalArticles.toFixed(2),
  //           freight: (+data.totalFreight).toFixed(2),
  //           grandTotal: data.totalAmount.toFixed(2),
  //           totalInWords: getWordNumber(data.totalAmount),
  //         };
  //         const templatePath = path.join(__dirname, "../bills/") + "Bill.html";
  //         res.render(
  //           templatePath,
  //           {
  //             info: {
  //               ...printData,
  //             },
  //           },
  //           (err, HTML) => {
  //             const fileName = pad(data.billNo, 6);
  //             var isWin = process.platform === "win32";
  //             let htmlRaw = HTML;
  //             if (isWin) {
  //               htmlRaw = htmlRaw.replace("0.55", "1");
  //             }
  //             pdf.create(htmlRaw, options2).toBuffer((buffErr, buffer) => {
  //               if (buffErr) {
  //                 return res.status(500).json({ message: buffErr.message });
  //               }
  //               const base64String = buffer.toString("base64");
  //               if (req.body.email && req.body.email.trim() !== "") {
  //                 sendEmail(
  //                   req.body.email,
  //                   base64String,
  //                   `${fileName}.pdf`,
  //                   `DTC - Bill no. ${fileName}`,
  //                   `DTC - Bill no. ${fileName}`,
  //                   `<p><b>Hello</b></p><p>Please find attached bill.</p>`
  //                 )
  //                   .then((response) => {
  //                     return res.json({ success: true });
  //                   })
  //                   .catch((err) => {
  //                     return res.status(401).json({ message: err });
  //                   });
  //               } else {
  //                 return res.json({ file: base64String });
  //               }
  //             });
  //           }
  //         );
  //       }
  //     });
  //   });
  // });
};

const exportToExcelBill = (req, res) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Bill ID is required!" });
  }
  Bill.findById(req.params.id, (findBillErr, data) => {
    if (findBillErr) {
      return res.status(200).json(findBillErr);
    }
    Customer.findById(data.customer, (findCustErr, custData) => {
      if (findCustErr) {
        return res.status(200).json(findCustErr);
      }
      const lrList = [];
      data.lrList.forEach(async (lorryReceipt) => {
        const foundLR = await LorryReceipt.findById(lorryReceipt._id);
        const _id = lorryReceipt._id;
        const lr = JSON.parse(JSON.stringify(foundLR));
        lr.formattedDate = getFormattedDate(lr.date);
        lr.formattedLRNo = lr.lrNo;
        lrList.push(lr);
        if (data.lrList.length === lrList.length) {
          const updatedLRList = [];
          let totalWeight = 0;
          let totalArticles = 0;
          lrList.forEach((lr) => {
            lr.transactions.forEach((tr, index) => {
              totalWeight = totalWeight + +tr.weight;
              totalArticles = totalArticles + +tr.articleNo;
              if (index === 0) {
                updatedLRList.push({
                  ...lr,
                  ...tr,
                  articleNo: tr.articleNo?.toFixed?.(2),
                  rate: tr.rate?.toFixed?.(2),
                  lrCharges: lr.lrCharges ? lr.lrCharges?.toFixed?.(2) : "0.00",
                  hamali: lr.hamali ? lr.hamali?.toFixed?.(2) : "0.00",
                  deliveryCharges: lr.deliveryCharges
                    ? lr.deliveryCharges?.toFixed?.(2)
                    : "0.00",
                  total: (
                    +tr.freight +
                    +lr.lrCharges +
                    +lr.hamali +
                    +lr.deliveryCharges
                  )?.toFixed?.(2),
                });
              } else {
                updatedLRList.push({
                  ...tr,
                  articleNo: tr.articleNo?.toFixed?.(2),
                  rate: tr.rate?.toFixed?.(2),
                  total: tr.freight?.toFixed?.(2),
                });
              }
            });
          });

          const workbook = exportBillToXlsx(updatedLRList);
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "bill.xlsx"
          );
          return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
          });
        }
      });
    });
  });
};

const updateBills = (req, res, next) => {
  if (req.body.bills.length <= 0) {
    return res.status(401).json({ message: "Bills are required!" });
  }

  let updatedBills = [];
  req.body.bills.forEach(async (bill) => {
    try {
      const billToBeUpdated = await Bill.findOne({ _id: bill._id });
      billToBeUpdated.paymentCollection.push(bill.payment);
      billToBeUpdated.totalReceived = billToBeUpdated.paymentCollection.reduce(
        (acc, item) => {
          return acc + item.receive + item.tds + item.extra - item.reverse;
        },
        0
      );
      if (billToBeUpdated.totalAmount === billToBeUpdated.totalReceived) {
        billToBeUpdated.status = "closed";
      } else {
        billToBeUpdated.status = "open";
      }
      let savedBill = await billToBeUpdated.save();
      if (savedBill) {
        updatedBills.push(savedBill);
        savedBill = null;
        if (updatedBills.length === req.body.bills.length) {
          return res.send(updatedBills);
        }
      }
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  });
};

const getLastLR = (req, res, next) => {
  LorryReceipt.find({ active: true })
    .sort({ _id: -1 })
    .limit(1)
    .exec(function (err, lr) {
      if (err) {
        res.status(200).json({ message: err.message });
      }
      if (lr.length) {
        return res.send(lr[0]);
      } else {
        return res.send({ lastLR: null });
      }
    });
};

const getLoadingSlipsBySupplier = (req, res, next) => {
  if (!req.params.id) {
    res.status(200).json({ message: "Supplier ID is required" });
  }

  Vehicle.find(
    { owner: req.params.id, active: true },
    (vehicleErr, vehicleData) => {
      if (vehicleErr) {
        return res.status(200).json({ message: vehicleErr.message });
      }
      if (vehicleData.length) {
        const vehicleNos = vehicleData.map(({ vehicleNo }) => vehicleNo);
        let query = {
          vehicleNo: {
            $in: vehicleNos,
          },
          active: true,
        };
        if (req.body.branch) {
          query = { ...query, branch: req.body.branch };
        }
        LoadingSlip.find(query, (LSErr, LSData) => {
          if (LSErr) {
            return res.status(200).json({ message: LSErr.message });
          }
          res.send(LSData);
        });
      } else {
        res.send([]);
      }
    }
  );
};

const saveSupplierPayments = (req, res, next) => {
  if (req.body.loadingSlips.length <= 0) {
    return res.status(401).json({ message: "Loading slips are required!" });
  }

  let updatedLs = [];
  req.body.loadingSlips.forEach(async (ls) => {
    try {
      const LSToBeUpdated = await LoadingSlip.findOne({ _id: ls.ls_id });
      LSToBeUpdated.supplierPayments.push({
        date: ls.date,
        paid: ls.paid,
        createdBy: ls.createdBy,
      });
      let savedLs = await LSToBeUpdated.save();
      if (savedLs) {
        updatedLs.push(savedLs);
        savedLs = null;
        if (updatedLs.length === req.body.loadingSlips.length) {
          return res.send(updatedLs);
        }
      }
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  });
};

const saveSupplierBill = (req, res, next) => {
  const bill = new SuppliersBill({
    branch: req.body.branch,
    supplier: req.body.supplier,
    supplierType: req.body.supplierType,
    supplyContent: req.body.supplyContent,
    date: req.body.date,
    invoiceNo: req.body.invoiceNo,
    invoiceDate: req.body.invoiceDate,
    quantity: req.body.quantity,
    amount: req.body.amount,
    createdBy: req.body.createdBy,
  });

  SuppliersBill.create(bill, (error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
};

const getSupplierBills = (req, res, next) => {
  if (!req.params.supplier) {
    return res.status(200).json({ message: "Supplier ID is required!" });
  }
  let params = {
    supplier: req.params.supplier,
    active: true,
  };
  if (req.body.branch) {
    params = { ...params, branch: req.body.branch };
  }
  SuppliersBill.find(
    { supplier: req.params.supplier, active: true },
    (err, data) => {
      if (err) {
        res.status(200).json({ message: err.message });
      }
      res.send(data);
    }
  );
};

const updateSupplierBills = (req, res, next) => {
  if (req.body.supplierBills.length <= 0) {
    return res.status(401).json({ message: "Supplier bills are required!" });
  }

  const updatedBills = [];
  req.body.supplierBills.forEach(async (bill) => {
    try {
      const billsToBeUpdated = await SuppliersBill.findOne({ _id: bill._id });
      billsToBeUpdated.payments.push({
        date: bill.date,
        paid: bill.paid,
        createdBy: bill.createdBy,
      });
      let savedBill = await billsToBeUpdated.save();
      if (savedBill) {
        updatedBills.push(savedBill);
        savedBill = null;
        if (updatedBills.length === req.body.supplierBills.length) {
          return res.send(updatedBills);
        }
      }
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  });
};

const updateLorryReceiptAckByLRNo = (req, res, next) => {
  if (!req.body.lrNo || req.noLrNo) {
    return res.status(200).json({ message: "Lorry receipt no is required!" });
  }

  if (req.alreadyExist) {
    return res
      .status(200)
      .json({ message: `POD file for ${req.body.lrNo} already exist!` });
  }

  if (req.lrNotExist) {
    return res
      .status(200)
      .json({ message: `${req.body.lrNo} does not exist!` });
  }

  if (!req.file) {
    return res.status(200).json({ message: "POD file is required!" });
  }
  let filePath = "";
  if (req.file) {
    const url = "https://" + req.get("host") + "/acknowledgement/";
    filePath = url + req.file.filename;
  }

  LorryReceipt.findOneAndUpdate(
    { wayBillNo: req.body.lrNo?.trim?.() },
    {
      $set: {
        ack: filePath,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        res.status(200).json({ message: error.message });
      } else {
        res.json(data);
      }
    }
  );
};

const getQuotations = (req, res) => {
  Quotation.find(
    { active: true },
    {},
    { sort: { createdAt: -1 } },
    (err, data) => {
      if (err) {
        return res.status(200).json({ message: err.message });
      }
      return res.send(data);
    }
  );
};

const getQuotation = (req, res) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Quotation id is required" });
  }
  Quotation.findById(req.params.id, (err, data) => {
    if (err) {
      return res.status(200).json({ message: err.message });
    }
    return res.send(data);
  });
};

const addQuotation = (req, res) => {
  const quotation = new Quotation({
    date: req.body.date,
    customer: req.body.customer,
    from: req.body.from,
    to: req.body.to,
    ratePer: req.body.ratePer,
    otherField: req.body.otherField,
    stations: req.body.stations,
    createdBy: req.body.createdBy,
  });

  Quotation.findOne(
    {},
    {},
    { sort: { createdAt: -1 } },
    function (err, foundQuotation) {
      if (foundQuotation) {
        quotation.quotationNo = foundQuotation.quotationNo + 1;
      } else {
        quotation.quotationNo = 1;
      }
      Quotation.create(quotation, (error, data) => {
        if (error) {
          return res.status(200).json({ message: error.message });
        } else {
          return res.send(data);
        }
      });
    }
  );
};

const updateQuotation = (req, res) => {
  if (!req.body._id) {
    return res.status(200).json({ message: "Quotation ID is required!" });
  }

  Quotation.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        date: req.body.date,
        customer: req.body.customer,
        from: req.body.from,
        to: req.body.to,
        ratePer: req.body.ratePer,
        otherField: req.body.otherField,
        stations: req.body.stations,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(200).json({ message: error.message });
      } else {
        return res.json(data);
      }
    }
  );
};

const removeQuotation = (req, res) => {
  if (!req.params.id || !req.body.id) {
    return res.status(200).json({ message: "Quotation ID is required!" });
  }
  const _id = req.body.id || req.params.id;
  Quotation.findByIdAndUpdate(
    _id,
    {
      $set: {
        active: false,
        updatedBy: req.body.updatedBy,
      },
    },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(200).json({ message: error.message });
      } else {
        return res.json(data);
      }
    }
  );
};

const viewQuotation = (req, res) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "Quotation ID is required" });
  }
  Quotation.findById(req.params.id, (error, data) => {
    if (error) {
      return res.status(200).json({ message: error.message });
    }
    if (data) {
      const stations1 = [];
      const stations2 = [];
      const stations3 = [];
      const row0 = [
        0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54,
        57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99,
      ];
      const row1 = [
        1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55,
        58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94, 97, 100,
      ];
      const row2 = [
        2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56,
        59, 62, 65, 68, 71, 74, 77, 80, 83, 86, 89, 92, 95, 98, 101,
      ];
      data.stations.forEach((station, index) => {
        if (row0.indexOf(index) >= 0) {
          stations1.push(station);
        } else if (row1.indexOf(index) >= 0) {
          stations2.push(station);
        } else if (row2.indexOf(index) >= 0) {
          stations3.push(station);
        } else {
          stations1.push(station);
        }
      });
      let blankRows1 = [];
      let blankRows2 = [];
      let blankRows3 = [];

      blankRows1.length =
        28 - stations1?.length < 0 ? 0 : 28 - stations1?.length;
      blankRows2.length =
        28 - stations2?.length < 0 ? 0 : 28 - stations2?.length;
      blankRows3.length =
        28 - stations3?.length < 0 ? 0 : 28 - stations3?.length;

      // const logo = base64_encode(
      //   path.join(__dirname, "../public/images/logo.png")
      // );
      // const laxmi = base64_encode(
      //   path.join(__dirname, "../public/images/laxmi.jpeg")
      // );
      const templatePath = path.join(__dirname, "../bills/") + "Quotation.html";
      res.render(
        templatePath,
        {
          info: {
            quotation: data,
            date: getFormattedDateString(data.date),
            fromDate: getFormattedDateString(data.from),
            toDate: getFormattedDateString(data.to),
            stations1: stations1,
            stations2: stations2,
            stations3: stations3,
            // logo: logo,
            // laxmi: laxmi,
            blankRows1,
            blankRows2,
            blankRows3,
            createdDate: converDateFormat(data.createdAt),
            printDate: converDateFormat(Date.now()),
          },
        },
        (err, HTML) => {
          const finalPath = path.join(__dirname, "../bills/quotations/");
          const fileName = data.quotationNo;
          pdf
            .create(HTML, options2)
            // .toFile(path.join(finalPath, fileName + ".pdf"), (err, result) => {
            //   if (err) {
            //     return res.status(200).send({
            //       message: err,
            //     });
            //   }
            //   return res.sendFile(result.filename);
            // });
            .toBuffer((buffErr, buffer) => {
              if (buffErr) {
                return res.status(200).json({ message: buffErr.message });
              }
              const base64String = buffer.toString("base64");

              if (req.body.email && req.body.email?.trim() !== "") {
                sendEmail(
                  req.body.email,
                  base64String,
                  `${fileName}.pdf`,
                  `DTC - Quotation no. ${fileName}`,
                  `DTC - Quotation no. ${fileName}`,
                  `<p><b>Hello</b></p><p>Please find attached quotation.</p>`
                )
                  .then((response) => {
                    return res.json({ success: true });
                  })
                  .catch((err) => {
                    return res.status(200).json({ message: err });
                  });
              } else {
                return res.json({ file: base64String });
              }
            });
        }
      );
    }
  });
};

const viewPaymentCollection = (req, res) => {
  if (!req.params.billId || !req.params.collectionId) {
    return res
      .status(200)
      .json({ message: "Bill and Collection IDs are required" });
  }
  Bill.findById(req.params.billId, async (err, data) => {
    if (err) {
      return res.status(200).json({ message: err.message });
    }
    let payment;
    if (data && data.paymentCollection && data.paymentCollection.length) {
      Customer.findById(data.customer, (customerErr, customerData) => {
        if (customerErr) {
          return res.status(200).json({ message: customerErr.message });
        }
        const payments = JSON.parse(JSON.stringify(data.paymentCollection));
        payment = payments.find((pay) => pay._id === req.params.collectionId);
        paymentIndex =
          payments.findIndex((pay) => pay._id === req.params.collectionId) + 1;
        const voucherNumber = `${getFormattedLSNumber(
          data.billNo
        )}_${paymentIndex}`;

        const templatePath = path.join(__dirname, "../bills/") + "Voucher.html";

        res.render(
          templatePath,
          {
            info: {
              voucherNumber: voucherNumber,
              bill: data,
              customer: customerData.name,
              billNo: getFormattedLSNumber(data.billNo),
              billDate: getFormattedDateString(data.date),
              paymentDate: payment.chequeDate
                ? getFormattedDateString(payment.chequeDate)
                : getFormattedDateString(payment.receivingDate),
              payment: payment.receive?.toFixed?.(2),
              paymentMode:
                payment.payMode?.toLowerCase() === "cheque"
                  ? `by ${payment.payMode} no`
                  : `by ${payment.payMode}`,
              chequeNo: payment.chequeNo ? payment.chequeNo : "-",
              bank: payment.bankName ? payment.bankName : "-",
              receive: getWordNumber(payment.receive || 0),
              date: getFormattedDateString(payment.receivingDate),
              note:
                payment.payMode.toLowerCase() === "cheque"
                  ? "Subject to realisation of cheque"
                  : "",
              createdDate: converDateFormat(data.createdAt),
              printDate: converDateFormat(Date.now()),
            },
          },
          (err, HTML) => {
            const finalPath = path.join(__dirname, "../bills/vouchers/");
            const fileName = voucherNumber;
            var isWin = process.platform === "win32";
            let htmlRaw = HTML;
            if (isWin) {
              htmlRaw = htmlRaw.replace("0.55", "1");
            }
            pdf.create(htmlRaw, options2).toBuffer((buffErr, buffer) => {
              if (buffErr) {
                return res.status(200).json({ message: buffErr.message });
              }
              const base64String = buffer.toString("base64");
              if (req.body.email && req.body.email?.trim() !== "") {
                sendEmail(
                  req.body.email,
                  base64String,
                  `${fileName}.pdf`,
                  `DTC - Payment voucher no. ${fileName}`,
                  `DTC - Payment voucher no. ${fileName}`,
                  `<p><b>Hello</b></p><p>Please find attached payment voucher.</p>`
                )
                  .then((response) => {
                    return res.json({ success: true });
                  })
                  .catch((err) => {
                    return res.status(200).json({ message: err });
                  });
              } else {
                return res.json({ file: base64String });
              }
            });
          }
        );
      });
    }
  });
};

const getLorryReceiptsForReport = async (req, res) => {
  try {
    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    let { branch, lrno, consignor, consignee, from, to, payType } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    consignor = consignor || "";
    consignee = consignee || "";
    payType = payType || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getlrlistforreport(?,?,?,?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [lrno, branch, consignor, consignee, formattedStartDate, formattedEndDate, payType, start_index, counts]);
    } else {
      result = await db.query(query, [lrno, branch, consignor, consignee, null, null, payType, start_index, counts])
    }
    // console.log(result[0][1])

    const { total_count } = result[0]?.[1]?.[0]
    if (result[0][0].length > 0) {
      return res.json({
        lorryReceipts: result[0][0],
        count: total_count
      });
    } else {
      return res.json({
        lorryReceipts: 0,
        count: 0,
        message: "No Data Found"
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
  // if (!req.body.pagination.page || !req.body.pagination.limit) {
  //   return res.status(200).json({ message: "Pagination inputs not provided!" });
  // }

  // const limit = req.body.pagination.limit || 100;
  // const start = (req.body.pagination.page - 1) * limit;
  // const end = req.body.pagination.page * limit;

  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.consignor) {
  //     query.consignor = req.body.query.consignor;
  //   }
  //   if (req.body.query.consignee) {
  //     query.consignee = req.body.query.consignee;
  //   }
  //   if (req.body.query.from) {
  //     const date = new Date(req.body.query.from);
  //     const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
  //     query.date = {
  //       ...query.date,
  //       $gte: new Date(newDate)?.toISOString(),
  //     };
  //   }
  //   if (req.body.query.to) {
  //     const date = new Date(req.body.query.to);
  //     const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //     query.date = {
  //       ...query.date,
  //       $lte: new Date(newDate)?.toISOString(),
  //     };
  //   }
  //   if (req.body.query.payType) {
  //     query.payType = req.body.query.payType;
  //   }
  // }

  // LorryReceipt.count(query, (countErr, count) => {
  //   if (countErr) {
  //     return res.status(200).json({
  //       message: "Error fetching lorry count!",
  //     });
  //   } else {
  //     LorryReceipt.find(query)
  //       .sort("-createdAt")
  //       .exec((lrError, lorryReceipts) => {
  //         if (lrError) {
  //           return res.status(200).json({
  //             message: "Error fetching lorry receipts!",
  //           });
  //         } else {
  //           res.json({
  //             lorryReceipts: lorryReceipts.slice(start, end),
  //             count: lorryReceipts?.length,
  //           });
  //         }
  //       });
  //   }
  // });
};

const downloadLRReport = async (req, res) => {
  // console.log(req.body)
  try {
    let { branch, lrno, consignor, consignee, from, to, payType } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    consignor = consignor || "";
    consignee = consignee || "";
    payType = payType || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getlrlistforreporttoexcel(?,?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [lrno, branch, consignor, consignee, formattedStartDate, formattedEndDate, payType]);
    } else {
      result = await db.query(query, [lrno, branch, consignor, consignee, null, null, payType])
    }

    const updateLR = result[0][0].map((row, index) => ({
      ...row, index: index + 1
    }))

    // console.log("print data : ", result[0][0])
    if (result) {
      const workbook = exportLRDataToXlsx(updateLR);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      );
      return workbook.xlsx.write(res).then(() => {
        console.log("excel success")
        res.status(200).end();
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.consignor) {
  //     query.consignor = req.body.query.consignor;
  //   }
  //   if (req.body.query.consignee) {
  //     query.consignee = req.body.query.consignee;
  //   }
  //   if (req.body.query.from) {
  //     const date = new Date(req.body.query.from);
  //     const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
  //     query.date = {
  //       ...query.date,
  //       $gte: new Date(newDate)?.toISOString(),
  //     };
  //   }
  //   if (req.body.query.to) {
  //     const date = new Date(req.body.query.to);
  //     const updatedDate = new Date(date).setDate(date?.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //     query.date = {
  //       ...query.date,
  //       $lte: new Date(newDate)?.toISOString(),
  //     };
  //   }
  // }
  // LorryReceipt.find(query)
  //   .sort("-createdAt")
  //   .exec((err, data) => {
  //     if (err) {
  //       return res.status(200).json({ message: err.message });
  //     }
  //     if (data && data.length) {
  //       const updatedData = JSON.parse(JSON.stringify(data));
  //       const printData = [];
  //       updatedData.forEach(async (lr, index) => {
  //         try {
  //           const consignor = await Customer.findById(lr.consignor);
  //           const consignee = await Customer.findById(lr.consignee);

  //           const from = await Place.findById(lr.from);
  //           const to = await Place.findById(lr.to);

  //           lr.from = from?.name || "";
  //           lr.to = to?.name || "";

  //           lr.formattedLRNo = lr.lrNo;
  //           lr.formattedDate = getFormattedDate(lr.date);
  //           lr.consignorName =
  //             consignor && consignor.name ? consignor.name : lr.consignor;
  //           lr.consigneeName =
  //             consignee && consignee.name ? consignee.name : lr.consignee;
  //           lr.totalArticles = lr.transactions.reduce(
  //             (acc, tr) => acc + tr.articleNo,
  //             0
  //           );
  //           lr.totalWeight = lr.transactions.reduce(
  //             (acc, tr) => acc + tr.weight,
  //             0
  //           );
  //           lr.totalChargeWeight = lr.transactions.reduce(
  //             (acc, tr) => acc + tr.chargeWeight,
  //             0
  //           );
  //           lr.totalFreight = lr.transactions.reduce(
  //             (acc, tr) => acc + tr.freight,
  //             0
  //           );
  //           lr.index = index + 1;
  //           printData.push(lr);

  //           if (updatedData.length === printData.length) {
  //             const workbook = exportLRDataToXlsx(updatedData);
  //             res.setHeader(
  //               "Content-Type",
  //               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //             );
  //             res.setHeader(
  //               "Content-Disposition",
  //               "attachment; filename=" + "data.xlsx"
  //             );
  //             return workbook.xlsx.write(res).then(() => {
  //               res.status(200).end();
  //             });
  //           }
  //         } catch (e) { }
  //       });
  //     }
  //   });
};

const getBilledLRReport = async (req, res) => {

  try {
    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    let { branch, customer, lrno } = req.body.query
    if (!customer && !lrno) {
      return res.json({
        lorryReceipts: [],
        count: 0,
        isLastPage: true,
      });
    }
    customer = customer || "";
    lrno = lrno || "";
    const query = 'CALL getlrlistforlrstatusreport(?,?,?,?,?)'
    const result = await db.query(query, [branch, customer, lrno.trim(), start_index, counts])
    // console.log(result[0][0])
    if (result) {
      // const updateLS = result[0][0].map((row) => ({
      //   ...row,
      //   hire: row.hire || 0,
      //   adv_amt: row.adv_am || 0,
      //   total: row.total || 0
      // }))
      const { total_count } = result[0][1][0]
      return res.json({
        lorryReceipts: result[0][0],
        count: total_count,
        isLastPage: true,
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};

const downloadBilledLRReport = async (req, res) => {
  console.log(req.body)
  try {
    let { branch, customer, lrno } = req.body.query
    customer = customer || "";
    lrno = lrno || "";
    const query = 'CALL getlrlistforlrstatusreportexcel(?,?,?)'
    const result = await db.query(query, [branch, customer, lrno])
    // console.log(result[0][0])
    if (result) {
      const updateLRstatus = result[0][0].map((row, index) => ({
        ...row,
        index: index + 1,
        dc_no: row.dc_no || "-",
        dc_date: row.dc_date || "-",
        bill_no: row.bill_no || "-",
        bill_date: row.bill_date || "-",
        local_memo_no: row.local_memo_no || "-",
        local_memo_date: row.local_memo_date || "-",
        ack_date: row.ack_date || "-",
        pc_date: row.pc_date || "-",
        pa_date: row.pa_date || "-"
      }))
      const workbook = exportLRBillDataToXlsx(updateLRstatus);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      );
      return workbook.xlsx.write(res).then(() => {
        res.status(200).end();
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
  // if (!req.body.query || !req.body.query.branch) {
  //   return res.status(400).json({ message: "Branch is required!" });
  // }
  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.customer) {
  //     query.consignor = req.body.query.customer;
  //   }
  //   if (req.body.query.billed) {
  //     if (req.body.query.billed?.toLowerCase?.() === "billed") {
  //       query.billGenerated = true;
  //     }
  //     if (req.body.query.billed.toLowerCase?.() === "not billed") {
  //       query.billGenerated = false;
  //     }
  //   }
  // }

  // LorryReceipt.find(query)
  //   .sort("-createdAt")
  //   .exec((lrError, lorryReceipts) => {
  //     if (lrError) {
  //       return res.status(401).json({
  //         message: lrError.message,
  //       });
  //     } else {
  //       const printData = [];
  //       const updatedLR = JSON.parse(JSON.stringify(lorryReceipts));
  //       updatedLR.forEach(async (lr, index) => {
  //         try {
  //           if (lr.assoBill) {
  //             const fetchedBill = await Bill.findById(lr.assoBill);
  //             lr.billDetails = fetchedBill;
  //             lr.formattedLRNo = lr.lrNo;
  //             lr.index = index + 1;
  //             lr.formattedDate = getFormattedDate(lr.date);
  //             lr.billNo = getFormattedLSNumber(lr.billDetails.billNo);
  //             lr.billDate = getFormattedDate(lr.billDetails.date);
  //             lr.billDueDate = getFormattedDate(lr.billDetails.dueDate);
  //             lr.formattedAmount = lr.total.toFixed(2);
  //             printData.push(lr);
  //           } else {
  //             lr.formattedLRNo = lr.lrNo;
  //             lr.index = index + 1;
  //             lr.formattedDate = getFormattedDate(lr.date);
  //             lr.formattedAmount = lr.total.toFixed(2);
  //             printData.push(lr);
  //           }
  //           if (updatedLR.length === printData.length) {
  //             const workbook = exportLRBillDataToXlsx(updatedLR);
  //             res.setHeader(
  //               "Content-Type",
  //               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //             );
  //             res.setHeader(
  //               "Content-Disposition",
  //               "attachment; filename=" + "data.xlsx"
  //             );
  //             return workbook.xlsx.write(res).then(() => {
  //               res.status(200).end();
  //             });
  //           }
  //         } catch (e) {
  //           return res.status(401).json({
  //             message: e.message,
  //           });
  //         }
  //       });
  //     }
  //   });
};

const downloadLSReport = async (req, res) => {

  // console.log(req.body)
  try {
    let { branch, from, to, transporter, vehicleNo, lrNo } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    transporter = transporter || "";
    vehicleNo = vehicleNo || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);;
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);;
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getdclistforreporttoexcel(?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [branch, transporter, vehicleNo, formattedStartDate, formattedEndDate, lrNo]);
    } else {
      result = await db.query(query, [branch, transporter, vehicleNo, null, null, lrNo])
    }
    // console.log(result[0][0])
    if (result) {
      const updateLS = result[0][0].map((row, index) => ({
        ...row,
        index: index + 1,
        hire: row.hire || 0,
        adv_amt: row.adv_am || 0,
        total: row.total || 0,
        totalPaid: 0
      }))

      const workbook = exportLSDataToXlsx(updateLS);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      );
      return workbook.xlsx.write(res).then(() => {
        res.status(200).end();
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }

  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.from) {
  //     const date = new Date(req.body.query.from);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
  //     query.date = {
  //       ...query.date,
  //       $gte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (req.body.query.to) {
  //     const date = new Date(req.body.query.to);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //     query.date = {
  //       ...query.date,
  //       $lte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (req.body.query.transporter) {
  //     query.vehicleOwner = req.body.query.transporter;
  //   }
  //   if (req.body.query.vehicleNo) {
  //     query.vehicleNo = req.body.query.vehicleNo;
  //   }
  //   if (req.body.query.driverName) {
  //     query.driverName = req.body.query.driverName;
  //   }
  // }
  // LoadingSlip.find(query)
  //   .sort("-createdAt")
  //   .exec((err, data) => {
  //     if (err) {
  //       return res.status(401).json({ message: err.message });
  //     }
  //     if (data && data.length) {
  //       const updatedData = JSON.parse(JSON.stringify(data));
  //       const printData = [];
  //       updatedData.forEach(async (ls, index) => {
  //         try {
  //           ls.formattedLSNo = getFormattedLSNumber(ls.lsNo);
  //           ls.formattedDate = getFormattedDate(ls.date);
  //           ls.index = index + 1;
  //           ls.fromPlace = ls.fromName;
  //           ls.toPlace = ls.toName;
  //           ls.totalPaid = ls.supplierPayments.reduce(
  //             (acc, payment) => acc + payment.paid,
  //             0
  //           );
  //           ls.totalBalance =
  //             +ls.hire +
  //             +ls.hamali -
  //             +ls.advance -
  //             +ls.commission -
  //             +ls.stacking -
  //             ls.totalPaid;
  //           printData.push(ls);

  //           if (updatedData.length === printData.length) {
  //             const workbook = exportLSDataToXlsx(updatedData);
  //             res.setHeader(
  //               "Content-Type",
  //               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //             );
  //             res.setHeader(
  //               "Content-Disposition",
  //               "attachment; filename=" + "data.xlsx"
  //             );
  //             return workbook.xlsx.write(res).then(() => {
  //               res.status(200).end();
  //             });
  //           }
  //         } catch (e) {
  //           return res.status(401).json({ message: e.message });
  //         }
  //       });
  //     }
  //   });
};

const getBillsForReport = async (req, res) => {

  console.log(req.body)

  try {
    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    let { branch, from, to, status, customer, lrno } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    customer = customer || "";
    status = status || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getbilllistforreport(?,?,?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [branch, customer, formattedStartDate, formattedEndDate, status, start_index, counts, lrno]);
    } else {
      result = await db.query(query, [branch, customer, null, null, status, start_index, counts, lrno])
    }

    if (result) {
      const updateBill = result[0][0].map((row) => ({
        ...row,
        tot_amount: parseFloat(row.tot_amount).toFixed(2),
        totalReceived: (0).toFixed(2),
        totalBalance: parseFloat(row.tot_amount - 0).toFixed(2),
        status: 'open'
      }))
      const { total_count } = result[0][1][0]
      return res.json({
        bills: updateBill,
        count: total_count,
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
  // if (
  //   !req.body.pagination.page ||
  //   !req.body.pagination.limit ||
  //   !req.body.query ||
  //   !req.body.query.branch
  // ) {
  //   return res
  //     .status(400)
  //     .json({ message: "Branch and Pagination inputs are required!" });
  // }

  // const limit = req.body.pagination.limit || 100;
  // const skip = req.body.pagination.page * limit - limit;

  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.from) {
  //     const date = new Date(req.body.query.from);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
  //     query.date = {
  //       ...query.date,
  //       $gte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (req.body.query.to) {
  //     const date = new Date(req.body.query.to);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //     query.date = {
  //       ...query.date,
  //       $lte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (
  //     req.body.query.status &&
  //     req.body.query.status.toLowerCase() !== "all"
  //   ) {
  //     query.status = req.body.query.status.toLowerCase();
  //   }
  //   if (req.body.query.customer) {
  //     query.customer = req.body.query.customer;
  //   }
  // }

  // Bill.count(query, (countErr, count) => {
  //   if (countErr) {
  //     return res.status(404).json({
  //       message: countErr.message,
  //     });
  //   } else {
  //     if (count && count > 0) {
  //       Bill.find(query)
  //         .limit(limit)
  //         .skip(skip)
  //         .sort("-createdAt")
  //         .exec((billError, bills) => {
  //           if (billError) {
  //             return res.status(401).json({
  //               message: billError.message,
  //             });
  //           } else {
  //             const isLastPage = count - (skip + limit) <= 0;
  //             return res.json({
  //               bills: bills,
  //               count: count,
  //               isLastPage: isLastPage,
  //             });
  //           }
  //         });
  //     } else {
  //       return res.json({
  //         bills: [],
  //         count: 0,
  //         isLastPage: true,
  //       });
  //     }
  //   }
  // });
};

const downloadBillsReport = async (req, res) => {
  try {
    let { branch, from, to, status, customer, lrno } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    customer = customer || "";
    status = status || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getbilllistforreporttoexcel(?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [branch, customer, formattedStartDate, formattedEndDate, status, lrno]);
    } else {
      result = await db.query(query, [branch, customer, null, null, status, lrno])
    }

    if (result) {
      const updateBill = result[0][0].map((row, index) => ({
        ...row,
        index: index + 1,
        tot_amount: parseFloat(row.tot_amount).toFixed(2),
        totalReceived: (0).toFixed(2),
        totalBalance: parseFloat(row.tot_amount - 0).toFixed(2),
        status: 'open'
      }))
      const workbook = exportBillDataToXlsx(updateBill);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "data.xlsx"
      );
      return workbook.xlsx.write(res).then(() => {
        res.status(200).end();
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
  // const query = { active: true };
  // if (req.body.query) {
  //   if (req.body.query.branch) {
  //     query.branch = req.body.query.branch;
  //   }
  //   if (req.body.query.from) {
  //     const date = new Date(req.body.query.from);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
  //     query.date = {
  //       ...query.date,
  //       $gte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (req.body.query.to) {
  //     const date = new Date(req.body.query.to);
  //     const updatedDate = new Date(date).setDate(date.getDate() + 1);
  //     const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
  //     query.date = {
  //       ...query.date,
  //       $lte: new Date(newDate).toISOString(),
  //     };
  //   }
  //   if (
  //     req.body.query.status &&
  //     req.body.query.status.toLowerCase() !== "all"
  //   ) {
  //     query.status = req.body.query.status.toLowerCase();
  //   }
  //   if (req.body.query.customer) {
  //     query.customer = req.body.query.customer;
  //   }
  // }
  // Bill.find(query)
  //   .sort("-createdAt")
  //   .exec((err, data) => {
  //     if (err) {
  //       return res.status(401).json({ message: err.message });
  //     }
  //     if (data && data.length) {
  //       const updatedData = JSON.parse(JSON.stringify(data));
  //       const printData = [];
  //       updatedData.forEach(async (bill, index) => {
  //         try {
  //           bill.formattedBillNo = getFormattedLSNumber(bill.billNo);
  //           bill.formattedDate = getFormattedDate(bill.date);
  //           bill.customerData = await Customer.findById(bill.customer);
  //           bill.customerName =
  //             bill.customerData && bill.customerData.name
  //               ? bill.customerData.name
  //               : "";
  //           bill.totalReceived = bill.totalReceived ? bill.totalReceived : 0;
  //           bill.balanceAmount = bill.total - bill.totalReceived;
  //           bill.status = titleCase(bill.status);
  //           bill.index = index + 1;
  //           printData.push(bill);
  //           if (updatedData.length === printData.length) {
  //             const workbook = exportBillDataToXlsx(updatedData);
  //             res.setHeader(
  //               "Content-Type",
  //               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //             );
  //             res.setHeader(
  //               "Content-Disposition",
  //               "attachment; filename=" + "data.xlsx"
  //             );
  //             return workbook.xlsx.write(res).then(() => {
  //               res.status(200).end();
  //             });
  //           }
  //         } catch (e) {
  //           return res.status(401).json({ message: e.message });
  //         }
  //       });
  //     }
  //   });
};

const getAllLRAck = async (req, res) => {
  try {
    const query = 'CALL get_lrforack()';
    const result = await db.query(query);
    if (result) {
      return res.json(result[0][0])
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).json({ messgae: "Internal Server Error" })
  }
  // let query = {
  //   active: true,
  //   status: { $ne: 0 },
  //   $or: [{ deliveryDate: null }, { deliveryDate: "" }],
  // };
  // // if (req.body.branch) {
  // //   query = { ...query, branch: req.body.branch };
  // // }
  // LorryReceipt.find(query).exec((lrError, lorryReceipts) => {
  //   if (lrError) {
  //     return res.status(200).json({
  //       message: "Error fetching lorry receipts!",
  //     });
  //   } else {
  //     return res.json(lorryReceipts);
  //   }
  // });
};

const getAllLRAckList = (req, res) => {
  let query = {
    active: true,
    status: { $ne: 0 },
    ack: { $or: [{ $ne: "" }, { $ne: undefined }] },
    $or: [{ deliveryDate: null }, { deliveryDate: "" }],
  };
  if (req.body.branch) {
    query = { ...query, branch: req.body.branch };
  }
  LorryReceipt.find(query).exec((lrError, lorryReceipts) => {
    if (lrError) {
      return res.status(200).json({
        message: "Error fetching lorry receipts!",
      });
    } else {
      return res.json(lorryReceipts);
    }
  });
};

const getChallanAck = (req, res) => {
  const _id = req.params.id;
  const query = {
    lrList: {
      $elemMatch: {
        _id,
      },
    },
  };
  LoadingSlip.findOne(query).exec((lrError, lorryReceipts) => {
    if (lrError) {
      return res.status(200).json({
        message: "Error fetching lorry receipts!",
      });
    } else {
      return res.json(lorryReceipts);
    }
  });
};

const addFONum = (req, res) => {
  if (!req.body._id) {
    return res.status(200).json({ message: "Lorry receipt ID is required!" });
  }

  try {
    LorryReceipt.findByIdAndUpdate(
      req.body._id,
      {
        $set: {
          foNum: req.body.foNum,
          updatedBy: req.body.updatedBy,
        },
      },
      { new: true },
      (error, data) => {
        if (error) {
          res.status(200).json({ message: error.message });
        } else {
          res.json(data);
        }
      }
    );
  } catch (e) {
    return res.status(200).json({ message: e.message });
  }
};

const getLoadingSlipsForReport = (req, res) => {
  if (
    !req.body.pagination.page ||
    !req.body.pagination.limit ||
    !req.body.query ||
    !req.body.query.branch
  ) {
    return res
      .status(400)
      .json({ message: "Branch and Pagination inputs are required!" });
  }

  const limit = req.body.pagination.limit || 100;
  const skip = req.body.pagination.page * limit - limit;

  const query = { active: true };
  if (req.body.query) {
    if (req.body.query.branch) {
      query.branch = req.body.query.branch;
    }
    if (req.body.query.from) {
      const date = new Date(req.body.query.from);
      const updatedDate = new Date(date).setDate(date.getDate() + 1);
      const newDate = new Date(updatedDate).setUTCHours(0, 0, 0, 000);
      query.date = {
        ...query.date,
        $gte: new Date(newDate).toISOString(),
      };
    }
    if (req.body.query.to) {
      const date = new Date(req.body.query.to);
      const updatedDate = new Date(date).setDate(date.getDate() + 1);
      const newDate = new Date(updatedDate).setUTCHours(23, 59, 59, 999);
      query.date = {
        ...query.date,
        $lte: new Date(newDate).toISOString(),
      };
    }
    if (req.body.query.transporter) {
      query.vehicleOwner = req.body.query.transporter;
    }
    if (req.body.query.vehicleNo) {
      query.vehicleNo = req.body.query.vehicleNo;
    }
    if (req.body.query.driverName) {
      query.driverName = req.body.query.driverName;
    }
  }

  LoadingSlip.count(query, (countErr, count) => {
    if (countErr) {
      return res.status(404).json({
        message: "Error fetching lorry count!",
      });
    } else {
      if (count > 0) {
        LoadingSlip.find(query)
          .limit(limit)
          .skip(skip)
          .sort("-createdAt")
          .exec((lrError, loadingSlips) => {
            if (lrError) {
              return res.status(401).json({
                message: "Error fetching loading slips!",
              });
            } else {
              const isLastPage = count - (skip + limit) <= 0;
              const updatedLS = JSON.parse(JSON.stringify(loadingSlips));
              updatedLS.forEach(async (ls, index) => {
                try {
                  const lrNos = ls.lrList.map((lr) => lr._id);
                  const allLR = await LorryReceipt.find({
                    _id: {
                      $in: lrNos,
                    },
                  });
                  ls.allLR = allLR;
                  if (index === loadingSlips.length - 1) {
                    return res.json({
                      loadingSlips: updatedLS,
                      count: count,
                      isLastPage: isLastPage,
                    });
                  }
                } catch (e) {
                  return res.status(401).json({
                    message: e.message,
                  });
                }
              });
            }
          });
      } else {
        return res.json({
          loadingSlips: [],
          count: 0,
          isLastPage: true,
        });
      }
    }
  });
};

const getLoadingSlipForReport = async (req, res) => {
  console.log(req.body)
  try {
    const page = parseInt(req.body.page) || 0;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const start_index = page + 1;
    const counts = pageSize;

    let { branch, from, to, transporter, vehicleNo, lrNo } = req.body.query
    let formattedStartDate = null;
    let formattedEndDate = null;
    transporter = transporter || "";
    vehicleNo = vehicleNo || "";
    if (from) {
      formattedStartDate = formatDateToDDMMYYYY(from);;
      console.log("form data : ", formattedStartDate)
    }

    if (to) {
      formattedEndDate = formatDateToDDMMYYYY(to);;
      console.log("form data : ", formattedEndDate)
    }
    const query = 'CALL getdclistforreport(?,?,?,?,?,?,?,?)'
    let result;
    if (formattedStartDate && formattedEndDate) {
      result = await db.query(query, [branch, transporter, vehicleNo, formattedStartDate, formattedEndDate, start_index, counts, lrNo]);
    } else {
      result = await db.query(query, [branch, transporter, vehicleNo, null, null, start_index, counts, lrNo])
    }
    // console.log(result[0][0])
    if (result) {
      const updateLS = result[0][0].map((row) => ({
        ...row,
        hire: row.hire || 0,
        adv_amt: row.adv_am || 0,
        total: row.total || 0
      }))
      const { total_count } = result[0][1][0]
      return res.json({
        loadingSlips: updateLS,
        count: total_count,
      });
    }
  } catch (error) {
    console.log("Error : ", error);
    return res.status(500).send(error);
  }
};

const updateMultiLorryReceiptAck = async (req, res, next) => {
  const { list } = req.body;

  if (!list?.length) {
    return res.status(200).json({ message: "Lorry receipt ID is required!" });
  }

  try {
    const query = 'CALL addacknowledgement(?,?,?)'
    const promises = map(list, ({ deliveryDate, id }) => {
      const date = new Date(deliveryDate).toLocaleDateString('en-IN').split('/').reverse().join('-');
      db.query(query, [id, date, date])
    }
    );
    const data = await Promise.all(promises);
    res.json(data);
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

module.exports = {
  getLorryReceipts,
  getLorryReceiptsWithCount,
  getLorryReceiptsBySearch,
  getLRAckWithCount,
  getAcknowledgeById,
  getAllLorryReceiptsWithCount,
  getLorryReceiptsByConsignor,
  getLorryReceiptsByConsignorEdit,
  addLorryReceipt,
  checkDuplicateLR,
  removeLorryReceipt,
  viewLorryReceipt,
  getLorryReceipt,
  updateLorryReceipt,
  updateMultiLorryReceiptAck,
  updateLorryReceiptAck,
  removeLorryReceiptAck,
  getLoadingSlips,
  getLoadingSlipsSearch,
  getLocalMemos,
  getLocalMemoSearch,
  addLoadingSlip,
  removeLoadingSlip,
  getLoadingSlip,
  updateLoadingSlip,
  printLoadingSlip,
  addLoaclMemo,
  getLocalMemo,
  updateLocalMemo,
  printLocalMemo,
  removeLocalMemo,
  getMoneyTransfers,
  addMoneyTransfer,
  removeMoneyTransfer,
  updateMoneyTransfer,
  getMoneyTransfer,
  getPettyTransactions,
  addPettyTransaction,
  getPettyCashBalance,
  getPettyTransactionsByDate,
  getLoadingSlipsById,
  getLorryReceiptsByDate,
  getBills,
  getBillsByBranch,
  getBillsBySearch,
  getBillsByCustomer,
  addBill,
  getLorryReceiptsForBilldetials,
  removeBill,
  getBill,
  printBill,
  updateBill,
  updateBills,
  getLastLR,
  getLoadingSlipsBySupplier,
  saveSupplierPayments,
  saveSupplierBill,
  getSupplierBills,
  updateSupplierBills,
  updateLorryReceiptAckByLRNo,
  getLorryReceiptsForLSdetials,
  getQuotations,
  getQuotation,
  addQuotation,
  updateQuotation,
  removeQuotation,
  viewQuotation,
  viewPaymentCollection,
  getLorryReceiptsForReport,
  downloadLRReport,
  downloadLSReport,
  getAllLRAck,
  addFONum,
  getLoadingSlipForReport,
  getLorryReceiptsForLS,
  getLorryReceiptsForLocalMemo,
  getlrforloadingsheetedit,
  getlrforlocalmemoedit,
  getChallanAck,
  exportToExcelBill,
  getBillsForReport,
  downloadBillsReport,
  getBilledLRReport,
  downloadBilledLRReport,
  getAllLRAckList,
};

const exportLRDataToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Lorry receipts");
  const columns = data.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );
  worksheet.columns = [
    { header: "Sr. no", key: "index" },
    { header: "LR No", key: "lr_no" },
    { header: "Date", key: "lr_date" },
    { header: "Invoice no", key: "invoiceNo" },
    { header: "Vehicle no", key: "vehicleno" },
    { header: "Consignor", key: "consigner" },
    { header: "Consignee", key: "consignee" },
    { header: "From", key: "loc_from" },
    { header: "To", key: "loc_to" },
    { header: "Total Articles", key: "no_of_articles" },
    { header: "Total weight", key: "actual_weight" },
    { header: "Total charge weight", key: "charge_weight" },
    { header: "Total freight", key: "freight" },
  ];
  worksheet.addRows(data);
  return workbook;
};

const exportLRChallanDataToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("LR Challan");
  const columns = data.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );

  worksheet.columns = [
    { header: "Sr. no", key: "index" },
    { header: "LS no.", key: "lsNo" },
    { header: "Date", key: "date" },
    { header: "Vehicle no", key: "vehicleNo" },
    { header: "Driver", key: "driverName" },
    { header: "Driver phone", key: "phone" },
    { header: "From", key: "fromName" },
    { header: "To", key: "toName" },
    { header: "Hire amount", key: "totalFreight" },
    { header: "Balance", key: "totalPayable" },
  ];
  worksheet.addRows(data);
  return workbook;
};

const exportBillToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bill");
  const columns = data.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );
  worksheet.columns = [
    { header: "Date", key: "formattedDate" },
    { header: "LR No", key: "formattedLRNo" },
    { header: "Station", key: "to" },
    { header: "Invoice No.", key: "invoiceNo" },
    { header: "Article", key: "article" },
    { header: "FO Num", key: "foNum" },
    { header: "Weight", key: "weight" },
    { header: "No. of Article", key: "articleNo" },
    { header: "Rate", key: "rate" },
    { header: "LR Charge", key: "lrCharges" },
    { header: "Hamali", key: "hamali" },
    { header: "Delivery Charges", key: "deliveryCharges" },
    { header: "Amount", key: "total" },
  ];
  worksheet.addRows(data);
  return workbook;
};

const exportLRBillDataToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Billed LR Status");
  worksheet.columns = [
    // { header: "Sr. no", key: "index" },
    // { header: "LR no", key: "formattedLRNo" },
    // { header: "Date", key: "formattedDate" },
    // { header: "Consignor", key: "consignorName" },
    // { header: "Consignee", key: "consigneeName" },
    // { header: "Amount", key: "total" },
    // { header: "Bill no", key: "billNo" },
    // { header: "Bill date", key: "billDate" },
    // { header: "Bill due date", key: "billDueDate" },
    { header: "Sr. no", key: "index" },
    { header: "LR no", key: "lr_no" },
    { header: "LR Date", key: "lr_date" },
    { header: "Memo no", key: "dc_no" },
    { header: "Memo Date", key: "dc_date" },
    // { header: "LocalMemo no", key: "local_memo_no" },
    // { header: "LocalMemo Date", key: "local_memo_date" },
    // { header: "Acknowledgement Date", key: "ack_date" },
    { header: "Bill no", key: "bill_no" },
    { header: "Bill Date", key: "bill_date" },
    // { header: "Payment Collection Date", key: "pc_date" },
    // { header: "Payment Advoice Date", key: "pa_date" },
  ];
  worksheet.addRows(data);
  const cell = worksheet.getColumn(6);
  cell.eachCell((c, rowNumber) => {
    c.numFmt = "0.00";
  });
  return workbook;
};

const getFormattedDate = (date) => {
  // const day = new Date(date)?.getDate();
  // const month = new Date(date)?.getMonth() + 1;
  // const year = new Date(date)?.getFullYear();
  if (dayjs(date).isValid()) {
    const newDate = dayjs(date).format("MM-DD-YYYY").toString().split("-");
    return (
      newDate.toString().split(",")[1] +
      "-" +
      newDate.toString().split(",")[0] +
      "-" +
      newDate.toString().split(",")[2]
    );
  } else {
    return date;
  }
};

// prefix 0 to a number
const pad = (num, size) => {
  if (typeof num === "number" && typeof size === "number") {
    let stringNum = num?.toString();
    while (stringNum.length < size) stringNum = "0" + stringNum;
    return stringNum;
  }
  return false;
};

const getFormattedLSNumber = (lsNo = "") => {
  lsNo = lsNo.toString?.();
  return "P1-" + lsNo.padStart(6, "0");
};

const getWordNumber = (num) => {
  const [rupee, paise] = (num || 0)?.toFixed?.(2).split(".");
  if (parseInt(paise || 0)) {
    return `${titleCase(numWords(+rupee))} Rupees And ${titleCase(
      numWords(+paise)
    )} Paise only`;
  }
  return `${titleCase(numWords(num))} only`;
};

const titleCase = (str = "") => {
  str = str?.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i]?.charAt(0)?.toUpperCase() + str[i]?.slice(1);
  }
  return str.join(" ");
};

const base64_encode = (file) => {
  return "data:image/gif;base64," + fs.readFileSync(file, "base64");
};

const getTotalWeight = (transactions) => {
  let totalWeight = 0;
  transactions.forEach((transaction) => {
    totalWeight += +transaction.weight;
  });
  return totalWeight;
};

const getTotalArticles = (transactions) => {
  let totalArticles = 0;
  transactions.forEach((transaction) => {
    totalArticles += +transaction.articleNo;
  });
  return totalArticles;
};

const getFormattedDateString = (receivedDate) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date(receivedDate);
  const day = date?.getDate();
  const formattedDay = ("0" + day).slice(-2);
  const month = date?.getMonth();
  const year = date?.getFullYear();

  return `${formattedDay} ${monthNames[month]} ${year}`;
};

const exportLSDataToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Loading slips");
  const columns = data.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );
  worksheet.columns = [
    { header: "Sr. no", key: "index" },
    { header: "LS No", key: "dc_no" },
    { header: "Date", key: "dc_date" },
    { header: "Transporter name", key: "name" },
    { header: "Driver name", key: "driver_name" },
    { header: "Vehicle no", key: "vehicleno" },
    { header: "From", key: "loc_from" },
    { header: "To", key: "loc_to" },
    { header: "Hire", key: "hire" },
    { header: "Paid", key: "totalPaid" },
    { header: "Balance", key: "total" },
  ];
  worksheet.addRows(data);
  return workbook;
};

const exportBillDataToXlsx = (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bills");
  const columns = data.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );
  worksheet.columns = [
    { header: "Sr. no", key: "index" },
    { header: "Bill No", key: "bill_no" },
    { header: "Date", key: "bill_date" },
    { header: "Customer", key: "customer" },
    { header: "Bill amount", key: "tot_amount" },
    { header: "Received amount", key: "totalReceived" },
    { header: "Outstanding", key: "totalBalance" },
    { header: "Status", key: "status" },
  ];
  worksheet.addRows(data);
  return workbook;
};

const converDateFormat = (date = new Date()) => {
  const day = new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return day;
};

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);

  // Add one day
  date.setUTCDate(date.getUTCDate() + 1);

  // Get components
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');

  // Return formatted date
  return `${day}-${month}-${year}`;
}

