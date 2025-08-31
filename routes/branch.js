const express = require('express');
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const checkRole = require('../middleware/checkRole');
const { registerUser,registerStudent } = require('../controllers/registerController');
const db = require('../db/postgres');

const router = express.Router();

// ✅ Branch dashboard
router.get('/dashboard',ensureAuthenticated, checkRole('branch head') ,async (req, res) => {
  try {
    const result = await db.query("SELECT name FROM admins WHERE username=$1", [req.user.username]);
    const headName = result.rows.length > 0 ? result.rows[0].name : req.user.username;

    res.render('dashboard/branch-dashboard', { name: headName });
  } catch (err) {
    console.error("Error fetching head name:", err);
    res.render('dashboard/branch-dashboard', { name: "Unknown" });
  }
});
// ✅ Branch head can also register volunteers
router.post('/register-user', ensureAuthenticated, checkRole('branch head'), registerUser);
router.post('/register-student',ensureAuthenticated,checkRole('branch head'),registerStudent);

router.get('/volunteer_form', ensureAuthenticated, checkRole('branch head'), async(req, res) => {
  try {
    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/volunteer_form', { branches, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

router.get('/student_form',ensureAuthenticated,checkRole("branch head"),async (req,res)=>{
    try {

    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/student_form', { branches, basePath: '/branch' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
})

module.exports = router;
