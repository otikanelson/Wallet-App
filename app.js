/**
 * Express server setup for the VTU backend API
 * @module app
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { query, validationResult } = require('express-validator');
const { errorResponse } = require('./src/middleware/response_handler');
const sequelize = require('./src/config/db');
const routerUser = require('./src/route/user_route');
const routerUtility = require('./src/route/utility_bill');

// In-memory cache for geolocation data

/**
 * Fetch geolocation data for an IP address
 * @param {string} ip - Client IP address
 * @returns {Promise<Object>} - Geolocation data (city, region, country)
 */
const app = express();


/**
 * Middleware to attach geolocation data to req.geoLocation
 */


/**
 * Custom Morgan token for location
 */
morgan.token('location', (req) => {
  return req.geoLocation
    ? `${req.geoLocation.city}, ${req.geoLocation.region}, ${req.geoLocation.country}`
    : 'Unknown, Unknown, Unknown';
});

/**
 * Initialize Sequelize database connection
 * @async
 */
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Configure rate limiter with MemoryStore
 */
const limiter = rateLimit({
  limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === `${process.env.API_PREFIX || '/api/v1'}/stripe-webhook`,
  message: async (req) => ({
    message: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
  }),
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    errorResponse(
      res,
      'Too many requests from this IP, please try again later',
      429,
      { retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000) }
    );
  },
});

/**
 * Initialize Express app
 * @type {express.Application}
 */

// Security headers
app.use(helmet());

// Custom Morgan format with location
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":location"'
  )
);

// Compression
app.use(compression());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || ['http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate limiting
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initializeDatabase();

// Request counter for metrics
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  next();
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';
app.use(apiPrefix, routerUser);
app.use(apiPrefix, routerUtility);


/**
 * Root endpoint with enhanced JSON and HTML responses
 * @route GET /
 * @param {string} [format] - Query param to force json or html response
 */
app.get(
  '/',
  [query('format').optional().isIn(['json', 'html']).withMessage('Format must be json or html')],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error(`❌ Validation failed for GET /`, errors.array());
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const apiMetadata = {
        name: process.env.API_NAME || 'VTU API',
        version: process.env.API_VERSION || '1.0.0',
        description: process.env.API_DESCRIPTION || 'API for VTU ride-sharing platform',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: `${apiPrefix}/health`,
          metrics: `${apiPrefix}/metrics`,
          users: `${apiPrefix}/users`,
          documentation: process.env.API_DOCS_URL || 'https://api.vtu.com/docs',
        }, 
        timestamp: new Date().toISOString(),
      };

      const format = req.query.format || req.headers.accept?.includes('text/html') ? 'html' : 'json';
      console.log(`📜 Serving ${format} response for GET /`);

      if (format === 'html') {
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${apiMetadata.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-100 font-sans">
            <div class="min-h-screen flex items-center justify-center">
              <div class="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
                <h1 class="text-4xl font-bold text-blue-600 mb-4">Welcome to ${apiMetadata.name}</h1>
                <p class="text-gray-600 mb-6">${apiMetadata.description}</p>
                <p class="text-sm text-gray-500 mb-4">Version: ${apiMetadata.version} | Environment: ${apiMetadata.environment}</p>
                <div class="space-y-4">
                  <h2 class="text-xl font-semibold text-gray-800">Explore the API</h2>
                 
                </div>
                <p class="text-sm text-gray-400 mt-6">Last updated: ${apiMetadata.timestamp}</p>
              </div>
            </div>
          </body>
          </html>
        `);
      } else {
        res.status(200).json({
          message: process.env.WELCOME_MESSAGE || 'Welcome to the VTU API!',
          ...apiMetadata,
        });
      }
    } catch (error) {
      console.error(`❌ Error in root endpoint`, error.message);
      errorResponse(res, 'Internal server error', 500, error.message);
    }
  }
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(`❌ Unhandled error`, err.message);
  errorResponse(res, err.message || 'Internal server error', 500, err.stack);
});

module.exports = app;