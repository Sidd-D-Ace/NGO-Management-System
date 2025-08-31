const express = require('express');
const passport = require('passport');

const router = express.Router();


// Common login route for all roles
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return next(err);
    }
    if (!user) {
      console.log("Invalid credentials");
      return res.redirect('/login'); // stay on login if fail
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      // ✅ Role-based redirection
      switch (user.role) {
        case 'volunteer':
          return res.redirect('/volunteer/dashboard');
        case 'branch head':
          return res.redirect('/branch/dashboard');
        case 'head':
          return res.redirect('/head/dashboard');
        case 'admin':
          return res.redirect('/admin/dashboard');
        default:
          return res.redirect('/dashboard'); // fallback
      }
    });
  })(req, res, next);
});

module.exports = router;
