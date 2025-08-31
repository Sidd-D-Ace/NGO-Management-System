// connection.js
require('dotenv').config();
const session = require('express-session');
const connectMongo = require('./db/mongo');
const setupPassport = require('./config/passport');

function setupConnections(app) {
  // Session middleware
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));

  // Connect MongoDB (singleton)
  connectMongo();

  // Setup passport
  setupPassport(app);
}

module.exports = setupConnections;
