const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.food_deli_token;

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Token is not valid.",
      });
    }

    req.user = decoded; 
    next();
  });
};

module.exports = authMiddleware;
