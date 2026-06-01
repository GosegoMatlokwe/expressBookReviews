const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

        // Check if the session contains authorization object
        if (req.session && req.session.authorization) {
            const token = req.session.authorization['accessToken']; // Extract access token
    
            // Verify the JWT token
            jwt.verify(token, "fingerprint_customer", (err, user) => {
                if (!err) {
                    req.user = user; // Attach verified user payload to the request object
                    next(); // Token is valid, proceed to the secure route handler
                } else {
                    return res.status(403).json({ message: "User not authenticated" });
                }
            });
        } else {
            return res.status(403).json({ message: "User not logged in" });
        }
    });

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
