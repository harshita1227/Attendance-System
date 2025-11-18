import express from "express";
import AttendanceSession from "../models/AttendanceSession.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

router.post("/mark", async (req, res) => {
  try {
    const { studentId, sessionCode } = req.body;

    if (!studentId || !sessionCode) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ Find session using sessionCode
    const session = await AttendanceSession.findOne({ sessionCode });

    if (!session) {
      return res.status(404).json({ message: "Invalid session code" });
    }

    // 2️⃣ Check if student already marked attendance
    const already = await Attendance.findOne({
      studentId,
      sessionId: session._id,
    });

    if (already) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // 3️⃣ Mark attendance
    await Attendance.create({
      studentId,
      sessionId: session._id,
      timestamp: Date.now(),
    });

    return res.json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
