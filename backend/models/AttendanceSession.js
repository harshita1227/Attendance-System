import mongoose from "mongoose";

const AttendanceSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  sessionCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AttendanceSession", AttendanceSessionSchema);
