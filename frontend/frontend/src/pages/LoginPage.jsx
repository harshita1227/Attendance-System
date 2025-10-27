import React, { useState } from "react";
import ThreeBackground from "../components/ThreeBackground";
import "./LoginPage.css";

const LoginPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({ name: "", email: "", roll: "" });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.className = isDark ? "light" : "dark";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login as:", userType, formData);
    alert(`Logged in as ${userType === "student" ? "Student" : "Teacher"}`);
  };

  return (
    <div className={`login-container ${isDark ? "dark" : "light"}`}>
      <ThreeBackground />

      <div className="login-box">
        <div className="toggle-container">
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <h2 className="login-title">Welcome Back!</h2>

        <div className="user-switch">
          <button
            className={userType === "student" ? "active" : ""}
            onClick={() => setUserType("student")}
          >
            Student
          </button>
          <button
            className={userType === "teacher" ? "active" : ""}
            onClick={() => setUserType("teacher")}
          >
            Teacher
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {userType === "teacher" && (
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          {userType === "student" && (
            <input
              type="text"
              name="roll"
              placeholder="Enter Roll Number"
              value={formData.roll}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
