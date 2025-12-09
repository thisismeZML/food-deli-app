const jwt = require("jsonwebtoken");
const HandleError = require("../utils/handleError");
const authMiddleware = (req, next) => {
  const token = req.cookies.food_deli_token;
  if (!token) {
    return next(HandleError(401, "Access Denied. No token provided."));
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(HandleError(403, "Token is not valid"));
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    HandleError(err);
  }
};

module.exports = authMiddleware;
