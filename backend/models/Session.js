import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  sessionCode: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 1000 * 60 * 5 }, // 5 min expiry
  attendees: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      name: String,
      rollNumber: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Session", sessionSchema);
