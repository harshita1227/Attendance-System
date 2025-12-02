import React, { useEffect, useState } from "react";
import "./AddTimetableForm.css";

export default function AddTimetableForm({ adminId, onClose, refresh }) {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    teacherId: "",
    subject: "",
    year: "",
    branch: "",
    batchNumber: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/teachers");
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.error("Error loading teachers:", err);
    }
  };

  // ⭐ FIXED: Generate batch code properly
  const generateBatchCode = () => {
    if (!form.year || !form.branch || !form.batchNumber) return "";

    // Convert “1st Year / 2nd Year / 3rd Year / 4th Year” → 1,2,3,4
    const yearNum = form.year[0]; 

    return `BTech${yearNum}_${form.branch}_${form.batchNumber}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalBatch = generateBatchCode();

    try {
      const res = await fetch("http://localhost:5000/api/timetable/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: form.teacherId,
          subject: form.subject,
          batch: finalBatch,
          day: form.day,
          startTime: form.startTime,
          endTime: form.endTime,
          adminId,
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Timetable Slot Added!");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error adding slot");
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-box" onClick={(e) => e.stopPropagation()}>
        <h2>Add Timetable Slot</h2>

        <form onSubmit={handleSubmit}>
          
          {/* Teacher Select */}
          <label>Teacher</label>
          <select
            required
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <label>Subject</label>
          <input
            type="text"
            required
            placeholder="DBMS, OS, CN..."
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          {/* ⭐ YEAR */}
          <label>Year</label>
          <select
            required
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          {/* ⭐ BRANCH */}
          <label>Branch</label>
          <select
            required
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="IT">IT</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          {/* ⭐ BATCH NUMBER */}
          <label>Batch Number</label>
          <input
            type="text"
            required
            placeholder="B1 / B2 / B3"
            value={form.batchNumber}
            onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
          />

          <label>Day</label>
          <select
            required
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          >
            <option value="">Select Day</option>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>

          <label>Start Time</label>
          <input
            type="time"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />

          <label>End Time</label>
          <input
            type="time"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />

          <button type="submit" className="submit-btn">
            Add Slot
          </button>
        </form>

        <button className="close-btn" onClick={onClose}>
          ✖ Close
        </button>
      </div>
    </div>
  );
}
