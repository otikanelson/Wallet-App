require('dotenv').config();
const sequelize = require("./src/config/db");

async function migrateToCloudinary() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");
    
    console.log("Updating profilePicture column to VARCHAR(500)...");
    
    // Change column type to VARCHAR(500) for storing Cloudinary URLs
    await sequelize.query(
      "ALTER TABLE users MODIFY COLUMN profilePicture VARCHAR(500) NOT NULL"
    );
    
    console.log("✅ Database schema updated successfully!");
    console.log("profilePicture column now stores Cloudinary URLs (max 500 chars)");
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating schema:", error.message);
    process.exit(1);
  }
}

migrateToCloudinary();
