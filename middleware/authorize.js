const authorize = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ Status: false, Message: "Access Denied" });
      }
      next();
    };
  };
  
  module.exports = authorize;
  