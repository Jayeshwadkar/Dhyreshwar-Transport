const express = require("express");
const routes = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const checkAuth = require("../middleware/check-auth");

const masterCtrl = require("../controller/master-controller");

// Add a branch
routes.route("/addBranch").post(checkAuth, masterCtrl.addBranch);

// Get branches
routes.route("/getBranches").get(checkAuth, masterCtrl.getBranches);
routes.route("/getBranchList").get(checkAuth, masterCtrl.getBranchList);
routes.route("/getBranchesBySearch").post(checkAuth, masterCtrl.getBranchesBySearch);
routes.route("/getBranchesByPage").post(checkAuth, masterCtrl.getBranchesListByPage);

// Get a branches
routes.route("/getBranch/:id").get(checkAuth, masterCtrl.getBranch);

//Delete branch
routes.route("/removeBranch/:id").delete(checkAuth, masterCtrl.removeBranch);

//Update a branch
routes.route("/updateBranch/:id").put(checkAuth, masterCtrl.updateBranch);

// Get places
routes.route("/getPlaces").get(masterCtrl.getPlaces);

// Get places By Search
routes.route("/getPlacesBySearch").post(checkAuth, masterCtrl.getPlacesBySearch);

// Get places By Page
routes.route("/getPlacesByPage").post(checkAuth, masterCtrl.getPlacesListByPage);

//Add a place
routes.route("/addPlace").post(checkAuth, masterCtrl.addPlace);

//Delete place
routes.route("/removePlace/:id").delete(checkAuth, masterCtrl.removePlace);

//Update a place
routes.route("/updatePlace/:id").put(checkAuth, masterCtrl.updatePlace);

// Get a place
routes.route("/getPlace/:id").get(checkAuth, masterCtrl.getPlace);

//Add a employee
routes.route("/addEmployee").post(checkAuth, masterCtrl.addEmployee);

//Add a employee
routes.route("/getEmployees").get(checkAuth, masterCtrl.getEmployees);
routes.route("/getEmployeesForUserReg").get(checkAuth, masterCtrl.getEmployeesForUserReg);
routes.route("/getEmployeesBySearch").post(checkAuth, masterCtrl.getEmployeesBySearch);
routes.route("/getEmployeesByPage").post(checkAuth, masterCtrl.getEmployeesByPage);

//Delete employee
routes
  .route("/removeEmployee/:id")
  .delete(checkAuth, masterCtrl.removeEmployee);

//Update a employee
routes.route("/updateEmployee/:id").put(checkAuth, masterCtrl.updateEmployee);

// Get a place
routes.route("/getEmployee/:id").get(checkAuth, masterCtrl.getEmployee);

// Get articles
routes.route("/getArticles").get(masterCtrl.getArticles);
// get email
routes.route("/fetchemail").get(masterCtrl.fetchemail);

// Get articles by search
routes.route("/getArticlesBySearch").post(checkAuth, masterCtrl.getArticlesBySearch);

//Add a article
routes.route("/addArticle").post(checkAuth, masterCtrl.addArticle);

// Get All Articles By Page
routes.route("/getAllArticlesByPage").post(checkAuth, masterCtrl.getArticlesByPage);

//Delete article
routes.route("/removeArticle/:id").delete(checkAuth, masterCtrl.removeArticle);

//Update a article
routes.route("/updateArticle/:id").put(checkAuth, masterCtrl.updateArticle);

// Get a article
routes.route("/getArticle/:id").get(checkAuth, masterCtrl.getArticle);

// Get customers
routes.route("/getCustomers").get(masterCtrl.getCustomers);
routes.route("/getCustomersLimit").post(checkAuth, masterCtrl.getCustomersLimit);

// Get customers by Search
routes.route("/getCustomersBySearch").post(checkAuth, masterCtrl.getCustomersBySearch);

// Get customers by Page
routes.route("/getCustomersByPage").post(checkAuth, masterCtrl.getCustomersByPage);

// download customers by Search
routes.route("/downloadCustomers").post(checkAuth, masterCtrl.downloadCustomers);

// Get customers by branch
routes.route("/getCustomersByBranch").post(checkAuth, masterCtrl.getCustomersByBranch);

//Add a customer
routes.route("/addCustomer").post(checkAuth, masterCtrl.addCustomer);

//Delete customer
routes
  .route("/removeCustomer/:id")
  .delete(checkAuth, masterCtrl.removeCustomer);

//Update a customer
routes.route("/updateCustomer/:id").put(checkAuth, masterCtrl.updateCustomer);

// Get a customer
routes.route("/getCustomer/:id").get(checkAuth, masterCtrl.getCustomer);

// Get a customer contact person
routes.route("/getCustomerContactPer/:id").get(checkAuth, masterCtrl.getCustomerContactPerson); // new create

// Get drivers
routes.route("/getDrivers").get(checkAuth, masterCtrl.getDrivers);

// Get drivers by search
routes.route("/getDriversBySearch").post(checkAuth, masterCtrl.getDriversBySearch);

// Get drivers by page
routes.route("/getDriversByPage").post(checkAuth, masterCtrl.getDriversByPage);

//Add a driver
routes.route("/addDriver").post(checkAuth, masterCtrl.addDriver);

//Delete driver
routes.route("/removeDriver/:id").delete(checkAuth, masterCtrl.removeDriver);

//Update a driver
routes.route("/updateDriver/:id").put(checkAuth, masterCtrl.updateDriver);

// Get a driver
routes.route("/getDriver/:id").get(checkAuth, masterCtrl.getDriver);

// Get suppliers by page
routes.route("/getSuppliersByPage").post(checkAuth, masterCtrl.getSuppliersByPage);

// Get suppliers by search
routes.route("/getSuppliersBysearch").post(checkAuth, masterCtrl.getSuppliersBySearch);

// Get suppliers
routes.route("/getSuppliers").get(checkAuth, masterCtrl.getSuppliers);

routes
  .route("/getSuppliersByType")
  .post(checkAuth, masterCtrl.getSuppliersByType);

//Add a supplier
routes.route("/addSupplier").post(checkAuth, masterCtrl.addSupplier);

//Delete supplier
routes
  .route("/removeSupplier/:id")
  .delete(checkAuth, masterCtrl.removeSupplier);

//Update a supplier
routes.route("/updateSupplier/:id").put(checkAuth, masterCtrl.updateSupplier);

// Get Supplier Contact Person
routes.route("/getSupplierContactPer/:id").get(checkAuth, masterCtrl.getSupplierContactPerson); // new create

// Get a supplier
routes.route("/getSupplier/:id").get(checkAuth, masterCtrl.getSupplier);

// Get vehicle types by page
routes.route("/getVehicleTypesByPage").post(checkAuth, masterCtrl.getVehicleTypesByPage);

// Get vehicle types by search
routes.route("/getVehicleTypesBySearch").post(checkAuth, masterCtrl.getVehicleTypesBySearch);

// Get vehicle types
routes.route("/getVehicleTypes").get(checkAuth, masterCtrl.getVehicleTypes);

//Add a vehicle type
routes.route("/addVehicleType").post(checkAuth, masterCtrl.addVehicleType);

//Delete vehicle type
routes
  .route("/removeVehicleType/:id")
  .delete(checkAuth, masterCtrl.removeVehicleType);

//Update a vehicle type
routes
  .route("/updateVehicleType/:id")
  .put(checkAuth, masterCtrl.updateVehicleType);

// Get a vehicle type
routes.route("/getVehicleType/:id").get(checkAuth, masterCtrl.getVehicleType);

// Get vehicles
routes.route("/getVehicles").get(masterCtrl.getVehicles);
routes.route("/getVehicleList").get(checkAuth, masterCtrl.getVehicleList);
routes.route("/getVehicleListBySearch").post(checkAuth, masterCtrl.getVehicleListBySearch);
routes.route("/getVehicleListByPage").post(checkAuth, masterCtrl.getVehicleListByPage);

//Add a vehicle
routes.route("/addVehicle").post(checkAuth, masterCtrl.addVehicle);

//Delete vehicle
routes.route("/removeVehicle/:id").delete(checkAuth, masterCtrl.removeVehicle);

//Update a vehicle
routes.route("/updateVehicle/:id").put(checkAuth, masterCtrl.updateVehicle);

// Get a vehicle
routes.route("/getVehicle/:id").get(checkAuth, masterCtrl.getVehicle);

// Get Vehicle Tax Details
routes.route("/getVehicleTaxDetails/:id").get(checkAuth, masterCtrl.getVehicleTaxDetails); // new create

// Get banks
routes.route("/getBanksBySearch").post(checkAuth, masterCtrl.getBanksBySeach);

// Get banks
routes.route("/getBanksByPage").post(checkAuth, masterCtrl.getBanksByPage);

// Get banks
routes.route("/getBanks").get(checkAuth, masterCtrl.getBanks);

//Add a bank
routes.route("/addBank").post(checkAuth, masterCtrl.addBank);

//Update a bank
routes.route("/updateBank/:id").put(checkAuth, masterCtrl.updateBank);

// Get a bank
routes.route("/getBank/:id").get(checkAuth, masterCtrl.getBank);

//Delete bank
routes.route("/removeBank/:id").delete(checkAuth, masterCtrl.removeBank);

// Get banks
routes.route("/getBankAccounts").get(checkAuth, masterCtrl.getBankAccounts);
routes.route("/getBankAccountList").post(checkAuth, masterCtrl.getBankAccountListBySearch);
routes.route("/getBankAccountListByPage").post(checkAuth, masterCtrl.getBankAccountListByPage);

//Add a bank
routes.route("/addBankAccount").post(checkAuth, masterCtrl.addBankAccount);

//Update a bank
routes
  .route("/updateBankAccount/:id")
  .put(checkAuth, masterCtrl.updateBankAccount);

// Get a bank
routes.route("/getBankAccount/:id").get(checkAuth, masterCtrl.getBankAccount);

//Delete bank
routes
  .route("/removeBankAccount/:id")
  .delete(checkAuth, masterCtrl.removeBankAccount);

routes.route("/getLastEmployee").get(checkAuth, masterCtrl.getLastEmployee);

routes.route("/getLastDriver").get(checkAuth, masterCtrl.getLastDriver);

routes
  .route("/getRateListWithPagination")
  .post(checkAuth, masterCtrl.getRateListWithPagination);

routes.route("/addToRateMaster").post(checkAuth, masterCtrl.addToRateMaster);

routes
  .route("/getCustomersForRateMaster")
  .get(checkAuth, masterCtrl.getCustomersForRateMaster);

routes
  .route("/getRateMasterById/:id")
  .get(checkAuth, masterCtrl.getRateMasterById);

routes.route("/updateRateMaster").post(checkAuth, masterCtrl.updateRateMaster);

routes
  .route("/getRateMasterByCustomer/:id")
  .get(checkAuth, masterCtrl.getRateMasterByCustomer);

routes
  .route("/getRateMasterByCustomer/:id")
  .get(checkAuth, masterCtrl.getRateMasterByCustomer);

// User search

routes
  .route("/getTransactionPrefix/:code")
  .get(checkAuth, masterCtrl.getTransactionPrefix);

routes
  .route("/addTransactionPrefix")
  .post(checkAuth, masterCtrl.addTransactionPrefix);

module.exports = routes;
