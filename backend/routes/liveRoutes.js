// liveroutes.js
import express from "express";
import LiveClass from "../models/LiveClass.js";
import User from "../models/User.js";
import Timetable from "../models/Timetable.js";
import { isNowBetween } from "../utils/timeUtils.js";

const router = express.Router();

/* -------------------------------------------------
   START LIVE CLASS (Teacher starts manually)
--------------------------------------------------- */
router.post("/start", async (req, res) => {
  try {
    const { teacherId, subject, batch, year, branch } = req.body;

    if (!teacherId || !subject)
      return res.status(400).json({ message: "Missing fields" });

    // End previous live class of this teacher
    await LiveClass.updateMany({ teacherId, isActive: true }, { isActive: false });

    const session = await LiveClass.create({
      teacherId,
      subject,
      batch: batch || null,
      year: year || null,
      branch: branch || null,
      isActive: true,
      students: [],
    });

    res.json({
      message: "Live class started",
      sessionId: session._id,
      batch: session.batch,
      year: session.year,
      branch: session.branch,
    });
  } catch (err) {
    res.status(500).json({ message: "Error starting live class" });
  }
});


/* -------------------------------------------------
   AUTO CHECK ACTIVE CLASS (Teacher + Student)
--------------------------------------------------- */
router.get("/active", async (req, res) => {
  try {
    const { teacherId, batch } = req.query;

    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" });

    /* --------------------- TEACHER SIDE --------------------- */
    if (teacherId) {
      const slots = await Timetable.find({ teacherId, day });

      const current = slots.find(s => isNowBetween(s.startTime, s.endTime));
      if (!current) return res.json({ active: false });

      // Ensure live class exists
      let live = await LiveClass.findOne({ teacherId, isActive: true });

      if (!live) {
        live = await LiveClass.create({
          teacherId,
          subject: current.subject,
          batch: current.batch,
          year: current.year,
          branch: current.branch,
          isActive: true,
        });
      }

      const teacher = await User.findById(teacherId).select("name");

      return res.json({
        active: true,
        sessionId: live._id,
        subject: live.subject,
        batch: live.batch,
        year: live.year,
        branch: live.branch,
        startTime: current.startTime,
        endTime: current.endTime,
        teacherName: teacher?.name || "Teacher",
      });
    }

    /* --------------------- STUDENT SIDE --------------------- */
    if (batch) {
      // Student is requesting — find matching class
      const slots = await Timetable.find({ batch, day });
      const current = slots.find(s => isNowBetween(s.startTime, s.endTime));

      if (!current) return res.json({ active: false });

      let live = await LiveClass.findOne({
        teacherId: current.teacherId,
        isActive: true,
      });

      if (!live) {
        live = await LiveClass.create({
          teacherId: current.teacherId,
          subject: current.subject,
          batch: current.batch,
          year: current.year,
          branch: current.branch,
          isActive: true,
        });
      }

      const teacher = await User.findById(current.teacherId).select("name");

      return res.json({
        active: true,
        sessionId: live._id,
        teacherId: current.teacherId,
        subject: live.subject,
        batch: live.batch,
        year: live.year,
        branch: live.branch,
        startTime: current.startTime,
        endTime: current.endTime,
        teacherName: teacher?.name || "Teacher",
      });
    }

    return res.json({ active: false });

  } catch (err) {
    res.status(500).json({ message: "Error checking active class" });
  }
});


/* -------------------------------------------------
   STUDENT JOINS LIVE CLASS
--------------------------------------------------- */
router.post("/join", async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;

    if (!sessionId || !studentId)
      return res.status(400).json({ message: "Missing fields" });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.isBlocked)
      return res.status(403).json({ message: "You are blocked" });

    const session = await LiveClass.findById(sessionId);
    if (!session || !session.isActive)
      return res.status(400).json({ message: "No active live class" });

    // FULL MATCH CHECK
    if (
      session.batch && session.batch !== student.batch ||
      session.year && session.year !== student.year ||
      session.branch && session.branch !== student.branch
    ) {
      return res.status(403).json({
        message: "This class is not for your year/branch/batch",
      });
    }

    // prevent duplicate join
    const exists = session.students.find(
      s => s.studentId.toString() === studentId
    );
    if (exists) return res.json({ message: "Already joined" });

    session.students.push({
      studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      loginTime: new Date(),
    });

    await session.save();

    res.json({ message: "Joined live class successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error joining live class" });
  }
});


/* -------------------------------------------------
   TEACHER VIEW LIVE STUDENTS
--------------------------------------------------- */
router.get("/:teacherId", async (req, res) => {
  try {
    const session = await LiveClass.findOne({
      teacherId: req.params.teacherId,
      isActive: true,
    });

    if (!session)
      return res.json({ active: false, students: [] });

    res.json({
      active: true,
      sessionId: session._id,
      subject: session.subject,
      batch: session.batch,
      year: session.year,
      branch: session.branch,
      students: session.students,
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});


/* -------------------------------------------------
   END LIVE CLASS
--------------------------------------------------- */
router.post("/end/:sessionId", async (req, res) => {
  try {
    const session = await LiveClass.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.isActive = false;
    await session.save();

    res.json({ message: "Live class ended" });

  } catch (err) {
    res.status(500).json({ message: "Error ending live class" });
  }
});

export default router;
