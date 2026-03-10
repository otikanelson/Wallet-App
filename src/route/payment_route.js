// routes/user_routes.js
const express = require("express");
const routerPayment = express.Router();
const payment = require("../controller/payment_controller");
const {verifyToken} = require("../middleware/token_validation");

routerPayment.post(
  "/fund-wallet",
   verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  payment.bank_paymentmethod
);

// Manual wallet funding for testing (user only - for testing purposes)
routerPayment.post(
  "/fund-wallet-manual",
   verifyToken(["admin", "basic-admin", "standard-admin","user"], ["verified", "active"]) ,
  payment.manual_fund_wallet
);


module.exports = routerPayment;
