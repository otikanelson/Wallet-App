const { body } = require("express-validator");
const Big = require("big.js");

const createUtilityValidator = [
  body("amountRecharge")
    .trim()
    .notEmpty()
    .withMessage("Amount is required")
    .custom((value) => {
      try {
        const amount = new Big(value);
        if (amount.lte(50)) {
          throw new Error("Amount must be greater than 50");
        }
        return true;
      } catch (error) {
        throw new Error("Amount must be a valid number");
      }
    }),

  body("service")
    .trim()
    .notEmpty()
    .isString().withMessage("Service must be a string.")
    .withMessage("Service must be either AIRTIME or DATA")
    .toUpperCase(),

  body("network")
    .trim()
    .notEmpty()
    .isString().withMessage("Network must be a string.")
    .withMessage("Network must be one of MTN, AIRTEL, GLO, or 9MOBILE")
    .toUpperCase(),

  body("pin")
    .trim()
    .notEmpty()
    .withMessage("PIN is required")
    .matches(/^\d{4}$/)
    .withMessage("PIN must be a 4-digit number"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{11}$/)
    .withMessage("Phone number must be an 11-digit number"),
];

module.exports = { createUtilityValidator };