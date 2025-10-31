const express = require("express");
const { markAttendance, getAttendance } = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Only logged-in users can mark attendance
router.post("/mark", authMiddleware, markAttendance);

// Only admin/teacher can view attendance (optional role check)
router.get("/all", authMiddleware, getAttendance);

module.exports = router;
