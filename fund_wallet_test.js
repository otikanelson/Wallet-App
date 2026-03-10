/**
 * Test script to manually fund wallet for testing purposes
 * Usage: node fund_wallet_test.js <email> <amount>
 * Example: node fund_wallet_test.js somtootika@gmail.com 10000
 */

require('dotenv').config();
const axios = require('axios');
const { User } = require('./src/model/assocations');
require('./src/config/db');

async function fundWallet(email, amount) {
    try {
        console.log(`\nFunding wallet for ${email}...`);

        // Find user
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }

        // Get current balance
        const currentBalance = parseFloat(user.totalFund || 0);
        console.log(`Current balance: ₦${currentBalance.toLocaleString()}`);

        // Calculate new balance
        const amountToAdd = parseFloat(amount);
        const newBalance = currentBalance + amountToAdd;

        // Update balance
        await user.update({ totalFund: newBalance.toString() });

        console.log(`\n✅ Wallet funded successfully!`);
        console.log(`Amount added: ₦${amountToAdd.toLocaleString()}`);
        console.log(`New balance: ₦${newBalance.toLocaleString()}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get command line arguments
const email = process.argv[2];
const amount = process.argv[3];

if (!email || !amount) {
    console.log('Usage: node fund_wallet_test.js <email> <amount>');
    console.log('Example: node fund_wallet_test.js somtootika@gmail.com 10000');
    process.exit(1);
}

// Run the function
fundWallet(email, amount);
