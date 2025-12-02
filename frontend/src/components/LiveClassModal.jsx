import React from "react";
import "./LiveClassModal.css";

export default function LiveClassModal({
  sessionId,
  subject = "Live Class",
  students = [],
  onClose,
  onFlag,
}) {
  return (
    <div className="live-overlay" onClick={onClose}>
      <div className="live-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="live-header">
          <h2>{subject} – Live Students</h2>
          <button className="close" onClick={onClose}>✖</button>
        </div>

        {/* SESSION INFO */}
        <p className="live-session-id">
          <b>Session ID:</b> {sessionId}
        </p>

        {/* LIVE STATS */}
        <div className="live-stats">
          <div className="live-count">{students.length}</div>
          <div>Students Logged In</div>
        </div>

        {/* STUDENT LIST */}
        <div className="live-list">
          {students.length === 0 ? (
            <div className="no-students">No students online yet.</div>
          ) : (
            students.map((s, i) => (
              <div key={i} className="live-item">
                
                {/* LEFT SIDE — DETAILS */}
                <div>
                  <div className="live-name">{s.name}</div>
                  <div className="live-roll">{s.rollNumber}</div>

                  <div className="live-time">
                    {s.loginTime
                      ? new Date(s.loginTime).toLocaleString()
                      : "Joined just now"}
                  </div>
                </div>

                {/* RIGHT SIDE — FLAG ACTION */}
                <div className="live-actions">
                  {s.flagged && (
                    <span className="flag-badge flagged">Flagged</span>
                  )}

                  <button
                    className="flag-btn"
                    onClick={() => onFlag(s.studentId)}
                  >
                    🚩 Flag
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
