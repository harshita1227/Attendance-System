import React, { useEffect, useState } from "react";
import "./AttendancePage.css"; // Make sure this is added

export default function AttendancePage({ student, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalSessions, setTotalSessions] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const studentId = student?._id;

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/attendance/student/${studentId}`
        );
        const data = await res.json();

        if (res.ok) {
          setRecords(data.records || []);
          setTotalSessions(data.totalSessions || 0);
          setPresent(data.present || 0);
          setAbsent(data.absent || 0); 
          setPercentage(data.percentage || 0);
        }
      } catch (err) {
        console.error("Error loading attendance", err);
      }
      setLoading(false);
    }

    loadAttendance();
  }, [studentId]);

  return (
    <div className="attendance-overlay" onClick={onClose}>
      <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Header */}
        <div className="attendance-header">
          <h2>Your Attendance</h2>
          <p>Summary of all your attendance sessions</p>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {/* Stats Section */}
        <div className="attendance-stats-box">
          <div className="stat-card-new">
            <h3>{totalSessions}</h3>
            <p>Total Sessions</p>
          </div>

          <div className="stat-card-new">
            <h3>{present}</h3>
            <p>Present</p>
          </div>

          <div className="stat-card-new">
            <h3>{absent}</h3>
            <p>Absent</p>
          </div>

          <div className="stat-card-new highlight">
            <h3>{percentage}%</h3>
            <p>Attendance %</p>
          </div>
        </div>

        {/* Records List */}
        <div className="attendance-records-box">
          <h3 className="records-title">Attendance Records</h3>

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : records.length === 0 ? (
            <div className="empty-state-new">
              <span className="empty-icon">📭</span>
              <p>No attendance marked yet.</p>
            </div>
          ) : (
            <div className="records-scroll">
              {records.map((rec, index) => (
                <div className="record-card" key={index}>
                  <div className="record-top">
                    <span className="record-number">#{index + 1}</span>
                    <span className="status-tag">{rec.status}</span>
                  </div>

                  <div className="record-info-box">
                    <p><span>Date:</span> {new Date(rec.date).toLocaleString()}</p>
                    <p><span>Session Code:</span> {rec.sessionCode}</p>
                    <p><span>Teacher:</span> {rec.teacherName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
