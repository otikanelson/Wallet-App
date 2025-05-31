const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 4000,
  CRYPTOJSPW:process.env.CRYPTOJSPW,
  JWT_SECRET:process.env.JWT_SECRET,
  TOKENDATE:process.env.TOKENDATE,
  MAILEMAIL:process.env.MAILEMAIL,
  MAILHOST:process.env.MAILHOST,
  MAILPASSWORD:process.env.MAILPASSWORD,
  PUBLIC_KEY_USER:process.env.PUBLIC_KEY,
  SECRET_KEY_USER:process.env.SECRET_KEY,

};
