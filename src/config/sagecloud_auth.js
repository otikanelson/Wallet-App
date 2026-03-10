const axios = require('axios');
const base64 = require('base-64');
const {PUBLIC_KEY_USER,SECRET_KEY_USER } = require("./env");

// Configuration
const API_URL = 'https://sagecloud.ng/api/v2/merchant/authorization';
const PUBLIC_KEY =PUBLIC_KEY_USER; // Replace with your actual public key
const SECRET_KEY = SECRET_KEY_USER; // Replace with your actual secret key

async function getSagecloudToken() {
    try {
        console.log('Getting SageCloud token...');
        console.log('Public Key:', PUBLIC_KEY);
        console.log('API URL:', API_URL);
        
        // Create Basic Auth header
        const authString = `${PUBLIC_KEY}:${SECRET_KEY}`;
        const encodedAuth = base64.encode(authString);
        const authHeader = `Basic ${encodedAuth}`;

        // Make POST request to Sagecloud authorization endpoint
        const response = await axios.post(API_URL, {}, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        console.log('SageCloud auth response:', response.data);

        // Handle successful response
        if (response.status === 200) {
            const { success, data } = response.data;
            if (success) {
                // The token is nested: data.token.access_token
                const accessToken = data.token?.access_token || data.token;
                console.log('Token obtained successfully');
                console.log('Token type:', typeof accessToken);
                return { access_token: accessToken };
            }
        }
        
        throw new Error('Failed to get access token');
    } catch (error) {
        // Handle errors
        console.error('SageCloud auth error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response && error.response.status === 401) {
            console.error('Authentication failed: Invalid Credentials');
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Export the function for use in other modules


    module.exports = {
        getSagecloudToken
    };