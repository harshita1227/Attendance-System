import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// ✅ Create new session (for teachers)
router.post("/create", async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ message: "Teacher ID required" });

    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const session = await Session.create({
      teacherId,
      sessionCode,
    });

    res.json({
      message: "Session created successfully",
      sessionId: session._id,
      sessionCode,
    });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ message: "Server error while creating session" });
  }
});

// ✅ Student joins session
router.post("/join", async (req, res) => {
  try {
    const { sessionCode, student } = req.body;

    const session = await Session.findOne({ sessionCode, isActive: true });
    if (!session) return res.status(400).json({ message: "Invalid or expired session" });

    const alreadyJoined = session.attendees.find(
      (s) => s.rollNumber === student.rollNumber
    );
    if (alreadyJoined)
      return res.json({ message: "Attendance already marked" });

    session.attendees.push(student);
    await session.save();

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Join session error:", err);
    res.status(500).json({ message: "Server error while joining session" });
  }
});

export default router;
