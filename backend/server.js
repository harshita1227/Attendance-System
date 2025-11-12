import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/attendanceDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ============================
// 🔹 USER MODEL
// ============================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNumber: String,
  password: String,
  userType: String, // "student" or "teacher"
});

const User = mongoose.model("User", userSchema);

// ============================
// 🔹 SESSION MODEL
// ============================
const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionCode: String, // OTP code
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 1000 * 60 * 5 }, // expires in 5 minutes
  attendees: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      rollNumber: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

const Session = mongoose.model("Session", sessionSchema);

// ============================
// 🔹 REGISTER ROUTE
// ============================
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, rollNumber, password, userType } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      rollNumber: userType === "student" ? rollNumber : "",
      password,
      userType,
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ============================
// 🔹 LOGIN ROUTE
// ============================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email, userType });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Send success response with user data
    res.status(200).json({
      message: "Login successful",
      userType: user.userType,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ============================
// 🔹 CREATE SESSION (Teacher)
// ============================
app.post("/api/session/create", async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId)
      return res.status(400).json({ message: "Teacher ID required" });

    // Generate 6-digit OTP
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();

    // End any previous active sessions by this teacher
    await Session.updateMany({ teacherId, isActive: true }, { isActive: false });

    const session = await Session.create({
      teacherId,
      sessionCode,
    });

    res.json({
      message: "✅ Session created successfully",
      sessionId: session._id,
      sessionCode,
    });
  } catch (err) {
    console.error("❌ Session Creation Error:", err);
    res.status(500).json({ message: "Server error while creating session" });
  }
});

// ============================
// 🔹 JOIN SESSION (Student)
// ============================
app.post("/api/session/join", async (req, res) => {
  try {
    const { sessionCode, student } = req.body;

    const session = await Session.findOne({ sessionCode, isActive: true });
    if (!session) {
      return res.status(400).json({ message: "Invalid or expired session" });
    }

    const alreadyJoined = session.attendees.find(
      (s) => s.rollNumber === student.rollNumber
    );

    if (alreadyJoined) {
      return res.json({ message: "⚠️ Attendance already marked!" });
    }

    session.attendees.push(student);
    await session.save();

    res.json({ message: "✅ Attendance marked successfully!" });
  } catch (err) {
    console.error("❌ Join Session Error:", err);
    res.status(500).json({ message: "Server error while joining session" });
  }
});

// ============================
// 🔹 ROOT ROUTE
// ============================
app.get("/", (req, res) => {
  res.send("✅ Attendance System Backend is Running...");
});

// ============================
// 🔹 START SERVER
// ============================
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
