import React, { useState, useEffect } from "react";
import "./LiveClassModal.css";

export default function LiveClassModal({
  sessionId,
  subject = "Live Class",
  students = [],
  registeredStudents = [],
  registeredCount = 0,
  onClose,
  onFlag,
}) {
  const [showPresent, setShowPresent] = useState(true);
  const [absentStudents, setAbsentStudents] = useState([]);

  // -------------------------------------------
  // CALCULATE ABSENT STUDENTS SAFELY (NO LOOP)
  // -------------------------------------------
  useEffect(() => {
    if (!registeredStudents.length) return;

    const presentIds = students.map((s) => s.studentId);

    const absList = registeredStudents.filter(
      (stu) => !presentIds.includes(stu._id)
    );

    // Format for UI
    const formatted = absList.map((s) => ({
      name: s.name,
      rollNumber: s.rollNumber,
      studentId: s._id,
    }));

    // Prevent infinite loop: update only if changed
    setAbsentStudents((prev) => {
      const same =
        prev.length === formatted.length &&
        prev.every((p, i) => p.studentId === formatted[i]?.studentId);

      return same ? prev : formatted;
    });
  }, [students, registeredStudents]); // SAFE

  return (
    <div className="live-overlay" onClick={onClose}>
      <div className="live-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="live-header">
          <h2>{subject} – Live Students</h2>
          <button className="close" onClick={onClose}>✖</button>
        </div>

        {/* SESSION ID */}
        <p className="live-session-id">
          <b>Session ID:</b> {sessionId}
        </p>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-box">
            <b>{registeredCount}</b>
            <span>Total Registered</span>
          </div>

          <div className="stat-box">
            <b>{students.length}</b>
            <span>Present</span>
          </div>

          <div className="stat-box">
            <b>{registeredCount - students.length}</b>
            <span>Absent</span>
          </div>

          <div className="stat-box">
            <b>
              {registeredCount
                ? Math.round((students.length / registeredCount) * 100)
                : 0}
              %
            </b>
            <span>Attendance</span>
          </div>
        </div>

        {/* TOGGLE BUTTONS */}
        <div className="toggle-buttons">
          <button
            className={showPresent ? "toggle-active" : ""}
            onClick={() => setShowPresent(true)}
          >
            Present
          </button>

          <button
            className={!showPresent ? "toggle-active" : ""}
            onClick={() => setShowPresent(false)}
          >
            Absent
          </button>
        </div>

        {/* MARK PRESENT BUTTON */}
<div className="mark-present-wrap">
  <button
    className="mark-present-btn"
    onClick={async () => {
      await fetch("http://localhost:5000/api/live/mark-present", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      alert("All present students marked successfully!");
    }}
  >
    ✔ Mark All Present
  </button>
</div>


        {/* STUDENT LIST */}
        <div className="live-list">
          {showPresent ? (
            // ---------------- PRESENT LIST ----------------
            students.length === 0 ? (
              <div className="no-students">No student is present.</div>
            ) : (
              students.map((s) => (
                <div key={s.studentId} className="live-item present-item">
                  <div>
                    <div className="live-name">{s.name}</div>
                    <div className="live-roll">{s.rollNumber}</div>
                    <div className="live-time">
                      {s.loginTime
                        ? new Date(s.loginTime).toLocaleString()
                        : "Joined just now"}
                    </div>
                  </div>

                  <button
                    className="flag-btn"
                    onClick={() => onFlag(s.studentId)}
                  >
                    🚩 Flag
                  </button>
                </div>
              ))
            )
          ) : (
            // ---------------- ABSENT LIST ----------------
            absentStudents.length === 0 ? (
              <div className="no-students">No student is absent.</div>
            ) : (
              absentStudents.map((s) => (
                <div key={s.studentId} className="live-item absent-item">
                  <div>
                    <div className="live-name">{s.name}</div>
                    <div className="live-roll">{s.rollNumber}</div>
                    <div className="live-time">Absent</div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

      </div>
    </div>
  );
}
