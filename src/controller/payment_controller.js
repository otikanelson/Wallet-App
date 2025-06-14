const axios = require('axios');
const {User} = require('../model/assocations');
const { v4: uuidv4 } = require('uuid');
const { errorResponse,successResponse } = require("../middleware/response_handler");



exports.bank_paymentmethod = async (req, res) => {
    const { amount, address, currency = "NGN", redirectUrl } = req.body;

     const id = req.user.id;
     console.log(id);
     

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    // Keep track of missing fields
    const missingFields = [];

    // Check for missing fields
    if (!amount) missingFields.push('amount');

    if (missingFields.length > 0) {
                      return errorResponse(res, { message:'Missing required fields' }, 400);

    }
    const merchantTransactionReference = uuidv4();

    try {
        // Generate payment link using GlobalPay API
        const response = await axios.post(
            "https://paygw.globalpay.com.ng/globalpay-paymentgateway/api/paymentgateway/generate-payment-link",
            {
                amount: amount,
                merchantTransactionReference: merchantTransactionReference,
                redirectUrl: redirectUrl,
                customer: {
                    lastName: user.name.split(' ')[1] || 'Emmanuel', // Assuming last name is the second part of the full name
                    firstName: user.name.split(' ')[0] || 'Emmanuel', // Assuming first name is the first part of the full name
                    currency: currency,
                    phoneNumber: user.phoneNumber||"07035451058",
                    emailAddress: user.email
                }
            },
            {
                headers: {
                    apikey: "077NGEJSLOGMKW76", // Replace with your GlobalPay public key
                    language: 'en', // Optional header
                    'Content-Type': 'application/json'
                }
            }
        );

             return successResponse(res, response.data, 200);

        // Respond with the payment link from GlobalPay API
    } catch (err) {
        console.error('Error generating payment link:', err.response ? err.response.data : err.message);
              return errorResponse(res, { message: err.response?.data || err.message }, 400);

    }
};