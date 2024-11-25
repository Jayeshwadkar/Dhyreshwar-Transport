const jwt = require("jsonwebtoken");
const secrets = require("../secrets/secrets");
const User = require("../models/User.js");
const Employee = require("../models/Employee.js");
const Branch = require("../models/Branch.js");
const db = require('../database/db.js')

const signupAdminCtrl = (req, res) => {
  const user = new User({
    type: req.body.type,
    username: req.body.username,
    password: req.body.password,
    createdBy: "system",
  });

  User.findOne(
    {
      type: {
        $regex: getRegex(req.body.type?.trim?.()),
        $options: "i",
      },

      username: {
        $regex: getRegex(req.body.username?.trim?.()),
        $options: "i",
      },
    },
    (error, foundUser) => {
      if (error) {
        return next(error);
      }
      if (foundUser) {
        return res.status(200).json({
          message: "User already exist!",
        });
      }
      User.create(user, (error, data) => {
        if (error) {
          res.send(error);
        } else {
          res.send(data);
        }
      });
    }
  );
};
const transformPermissions = (permissions) => {
  const transformed = {};

  for (const [section, actions] of Object.entries(permissions)) {
    transformed[section] = {};
    for (const [action, permission] of Object.entries(actions)) {
      transformed[section][action] = {
        read: permission.read ? 1 : 0,
        write: permission.write ? 1 : 0
      };
    }
  }

  return transformed;
};

const permissions = {
  "Accounts": {
    "RouteBill": { "read": false, "write": false },
    "PaymentCollection": { "read": false, "write": false },
    "BankTransaction": { "read": false, "write": false },
    "BillRegister": { "read": false, "write": false },
    "BilledLRStatus": { "read": false, "write": false },
    "Branch": { "read": false, "write": false },
    "Customers": { "read": false, "write": false },
    "Driver": { "read": false, "write": false },
    "LRSRegister": { "read": false, "write": false },
    "LoadingTripsheet": { "read": false, "write": false },
    "LorryReceipt": { "read": false, "write": false },
    "MaterialInward": { "read": false, "write": false },
    "MaterialOutward": { "read": false, "write": false },
    "PATyreReport": { "read": false, "write": false },
    "Package": { "read": false, "write": false },
    "PaymentCollectionReport": { "read": false, "write": false },
    "PetrolReport": { "read": false, "write": false },
    "PettyCashRegister": { "read": false, "write": false },
    "Place": { "read": false, "write": false },
    "Supplier": { "read": false, "write": false },
    "Vehicle": { "read": false, "write": false },
    "VendorRegister": { "read": false, "write": false },
    "Voucher": { "read": false, "write": false }
  },
  "Admin": {
    "MoneyTransfer": { "read": false, "write": false },
    "Place": { "read": false, "write": false },
    "Article": { "read": false, "write": false },
    "Branch": { "read": false, "write": false },
    "Customers": { "read": false, "write": false },
    "Driver": { "read": false, "write": false },
    "Employee": { "read": false, "write": false },
    "GCNoteStatement": { "read": false, "write": false },
    "Kilometer": { "read": false, "write": false },
    "Package": { "read": false, "write": false },
    "RateMaster": { "read": false, "write": false },
    "Supplier": { "read": false, "write": false },
    "Tyre": { "read": false, "write": false },
    "TyreFitRemove": { "read": false, "write": false },
    "TyreOutward": { "read": false, "write": false },
    "Vehicle": { "read": false, "write": false },
    "VehicleTaxPay": { "read": false, "write": false },
    "VehicleType": { "read": false, "write": false }
  },
  "Sales/Purchase": {
    "LoadingSlip": { "read": false, "write": false },
    "TripSheet": { "read": false, "write": false },
    "BankTransaction1": { "read": false, "write": false },
    "Acknowledge": { "read": false, "write": false },
    "Add_FO_No": { "read": false, "write": false },
    "BankAccountMaster": { "read": false, "write": false },
    "BankMaster": { "read": false, "write": false },
    "BankPettyCash": { "read": false, "write": false },
    "CashMemo": { "read": false, "write": false },
    "ChallanReceiptReg": { "read": false, "write": false },
    "DebitNote": { "read": false, "write": false },
    "DeliveryStatus": { "read": false, "write": false },
    "DeliveryStatusReport": { "read": false, "write": false },
    "FundTransfer": { "read": false, "write": false },
    "InwardStatus": { "read": false, "write": false },
    "LRAcknowledge": { "read": false, "write": false },
    "LRStatus": { "read": false, "write": false },
    "LoadingSlipRegister": { "read": false, "write": false },
    "LocalMemo": { "read": false, "write": false },
    "LorryReceiptReg": { "read": false, "write": false },
    "MaterialInwardRegisterReport": { "read": false, "write": false },
    "MaterialOutwardRegReport": { "read": false, "write": false },
    "PaymentAdvice": { "read": false, "write": false },
    "PaymentAdvicePetrol": { "read": false, "write": false },
    "PendingCheque": { "read": false, "write": false },
    "PetrolPump": { "read": false, "write": false },
    "PetrolPump1": { "read": false, "write": false },
    "RateMasterList": { "read": false, "write": false },
    "StockLRRegister": { "read": false, "write": false },
    "StockReport": { "read": false, "write": false },
    "TyreSupplier": { "read": false, "write": false },
    "TyreSupplierList": { "read": false, "write": false }
  },
  "User": {
    "RoleMaster": { "read": false, "write": false },
    "PendingRequest": { "read": false, "write": false },
    "ChangePassword": { "read": false, "write": false },
    "Designation": { "read": false, "write": false },
    "UserActivation": { "read": false, "write": false },
    "UserRegister": { "read": false, "write": false }
  }
};

const signupCtrl = async (req, res, next) => {
  const { employee, username, password, place, type } = req.body;
  const transformedPermissions = transformPermissions(permissions);
  console.log(transformedPermissions);
  let userType;
  if (type === 'Admin') {
    userType = 1;
  } else if (type === 'User') {
    userType = 2;
  }

  try {
    const query = 'CALL adduser(?,?,?,?,?,@message,@inserted_id)';
    const result = await db.query(query, [username, password, employee, place, userType]);

    if (!result || !result[0][0]) {
      return res.status(200).json({ message: 'Something went wrong' });
    }
    const message = result[0][0][0].message;
    if (message === 'User Already Exist!') {
      return res.status(200).json({ message: message });
    }
    const userId = result[0][0][0].inserted_id;

    for (const role in transformedPermissions) {
      const rolePermissions = transformedPermissions[role];

      for (const permission in rolePermissions) {
        const { read, write } = rolePermissions[permission];

        const insertPermissionQuery = 'INSERT INTO user_permissions (user_id, permission, status, edit) VALUES (?, ?, ?, ?)';

        await db.query(insertPermissionQuery, [userId, permission, read, write]);
      }
    }

    return res.status(200).json('User added successfully with permissions');
  } catch (error) {
    console.log('Error in adding employee', error);
    return res.status(500).json(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const query = 'CALL listnewuser()'
    const [result] = await db.query(query)
    if(result[0].length <= 0){
      return res.status(200).json({ message: "No Record Found" })
    }
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      return res.status(200).json(result[0])
    }
  } catch (error) {
    console.log("Error in getting branches", error);
    return res.status(500).json(error)
  }
};



const getUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Query to get the user details
    const userQuery = 'CALL finduser(?)';
    const [userResult] = await db.query(userQuery, id);

    // Check if the user exists
    if (!userResult || !userResult[0][0]) {
      return res.status(200).json({ message: "Something went wrong" });
    } else {
      let userData = userResult[0][0];

      // Convert usertype to 'Admin' or 'User'
      if (userData.usertype == 1) {
        userData.type = 'Admin';
      } else if (userData.usertype == 2) {
        userData.type = 'User';
      }

      // Query to get the user permissions
      const permissionsQuery = 'SELECT * FROM user_permissions WHERE user_id = ?';
      const [permissionsResult] = await db.query(permissionsQuery, [id]);

      // Initialize the permissions structure
      let permissionsFormatted = {
        Admin: {},
        'Sales/Purchase': {},
        Accounts: {},
        User: {},
      };

      // Helper function to map permission name to its category
      const mapPermissionToCategory = (permission) => {
        const adminPermissions = ["MoneyTransfer", "Place", "Article", "Branch", "Customers", "Driver",
          "Employee", "GCNoteStatement", "Kilometer", "Package", "RateMaster", "Supplier", "Tyre", "TyreFitRemove",
          "TyreOutward", "Vehicle", "VehicleTaxPay", "VehicleType"];
        const salesPurchasePermissions = ["LoadingSlip","TripSheet", "BankTransaction1", "Acknowledge", "Add_FO_No", "BankAccountMaster",
          "BankMaster", "BankPettyCash", "CashMemo", "ChallanReceiptReg", "DebitNote", "DeliveryStatus", "DeliveryStatusReport",
          "FundTransfer", "InwardStatus", "LRAcknowledge", "LRStatus", "LoadingSlipRegister", "LocalMemo", "LorryReceiptReg",
          "MaterialInwardRegisterReport", "MaterialOutwardRegReport", "PaymentAdvice", "PaymentAdvicePetrol", "PendingCheque",
          "PetrolPump", "PetrolPump1", "RateMasterList", "StockLRRegister", "StockReport", "TripSheet", "TyreSupplier",
          "TyreSupplierList"];
        const accountsPermissions = ["RouteBill", "PaymentCollection", "BankTransaction", "BillRegister",
          "BilledLRStatus", "Branch", "Customers", "Driver", "LRSRegister",  "LoadingTripsheet", "LorryReceipt",
          "MaterialInward", "MaterialOutward", "PATyreReport", "Package", "PaymentCollectionReport", "PetrolReport",
          "PettyCashRegister", "Place", "Supplier", "Vehicle", "VendorRegister", "Voucher"];
        const userPermissions = ["RoleMaster", "PendingRequest", "ChangePassword", "Designation", "UserActivation", "UserRegister"];

        if (adminPermissions.includes(permission)) return 'Admin';
        if (salesPurchasePermissions.includes(permission)) return 'Sales/Purchase';
        if (accountsPermissions.includes(permission)) return 'Accounts';
        if (userPermissions.includes(permission)) return 'User';

        return null;
      };

      // Format the permissions into the desired structure
      permissionsResult.forEach((permission) => {
        const category = mapPermissionToCategory(permission.permission);
        if (category) {
          permissionsFormatted[category][permission.permission] = {
            read: permission.status === '1' ? true : false,
            write: permission.edit === '1' ? true : false,
          };
        }
      });

      // Add the formatted permissions to the userData
      userData.permissions = permissionsFormatted;

      // Return both user data and permissions
      return res.status(200).json(userData);
    }
  } catch (error) {
    console.log("Error in getting user details and permissions", error);
    return res.status(500).json(error);
  }
};



const getUsersByBranch = async (req, res, next) => {
  const { id } = req.params
  try {
    const query = 'CALL finduserbybranch(?)'
    const [result] = await db.query(query, id)
    if (!result || !result[0][0]) {
      return res.status(200).json({ message: "Something went wrong" })
    } else {
      console.log(result[0])
      let userData = result[0];
      return res.status(200).json(userData);
    }
  } catch (error) {
    console.log("Error in getting branches", error);
    return res.status(500).json(error)
  }
};

const updateUserPermissions = async (req, res, next) => {
  const { id, permissions } = req.body;
  const transformedPermissions = transformPermissions(permissions);

  try {
    for (const role in transformedPermissions) {
      const rolePermissions = transformedPermissions[role];

      for (const permission in rolePermissions) {
        const { read, write } = rolePermissions[permission];

        const updatePermissionQuery = `
          UPDATE user_permissions
          SET status = ?, edit = ?
          WHERE user_id = ? AND permission = ?
        `;

        const result = await db.query(updatePermissionQuery, [read, write, id, permission]);

      }
    }

    return res.status(200).json({ Data: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(500).json({ message: "Error updating permissions" });
  }
};


const removeUser = async (req, res, next) => {
  if (!req.params.id) {
    return res.status(200).json({ message: "User ID is required!" });
  }
  try {
    const id = req.params.id;
    const query = 'CALL softdelete_user(?)'
    const result = await db.query(query, id);
    if (result) {
      return res.json({ message: "User Delete Successfully" })
    }
  } catch (error) {
    console.log("Error : ", error)
    return res.status(500).send(error)
  }
};

const updateUser = async (req, res, next) => {
  const user = req.body.type
  let type
  if (user === 'Admin') {
    type = 1;
  } else if (user === 'User') {
    type = 2;
  }
  const { id, username, password, } = req.body

  try {
    const query = 'CALL updateuser(?,?,?,?,@message)'
    const result = await db.query(query, [
      id, username, password, type])
    if (!result) {
      return res.status(200).json({ message: "Error in updating employee" })
    }
    return res.status(200).json(result[0][0])
  } catch (error) {
    console.log("Internal Server Error", error)
    res.status(500).json(error)
  }
};

const loginCtrl = async (req, res, next) => {
  try {
    const { username, password } = req.body
    console.log("login data : ", username, password);

    // const result = await db.query('SELECT * FROM user WHERE username = ? AND password =? AND status = 1', [username, password])

    const query = "CALL user_login(?,?,@message)"
    const result = await db.query(query, [username, password])

    if (result) {
      let message;
      if (result[0][0][0].message) {
        message = result[0][0][0].message
      } else {
        message = result[0][1][0].message
      }

      if (message !== "Login successful.") {
        return res.status(200).json({
          message: message,
        });
      }

      const updatedUser = JSON.parse(JSON.stringify(result[0][0][0]));

      const token = jwt.sign(
        {
          username: result[0][0][0].username,
          userId: result[0][0][0].id,
          type: result[0][0][0].usertype,
        },
        secrets.authKey
      );

      updatedUser.token = token
      if (result[0][0][0].usertype == 0) {
        updatedUser.type = "Superadmin"
      } else if (result[0][0][0].usertype == 1) {
        updatedUser.type = "Admin"
      } else {
        updatedUser.type = "User"
      }


      const permissionsQuery = 'SELECT * FROM user_permissions WHERE user_id = ?';
      const [permissionsResult] = await db.query(permissionsQuery, [result[0][0][0].id]);

      // Initialize the permissions structure
      let permissionsFormatted = {
        Admin: {},
        'Sales/Purchase': {},
        Accounts: {},
        User: {},
      };

      // Helper function to map permission name to its category
      const mapPermissionToCategory = (permission) => {
        const adminPermissions = ["MoneyTransfer", "Place", "Article", "Branch", "Customers", "Driver",
          "Employee", "GCNoteStatement", "Kilometer", "Package", "RateMaster", "Supplier", "Tyre", "TyreFitRemove",
          "TyreOutward", "Vehicle", "VehicleTaxPay", "VehicleType"];
        const salesPurchasePermissions = ["TripSheet", "BankTransaction1", "Acknowledge", "Add_FO_No", "BankAccountMaster",
          "BankMaster", "BankPettyCash", "CashMemo", "ChallanReceiptReg", "DebitNote", "DeliveryStatus", "DeliveryStatusReport",
          "FundTransfer", "InwardStatus", "LRAcknowledge", "LRStatus", "LoadingSlipRegister", "LocalMemo", "LorryReceiptReg",
          "MaterialInwardRegisterReport", "MaterialOutwardRegReport", "PaymentAdvice", "PaymentAdvicePetrol", "PendingCheque",
          "PetrolPump", "PetrolPump1", "RateMasterList", "StockLRRegister", "StockReport", "TripSheet", "TyreSupplier",
          "TyreSupplierList"];
        const accountsPermissions = ["RouteBill", "PaymentCollection", "BankTransaction", "BillRegister",
          "BilledLRStatus", "Branch", "Customers", "Driver", "LRSRegister", "LoadingSlip", "LoadingTripsheet", "LorryReceipt",
          "MaterialInward", "MaterialOutward", "PATyreReport", "Package", "PaymentCollectionReport", "PetrolReport",
          "PettyCashRegister", "Place", "Supplier", "Vehicle", "VendorRegister", "Voucher"];
        const userPermissions = ["RoleMaster", "PendingRequest", "ChangePassword", "Designation", "UserActivation", "UserRegister"];

        if (adminPermissions.includes(permission)) return 'Admin';
        if (salesPurchasePermissions.includes(permission)) return 'Sales/Purchase';
        if (accountsPermissions.includes(permission)) return 'Accounts';
        if (userPermissions.includes(permission)) return 'User';

        return null;
      };

      // Format the permissions into the desired structure
      permissionsResult.forEach((permission) => {
        const category = mapPermissionToCategory(permission.permission);
        if (category) {
          permissionsFormatted[category][permission.permission] = {
            read: permission.status === '1' ? true : false,
            write: permission.edit === '1' ? true : false,
          };
        }
      });

      // Add the formatted permissions to the userData
      updatedUser.permissions = permissionsFormatted;

      const query2 = 'CALL getemployeebyid(?)'
      const empresult = await db.query(query2, [result[0][0][0].employee_id])
      if (empresult[0].length > 0) {
        const [empObj] = empresult[0][0];
        updatedUser.employee = empObj;
        delete updatedUser.password;

        if (result[0][0][0].branch) {
          const query3 = 'CALL getbranchbyid(?)'
          const branchresult = await db.query(query3, [result[0][0][0].branch])
          if (branchresult[0].length > 0) {
            const [branchObj] = branchresult[0][0];
            updatedUser.branchData = branchObj
            updatedUser.message = message
            return res.json(updatedUser);
          } else {
            return res.status(200).json({ message: "Branch not found" });
          }
        }
        updatedUser.message = message
        return res.json(updatedUser);
      } else {
        return res.status(200).json({ message: "Employee not found" });
      }

      // return res.json(updatedUser)

    } else {
      return res.status(200).json({
        message: "User not found!",
      });
    }

  } catch (error) {
    console.error('Internal server error', error);
    res.status(500).json({ error: 'Internal server error' });
  }


  // User.findOne(
  //   { username: req.body.username?.trim?.() },
  //   (error, foundUser) => {
  //     if (error) {
  //       return next(error);
  //     }
  //     if (foundUser) {
  //       if (!foundUser.active) {
  //         return res.status(200).json({
  //           message: "User is not active!",
  //         });
  //       }
  //       if (req.body.password !== foundUser.password) {
  //         return res.status(200).json({
  //           message: "Wrong password!",
  //         });
  //       } else {
  //         const updatedUser = JSON.parse(JSON.stringify(foundUser));

  //         const token = jwt.sign(
  //           {
  //             username: updatedUser.username,
  //             userId: updatedUser._id,
  //             type: updatedUser.type,
  //           },
  //           secrets.authKey
  //         );

  //         updatedUser.token = token;

  //         Employee.findById(updatedUser.employee, (findEmpErr, findEmpData) => {
  //           if (findEmpErr) {
  //             return res.status(200).json({ message: findEmpErr.message });
  //           }
  //           updatedUser.employee = findEmpData;
  //           delete updatedUser.password;
  //           if (foundUser.branch) {
  //             Branch.findById(
  //               foundUser.branch,
  //               (userBranchErr, userBranchData) => {
  //                 if (userBranchErr) {
  //                   return res
  //                     .status(200)
  //                     .json({ message: userBranchErr.message });
  //                 }
  //                 if (userBranchData._id) {
  //                   updatedUser.branchData = userBranchData;
  //                   return res.json(updatedUser);
  //                 }
  //                 return res.json(updatedUser);
  //               }
  //             );
  //           } else {
  //             return res.json(updatedUser);
  //           }
  //         });
  //       }
  //     }
  //     if (!error && !foundUser) {
  //       return res.status(200).json({
  //         message: "User not found!",
  //       });
  //     }
  //   }
  // );


};

const getSearchedUsers = (req, res, next) => {
  if (!req.body.search) {
    return getUsers(req, res, next);
  }
  const expression = new RegExp(req.body.search);
  User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $addFields: {
        convertedBranchId: { $toObjectId: "$branch" },
      },
    },
    {
      $addFields: {
        convertedEmployeeId: { $toObjectId: "$employee" },
      },
    },
    {
      $lookup: {
        from: "branch",
        localField: "convertedBranchId",
        foreignField: "_id",
        as: "Branch",
      },
    },
    {
      $lookup: {
        from: "employee",
        localField: "convertedEmployeeId",
        foreignField: "_id",
        as: "Employee",
      },
    },
    { $unwind: { path: "$Branch", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        active: true,
        $or: [
          {
            ["Branch.name"]: {
              $regex: expression,
              $options: "i",
            },
          },
          {
            ["Employee.name"]: {
              $regex: expression,
              $options: "i",
            },
          },
          {
            type: {
              $regex: expression,
              $options: "i",
            },
          },
          {
            username: {
              $regex: expression,
              $options: "i",
            },
          },
        ],
      },
    },
  ]).exec(function (error, users) {
    if (error) {
      return res.status(200).json({
        message: "Error fetching users!",
      });
    } else {
      const updatedUsers = [];
      users.forEach((user) => {
        if (user && user.type && user.type.toLowerCase() !== "superadmin") {
          const updatedUser = {
            branch: user.Branch?.name || "",
            employee: user.Employee?.name || "",
            type: user.type,
            username: user.username,
            id: user._id,
            permissions: user.permissions,
          };
          updatedUsers.push(updatedUser);
        }
      });
      res.json(updatedUsers);
    }
  });
};

const getRegex = (str) => `^${str}$`;

module.exports = {
  signupAdminCtrl,
  signupCtrl,
  loginCtrl,
  getUsers,
  updateUserPermissions,
  removeUser,
  getUser,
  getUsersByBranch,
  updateUser,
  getSearchedUsers,
};
