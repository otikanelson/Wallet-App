const { errorResponse, successResponse } = require("../middleware/response_handler");
const { User } = require("../model/assocations");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, TOKENDATE } = require("../config/env");
const argon2 = require("argon2");
const { sendMail } = require("../config/send_mail");
const { encryptData, deEncryption } = require("../middleware/encrptions");


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
 * Generates a refresh token for a user
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      id: user.id,
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Refresh token valid for 7 days
  );
};


/**
 * Register a new user
 */




exports.verifyOTP = async (req, res) => {
    try {
      const { token, pin } = req.body;
      const decrypted = await deEncryption(token);

      if (decrypted.message !== pin) {
        return errorResponse(res, "Incorrect Verification", 404);
      }
  
      return successResponse(res, "Code verified", "Code verified", 200);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  };


exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body;
      const generateOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
  
      const htmlEmail = `
      <html>
        <body>
          <h2>Your OTP is: ${generateOtp}</h2>
          <p>Enter this OTP to verify your account.</p>
        </body>
      </html>`;
  
      await sendMail(email, "VTU", htmlEmail);
      const encryptedOtp = await encryptData(generateOtp);
  
      return successResponse(res, encryptedOtp, "Mail sent Successfully", 200);
    } catch (error) {
      return errorResponse(res, error, 500);
    }
  };


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
    const refreshToken = generateRefreshToken(user);

    return successResponse(res, { token, refreshToken }, "User registered successfully", 201);
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
      attributes: { exclude: ["password"] },
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
    const updateData = { ...req.body };

    ["password", "email", "id"].forEach((field) => delete updateData[field]);

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
    const updateData = { ...req.body };

    ["password", "email", "id"].forEach((field) => delete updateData[field]);


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

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Respond with tokens and role
    return successResponse(res, { token, refreshToken, role: user.role }, "Login successful", 200);
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

/**
 * Check if user has transaction PIN set
 */
exports.checkTransactionPin = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await User.findByPk(id, {
      attributes: ['id', 'transactionPin'],
    });

    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    const hasPIN = !!user.transactionPin;
    return successResponse(res, { hasPIN }, "PIN status retrieved", 200);
  } catch (error) {
    console.error("Check transaction PIN error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};

/**
 * Update or set transaction PIN
 */
exports.updateTranscationPin = async (req, res) => {
  try {
    const id = req.user.id;
    const { transactionPin, oldPin } = req.body;

    if (!transactionPin || transactionPin.length !== 4) {
      return errorResponse(res, { message: "Transaction PIN must be 4 digits" }, 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // If user already has a PIN, verify the old PIN
    if (user.transactionPin) {
      if (!oldPin) {
        return errorResponse(res, { message: "Old PIN is required to change PIN" }, 400);
      }

      const isOldPinValid = await argon2.verify(user.transactionPin, oldPin);
      if (!isOldPinValid) {
        return errorResponse(res, { message: "Incorrect old PIN" }, 403);
      }
    }

    // Let the beforeUpdate hook handle hashing automatically
    await user.update({ transactionPin });
    
    const message = user.transactionPin ? "Transaction PIN changed successfully" : "Transaction PIN set successfully";
    return successResponse(res, {}, message, 200);
  } catch (error) {
    console.error("Update transaction PIN error:", error);
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

    return await argon2.verify(user.transactionPin, pin);
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





/**
 * Refresh access token using refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, { message: "Refresh token is required" }, 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // Fetch user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // Generate new access token
    const newToken = generateToken(user);

    return successResponse(res, { token: newToken }, "Token refreshed successfully", 200);
  } catch (error) {
    console.error("Refresh token error:", error);
    return errorResponse(res, { message: "Invalid or expired refresh token" }, 401);
  }
};


/**
 * Update push notification token
 */
exports.updatePushToken = async (req, res) => {
  try {
    const id = req.user.id;
    const { pushToken } = req.body;

    if (!pushToken) {
      return errorResponse(res, { message: "Push token is required" }, 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    await user.update({ pushToken });

    return successResponse(res, { pushToken }, "Push token updated successfully", 200);
  } catch (error) {
    console.error("Update push token error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};


/**
 * Upload profile picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const id = req.user.id;
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return errorResponse(res, { message: "Profile picture is required" }, 400);
    }

    // Validate base64 format
    if (!profilePicture.startsWith('data:image/')) {
      return errorResponse(res, { message: "Invalid image format" }, 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    // Upload to Cloudinary
    const { uploadImage, deleteImage } = require('../config/cloudinary');
    
    // Delete old image if it exists and is from Cloudinary
    if (user.profilePicture && user.profilePicture.includes('cloudinary.com')) {
      try {
        await deleteImage(user.profilePicture);
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue even if delete fails
      }
    }

    // Upload new image
    const cloudinaryUrl = await uploadImage(profilePicture, 'profile-pictures');

    // Update user with Cloudinary URL
    await user.update({ profilePicture: cloudinaryUrl });

    return successResponse(res, { profilePicture: cloudinaryUrl }, "Profile picture updated successfully", 200);
  } catch (error) {
    console.error("Upload profile picture error:", error);
    return errorResponse(res, { message: error.message || "Internal server error" }, 500);
  }
};


/**
 * Initiate forgot password - sends OTP
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, { message: "Email is required" }, 400);
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return successResponse(res, null, "If the email exists, an OTP has been sent", 200);
    }

    // Generate OTP
    const generateOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const htmlEmail = `
    <html>
      <body>
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is: <strong>${generateOtp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>`;

    await sendMail(email, "Password Reset - CFC Wallet", htmlEmail);
    const encryptedOtp = await encryptData(generateOtp);

    return successResponse(res, { token: encryptedOtp }, "OTP sent successfully", 200);
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};


/**
 * Reset password with OTP verification
 */
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, token, pin, newPassword } = req.body;

    if (!email || !token || !pin || !newPassword) {
      return errorResponse(res, { message: "All fields are required" }, 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, { message: "Password must be at least 8 characters long" }, 400);
    }

    // Verify OTP
    const decrypted = await deEncryption(token);
    if (decrypted.message !== pin) {
      return errorResponse(res, { message: "Invalid OTP" }, 400);
    }

    // Find user and update password
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, { message: "User not found" }, 404);
    }

    await user.update({ password: newPassword });

    return successResponse(res, null, "Password reset successfully", 200);
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse(res, { message: "Internal server error" }, 500);
  }
};
