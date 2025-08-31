// middleware/ensureAuthenticate.js
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // redirect if not logged in
}

module.exports = ensureAuthenticated;
