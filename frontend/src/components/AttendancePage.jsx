import React, { useEffect, useState } from "react";


export default function AttendancePage({ student, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = student?._id;

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch(`http://localhost:5000/api/attendance/student/${studentId}`);
        const data = await res.json();

        if (res.ok) {
          setRecords(data.records || []);
        }
      } catch (err) {
        console.error("Error loading attendance", err);
      }
      setLoading(false);
    }

    loadAttendance();
  }, [studentId]);

  // Calculate Stats
  const totalPresent = records.filter(r => r.status === "Present").length;
  const totalDays = records.length;
  const percentage = totalDays === 0 ? 0 : Math.round((totalPresent / totalDays) * 100);

  return (
    <div className="modal-overlay">
      <div className="modal-content attendance-modal">
        <button className="modal-close" onClick={onClose}>✖</button>

        <div className="modal-header">
          <div className="modal-icon-large">📅</div>
          <h2>Your Attendance</h2>
          <p>Complete record of all your attendance sessions</p>
        </div>

        {loading ? (
          <p>Loading records...</p>
        ) : (
          <>
            {/* Attendance Stats */}
            <div className="attendance-stats">
              <div className="stat-card">
                <div className="stat-number">{totalDays}</div>
                <div className="stat-label">Total Sessions</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{totalPresent}</div>
                <div className="stat-label">Present</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">{percentage}%</div>
                <div className="stat-label">Attendance %</div>
              </div>
            </div>

            {/* Attendance List */}
            <div className="attendance-list">
              <h3 className="list-title">Attendance Records</h3>

              {records.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Records Found</h3>
                  <p>You haven't marked any attendance yet.</p>
                </div>
              ) : (
                <div className="records-container">
                  {records.map((record, index) => (
                    <div className="attendance-record" key={index}>
                      <div className="record-header">
                        <div className="record-number">#{index + 1}</div>
                        <div className="record-status">
                          {record.status}
                        </div>
                      </div>

                      <div className="record-body">
                        <div className="record-info">
                          <span className="record-label">Date:</span>
                          <span className="record-value">
                            {new Date(record.date).toLocaleString()}
                          </span>
                        </div>

                        <div className="record-info">
                          <span className="record-label">Session Code:</span>
                          <span className="record-value code">{record.sessionCode}</span>
                        </div>

                        <div className="record-info">
                          <span className="record-label">Teacher:</span>
                          <span className="record-value">{record.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
