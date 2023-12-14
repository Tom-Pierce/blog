const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify token and set req.user
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader !== "") {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.user = decoded.user;
        return next();
      }
    });
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = verifyToken;
