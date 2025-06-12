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
routerUtility.post(
  "/verify-electricity-bill",
//  createUtilityValidator,
// handleValidationErrors,
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.verifyElectricityBill
);
routerUtility.post(
  "/buy-electricity-bill",
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.buyElectricityBill
);
routerUtility.post(
  "/buy-tv-bill",
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.buyTVBill
);
routerUtility.post(
  "/verify-tv-biller",
  verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.validateTvBiller
);

routerUtility.get(
  "/transactions",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getUserTransactions
);
routerUtility.get(
  "/get-eletricity-available",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getAvailableEletricity
);
routerUtility.get(
  "/get-tv-available",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getAvailableTV
);
routerUtility.get(
  "/get-tv-available-one/:provider",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getAvailableTVOne
);
routerUtility.get(
  "/get-data-available",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getData
);
routerUtility.get(
  "/get-eletricity-available",
 verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  utilityController.getAvailableEletricity
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
