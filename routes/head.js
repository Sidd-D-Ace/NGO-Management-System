const express=require('express');
const router=express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const { registerUser , registerBranch, registerStudent} = require('../controllers/registerController');
const checkRole=require('../middleware/checkRole');
const db = require('../db/postgres');

// router.route.get('/',(req,res)=>{
//     res.render('login');
// })




router.post('/register-user', ensureAuthenticated, checkRole('head'), registerUser);
router.post('/register-branch-head',ensureAuthenticated,checkRole('head'), registerUser);
router.post('/register-branch',ensureAuthenticated, checkRole('head'), registerBranch);
router.post('/register-student',ensureAuthenticated,checkRole('head'),registerStudent);


router.get('/dashboard',ensureAuthenticated, checkRole('head') ,async (req, res) => {
  try {
    const result = await db.query("SELECT name FROM Heads WHERE username=$1", [req.user.username]);
    const headName = result.rows.length > 0 ? result.rows[0].name : req.user.username;

    res.render('dashboard/head-dashboard', { name: headName });
  } catch (err) {
    console.error("Error fetching head name:", err);
    res.render('dashboard/head-dashboard', { name: "Unknown" });
  }
});

router.get('/volunteer_form', ensureAuthenticated, checkRole('head'), async(req, res) => {
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

router.get('/student_form',ensureAuthenticated,checkRole("head"),async (req,res)=>{
    try {

    // Fetch all branches
    const branchesResult = await db.query("SELECT branch_id, branch_name FROM branches");
    const branches = branchesResult.rows;

    res.render('forms/student_form', { branches, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
})

router.get('/branch_head_form',ensureAuthenticated,checkRole("head"),(req,res)=>{
    res.render('forms/branch_head_form',{ basePath: '/head'});
})



router.get('/Student_form', ensureAuthenticated, checkRole('head'), (req, res) => {
  res.render('/forms/student-form.ejs', { basePath: '/head' });
});

router.get('/branch_form',ensureAuthenticated, checkRole('head'),async (req,res)=>{
    try{
        const branchHeadsResult = await db.query("SELECT admin_id, name FROM admins");
        const branchHeads = branchHeadsResult.rows;
        console.log(branchHeads);
    // Fetch all heads (if different from branch heads)
    const headsResult = await db.query("SELECT head_id, name FROM heads");
    const heads = headsResult.rows;
        console.log(heads);
    // Render EJS page and pass the     data
    res.render('forms/branch_form', { branchHeads, heads, basePath: '/head' });
  } catch (err) {
    console.error("Error fetching heads:", err);
    res.status(500).send("Error fetching data");
    }
});


module.exports=router;