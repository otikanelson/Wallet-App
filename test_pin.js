require('dotenv').config();
const sequelize = require("./src/config/db");
const { User } = require("./src/model/assocations");
const argon2 = require("argon2");

async function testPIN() {
  try {
    const email = process.argv[2];
    const pin = process.argv[3];

    if (!email || !pin) {
      console.log("Usage: node test_pin.js <email> <pin>");
      console.log("Example: node test_pin.js user@example.com 1234");
      process.exit(1);
    }

    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'transactionPin']
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (!user.transactionPin) {
      console.log(`❌ User ${email} has no PIN set`);
      process.exit(1);
    }

    console.log(`Testing PIN for: ${user.name} (${user.email})`);
    
    const isValid = await argon2.verify(user.transactionPin, pin);

    if (isValid) {
      console.log(`✅ PIN ${pin} is CORRECT!`);
    } else {
      console.log(`❌ PIN ${pin} is INCORRECT`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testPIN();
