const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' not allowed to access this route`
      });
    }

    next();
  };
};

module.exports = authorizeRoles;