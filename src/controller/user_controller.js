const { errorResponse, successResponse } = require("../middleware/response_handler.JS");
const { User } = require("../model/assocations");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, TOKENDATE } = require("../config/env");
const argon2 = require("argon2");

/**
 * Generates a JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      id: user.id,
      status: user.status,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKENDATE }
  );
};

/**
 * Register a new user
 */
exports.createUser = async (req, res) => {
  try {
    const { email, name, phoneNumber, password } = req.body;

    if (!password || password.length < 8) {
          return errorResponse(res, { message: "Password must be at least 8 characters long." }, 400);

    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, { message: "Email already in use" }, 400);
    }

    const user = await User.create({
      name,
      phoneNumber,
      password,
      email,
    });

    const token = generateToken(user);

    return successResponse(res, token, "User registered successfully", 201);
  } catch (error) {
    console.error("User registration error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Get a single user by ID
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "transactionPin"] },
    });

    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    return successResponse(res, user, "User fetched successfully", 200);
  } catch (error) {
    console.error("Fetch user by ID error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Get the currently authenticated user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "transactionPin"] },
    });

    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    return successResponse(res, user, "User fetched successfully", 200);
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password", "transactionPin"] },
    });

    return successResponse(res, users, "Users fetched successfully", 200);
  } catch (error) {
    console.error("Fetch all users error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Update current user
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const id = req.user.id;
    const updateData = {};

      ["password", "email", "id"].forEach((field) => delete updates[field]);

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    await user.update(updateData);

    return successResponse(res, user, "User updated successfully", 200);
  } catch (error) {
    console.error("Update current user error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Update user by ID
 */
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    ["password", "email", "id"].forEach((field) => delete updates[field]);


    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    await user.update(updateData);

    return successResponse(res, user, "User updated successfully", 200);
  } catch (error) {
    console.error("Update user by ID error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Soft delete user by ID
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    await user.destroy(); // Soft delete if `paranoid: true` is enabled in model

    return successResponse(res, null, "User soft-deleted successfully", 200);
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};



/**
 * User login
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse(res, { message: "Invalid email or password" }, 400);
    }

   
        

    // Verify password
      const validPassword = await argon2.verify(user.password, password);
    
    if (!validPassword) {
      return errorResponse(res, { message: "Invalid email or password" }, 400);
    }

    // Generate token
    const token = generateToken(user);

    // Respond with token and role
    return successResponse(res, { token, role: user.role }, "Login successful", 200);
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};




/**
 * Update password for the current user
 */

exports.updatePassword = async (req, res) => {
  try {
    const { password,email } = req.body;

    if (!password || password.length < 8) {
          return errorResponse(res, { message: "Password must be at least 8 characters long." }, 400);

    }

    const user = await User.findOne({
      where: {  email },
    });
    if (!user) {
    return errorResponse(res, { message: "User not found"  }, 400);
    }

    await user.update({ password: password });
    return successResponse(res, { user: user.role }, "Password updated successfully", 200);

   
  } catch (error) {
    console.error("Update password error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};





/**
 * Update transcation pin for the current user
 */

exports.updateTranscationPin = async (req, res) => {
  try {
        const id = req.user.id;
    const { transactionPin } = req.body;
 if (!transactionPin || transactionPin.length > 4 || transactionPin.length < 4) {
          return errorResponse(res, { message: "Transcation Pin not correct" }, 400);

    }

    const user = await User.findByPk(id);
    if (!user) {
    return errorResponse(res, { message: "User not found"  }, 400);
    }

    await user.update({ transactionPin: transactionPin });
    return successResponse(res, { user: user.role }, "Transcation Pin Set", 200);

   
  } catch (error) {
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};





/**
 * Reusable function to verify a user's transaction pin
 * @param {string} pin - The transaction pin to verify
 * @param {string|number} userId - The ID of the user
 * @returns {Promise<boolean>} - Returns true if the pin is correct, otherwise false
 */
 exports.verifyTransactionPin = async (pin, userId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user || !user.transactionPin) {
      return false;
    }

    return user.transactionPin === pin;
  } catch (error) {
    console.error("verifyTransactionPin error:", error);
    return false;
  }
};


 exports.verifyUserBalance = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    

    

    return user.totalFund;
  } catch (error) { 
    console.error("verifyTransactionPin error:", error);
    return false;
  }
};


