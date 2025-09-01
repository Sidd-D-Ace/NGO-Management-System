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


// Render page (EJS shell only)
router.get("/student_list", ensureAuthenticated, checkRole("volunteer"), async (req, res) => {
  try {
    res.render("lists/students_list", { query: req.query ,basePath: '/volunteer' });
  } catch (err) {
    console.error("Error rendering student_list:", err);
    res.status(500).send("Error rendering student list");
  }
});

// Fetch students with status filter
router.get("/api/students", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        s.student_id, 
        s.name, 
        s.age, 
        s.gender, 
        s.status, 
        b.branch_name AS branch,
        COALESCE(a.attendance, '0%') AS attendance,
        s.enrollment_date
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN (
        SELECT 
          student_id,
          CONCAT(
            ROUND(
              (COUNT(*) FILTER (WHERE status = 'Present')::numeric / NULLIF(COUNT(*),0)) * 100,
              0
            ), '%'
          ) AS attendance
        FROM student_attendance
        GROUP BY student_id
      ) a ON s.student_id = a.student_id
    `;

    if (status === "Active" || status === "Inactive") {
      query += ` WHERE s.status = $1 ORDER BY s.student_id`;
      const result = await db.query(query, [status]);
      return res.json(result.rows);
    }

    if (status === "Recent") {
      query += ` ORDER BY s.enrollment_date DESC`;
      const result = await db.query(query);
      return res.json(result.rows);
    }

    // For "All" or no filter
    query += ` ORDER BY s.student_id`;
    const result = await db.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports=router;

