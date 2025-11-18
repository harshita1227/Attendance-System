import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession", required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Attendance", AttendanceSchema);
