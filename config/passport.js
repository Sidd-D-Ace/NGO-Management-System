// config/passport.js
const passport = require('passport');
const User = require('../models/user');

function setupPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(User.createStrategy());

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser(User.deserializeUser());
}

module.exports = setupPassport;
