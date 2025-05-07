const jwt = require("jsonwebtoken");
const JWT_SECRET = "eTailer";

class Authorization {
  // Middleware to check if the user is authorized
  authorized(req, res, next) {
    const headerToken = req.headers.authorization;

    if (headerToken) {
      const token = headerToken.split("Bearer ")[1];

      try {
        // Verify the token
        const verified = jwt.verify(token, JWT_SECRET);

        // Attach the decoded token to the request object for later use
        req.user = verified;

        // If verified, proceed to the next middleware or route handler
        next();
      } catch (error) {
        // Handle specific errors for invalid or expired tokens
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            errors: [{ msg: "Token has expired" }],
          });
        } else {
          return res.status(401).json({
            errors: [{ msg: "Invalid token" }],
          });
        }
      }
    } else {
      return res.status(401).json({
        errors: [{ msg: "Please add a token" }],
      });
    }
  }
  // Function to verify JWT token
  verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Decodes and verifies the token
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, message: "Invalid or expired OTP" };
    }
  };
}

module.exports = new Authorization();
