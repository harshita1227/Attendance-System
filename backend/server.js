import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/attendanceDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Schema (added rollNumber)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNumber: String,
  password: String,
  userType: String, // "student" or "teacher"
});

const User = mongoose.model("User", userSchema);

// ✅ Register route
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
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Send success response with user type
    res.status(200).json({
      message: "Login successful",
      userType: user.userType,
      name: user.name,
      rollNumber: user.rollNumber,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
