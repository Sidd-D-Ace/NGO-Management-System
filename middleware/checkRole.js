// middleware/checkRole.js
function checkRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    return res.status(403).send("Access Denied: You don't have permission");
  };
}

module.exports = checkRole;
