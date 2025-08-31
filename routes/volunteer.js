const express=require('express');
const router=express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const {registerStudent} = require('../controllers/registerController');
const checkRole=require('../middleware/checkRole');
const db = require('../db/postgres');


router.get('/dashboard',ensureAuthenticated, checkRole('volunteer') ,async (req, res) => {
  try {
    const result = await db.query("SELECT name FROM volunteers WHERE username=$1", [req.user.username]);
    const headName = result.rows.length > 0 ? result.rows[0].name : req.user.username;

    res.render('dashboard/volunteer-dashboard', { name: headName });
  } catch (err) {
    console.error("Error fetching head name:", err);
    res.render('dashboard/volunteer-dashboard', { name: "Unknown" });
  }
});

router.get('/student_form',ensureAuthenticated,checkRole("volunteer"),async (req,res)=>{
    try {

    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/student_form', { branches, basePath: '/volunteer' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
})

router.post('/register-student',ensureAuthenticated,checkRole('volunteer'),registerStudent);


module.exports=router;

