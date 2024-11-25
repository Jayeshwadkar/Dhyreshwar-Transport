const express = require("express");
const routes = express.Router();
const path = require("path");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const checkAuth = require("../middleware/check-auth");

const transactionsCtrl = require("../controller/transactions-controller");
const LorryReceipt = require("../models/LorryReceipt");

const ackStorage = multer.diskStorage({
  // Destination to store image
  destination: "acknowledgement",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const ackUpload = multer({
  storage: ackStorage,
  limits: {
    fileSize: 10000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      // upload only png and jpg format
      return cb(new Error("Please upload a valid image type (png/jpg/jpeg)"));
    }
    cb(undefined, true);
  },
});

const ackByLRUpload = multer({
  storage: ackStorage,
  limits: {
    fileSize: 10000000, // 10000000 Bytes = 10 MB
  },
  fileFilter(req, file, cb) {
    if (!req.body.lrNo) {
      req.noLrNo = true;
      return cb(new Error("Lorry receipt no is required!!!"));
    }
    LorryReceipt.find({ wayBillNo: req.body.lrNo }, (err, lrData) => {
      if (err) {
        return cb(new Error(err.message));
      }
      if (!lrData || lrData.length < 1) {
        req.lrNotExist = true;
        return cb(undefined, false);
        //return cb(new Error(`Lorry receipt ${req.body.lrNo} not found`));
      }
      if (lrData && lrData.length) {
        if (lrData[0].ack) {
          req.alreadyExist = true;
          return cb(undefined, false);
        }
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
          // upload only png and jpg format
          return cb(
            new Error("Please upload a valid image type (png/jpg/jpeg)")
          );
        }
        if (!req.alreadyExist) {
          cb(undefined, true);
        }
      }
    });
  },
});

// Get all lorry receipts by branch (100 receipts)
routes
  .route("/getLorryReceipts")
  .post(checkAuth, transactionsCtrl.getLorryReceipts);

// Get all lorry receipts with count by branch (1000 receipts)
routes
  .route("/getLorryReceiptsWithCount")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsWithCount);

routes
  .route("/getLorryReceiptsBySearch")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsBySearch);

routes
  .route("/getLRAckWithCount")
  .post(checkAuth, transactionsCtrl.getLRAckWithCount);

routes
  .route("/updateMultiLorryReceiptAck")
  .put(checkAuth, transactionsCtrl.updateMultiLorryReceiptAck);


// Get all lorry receipts with count (1000 receipts)
routes
  .route("/getAllLorryReceiptsWithCount")
  .post(checkAuth, transactionsCtrl.getAllLorryReceiptsWithCount);

// Get all lorry receipts by branch and consignor (100 receipts)
routes
  .route("/getLorryReceiptsByConsignor")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsByConsignor);

routes
  .route("/getLorryReceiptsByConsignorEdit")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsByConsignorEdit);

//Add a lorry receipt
routes
  .route("/addLorryReceipt")
  .post(checkAuth, transactionsCtrl.addLorryReceipt);

// Check Duplicate Lr
routes
  .route("/checkDuplicateLR")
  .post(checkAuth, transactionsCtrl.checkDuplicateLR);

//Delete a lorry receipt
routes
  .route("/removeLorryReceipt/:id")
  .delete(checkAuth, transactionsCtrl.removeLorryReceipt);

// Get all lorry receipts by search dates
routes
  .route("/getLorryReceiptsByDate")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsByDate);

//View bill
routes
  .route("/viewLorryReceipt/:id")
  .post(checkAuth, transactionsCtrl.viewLorryReceipt);

//Get a lorry receipt by id
routes
  .route("/getLorryReceipt/:id")
  .get(checkAuth, transactionsCtrl.getLorryReceipt);

//Update a lorry receipt
routes
  .route("/updateLorryReceipt/:id")
  .put(checkAuth, transactionsCtrl.updateLorryReceipt);

//Update a lorry receipt acknowledgement
routes
  .route("/updateLorryReceiptAck/:id")
  .put(checkAuth, transactionsCtrl.updateLorryReceiptAck);

routes
  .route("/removeLorryReceiptAck/:id")
  .get(checkAuth, transactionsCtrl.removeLorryReceiptAck);


routes
  .route("/getAcknowledgeById/:id")
  .get(checkAuth, transactionsCtrl.getAcknowledgeById);

routes
  .route("/removeLorryReceiptAck/:id")
  .post(checkAuth, transactionsCtrl.removeLorryReceiptAck);

// Get all loading slips by branch (100 receipts)
routes
  .route("/getLoadingSlips")
  .post(checkAuth, transactionsCtrl.getLoadingSlips);

routes
  .route("/getLoadingSlipsSearch")
  .post(checkAuth, transactionsCtrl.getLoadingSlipsSearch);

// Get Local Memo
routes.route("/getLocalMemos").post(checkAuth, transactionsCtrl.getLocalMemos);

// Get Local Memo By Search
routes
  .route("/getLocalMemoSearch")
  .post(checkAuth, transactionsCtrl.getLocalMemoSearch);

// Add a Local Memo
routes
  .route("/addLocalMemo")
  .post(checkAuth, transactionsCtrl.addLoaclMemo);

// Get loading slips by Id
routes
  .route("/getLoadingSlipsById")
  .post(checkAuth, transactionsCtrl.getLoadingSlipsById);

//Add a loading slip
routes
  .route("/addLoadingSlip")
  .post(checkAuth, transactionsCtrl.addLoadingSlip);

//Delete a loading slip
routes
  .route("/removeLoadingSlip/:id")
  .delete(checkAuth, transactionsCtrl.removeLoadingSlip);

routes
  .route("/removeLocalMemo/:id")
  .delete(checkAuth, transactionsCtrl.removeLocalMemo);

//Get a loading slip by id
routes
  .route("/getLoadingslip/:id")
  .get(checkAuth, transactionsCtrl.getLoadingSlip);

//Update a loading slip
routes
  .route("/updateLoadingSlip/:id")
  .put(checkAuth, transactionsCtrl.updateLoadingSlip);

routes
  .route("/printLoadingSlip/:id")
  .post(checkAuth, transactionsCtrl.printLoadingSlip);

routes
  .route("/printLocalMemo/:id")
  .post(checkAuth, transactionsCtrl.printLocalMemo);

routes
  .route("/updateLocalMemo/:id")
  .put(checkAuth, transactionsCtrl.updateLocalMemo);

//Get a loval Memo by id
routes
  .route("/getLocalMemo/:id")
  .get(checkAuth, transactionsCtrl.getLocalMemo);

// Get all money trasfers by branch (100 transfers)
routes
  .route("/getMoneyTransfers")
  .post(checkAuth, transactionsCtrl.getMoneyTransfers);

//Add a money transfer
routes
  .route("/addMoneyTransfer")
  .post(checkAuth, transactionsCtrl.addMoneyTransfer);

//Delete a money transfer
routes
  .route("/removeMoneyTransfer/:id")
  .delete(checkAuth, transactionsCtrl.removeMoneyTransfer);

//Update a money transfer
routes
  .route("/updateMoneyTransfer/:id")
  .put(checkAuth, transactionsCtrl.updateMoneyTransfer);

//Get a money transfer by id
routes
  .route("/getMoneyTransfer/:id")
  .get(checkAuth, transactionsCtrl.getMoneyTransfer);

// Get all petty cash transactions by branch (100 transfers)
routes
  .route("/getPettyTransactions")
  .post(checkAuth, transactionsCtrl.getPettyTransactions);

//Add a petty transaction
routes
  .route("/addPettyTransaction")
  .post(checkAuth, transactionsCtrl.addPettyTransaction);

//Get petty cash balance
routes
  .route("/getPettyCashBalance")
  .get(checkAuth, transactionsCtrl.getPettyCashBalance);

// Get transactions by start and end dates
routes
  .route("/getPettyTransactionsByDate")
  .post(checkAuth, transactionsCtrl.getPettyTransactionsByDate);

// Get bills by branch (100 bills)
routes.route("/getBills").post(checkAuth, transactionsCtrl.getBills);
routes.route("/getBillsBySearch").post(checkAuth, transactionsCtrl.getBillsBySearch);
routes.route("/getBillsByBranch").post(checkAuth, transactionsCtrl.getBillsByBranch);

// Get bills by customer (100 bills)
routes
  .route("/getBillsByCustomer")
  .post(checkAuth, transactionsCtrl.getBillsByCustomer);

// Add a bill
routes.route("/addBill").post(checkAuth, transactionsCtrl.addBill);

//Remove a bill
routes.route("/removeBill/:id").delete(checkAuth, transactionsCtrl.removeBill);

//Get a bill by id
routes.route("/getBill/:id").get(checkAuth, transactionsCtrl.getBill);

routes.route("/printBill/:id").post(checkAuth, transactionsCtrl.printBill);
routes
  .route("/exportToExcelBill/:id")
  .post(checkAuth, transactionsCtrl.exportToExcelBill);

routes
  .route("/getBillsForReport")
  .post(checkAuth, transactionsCtrl.getBillsForReport);

routes
  .route("/downloadBillsReport")
  .post(checkAuth, transactionsCtrl.downloadBillsReport);

//Update a bill
routes.route("/updateBill/:id").put(checkAuth, transactionsCtrl.updateBill);

//Update multiple bills for payment collection
routes.route("/updateBills").post(checkAuth, transactionsCtrl.updateBills);

routes.route("/getLastLR").get(checkAuth, transactionsCtrl.getLastLR);

routes
  .route("/getLoadingSlipsBySupplier/:id")
  .post(checkAuth, transactionsCtrl.getLoadingSlipsBySupplier);

routes
  .route("/saveSupplierPayments")
  .post(checkAuth, transactionsCtrl.saveSupplierPayments);

routes
  .route("/saveSupplierBill")
  .post(checkAuth, transactionsCtrl.saveSupplierBill);

routes
  .route("/getSupplierBills/:supplier")
  .post(checkAuth, transactionsCtrl.getSupplierBills);

routes
  .route("/updateSupplierBills")
  .post(checkAuth, transactionsCtrl.updateSupplierBills);

routes
  .route("/updateLorryReceiptAckByLRNo")
  .post(
    checkAuth,
    ackByLRUpload.single("ack"),
    transactionsCtrl.updateLorryReceiptAckByLRNo
  );

routes.route("/getQuotations").get(checkAuth, transactionsCtrl.getQuotations);
routes.route("/getQuotation/:id").get(checkAuth, transactionsCtrl.getQuotation);
routes.route("/addQuotation").post(checkAuth, transactionsCtrl.addQuotation);
routes
  .route("/updateQuotation")
  .post(checkAuth, transactionsCtrl.updateQuotation);
routes
  .route("/removeQuotation/:id")
  .post(checkAuth, transactionsCtrl.removeQuotation);

routes
  .route("/viewQuotation/:id")
  .post(checkAuth, transactionsCtrl.viewQuotation);

routes
  .route("/viewPaymentCollection/:billId/:collectionId")
  .post(checkAuth, transactionsCtrl.viewPaymentCollection);

routes
  .route("/getLorryReceiptsForReport")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsForReport);

routes
  .route("/downloadLRReport")
  .post(checkAuth, transactionsCtrl.downloadLRReport);

routes
  .route("/downloadLSReport")
  .post(checkAuth, transactionsCtrl.downloadLSReport);

routes.route("/getAllLRAck").post(checkAuth, transactionsCtrl.getAllLRAck);
routes
  .route("/getChallanAck/:id")
  .get(checkAuth, transactionsCtrl.getChallanAck);

routes.route("/addFONum").put(checkAuth, transactionsCtrl.addFONum);

routes
  .route("/getLoadingSlipForReport")
  .post(checkAuth, transactionsCtrl.getLoadingSlipForReport);

routes
  .route("/getLorryReceiptsForLS")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsForLS);

routes
  .route("/getLorryReceiptsForLSedit")
  .post(checkAuth, transactionsCtrl.getlrforloadingsheetedit);

routes
  .route("/fetchLorryReceiptsForLSdetails")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsForLSdetials);

routes
  .route("/getLorryReceiptsForLocalMemo")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsForLocalMemo);

routes
  .route("/getLorryReceiptsForLMedit")
  .post(checkAuth, transactionsCtrl.getlrforlocalmemoedit);

routes
  .route("/fetchLorryReceiptsForBilldetails")
  .post(checkAuth, transactionsCtrl.getLorryReceiptsForBilldetials);

routes
  .route("/getBilledLRReport")
  .post(checkAuth, transactionsCtrl.getBilledLRReport);

routes
  .route("/downloadBilledLRReport")
  .post(checkAuth, transactionsCtrl.downloadBilledLRReport);

module.exports = routes;
