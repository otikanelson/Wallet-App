require('dotenv').config();
const sequelize = require("./src/config/db");
const { User } = require("./src/model/assocations");
const argon2 = require("argon2");

async function checkUserPIN() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Get all users with their PIN status
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phoneNumber', 'transactionPin'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log("📋 Recent Users and PIN Status:\n");
    console.log("=" .repeat(80));

    for (const user of users) {
      const hasPIN = !!user.transactionPin;
      console.log(`Name: ${user.name || 'N/A'}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phoneNumber || 'N/A'}`);
      console.log(`Has PIN: ${hasPIN ? '✅ Yes' : '❌ No'}`);
      console.log(`User ID: ${user.id}`);
      console.log("-".repeat(80));
    }

    console.log("\n💡 To reset a user's PIN, use: node reset_user_pin.js <email>");
    console.log("💡 To test a PIN, use: node test_pin.js <email> <pin>");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUserPIN();
