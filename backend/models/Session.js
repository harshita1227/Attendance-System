import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionCode: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isLiveClass: { type: Boolean, default: false },
  subject: { type: String, default: null },
  liveStudents: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      rollNumber: String,
      loginTime: { type: Date, default: Date.now },
      flagged: { type: Boolean, default: false },
    },
  ],
  attendees: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      rollNumber: String,
      time: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);
