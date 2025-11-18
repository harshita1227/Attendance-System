import React from "react";

export default function SessionDetailsPage({ session, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>

        <h2>🧾 Session Details</h2>

        <p><b>Session Code:</b> {session.sessionCode}</p>
        <p><b>Date:</b> {new Date(session.createdAt).toLocaleString()}</p>

        <h3 style={{ marginTop: "20px" }}>👥 Students Present</h3>

        {session.attendees.length === 0 && <p>No attendance marked.</p>}

        {session.attendees.map((a, i) => (
          <div key={i} className="student-card">
            <p><b>{a.name}</b> ({a.rollNumber})</p>
            <p>{new Date(a.time).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
