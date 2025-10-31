const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { studentId, status } = req.body;
    const record = await Attendance.create({ student: studentId, status });
    res.json({ message: "Attendance Marked!", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const data = await Attendance.find().populate("student", "name email");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
