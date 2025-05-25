const express = require ('express');
var cors = require('cors')
const rateLimit  = require("express-rate-limit");
const { errorResponse } = require('./src/middleware/response_handler.JS');
const sequelize = require('./src/config/db');
const routerUser = require('./src/route/user_route');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per 15 minutes
    standardHeaders: 'draft-8', 
    legacyHeaders: false, 
    trustProxy: false, // ✅ Ensure proxies cannot spoof IP addresses
	skip: (req) => req.path === "/api/v1/stripe-webhook", // ✅ Exclude Webhook from rate limiting
	message: "Too many requests from this IP, please try again after 15 minutes",
	statusCode: 429,
	keyGenerator: (req) => req.ip, // ✅ Use IP address for rate limiting
	handler: (req, res) => {
		return errorResponse(res, "Too many requests from this IP, please try again after 15 minutes", 429);
	}
	// skip: (req, res) => req.ip === '
	// store: ... , // Redis, Memcached, etc. See below.
}) 
 

  

 const endpoint  = '/api/v1/';


const app = express ();

app.use(cors())

sequelize.sync({ force: false }).then(() => {  
    console.log('Database connected');
}).catch((err) => { 
    console.log(err); 
}); 

app.enable('trust proxy');

app.use(limiter)

app.use(express.json());
app.use(express.urlencoded({ extended: true}));



  
app.get("/", (req, res) => { 
    res.send('Hello World!');
});


 

app.use(`${endpoint}`, routerUser);



module.exports = app;