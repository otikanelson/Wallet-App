require('dotenv').config();
const sequelize = require("./src/config/db");
const { User } = require("./src/model/assocations");
const argon2 = require("argon2");

async function resetPIN() {
  try {
    const email = process.argv[2];
    const newPin = process.argv[3];

    if (!email) {
      console.log("Usage: node reset_user_pin.js <email> [new_pin]");
      console.log("Example: node reset_user_pin.js user@example.com 1234");
      console.log("\nIf no PIN provided, it will clear the PIN (user can set new one)");
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

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current PIN status: ${user.transactionPin ? '✅ Has PIN' : '❌ No PIN'}`);

    if (newPin) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        console.log("❌ PIN must be exactly 4 digits");
        process.exit(1);
      }

      const hashedPin = await argon2.hash(newPin);
      await user.update({ transactionPin: hashedPin });
      console.log(`\n✅ PIN set to: ${newPin}`);
    } else {
      // Use raw query to set NULL
      await sequelize.query(
        'UPDATE users SET transactionPin = NULL WHERE id = ?',
        { replacements: [user.id] }
      );
      console.log(`\n✅ PIN cleared. User can now set a new PIN.`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

resetPIN();
