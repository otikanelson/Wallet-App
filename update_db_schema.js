require('dotenv').config();
const sequelize = require("./src/config/db");

async function updateSchema() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");
    
    console.log("Updating profilePicture column to LONGTEXT...");
    
    await sequelize.query(
      "ALTER TABLE users MODIFY COLUMN profilePicture LONGTEXT NOT NULL"
    );
    
    console.log("✅ Database schema updated successfully!");
    console.log("profilePicture column can now store large base64 images");
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating schema:", error.message);
    process.exit(1);
  }
}

updateSchema();
