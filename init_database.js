/**
 * Database initialization script
 * Run this script to create all database tables
 * Usage: node init_database.js
 */
require('dotenv').config();
const sequelize = require('./src/config/db');
const { User, Transactions } = require('./src/model/assocations');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    console.log('🔄 Creating tables...');
    // force: true will drop existing tables and recreate them
    // Use force: false to only create missing tables
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database tables created successfully');
    console.log('📊 Tables created:');
    console.log('  - users');
    console.log('  - transactions');

    // Test query
    const userCount = await User.count();
    const transactionCount = await Transactions.count();
    
    console.log(`\n📈 Current data:`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Transactions: ${transactionCount}`);

    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
