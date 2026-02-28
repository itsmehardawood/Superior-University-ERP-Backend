// authorize.middleware.js
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role; // comes from protect middleware
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${userRole}`
      });
    }
    next(); // role is allowed, continue
  };
}

export default authorizeRoles;