import React, { useEffect, useState } from "react";
import AddTimetableForm from "../components/AddTimetableForm";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("adminData"));

    if (!storedAdmin) {
      alert("⚠ Please login as Admin first");
      window.location.href = "/";
      return;
    }

    setAdmin(storedAdmin);
    fetchTimetable();
  }, []);

  // ------------------------- FETCH TIMETABLE -------------------------
  const fetchTimetable = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/timetable/all");

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("❌ Invalid JSON response:", text);
        setLoading(false);
        return;
      }

      setTimetable(Array.isArray(data.slots) ? data.slots : []);
      setLoading(false);

    } catch (err) {
      console.error("Error loading timetable:", err);
      setLoading(false);
    }
  };

  // ------------------------- DELETE SLOT -------------------------
  const deleteSlot = async (id) => {
    if (!window.confirm("Delete this timetable slot?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/timetable/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin._id }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        alert("Deletion error: Invalid server response");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Error deleting");
        return;
      }

      alert("🗑 Slot Deleted");
      fetchTimetable();

    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting slot");
    }
  };

  // ------------------------- RENDER -------------------------
  if (loading) return <div>Loading timetable...</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {admin?.name} 👋</p>

      <button className="add-btn" onClick={() => setShowForm(true)}>
        ➕ Add Timetable Slot
      </button>

      {showForm && (
        <AddTimetableForm
          adminId={admin._id}
          onClose={() => setShowForm(false)}
          refresh={fetchTimetable}
        />
      )}

      <h2>All Timetable Slots</h2>

      <div className="table-container">
        {timetable.length === 0 ? (
          <p>No timetable slots added yet.</p>
        ) : (
          timetable.map((slot) => (
            <div className="slot-card" key={slot._id}>
              <h3>{slot.subject}</h3>

              <p><b>Teacher:</b> {slot.teacherId?.name || "Unknown"}</p>
              <p><b>Batch:</b> {slot.batch}</p>
              <p><b>Day:</b> {slot.day}</p>
              <p><b>Time:</b> {slot.startTime} – {slot.endTime}</p>

              <button
                className="delete-btn"
                onClick={() => deleteSlot(slot._id)}
              >
                ❌ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
