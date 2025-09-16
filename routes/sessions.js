const express=require('express');
const router=express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const checkRole=require('../middleware/checkRole');
const db = require('../db/postgres');
const user = require('../models/user');


router.get('/create_session', ensureAuthenticated, async (req, res) => {
  try {
    checkRole(req.user.role)
    const username = req.user.username; // assuming user info is in req.user
    console.log(req.user.username);
    let currRole;
    let userResult;
    if(req.user.role==='volunteer'){
        currRole='volunteer'
        userResult = await db.query(
      `SELECT volunteer_id,name, branch_id FROM volunteers WHERE username = $1`,
      [username]
    );
    }
    else if(req.user.role==='branch head'){
        currRole='branch'
        userResult = await db.query(
      `SELECT admin_id,name FROM admins WHERE username = $1`,
      [username]
    );

    }
    else{
        currRole='head'
        userResult = await db.query(
      `SELECT head_id,name FROM heads WHERE username = $1`,
      [username]
    );
    }

    // 1️⃣ Fetch current user info
    
    const currentUser = userResult.rows[0];
    console.log(currentUser);
    // 2️⃣ Fetch all branches
    const branchesResult = await db.query('SELECT branch_id, branch_name FROM branches');
    const branches = branchesResult.rows;
    

    // 3️⃣ Fetch all volunteers
    const volunteersResult = await db.query('SELECT volunteer_id, name,branch_id FROM volunteers');
    const volunteers = volunteersResult.rows;
    console.log(volunteers);
    // 4️⃣ Fetch all subjects
    const subjectsResult = await db.query('SELECT subject_id, name FROM subjects');
    const subjects = subjectsResult.rows;
    
    res.render('forms/register-session.ejs', {
      basePath:currRole,
      currentUser,
      branches,
      volunteers,
      subjects
    });
  } catch (err) {
    console.error('Error rendering page:',err);
    res.status(500).send('Server Error');
  }
});

router.post('/register_session', (req, res, next) => {
  console.log('content-type:', req.headers['content-type']);
  next();
});


module.exports = router;