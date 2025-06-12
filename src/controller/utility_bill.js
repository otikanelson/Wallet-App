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
        throw errData;
    }
}



// Function to purchase electricity
async function purchaseElectricity(
    billType,
    disco,
    meterNumber,
    phone,
    amount
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
            type: billType,
            disco: disco, // or 'MTNEPIN' depending on what you want
            account_number: meterNumber, // use international format for safety
            phone: phone,
            amount: amount
        };

        
        // Step 3: Send the POST request
        const response = await axios.post(`${BASE_URL}/v2/electricity/purchase`, airtimePayload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}

// Function to purchase tv
async function purchaseTV(
    tvType,
    code,
    smartCardNo
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
            type: tvType,
            code: code, // or 'MTNEPIN' depending on what you want
            smartCardNo: smartCardNo
        };

        
        // Step 3: Send the POST request
        const response = await axios.post(`${BASE_URL}/v2/cable-tv/purchase`, airtimePayload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
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
        throw errData;
    }
}




// Function to get electricity billers

async function getDataElectricity() {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }



        // Step 3: Send the GET request
        const response = await axios.get(`${BASE_URL}/v2/electricity/fetch-billers`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}

// Function to validate the electricity billers

async function validateElectricityBiller(billType , meterNumber) {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }


        var data = {
            "type": billType, // Example biller, replace with actual biller code
            "account_number": meterNumber // Example meter number, replace with actual meter number
        }

        // Step 3: Send the GET request
        const response = await axios.post(`${BASE_URL}/v2/electricity/validate-customer`, data,
            {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}
// Function to validate tv billers

async function validateTVBiller(billerId , meterNumber) {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }


        var data = {
            "biller_id": billerId, // Example biller, replace with actual biller code
            "smartCardNo": meterNumber // Example meter number, replace with actual meter number
        }

        // Step 3: Send the GET request
        const response = await axios.post(`${BASE_URL}/v2/cable-tv/validate-customer`, data,
            {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}


// Function to fetch the available tv billers
async function getDataTV() {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }



        // Step 3: Send the GET request
        const response = await axios.get(`${BASE_URL}/v2/cable-tv/fetch-providers`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}

// Function to fetch the available tv billers for each tv
async function getDataTVOne(cable = 'gotv') {
    try {
        // Step 1: Get the access token
        const accessTokenResponse = await getSagecloudToken();
        const token = accessTokenResponse?.access_token;

        if (!token) {
            throw new Error('Access token is missing or invalid.');
        }



        // Step 3: Send the GET request
        const response = await axios.get(`${BASE_URL}/v2/cable-tv/fetch-billers?type=${cable}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        const errData = error.response?.data || error.message;
        throw errData;
    }
}






// Export the function for use in other modules
module.exports = {
    purchaseAirtime,
    getDataAvailable,
    purchaseData,
    getDataElectricity,
    getDataTV,
    getDataTVOne,
    validateElectricityBiller,
    purchaseElectricity,
    purchaseTV,
    validateTVBiller
};
