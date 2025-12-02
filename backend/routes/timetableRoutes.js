import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

/* ------------------------------------------------------------
   ADD TIMETABLE SLOT (Admin)
--------------------------------------------------------------*/
router.post("/add", async (req, res) => {
  try {
    const { teacherId, subject, batch, day, startTime, endTime } = req.body;

    // Check time clash for teacher
    const clash = await Timetable.findOne({
      teacherId,
      day,
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    });

    if (clash)
      return res
        .status(400)
        .json({ message: "Teacher already has a class in this time slot!" });

    const newSlot = await Timetable.create({
      teacherId,
      subject,
      batch,
      day,
      startTime,
      endTime,
    });

    res.json({ message: "Timetable slot added", slot: newSlot });

  } catch (err) {
    res.status(500).json({ message: "Error adding slot", error: err.message });
  }
});

/* ------------------------------------------------------------
   UPDATE TIMETABLE SLOT
--------------------------------------------------------------*/
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: "Timetable updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating timetable" });
  }
});

/* ------------------------------------------------------------
   DELETE SLOT
--------------------------------------------------------------*/
router.delete("/delete/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting timetable" });
  }
});

/* ------------------------------------------------------------
   GET TIMETABLE FOR A TEACHER
--------------------------------------------------------------*/
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const slots = await Timetable.find({ teacherId: req.params.teacherId })
      .sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timetable" });
  }
});

/* ------------------------------------------------------------
   GET TIMETABLE FOR A BATCH
--------------------------------------------------------------*/
router.get("/batch/:batch", async (req, res) => {
  try {
    const slots = await Timetable.find({ batch: req.params.batch })
      .sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching batch timetable" });
  }
});

/* ------------------------------------------------------------
   GET CURRENT CLASS FOR TEACHER
--------------------------------------------------------------*/
router.get("/current/teacher/:teacherId", async (req, res) => {
  try {
    const now = new Date();
    const dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const currentDay = dayNames[now.getDay()];

    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const activeClass = await Timetable.findOne({
      teacherId: req.params.teacherId,
      day: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    res.json({ activeClass });
  } catch (err) {
    res.status(500).json({ message: "Error checking current class" });
  }
});

/* ------------------------------------------------------------
   GET CURRENT CLASS FOR A BATCH
--------------------------------------------------------------*/
router.get("/current/batch/:batch", async (req, res) => {
  try {
    const now = new Date();
    const dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    const activeClass = await Timetable.findOne({
      batch: req.params.batch,
      day: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    res.json({ activeClass });
  } catch (err) {
    res.status(500).json({ message: "Error checking current class" });
  }
});

export default router;
