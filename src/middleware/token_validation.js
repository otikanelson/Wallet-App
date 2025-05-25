const jwt = require('jsonwebtoken');
const { errorResponse } = require('./response_handler');
const { JWT_SECRET } = require('../config/env');


exports.verifyToken = (requiredRoles = [],status = []) => {
    return (req, res, next) => {
      const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header
      if (!token) {
        return errorResponse(res, { message: 'Access denied. No token provided.' }, 401);
      }
  
      try {
        // Verify token
        const verified = jwt.verify(token,JWT_SECRET );
        
        
        req.user = verified; // Attach the verified payload to the request

        // Check if role is authorized
        if (requiredRoles.length > 0 && !requiredRoles.includes(req.user.role)) {
          return errorResponse(res, { message: 'Access denied. Unauthorized user.' }, 403);
        }
        if (status.length > 0 && !status.includes(req.user.status)) {
          return errorResponse(res, { message: 'You are not activated' }, 403);
        }
  
        next(); // Proceed to the next middleware or route handler
      } catch (error) {
        return errorResponse(res, { message: error.message }, 401);
      }
    };
  };
   