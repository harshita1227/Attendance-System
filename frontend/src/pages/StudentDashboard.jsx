import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Check student info or token from localStorage
    const storedStudent = JSON.parse(localStorage.getItem("studentData"));
    const token = localStorage.getItem("studentToken");

    if (storedStudent && token) {
      setStudent(storedStudent);
      setLoading(false);
    } else {
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  }, [navigate]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.className = isDark ? "light" : "dark";
  };

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    localStorage.removeItem("studentToken");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <ThreeBackground />
        <div className="loading-text">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`dashboard-page ${isDark ? "dark" : "light"}`}>
      <ThreeBackground />

      <div className="theme-toggle" onClick={toggleTheme}>
        {isDark ? "☀️" : "🌙"}
      </div>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome, {student?.name || "Student"} 👋</h1>
          <p>Roll Number: {student?.rollNumber || "N/A"}</p>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-card">
            <h2>📅 Attendance</h2>
            <p>View and mark your daily attendance records.</p>
            <button className="btn">View Attendance</button>
          </div>

          <div className="dashboard-card">
            <h2>📚 Subjects</h2>
            <p>Access your enrolled subjects and materials.</p>
            <button className="btn">View Subjects</button>
          </div>

          <div className="dashboard-card">
            <h2>👤 Profile</h2>
            <p>Check or update your personal details.</p>
            <button className="btn">View Profile</button>
          </div>
        </div>

        <footer className="dashboard-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard;
