// ----------------------------------------------
// StudentDashboard.jsx (FULLY OPTIMIZED)
// ----------------------------------------------
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ThreeBackground from "../components/ThreeBackground";
import AttendancePage from "../components/AttendancePage";
import ProfilePage from "../components/ProfilePage";
import QrScannerPage from "../components/QrScannerPage";

import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  // STATES
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isDark, setIsDark] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [liveInfo, setLiveInfo] = useState(null);
  const [joining, setJoining] = useState(false);

  // ----------------------------------------------
  // NORMALIZE BATCH (Fixes ALL “not your batch” errors)
  // ----------------------------------------------
  const normalize = (b) => (b ? b.trim().toLowerCase() : "");

  // ----------------------------------------------
  // LOAD STUDENT FROM STORAGE
  // ----------------------------------------------
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("studentData"));
    if (!data) {
      navigate("/login");
      return;
    }

    // Clean batch before storing
    data.batch = normalize(data.batch);

    setStudent(data);
    setLoading(false);
  }, [navigate]);

  // ----------------------------------------------
  // FETCH LIVE CLASS FOR THIS STUDENT
  // ----------------------------------------------
  useEffect(() => {
    if (!student?.batch) return;

    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 5000);

    return () => clearInterval(interval);
  }, [student]);

  // ----------------------------------------------
  // FETCH LIVE CLASS STATUS  
  // ----------------------------------------------
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/live/active?batch=${student.batch}`
      );

      const data = await res.json();

      if (!data.active) {
        setLiveInfo(null);
        return;
      }

      const normalizedBatch = normalize(data.batch);

      setLiveInfo({
        ...data,
        batch: normalizedBatch, // clean batch
      });
    } catch (err) {
      console.log("Error fetching live class:", err);
    }
  };

  // ----------------------------------------------
  // DARK MODE TOGGLE
  // ----------------------------------------------
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.body.className = !isDark ? "dark" : "light";
  };

  // ----------------------------------------------
  // LOGOUT
  // ----------------------------------------------
  const logout = () => {
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentToken");
    navigate("/login");
  };

  // ----------------------------------------------
  // JOIN LIVE CLASS — FIXED & OPTIMIZED
  // ----------------------------------------------
  const joinLiveClass = async () => {
    if (!liveInfo) return alert("No live class available!");

    const studentBatch = normalize(student.batch);
    const sessionBatch = normalize(liveInfo.batch);

    console.log("🔍 Comparing batches:", { studentBatch, sessionBatch });

    if (sessionBatch && studentBatch !== sessionBatch) {
      return alert("❌ This class is NOT for your batch!");
    }

    setJoining(true);

    try {
      const res = await fetch("http://localhost:5000/api/live/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: liveInfo.sessionId,
          studentId: student._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
      } else {
        alert("✅ Joined live class!");
      }
    } catch (err) {
      alert("⚠ Something went wrong!");
    }

    setJoining(false);
  };

  // ----------------------------------------------
  // UI
  // ----------------------------------------------
  if (loading) return <div>Loading...</div>;

  return (
    <div className={`dashboard-page ${isDark ? "dark" : "light"}`}>
      <ThreeBackground />

      {/* Theme Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        {isDark ? "☀️" : "🌙"}
      </div>

      {/* HEADER */}
      <header className="top-header">
        <div className="welcome-text">
          <h2>Welcome, {student?.name} 👋</h2>
          <p>Roll Number: {student?.rollNumber}</p>
          <p>Batch: {student?.batch.toUpperCase()}</p>
        </div>

        <button className="logout-btn-header" onClick={logout}>
          🚪 Logout
        </button>
      </header>

      {/* DASHBOARD GRID */}
      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Attendance */}
          <div className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>Attendance</h3>
            <p>View your attendance records.</p>
            <button className="card-button" onClick={() => setShowAttendance(true)}>
              View Attendance
            </button>
          </div>

          {/* Profile */}
          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile</h3>
            <p>View your personal details.</p>
            <button className="card-button" onClick={() => setShowProfile(true)}>
              View Profile
            </button>
          </div>

          {/* LIVE CLASS */}
          <div className="dashboard-card">
            <div className="card-icon">🟢</div>
            <h3>Join Live Class</h3>

            {!liveInfo ? (
              <p>No live class right now.</p>
            ) : (
              <>
                <p><b>Subject:</b> {liveInfo.subject}</p>
                <p><b>Teacher:</b> {liveInfo.teacherName}</p>
                <p><b>Batch:</b> {liveInfo.batch.toUpperCase()}</p>
                <p>
                  <b>Time:</b> {liveInfo.startTime} – {liveInfo.endTime}
                </p>

                <button
                  className="card-button"
                  disabled={joining}
                  onClick={joinLiveClass}
                >
                  {joining ? "Joining..." : "Join Class"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* QR SCANNER */}
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-icon">📷</div>
            <h3>Scan Attendance QR</h3>
            <p>Scan the teacher's QR code to mark attendance.</p>

            <button className="card-button" onClick={() => setShowScanner(true)}>
              Start Scanner
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAttendance && (
        <AttendancePage student={student} onClose={() => setShowAttendance(false)} />
      )}

      {showProfile && (
        <ProfilePage student={student} onClose={() => setShowProfile(false)} />
      )}

      {showScanner && (
        <QrScannerPage student={student} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
