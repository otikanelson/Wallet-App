const axios = require('axios');
const base64 = require('base-64');
const {PUBLIC_KEY_USER,SECRET_KEY_USER } = require("./env");

// Configuration
const API_URL = 'https://sagecloud.ng/api/v2/merchant/authorization';
const PUBLIC_KEY =PUBLIC_KEY_USER; // Replace with your actual public key
const SECRET_KEY = SECRET_KEY_USER; // Replace with your actual secret key

async function getSagecloudToken() {
    try {
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

        // Handle successful response
        if (response.status === 200) {
            const { success, data } = response.data;
            if (success) {
                console.log('Business Name:', data.business_name);
                return data.token;
            }
        }
    } catch (error) {
        // Handle errors
        if (error.response && error.response.status === 401) {
            console.error('Authentication failed: Invalid Credentials');
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Example usage
 getSagecloudToken()
    .then(token => {

        // Use the token for subsequent API requests
        // Example: Authorization: Bearer ${token.access_token}
    })
    .catch(error => {
        // Handle errors as needed
    });

// Export the function for use in other modules


    module.exports = {
        getSagecloudToken
    };