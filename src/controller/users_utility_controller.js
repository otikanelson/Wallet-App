const { User,Transactions } = require("../model/assocations");
const { Op } = require('sequelize');
const { errorResponse,successResponse } = require("../middleware/response_handler");
const Big = require('big.js'); 
const argon2 = require("argon2");


const sanitize = require('sanitize-html');

const { purchaseAirtime,getDataAvailable,purchaseData,getDataElectricity,getDataTV,getDataTVOne,validateElectricityBiller,purchaseElectricity,purchaseTV ,validateTVBiller} = require("./utility_bill");



exports.createUserUtilityAirtime = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.user?.id;
    console.log('Airtime purchase request:', { userId, body: req.body });

    // Sanitize and validate input
    const { amountRecharge, pin, phoneNumber, network, service } = req.body;
    if (!amountRecharge || !pin || !phoneNumber || !network || !service) {
      return errorResponse(res, { message: 'Amount, PIN, phone number, network, and service are required' }, 400);
    }

    // Validate phone number (assuming 11-digit Nigerian phone number format)
    const sanitizedPhone = sanitize(phoneNumber.toString());
    if (!/^\d{11}$/.test(sanitizedPhone)) {
      return errorResponse(res, { message: 'Invalid phone number format' }, 400);
    }

    // Validate network
    const sanitizedNetwork = sanitize(network.toString()).toUpperCase();
    

    // Validate service
    const sanitizedService = sanitize(service.toString()).toUpperCase();
    

    // Convert and validate amount using big.js
    let sanitizedAmount;
    try {
      sanitizedAmount = new Big(sanitize(amountRecharge.toString()));
      if (sanitizedAmount.lte(50)) {
        return errorResponse(res, { message: 'Recharge amount must be greater than 50' }, 400);
      }
    } catch (error) {
      return errorResponse(res, { message: 'Invalid recharge amount format' }, 400);
    }

    // Validate PIN format (4-digit PIN)
    const sanitizedPin = sanitize(pin.toString());
    if (!/^\d{4}$/.test(sanitizedPin)) {
      return errorResponse(res, { message: 'Invalid PIN format' }, 400);
    }

    // Fetch user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, { message: 'User not found' }, 404);
    }

    // Check if user has transaction PIN
    if (!user.transactionPin) {
      return errorResponse(res, { message: 'Please set your transaction PIN first' }, 400);
    }

    // Verify PIN
    const tranPin = await argon2.verify(user.transactionPin, sanitizedPin);

    if (!tranPin) {
      return errorResponse(res, { message: 'Incorrect transaction PIN' }, 403);
    }

    // Start database transaction
    const t = await User.sequelize.transaction();

    try {
      // Validate and deduct from user's total fund using big.js
      let currentAmount;
      try {
        currentAmount = new Big(user.totalFund || 0);
      } catch (error) {
        await t.rollback();
        return errorResponse(res, { message: 'Invalid user balance format' }, 400);
      }

      if (currentAmount.lt(sanitizedAmount)) {
        await t.rollback();
        return errorResponse(res, { message: `Insufficient balance. Current: ₦${currentAmount.toNumber()}, Required: ₦${sanitizedAmount.toNumber()}` }, 400);
      }

      const updatedFund = currentAmount.minus(sanitizedAmount);

      // Update user's total fund
      await user.update(
        { totalFund: updatedFund.toString() }, // Store as string if required by schema
        { transaction: t }
      );

      console.log('Calling SageCloud API for airtime purchase:', {
        network: sanitizedNetwork,
        service: sanitizedService,
        phone: sanitizedPhone,
        amount: sanitizedAmount.toString()
      });

      // Call purchaseAirtime
      const airtimeResponse = await purchaseAirtime(
        sanitizedNetwork,
        sanitizedService,
        sanitizedPhone,
        sanitizedAmount.toString()
      );

      console.log('SageCloud airtime response:', airtimeResponse);

      if (!airtimeResponse || airtimeResponse.status !== 'success') {
        await t.rollback();
        const errorMsg = airtimeResponse?.message || 'Airtime purchase failed';
        console.error('Airtime purchase failed:', errorMsg);
        return errorResponse(res, { message: errorMsg }, 500);
      }

      // Create transaction record
      await Transactions.create(
        {
          userId,
          amount: sanitizedAmount.toString(),
          type: sanitizedService,
          status: 'COMPLETED',
          network: sanitizedNetwork,
          phoneNumber: sanitizedPhone,
          createdAt: new Date(),
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      // Prepare response
      const response = {
        message: 'Recharge successful',
        data: {
          userId,
          amount: sanitizedAmount.toNumber(),
          newBalance: updatedFund.toNumber(),
          phoneNumber: sanitizedPhone,
          network: sanitizedNetwork,
          service: sanitizedService,
          timestamp: new Date().toISOString(),
        },
      };

      return successResponse(res, response, 200);

    } catch (error) {
      await t.rollback();
      console.error('Airtime purchase transaction error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Airtime purchase failed';
      return errorResponse(res, { message: errorMessage }, 500);
    }

  } catch (error) {
    console.error('Airtime purchase error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Internal server error';
    return errorResponse(res, { message: errorMessage }, 500);
  }
};


exports.buyElectricityBill = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.user?.id;
   

    // Sanitize and validate input
    const { amountRecharge: amount, pin, phoneNumber, disco, meterNumber } = req.body;
    if (!amount || !pin || !phoneNumber || !disco || !meterNumber) {
      return errorResponse(res, { message: 'Amount, PIN, phone number, disco, and meter number are required' }, 400);
    }

    // Validate phone number (assuming 11-digit Nigerian phone number format)
    const sanitizedPhone = sanitize(phoneNumber.toString());
    if (!/^\d{11}$/.test(sanitizedPhone)) {
      return errorResponse(res, { message: 'Invalid phone number format' }, 400);
    }

    

    

    // Convert and validate amount using big.js
    let sanitizedAmount;
    try {
      sanitizedAmount = new Big(sanitize(amount.toString()));
      if (sanitizedAmount.lte(50)) {
        return errorResponse(res, { message: 'Recharge amount must be greater than 50' }, 400);
      }
    } catch (error) {
      return errorResponse(res, { message: 'Invalid recharge amount format' }, 400);
    }

    // Validate PIN format (4-digit PIN)
    const sanitizedPin = sanitize(pin.toString());
    if (!/^\d{4}$/.test(sanitizedPin)) {
      return errorResponse(res, { message: 'Invalid PIN format' }, 400);
    }

    // Fetch user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, { message: 'User not found' }, 404);
    }

    // Verify PIN
    
      const tranPin = await argon2.verify(user.transactionPin, sanitizedPin);

    if (!tranPin) {
      return errorResponse(res, { message: 'Incorrect transaction PIN' }, 403);
    }

    // Start database transaction
    const t = await User.sequelize.transaction();

    try {
      // Validate and deduct from user's total fund using big.js
      let currentAmount;
      try {
        currentAmount = new Big(user.totalFund || 0);
      } catch (error) {
        await t.rollback();
        return errorResponse(res, { message: 'Invalid user balance format' }, 400);
      }

      if (currentAmount.lt(sanitizedAmount)) {
        await t.rollback();
        return errorResponse(res, { message: 'Insufficient balance' }, 400);
      }

      const updatedFund = currentAmount.minus(sanitizedAmount);

      // Update user's total fund
      await user.update(
        { totalFund: updatedFund.toString() }, // Store as string if required by schema
        { transaction: t }
      );


      // Call purchaseElectricity
      const electricityResponse = await purchaseElectricity(
        disco,
        disco,
        meterNumber,
        sanitizedPhone,
        sanitizedAmount.toString()
      );

      if (!electricityResponse || electricityResponse.status !== 'success') {
        await t.rollback();
        return errorResponse(res, { message: 'Electricity purchase failed' }, 500);
      }

      // Create transaction record
      await Transactions.create(
        {
          userId,
          amount: sanitizedAmount.toString(),
          type: 'ELECTRICITY PURCHASE',
          status: 'COMPLETED',
          network: disco,
          phoneNumber: meterNumber,
          createdAt: new Date(),
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      // Prepare response
      const response = {
        message: 'purchase successful',
        data: {
          userId,
          amount: sanitizedAmount.toNumber(),
          newBalance: updatedFund.toNumber(),
          phoneNumber: meterNumber,
          network: disco,
          service: 'ELECTRICITY',
          timestamp: new Date().toISOString(),
        },
      };

      return successResponse(res, response, 200);

    } catch (error) {
      await t.rollback();
      
      return errorResponse(res, { message: error.message }, 500);
    }

  } catch (error) {
    console.log(error);
    
    
    return errorResponse(res, { message: error.message }, 500);
  }
};
exports.buyTVBill = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.user?.id;
   

    // Sanitize and validate input
    const { amountRecharge: amount, pin, code, tvType, meterNumber } = req.body;
    if (!amount || !pin || !code || !tvType || !meterNumber) {
      return errorResponse(res, { message: 'Amount, PIN, code, TV type, and meter number are required' }, 400);
    }

    

    

    

    // Convert and validate amount using big.js
    let sanitizedAmount;
    try {
      sanitizedAmount = new Big(sanitize(amount.toString()));
      if (sanitizedAmount.lte(50)) {
        return errorResponse(res, { message: 'Recharge amount must be greater than 50' }, 400);
      }
    } catch (error) {
      return errorResponse(res, { message: 'Invalid recharge amount format' }, 400);
    }

    // Validate PIN format (4-digit PIN)
    const sanitizedPin = sanitize(pin.toString());
    if (!/^\d{4}$/.test(sanitizedPin)) {
      return errorResponse(res, { message: 'Invalid PIN format' }, 400);
    }

    // Fetch user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, { message: 'User not found' }, 404);
    }

    // Verify PIN
    
      const tranPin = await argon2.verify(user.transactionPin, sanitizedPin);

    if (!tranPin) {
      return errorResponse(res, { message: 'Incorrect transaction PIN' }, 403);
    }

    // Start database transaction
    const t = await User.sequelize.transaction();

    try {
      // Validate and deduct from user's total fund using big.js
      let currentAmount;
      try {
        currentAmount = new Big(user.totalFund || 0);
      } catch (error) {
        await t.rollback();
        return errorResponse(res, { message: 'Invalid user balance format' }, 400);
      }

      if (currentAmount.lt(sanitizedAmount)) {
        await t.rollback();
        return errorResponse(res, { message: 'Insufficient balance' }, 400);
      }

      const updatedFund = currentAmount.minus(sanitizedAmount);

      // Update user's total fund
      await user.update(
        { totalFund: updatedFund.toString() }, // Store as string if required by schema
        { transaction: t }
      );


      // Call purchaseTV
      const tvResponse = await purchaseTV(
        tvType,
        code,
        meterNumber
      );

      if (!tvResponse || tvResponse.status !== 'success') {
        await t.rollback();
        return errorResponse(res, { message: 'TV purchase failed' }, 500);
      }

      // Create transaction record
      await Transactions.create(
        {
          userId,
          amount: sanitizedAmount.toString(),
          type: 'TV PURCHASE',
          status: 'COMPLETED',
          network: tvType,
          phoneNumber: meterNumber,
          createdAt: new Date(),
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      // Prepare response
      const response = {
        message: 'purchase successful',
        data: {
          userId,
          amount: sanitizedAmount.toNumber(),
          newBalance: updatedFund.toNumber(),
          phoneNumber: meterNumber,
          network: tvType,
          service: 'TV',
          timestamp: new Date().toISOString(),
        },
      };

      return successResponse(res, response, 200);

    } catch (error) {
      await t.rollback();
      
      return errorResponse(res, { message: error.message }, 500);
    }

  } catch (error) {
    console.log(error);
    
    
    return errorResponse(res, { message: error.message }, 500);
  }
};


exports.getUserTransactions = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.user?.id;
   

    // Check if user exists
    const user = await User.findByPk(userId, {
      attributes: ["id"], // Minimal query to check existence
    });
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch transactions with pagination
    const { count, rows: transactions } = await Transactions.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"], // Select relevant user fields
        },
      ],
      attributes: [
        "id",
        "amount",
        "type",
        "status",
        "network",
        "phoneNumber",
        "reference",
        "description",
        "createdAt",
      ],
    });

    if (!transactions || transactions.length === 0) {
      return successResponse(
        res,
        {
          message: "No transactions found",
          data: {
            transactions: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          },
        },
        200
      );
    }

    // Prepare response
    const response = {
      message: "Transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };

    return successResponse(res, response, 200);
  } catch (error) {
    
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};





exports.getData = async (req, res) => {
  try {
    // Validate user ID
    const network = req.query.network || 'MTNDATA'; // Default to MTNDATA if not provided
   
   let t = await getDataAvailable(network);

   
    // Prepare response - extract data from the utility response
    const response = {
      message: "Available fetched successfully",
      data: t.data || t, // Use t.data if available, otherwise use t
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Get data plans error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data plans";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};

exports.validateTvBiller = async (req, res) => {
  try {
    const { billerId, smartCardNo } = req.body;
    if (!billerId || !smartCardNo) {
      return errorResponse(res, { message: 'Biller ID and Smart Card Number are required' }, 400);
    }

    // Call the validation function
    let t = await validateTVBiller(billerId, smartCardNo);

    // Prepare response
    const response = {
      message: "Available fetched successfully",
      data: t,
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Validate TV biller error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to verify smart card";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};

exports.getAvailableEletricity = async (req, res) => {
  try {
    let t = await getDataElectricity();

    // Prepare response - extract data from the utility response
    const response = {
      message: "Available fetched successfully",
      data: t.data || t, // Use t.data if available, otherwise use t
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Get electricity providers error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch electricity providers";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};


exports.getAvailableTV = async (req, res) => {
  try {
    let t = await getDataTV();

    // Prepare response - extract data from the utility response
    const response = {
      message: "Available fetched successfully",
      data: t.data || t, // Use t.data if available, otherwise use t
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Get TV providers error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch TV providers";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};


exports.getAvailableTVOne = async (req, res) => {
  try {
    const { provider } = req.params;

    let t = await getDataTVOne(provider);

    // Prepare response - extract data from the utility response
    const response = {
      message: "Available fetched successfully",
      data: t.data || t, // Use t.data if available, otherwise use t
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Get TV packages error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch TV packages";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};

exports.verifyElectricityBill = async (req, res) => {
  try {
    const { billerCode, meterNumber } = req.body;
    if (!billerCode || !meterNumber) {
      return errorResponse(res, { message: 'Biller code and meter number are required' }, 400);
    }

    let t = await validateElectricityBiller(
      billerCode,
      meterNumber
    );

    // Prepare response
    const response = {
      message: "Data fetched successfully",
      data: t,
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Verify electricity bill error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || "Failed to verify meter";
    return errorResponse(res, { message: errorMessage }, 500);
  }
};

exports.createUserUtilityData = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.user?.id;
   

    // Sanitize and validate input
    const {  amountRecharge, pin, phoneNumber, network, service ,codeNetwork} = req.body;
    if (!amountRecharge || !pin || !phoneNumber || !network || !service || !codeNetwork) {
      return errorResponse(res, { message: 'Amount, PIN, phone number, network, code,  and service are required' }, 400);
    }

    // Validate phone number (assuming 11-digit Nigerian phone number format)
    const sanitizedPhone = sanitize(phoneNumber.toString());
    if (!/^\d{11}$/.test(sanitizedPhone)) {
      return errorResponse(res, { message: 'Invalid phone number format' }, 400);
    }

    // Validate network
    const sanitizedNetwork = sanitize(network.toString()).toUpperCase();
    

    // Validate service
    const sanitizedService = sanitize(service.toString()).toUpperCase();
    

    // Convert and validate amount using big.js
    let sanitizedAmount;
    try {
      sanitizedAmount = new Big(sanitize(amountRecharge.toString()));
      if (sanitizedAmount.lte(50)) {
        return errorResponse(res, { message: 'Recharge amount must be greater than 50' }, 400);
      }
    } catch (error) {
      return errorResponse(res, { message: 'Invalid recharge amount format' }, 400);
    }

    // Validate PIN format (4-digit PIN)
    const sanitizedPin = sanitize(pin.toString());
    if (!/^\d{4}$/.test(sanitizedPin)) {
      return errorResponse(res, { message: 'Invalid PIN format' }, 400);
    }

    // Fetch user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, { message: 'User not found' }, 404);
    }

  // Verify PIN
      const tranPin = await argon2.verify(user.transactionPin, sanitizedPin);

    if (!tranPin) {
      return errorResponse(res, { message: 'Incorrect transaction PIN' }, 403);
    }

    // Start database transaction
    const t = await User.sequelize.transaction();

    try {
      // Validate and deduct from user's total fund using big.js
      let currentAmount;
      try {
        currentAmount = new Big(user.totalFund || 0);
      } catch (error) {
        await t.rollback();
        return errorResponse(res, { message: 'Invalid user balance format' }, 400);
      }

      if (currentAmount.lt(sanitizedAmount)) {
        await t.rollback();
        return errorResponse(res, { message: 'Insufficient balance' }, 400);
      }

      const updatedFund = currentAmount.minus(sanitizedAmount);

      // Update user's total fund
      await user.update(
        { totalFund: updatedFund.toString() }, // Store as string if required by schema
        { transaction: t }
      );

      // Call purchaseAirtime
      const airtimeResponse = await purchaseData(
        sanitizedNetwork,
        service,
        codeNetwork,
        phoneNumber
      );

      if (!airtimeResponse || airtimeResponse.status !== 'success') {
        await t.rollback();
        return errorResponse(res, { message: 'Airtime purchase failed' }, 500);
      }

      // Create transaction record
      await Transactions.create(
        {
          userId,
          amount: sanitizedAmount.toString(),
          type: sanitizedService,
          status: 'COMPLETED',
          network: sanitizedNetwork,
          phoneNumber: sanitizedPhone,
          createdAt: new Date(),
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      // Prepare response
      const response = {
        message: 'Recharge successful',
        data: {
          userId,
          amount: sanitizedAmount.toNumber(),
          newBalance: updatedFund.toNumber(),
          phoneNumber: sanitizedPhone,
          network: sanitizedNetwork,
          service: sanitizedService,
          timestamp: new Date().toISOString(),
        },
      };

      return successResponse(res, response, 200);

    } catch (error) {
      await t.rollback();
      
      return errorResponse(res, { message: error.message }, 500);
    }

  } catch (error) {
    
    return errorResponse(res, { message: error.message }, 500);
  }
};





exports.getTransactions = async (req, res) => {
  try {
    // Validate user ID
    const userId = req.params.id;
   

    // Check if user exists
    const user = await User.findByPk(userId, {
      attributes: ["id"], // Minimal query to check existence
    });
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch transactions with pagination
    const { count, rows: transactions } = await Transactions.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"], // Select relevant user fields
        },
      ],
      attributes: [
        "id",
        "amount",
        "type",
        "status",
        "network",
        "phoneNumber",
        "reference",
        "description",
        "createdAt",
      ],
    });

    if (!transactions || transactions.length === 0) {
      return successResponse(
        res,
        {
          message: "No transactions found",
          data: {
            transactions: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          },
        },
        200
      );
    }

    // Prepare response
    const response = {
      message: "Transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };

    return successResponse(res, response, 200);
  } catch (error) {
    
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    // Validate user ID
  

   

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch transactions with pagination
    const { count, rows: transactions } = await Transactions.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"], // Select relevant user fields
        },
      ],
      attributes: [
        "id",
        "amount",
        "type",
        "status",
        "network",
        "phoneNumber",
        "reference",
        "description",
        "createdAt",
      ],
    });

    if (!transactions || transactions.length === 0) {
      return successResponse(
        res,
        {
          message: "No transactions found",
          data: {
            transactions: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          },
        },
        200
      );
    }

    // Prepare response
    const response = {
      message: "Transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };

    return successResponse(res, response, 200);
  } catch (error) {
    
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};
// Utility function for consistent success response




/**
 * Get single transaction details
 */
exports.getTransactionDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    if (!transactionId) {
      return errorResponse(res, { message: "Transaction ID is required" }, 400);
    }

    // Fetch transaction
    const transaction = await Transactions.findOne({
      where: { 
        id: transactionId,
        userId // Ensure user can only see their own transactions
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!transaction) {
      return errorResponse(res, { message: "Transaction not found" }, 404);
    }

    return successResponse(res, { transaction }, "Transaction details fetched successfully", 200);
  } catch (error) {
    console.error("Get transaction details error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};


/**
 * Get user transactions with filtering
 */
exports.getUserTransactionsFiltered = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Check if user exists
    const user = await User.findByPk(userId, {
      attributes: ["id"],
    });
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // Get pagination and filter parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { type, status, network, startDate, endDate, search } = req.query;

    // Build where clause
    const whereClause = { userId };

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (network) {
      whereClause.network = network;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { phoneNumber: { [Op.like]: `%${search}%` } },
        { reference: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Fetch transactions with filters
    const { count, rows: transactions } = await Transactions.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: [
        "id",
        "amount",
        "type",
        "status",
        "network",
        "phoneNumber",
        "reference",
        "description",
        "createdAt",
      ],
    });

    const response = {
      message: "Transactions fetched successfully",
      data: {
        transactions,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
        filters: {
          type,
          status,
          network,
          startDate,
          endDate,
          search
        }
      },
    };

    return successResponse(res, response, 200);
  } catch (error) {
    console.error("Get filtered transactions error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};


/**
 * Get recent beneficiaries (unique phone numbers from recent transactions)
 */
exports.getRecentBeneficiaries = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 10;
    const { type } = req.query; // Optional: filter by transaction type

    const whereClause = { 
      userId,
      status: 'COMPLETED' // Only successful transactions
    };

    if (type) {
      whereClause.type = type;
    }

    // Get unique phone numbers from recent transactions
    const transactions = await Transactions.findAll({
      where: whereClause,
      attributes: [
        'phoneNumber',
        'network',
        'type',
        [User.sequelize.fn('MAX', User.sequelize.col('createdAt')), 'lastUsed']
      ],
      group: ['phoneNumber', 'network', 'type'],
      order: [[User.sequelize.literal('lastUsed'), 'DESC']],
      limit,
      raw: true
    });

    return successResponse(res, { beneficiaries: transactions }, "Recent beneficiaries fetched successfully", 200);
  } catch (error) {
    console.error("Get recent beneficiaries error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};
