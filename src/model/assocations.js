const Transactions = require("../schema/transcation_db");
const User = require("../schema/users_db");

// Define associations
User.hasMany(Transactions, {
  foreignKey: "userId",
  as: "transactions",
});

Transactions.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
    User,
    Transactions
}
