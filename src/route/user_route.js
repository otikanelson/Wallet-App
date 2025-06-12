// routes/user_routes.js
const express = require("express");
const routerUser = express.Router();
const userController = require("../controller/user_controller");

const {handleValidationErrors} = require("../middleware/validation");
const { createUserValidator,loginUserValidator } = require("../validator/user_validator");
const {verifyToken} = require("../middleware/token_validation");
routerUser.post(
  "/user",
  createUserValidator,
  handleValidationErrors,
  userController.createUser
);
routerUser.post(
  "/login",
  loginUserValidator,
  handleValidationErrors,
  userController.loginUser
);
routerUser.get(
  "/user/:id",
 verifyToken(["admin", "basic-admin", "standard-admin"], ["verified", "active"]) ,
  userController.getUser
);
routerUser.patch(
  "/user/:id",
 verifyToken(["admin", "basic-admin", "standard-admin"], ["verified", "active"]) ,
  userController.updateUserById
);
routerUser.delete(
  "/user/:id",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  userController.deleteUser
);
routerUser.get(
  "/user",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  userController.getCurrentUser
);
routerUser.patch(
  "/change-password",
  userController.updatePassword
);
routerUser.patch(
  "/transaction-pin",
   verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  userController.updateTranscationPin
);
routerUser.patch(
  "/user",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  userController.updateCurrentUser
);
routerUser.get(
  "/user-all",
 verifyToken(["admin", "basic-admin", "standard-admin"], ["verified", "active"]) ,
userController.getAllUsers
);


routerUser.post(
  "/send-otp",
  userController.sendOTP
);
routerUser.post(
  "/verify-otp",
  userController.verifyOTP
);



module.exports = routerUser;
