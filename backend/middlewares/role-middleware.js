const HandleError = require("../utils/handleError");

const rolemiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return HandleError(401, "Access Denied. Not authenticated.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return HandleError(
        403,
        "Access Denied. You don't have permission to access this resource."
      );
    }

    next();
  };
};

module.exports = rolemiddleware;
