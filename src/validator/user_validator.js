const { body } = require("express-validator");

const createUserValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isString().withMessage("Name must be a string.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email address."),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),

  body("phoneNumber")
    .optional()
    .trim()
    .isMobilePhone().withMessage("Phone number must be a valid mobile number."),
];
const createUserValidatorAdmin = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address"),

  body("gender")
    .optional()
    .isIn(["male", "female"]).withMessage("Gender must be 'male' or 'female'"),

  body("status")
    .optional()
    .isIn(["verified", "unverified", "active", "inactive"])
    .withMessage("Status must be one of: verified, unverified, active, inactive"),

  body("role")
    .optional()
    .isIn(["admin", "user", "basic-admin", "standard-admin"])
    .withMessage("Role must be a valid role"),

  body("profilePicture")
    .optional()
    .isURL().withMessage("Profile picture must be a valid URL"),


      body("aboutUs")
    .optional()
    .isString().withMessage("How your hear about Us must be a string"),


  body("longitude").optional().isFloat().withMessage("Longitude must be a float"),
  body("latitude").optional().isFloat().withMessage("Latitude must be a float"),
];


const updateUserValidator = [
  body("name")
  .optional()
  .isString().withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

 
  body("gender")
    .optional()
    .isIn(["male", "female"]).withMessage("Gender must be 'male' or 'female'"),

  body("status")
    .optional()
    .isIn(["verified", "unverified", "active", "inactive"])
    .withMessage("Status must be one of: verified, unverified, active, inactive"),

  body("role")
    .optional()
    .isIn(["admin", "user", "basic-admin", "standard-admin"])
    .withMessage("Role must be a valid role"),

  body("profilePicture")
    .optional()
    .isURL().withMessage("Profile picture must be a valid URL"),


      body("aboutUs")
    .optional()
    .isString().withMessage("How your hear about Us must be a string"),


  body("longitude").optional().isFloat().withMessage("Longitude must be a float"),
  body("latitude").optional().isFloat().withMessage("Latitude must be a float"),
];

const emailValidator = [
  
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email address"),
];
const otpValidator = [
  
  body("token")
    .notEmpty().withMessage("Token is required")
    .isString().withMessage("Token must be a string")
    .isLength({ min: 2, max: 1000 }).withMessage("token must be 2-100 characters"),
    body("pin")
    .notEmpty().withMessage("PIN is required")
    .isString().withMessage("PIN must be a string")
    .isLength({ min: 3, max: 4 }).withMessage("PIN must be 2-100 characters"),
];


const loginUserValidator = [
  body("email")
  .notEmpty().withMessage("Email is required")
  .isEmail().withMessage("Invalid email address"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];
module.exports = {createUserValidatorAdmin, createUserValidator,updateUserValidator,emailValidator,otpValidator,loginUserValidator };
