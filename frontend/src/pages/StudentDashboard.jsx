import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";

// Fixed correct component names
import AttendancePage from "../components/AttendancePage";
import ProfilePage from "../components/ProfilePage";
import QrScannerPage from "../components/QrScannerPage.jsx";

import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Modal states
  const [showAttendance, setShowAttendance] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Load student data from localStorage
  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("studentData"));
    if (!storedStudent) {
      navigate("/login");
      return;
    }
    setStudent(storedStudent);
    setLoading(false);
  }, [navigate]);

  // Dark mode toggle
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.body.className = isDark ? "light" : "dark";
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentToken");
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`dashboard-page ${isDark ? "dark" : "light"}`}>
      <ThreeBackground />

      {/* Dark Mode Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        {isDark ? "☀️" : "🌙"}
      </div>

      {/* Header */}
      <header className="dashboard-header">
        <h1>Welcome, {student?.name} 👋</h1>
        <p>Roll Number: {student?.rollNumber}</p>
      </header>

      {/* Main Dashboard Boxes */}
      <div className="dashboard-container">
        <div className="dashboard-grid">

          {/* Attendance Card */}
          <div className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>Attendance</h3>
            <p>View and mark your daily attendance records.</p>
            <button className="card-button" onClick={() => setShowAttendance(true)}>
              View Attendance
            </button>
          </div>

          {/* Profile Card */}
          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile</h3>
            <p>Check or update your personal details.</p>
            <button className="card-button" onClick={() => setShowProfile(true)}>
              View Profile
            </button>
          </div>

          {/* Join Session */}
          <div className="dashboard-card">
            <div className="card-icon">🔗</div>
            <h3>Join Session</h3>
            <p>Need to mark attendance? Jump straight to scanner.</p>
            <button className="card-button" onClick={() => setShowScanner(true)}>
              Join Session
            </button>
          </div>

        </div>

        {/* Full-width Scanner Card */}
        <div className="dashboard-grid">
          <div className="dashboard-card full-width">
            <div className="card-icon">📷</div>
            <h3>Scan Attendance QR</h3>
            <p>Scan your teacher’s session QR to mark attendance.</p>
            <button className="card-button" onClick={() => setShowScanner(true)}>
              Start Scanner
            </button>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={logout}>🚪 Logout</button>
      </div>

      {/* ========== MODALS ========== */}

      {showAttendance && (
        <AttendancePage 
          student={student} 
          onClose={() => setShowAttendance(false)} 
        />
      )}

      {showProfile && (
        <ProfilePage 
          student={student} 
          onClose={() => setShowProfile(false)} 
        />
      )}

      {showScanner && (
        <QrScannerPage 
          student={student} 
          onClose={() => setShowScanner(false)} 
        />
      )}

    </div>
  );
}
