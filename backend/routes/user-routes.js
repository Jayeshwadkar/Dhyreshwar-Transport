const express = require("express");
const routes = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const checkAuth = require("../middleware/check-auth");

const userCtrl = require("../controller/user-controller");

routes.route("/signupAdmin").post(checkAuth, userCtrl.signupAdminCtrl);

// Add a user
routes.route("/signup").post(checkAuth, userCtrl.signupCtrl);

// Login
routes.route("/login").post(userCtrl.loginCtrl);

// Get all users
routes.route("/getUsers").get(checkAuth, userCtrl.getUsers);

// Get a user
routes.route("/getUser/:id").get(checkAuth, userCtrl.getUser);

//Update user
routes.route("/updateUser/:id").put(checkAuth, userCtrl.updateUser);

// Update user permissions
routes
  .route("/updateUserPermissions")
  .post(checkAuth, userCtrl.updateUserPermissions);

// Delete user
routes.route("/removeUser/:id").delete(checkAuth, userCtrl.removeUser);

// Get users by branch
routes.route("/getUsersByBranch/:id").get(checkAuth, userCtrl.getUsersByBranch);

// User search
routes.route("/getSearchedUsers").post(checkAuth, userCtrl.getSearchedUsers);

module.exports = routes;
