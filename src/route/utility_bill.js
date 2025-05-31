// routes/user_routes.js
const express = require("express");
const routerUtility = express.Router();
const utilityController = require("../controller/users_utility_controller");

const {handleValidationErrors} = require("../middleware/validation");
const {verifyToken} = require("../middleware/token_validation");
const { createUtilityValidator } = require("../validator/utility_validator");
routerUtility.post(
  "/buy-airtime",
 createUtilityValidator,
handleValidationErrors,
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.createUserUtilityAirtime
);
routerUtility.post(
  "/buy-data",
//  createUtilityValidator,
// handleValidationErrors,
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.createUserUtilityData
);

routerUtility.get(
  "/transactions",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getUserTransactions
);
routerUtility.get(
  "/get-data-available",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getData
);
routerUtility.get(
  "/transactions-all-admin",
 verifyToken(["admin", "basic-admin", "standard-admin"], ["verified", "active"]) ,
  utilityController.getAllTransactions
);
routerUtility.get(
  "/transactions/:id",
 verifyToken(["admin", "basic-admin", "standard-admin",], ["verified", "active"]) ,
  utilityController.getTransactions
);


module.exports = routerUtility;
