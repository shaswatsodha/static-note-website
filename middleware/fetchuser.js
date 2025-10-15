const jwt = require('jsonwebtoken');

// IMPORTANT: Replace this with your actual secret key used during login/signup
const JWT_SECRET = 'YourSuperSecretKey123'; 

/**
 * Middleware to fetch user ID from JWT in request header.
 * Attaches the user's ID to the request object (req.user.id).
 */
const fetchuser = (req, res, next) => {
    // Get the token from the header (e.g., "auth-token: <jwt_token>")
    const token = req.header('auth-token');

    if (!token) {
        // If no token is provided, access is denied
        return res.status(401).send({ error: "Please authenticate using a valid token." });
    }

    try {
        // Verify the token and extract the user payload (which contains the user ID)
        const data = jwt.verify(token, JWT_SECRET);
        
        // Attach the user ID to the request object for use in the routes
        req.user = data.user;
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        // If the token is invalid or expired
        return res.status(401).send({ error: "Please authenticate using a valid token." });
    }
}

module.exports = fetchuser;
