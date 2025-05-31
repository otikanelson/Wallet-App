const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getSagecloudToken } = require('../config/sagecloud_auth');

const BASE_URL = 'https://sagecloud.ng/api';

// Function to purchase airtime
async function purchaseAirtime(
    mtn,
    mtnVtu,
    userPhone,
    amountRecharge
) {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }


        // Step 2: Define the airtime purchase data
        const airtimePayload = {
            reference: uuidv4(), // Generate a unique reference
            network: mtn,
            service: mtnVtu, // or 'MTNEPIN' depending on what you want
            phone: userPhone, // use international format for safety
            amount: amountRecharge
        };

        
        // Step 3: Send the POST request
        const response = await axios.post(`${BASE_URL}/v2/airtime`, airtimePayload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw error;
    }
}



// Function to get data available 
async function getDataAvailable(network = 'MTNDATA') {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }


        
        
        // Step 3: Recieve the GET request
        const response = await axios.get(`${BASE_URL}/v2/internet/data/lookup?provider=${network}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw error;
    }
}


// Function to purchase data
async function purchaseData(
    network,
    typeNetwork,
    codeNetwork,
    userPhone
) {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }


        // Step 2: Define the airtime purchase data
        const airtimePayload = {
            reference: uuidv4(), // Generate a unique reference
            code: codeNetwork,
            type: typeNetwork, // or 'MTNEPIN' depending on what you want
            network: network, // or 'MTNEPIN' depending on what you want
            phone: userPhone, // use international format for safety
            provider: network
        };

        
        // Step 3: Send the POST request
        const response = await axios.post(`${BASE_URL}/v2/internet/data`, airtimePayload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw error;
    }
}





// Export the function for use in other modules
module.exports = {
    purchaseAirtime,
    getDataAvailable,
    purchaseData
};
