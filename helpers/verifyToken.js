const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token and set req.user
const verifyToken = (req, res, next) => {
  if (!req.cookies.token) {
    return next();
  }
  const token = req.cookies.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Invalid token: Authentication failed" });
    } else {
      req.user = decoded;
    }
    return next();
  });
};

module.exports = verifyToken;
