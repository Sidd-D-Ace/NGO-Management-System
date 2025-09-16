const express = require('express');
const ensureAuthenticated = require('../middleware/ensureAuthentication');
const checkRole = require('../middleware/checkRole');
const { registerUser,registerStudent } = require('../controllers/registerController');
const db = require('../db/postgres');

const router = express.Router();

const sessionRoutes = require('./sessions');
router.use('/sessions',sessionRoutes);


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


router.get("/student_list", ensureAuthenticated, checkRole("branch head"), async (req, res) => {
  try {
    res.render("lists/students_list", { query: req.query ,basePath: '/branch' });
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

router.get("/volunteer_list", ensureAuthenticated, checkRole("branch head"), async (req, res) => {
  try {
    res.render("lists/volunteer_list", { query: req.query ,basePath: '/branch' });
  } catch (err) {
    console.error("Error rendering volunteer_list:", err);
    res.status(500).send("Error rendering volnteer list");
  }
});

router.get("/api/volunteers", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        v.volunteer_id, 
        v.name, 
        v.age, 
        v.gender, 
        v.status, 
        b.branch_name AS branch,
        COALESCE(a.attendance, '0%') AS attendance,
        v.join_date
      FROM volunteers v
      LEFT JOIN branches b ON v.branch_id = b.branch_id
      LEFT JOIN (
        SELECT 
          volunteer_id,
          CONCAT(
            ROUND(
              (COUNT(*) FILTER (WHERE status = 'Present')::numeric / NULLIF(COUNT(*),0)) * 100,
              0
            ), '%'
          ) AS attendance
        FROM volunteer_attendance
        GROUP BY volunteer_id
      ) a ON v.volunteer_id = a.volunteer_id
    `;

    if (status === "Active" || status === "Inactive") {
      query += ` WHERE v.status = $1 ORDER BY v.volunteer_id`;
      const result = await db.query(query, [status]);
      return res.json(result.rows);
    }

    if (status === "Recent") {
      query += ` ORDER BY v.join_date DESC`;
      const result = await db.query(query);
      return res.json(result.rows);
    }

    // All volunteers
    query += ` ORDER BY v.volunteer_id`;
    const result = await db.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
