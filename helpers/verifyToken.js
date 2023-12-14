const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token and set req.user
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    req.user = { guest: true };
    return next();
  }
  const token = bearerHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Invalid token: Authentication failed" });
    } else {
      req.user = decoded.user;
    }
    return next();
  });
};

module.exports = verifyToken;
