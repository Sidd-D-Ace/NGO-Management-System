const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

const setupConnections = require('./connection'); 

// Routes
const authRoutes = require('./routes/auth');
const headRoutes = require('./routes/head');
const branchRoutes = require('./routes/branch');
const volunteerRoutes = require('./routes/volunteer');


dotenv.config();

const port = 3000;
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// DB connection
setupConnections(app);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/head', headRoutes);
app.use('/branch', branchRoutes);
app.use('/volunteer', volunteerRoutes);


// Default route → login page
app.get('/', (req, res) => {
  res.render('login'); // no need to write .ejs
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
