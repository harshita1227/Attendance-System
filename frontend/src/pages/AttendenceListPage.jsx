import React, { useEffect, useState } from "react";

export default function AttendanceListPage({ teacher, onSelect, onClose }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/sessions/teacher/${teacher._id}`)
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }, []);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>

        <h2>📋 Attendance Sessions</h2>

        {sessions.length === 0 && <p>No sessions found.</p>}

        {sessions.map((s) => (
          <div
            key={s._id}
            className="session-card"
            onClick={() => onSelect(s)}
          >
            <p><b>Session Code:</b> {s.sessionCode}</p>
            <p><b>Date:</b> {new Date(s.createdAt).toLocaleString()}</p>
            <p><b>Students Marked:</b> {s.attendees.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
