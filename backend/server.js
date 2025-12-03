// ----------------------------------------------
// server.js (FULL, CLEAN, NOT SHORTENED)
// ----------------------------------------------

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Timetable from "./models/Timetable.js";
import { isNowBetween } from "./utils/timeUtils.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------
// MONGODB CONNECTION
// ----------------------------------------------

mongoose
  .connect(
    process.env.MONGO_URI && process.env.MONGO_URI.trim() !== ""
      ? process.env.MONGO_URI
      : "mongodb://127.0.0.1:27017/attendanceDB"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ----------------------------------------------
// USER MODEL
// ----------------------------------------------

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNumber: String,
  password: String,

  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },

  year: { type: String, default: "" },
  branch: { type: String, default: "" },
  batch: { type: String, default: "" },

  flagCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

// ----------------------------------------------
// GET ALL TEACHERS
// ----------------------------------------------

app.get("/api/users/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "_id name email"
    );
    res.json({ teachers });
  } catch {
    res.status(500).json({ message: "Error loading teachers" });
  }
});

// ----------------------------------------------
// SESSION MODEL
// ----------------------------------------------

const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  sessionCode: { type: String, default: null },
  expiresAt: { type: Date, default: null },

  isLiveClass: { type: Boolean, default: false },
  subject: { type: String, default: null },
  batch: { type: String, default: null },

  attendees: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      rollNumber: String,
      time: { type: Date, default: Date.now },
    },
  ],

  liveStudents: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      rollNumber: String,
      loginTime: { type: Date, default: Date.now },
      flagged: { type: Boolean, default: false },
    },
  ],

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);

// ----------------------------------------------
// REGISTER
// ----------------------------------------------

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      rollNumber,
      password,
      userType,
      year,
      branch,
      batch,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      name,
      email,
      password,
      role: userType || "student",
      rollNumber: userType === "student" ? rollNumber : "",
      year: userType === "student" ? year : "",
      branch: userType === "student" ? branch : "",
      batch: userType === "student" ? batch : "",
    });

    res.json({ message: "Registration successful!", userId: newUser._id });
  } catch {
    res.status(500).json({ message: "Registration error" });
  }
});

// ----------------------------------------------
// LOGIN
// ----------------------------------------------

app.post("/api/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email, role: userType });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.password !== password)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({
      message: "Login successful",
      userType: user.role,
      user,
    });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// ----------------------------------------------
// CREATE QR SESSION
// ----------------------------------------------

app.post("/api/session/create", async (req, res) => {
  try {
    const { teacherId } = req.body;

    await Session.updateMany({ teacherId, isActive: true }, { isActive: false });

    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await Session.create({
      teacherId,
      sessionCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    res.json({ sessionId: session._id, sessionCode });
  } catch {
    res.status(500).json({ message: "Session create error" });
  }
});

// ----------------------------------------------
// JOIN QR SESSION
// ----------------------------------------------

app.post("/api/session/join", async (req, res) => {
  try {
    const { sessionCode, student } = req.body;

    const session = await Session.findOne({ sessionCode, isActive: true });
    if (!session) return res.status(400).json({ message: "Invalid session" });

    const exists = session.attendees.some(
      (s) => s.rollNumber === student.rollNumber
    );
    if (exists) return res.json({ message: "Already marked" });

    session.attendees.push(student);
    await session.save();

    res.json({ message: "Attendance marked!" });
  } catch {
    res.status(500).json({ message: "Error joining QR session" });
  }
});

// ----------------------------------------------
// MARK ATTENDANCE (QR)
// ----------------------------------------------

app.post("/api/attendance/mark", async (req, res) => {
  try {
    const { studentId, sessionCode } = req.body;

    const session = await Session.findOne({ sessionCode, isActive: true });
    if (!session)
      return res.status(400).json({ message: "Invalid session" });

    const student = await User.findById(studentId);
    if (!student)
      return res.status(400).json({ message: "Student not found" });

    if (student.isBlocked)
      return res.status(403).json({ message: "Blocked due to flags" });

    const exists = session.attendees.some(
      (a) => a.studentId?.toString() === studentId
    );
    if (exists) return res.json({ message: "Already marked" });

    session.attendees.push({
      studentId,
      name: student.name,
      rollNumber: student.rollNumber,
    });

    await session.save();
    res.json({ message: "QR attendance marked" });
  } catch {
    res.status(500).json({ message: "QR attendance error" });
  }
});

// ----------------------------------------------
// VIEW SESSION
// ----------------------------------------------

app.get("/api/session/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    res.json({ attendees: session.attendees });
  } catch {
    res.status(500).json({ message: "Session fetch error" });
  }
});

// ----------------------------------------------
// TIMETABLE ROUTES
// ----------------------------------------------

app.get("/api/timetable/all", async (req, res) => {
  try {
    const slots = await Timetable.find().populate("teacherId", "name");
    res.json({ slots });
  } catch {
    res.status(500).json({ message: "Error fetching all timetable slots" });
  }
});

app.post("/api/timetable/add", async (req, res) => {
  try {
    const { adminId } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const slot = await Timetable.create(req.body);
    res.json({ message: "Slot added", slot });
  } catch {
    res.status(500).json({ message: "Error adding slot" });
  }
});

// ----------------------------------------------
// FIXED ROUTE: TIMETABLE FOR TEACHER (404 SOLVED)
// ----------------------------------------------

app.get("/api/timetable/teacher/:teacherId", async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const slots = await Timetable.find({ teacherId }).populate(
      "teacherId",
      "name"
    );

    res.json(slots);
  } catch {
    res.status(500).json({ message: "Error loading teacher timetable" });
  }
});

// ----------------------------------------------
// CLASS INFO FOR STUDENT
// ----------------------------------------------

app.get("/api/timetable/class-info", async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId)
      return res.status(400).json({ message: "Missing teacherId" });

    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    const slots = await Timetable.find({ teacherId, day: dayName }).populate(
      "teacherId",
      "name"
    );

    if (!slots.length)
      return res.json({ message: "No classes today" });

    const slot = slots.find((s) => isNowBetween(s.startTime, s.endTime));
    if (!slot) return res.json({ message: "No running class now" });

    res.json({
      teacherName: slot.teacherId.name,
      subject: slot.subject,
      batch: slot.batch,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  } catch {
    res.status(500).json({ message: "Error fetching class info" });
  }
});

// ----------------------------------------------
// LIVE CLASS START
// ----------------------------------------------

app.post("/api/live/start", async (req, res) => {
  try {
    const { teacherId, subject, batch } = req.body;

    await Session.updateMany(
      { teacherId, isLiveClass: true, isActive: true },
      { isActive: false }
    );

    const session = await Session.create({
      teacherId,
      subject,
      batch,
      isLiveClass: true,
      isActive: true,
      liveStudents: [],
      attendees: [],
    });

    res.json({ message: "Live class started", sessionId: session._id });
  } catch {
    res.status(500).json({ message: "Error starting live class" });
  }
});

// ----------------------------------------------
// LIVE CLASS for STUDENTS (MAIN FIX HERE)
// ----------------------------------------------

app.get("/api/live/active", async (req, res) => {
  try {
    const { batch } = req.query;

    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    if (batch) {
      // ⭐ CASE-INSENSITIVE batch match FIX
      const slots = await Timetable.find({
        batch: new RegExp(`^${batch}$`, "i"),
        day: dayName,
      }).populate("teacherId", "name");

      const current = slots.find((s) => isNowBetween(s.startTime, s.endTime));
      if (!current) return res.json({ active: false });

      let session = await Session.findOne({
        teacherId: current.teacherId._id,
        subject: current.subject,
        batch: current.batch,
        isLiveClass: true,
        isActive: true,
      });

      if (!session) {
        session = await Session.create({
          teacherId: current.teacherId._id,
          subject: current.subject,
          batch: current.batch,
          isLiveClass: true,
          isActive: true,
          liveStudents: [],
          attendees: [],
        });
      }

      return res.json({
        active: true,
        sessionId: session._id,
        teacherId: current.teacherId._id,
        teacherName: current.teacherId.name,
        subject: session.subject,
        batch: session.batch,
        startTime: current.startTime,
        endTime: current.endTime,
      });
    }

    res.json({ active: false });
  } catch {
    res.status(500).json({ message: "Error checking active live" });
  }
});

// ----------------------------------------------
// LIVE CLASS FOR TEACHER (View Students)
// ----------------------------------------------

app.get("/api/live/:teacherId", async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    const slots = await Timetable.find({ teacherId, day: dayName });
    const current = slots.find((s) => isNowBetween(s.startTime, s.endTime));

    if (!current) return res.json({ active: false });

    const session = await Session.findOne({
      teacherId,
      subject: current.subject,
      batch: current.batch,
      isLiveClass: true,
      isActive: true,
    });

    if (!session) return res.json({ active: false });

    res.json({
      active: true,
      sessionId: session._id,
      subject: session.subject,
      students: session.liveStudents,
    });
  } catch {
    res.status(500).json({ message: "Live fetch error" });
  }
});

// ----------------------------------------------
// JOIN LIVE CLASS
// ----------------------------------------------

app.post("/api/live/join", async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    if (student.isBlocked)
      return res.status(403).json({ message: "Blocked due to flags" });

    const session = await Session.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    const sessionBatch = session.batch.trim().toLowerCase();
    const studentBatch = student.batch.trim().toLowerCase();

    if (sessionBatch !== studentBatch)
      return res.status(403).json({ message: "Not your batch" });

    const exists = session.liveStudents.some(
      (s) => s.studentId?.toString() === studentId
    );
    if (exists) return res.json({ message: "Already joined" });

    session.liveStudents.push({
      studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      loginTime: new Date(),
    });

    await session.save();

    res.json({ message: "Joined live class" });
  } catch {
    res.status(500).json({ message: "Join error" });
  }
});

// ----------------------------------------------
// FLAG STUDENT
// ----------------------------------------------

// ----------------------------------------------
// FLAG STUDENT → MARK ABSENT → REMOVE FROM LIVE
// ----------------------------------------------
app.post("/api/live/flag/:sessionId/:studentId", async (req, res) => {
  try {
    const { sessionId, studentId } = req.params;

    // 1️⃣ Find session
    const session = await Session.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    // 2️⃣ Find student inside live list
    const index = session.liveStudents.findIndex(
      (s) => s.studentId.toString() === studentId.toString()
    );

    if (index === -1)
      return res.status(404).json({ message: "Student not in live class" });

    const removedStudent = session.liveStudents[index];

    // 3️⃣ Remove from liveStudents array
    session.liveStudents.splice(index, 1);

    // 4️⃣ Mark ABSENT in this session
    session.attendees = session.attendees.filter(
      (a) => a.studentId?.toString() !== studentId.toString()
    );

    await session.save();

    return res.json({
      message: "Student flagged and marked ABSENT",
      removedStudent,
      students: session.liveStudents, // updated list
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ----------------------------------------------
// ATTENDANCE HISTORY
// ----------------------------------------------

app.get("/api/attendance/student/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const allSessions = await Session.find().populate("teacherId", "name");

    const present = allSessions.filter(
      (s) =>
        s.attendees.some((a) => a.studentId?.toString() === studentId) ||
        s.liveStudents.some((a) => a.studentId?.toString() === studentId)
    );

    const formatted = present.map((s) => {
      const live = s.liveStudents.find(
        (a) => a.studentId?.toString() === studentId
      );
      const att =
        live || s.attendees.find((a) => a.studentId?.toString() === studentId);

      return {
        date: att.loginTime || att.time,
        sessionCode: s.sessionCode || "LIVE",
        teacherName: s.teacherId?.name,
        status: "Present",
      };
    });

    res.json({
      totalSessions: allSessions.length,
      present: formatted.length,
      absent: allSessions.length - formatted.length,
      percentage: allSessions.length
        ? Math.round((formatted.length / allSessions.length) * 100)
        : 0,
      records: formatted,
    });
  } catch {
    res.status(500).json({ message: "History load error" });
  }
});
// ----------------------------------------------
// DOWNLOAD SESSION ATTENDANCE CSV (Teacher)
// ----------------------------------------------
app.get("/api/attendance/session/:sessionId/csv", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate(
      "teacherId",
      "name"
    );

    if (!session) return res.status(404).send("Session not found");

    let csv = "Name,RollNumber,JoinTime,Type\n";

    // Add LIVE students
    session.liveStudents.forEach((s) => {
      csv += `${s.name},${s.rollNumber},${new Date(
        s.loginTime
      ).toLocaleString()},LIVE\n`;
    });

    // Add QR students
    session.attendees.forEach((s) => {
      csv += `${s.name},${s.rollNumber},${new Date(
        s.time
      ).toLocaleString()},QR\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_session_${sessionId}.csv`
    );

    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send("CSV generation error");
  }
});

// ----------------------------------------------
// GET TOTAL REGISTERED STUDENTS IN A BATCH
// ----------------------------------------------
app.get("/api/batch/count/:batch", async (req, res) => {
  try {
    const batchRaw = req.params.batch;
    const batch = batchRaw.trim().toLowerCase();

    const count = await User.countDocuments({
      role: "student",
      batch: new RegExp(`^${batch}$`, "i"),
    });

    res.json({ total: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Batch count error" });
  }
});


// ----------------------------------------------
// ROOT ENDPOINT
// ----------------------------------------------

app.get("/", (req, res) => {
  res.send("Attendance System Backend Running...");
});

// ----------------------------------------------
// START SERVER
// ----------------------------------------------

app.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running on port 5000")
);
