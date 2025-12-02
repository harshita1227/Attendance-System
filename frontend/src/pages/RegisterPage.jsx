import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [userType, setUserType] = useState("student");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    year: "",
    branch: "",
    section: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.className = isDark ? "light" : "dark";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Year → Number mapping
  const yearNumberMap = {
    "1st Year": "1",
    "2nd Year": "2",
    "3rd Year": "3",
    "4th Year": "4",
  };

  // Generate final batch only ONE TIME (no duplication)
  const generateBatch = () => {
    if (!formData.year || !formData.branch || !formData.section) return "";
    return `BTech${yearNumberMap[formData.year]}_${formData.branch}_B${formData.section}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("⚠️ Passwords do not match!");
      return;
    }

    let finalBatch = "";
    if (userType === "student") {
      finalBatch = generateBatch();

      if (!formData.rollNumber.trim())
        return alert("⚠️ Enter Roll Number");
      if (!formData.year.trim()) return alert("⚠️ Select Year");
      if (!formData.branch.trim()) return alert("⚠️ Select Branch");
      if (!formData.section.trim()) return alert("⚠️ Select Section");
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType,

          // Student data (only ONE final batch — NO duplication)
          rollNumber: userType === "student" ? formData.rollNumber : "",
          year: userType === "student" ? formData.year : "",
          branch: userType === "student" ? formData.branch : "",
          batch: userType === "student" ? finalBatch : "",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration successful!");
        navigate("/login");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Register Error:", err);
      alert("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`register-page ${isDark ? "dark" : "light"}`}>
      <ThreeBackground />

      <div className="theme-toggle" onClick={toggleTheme}>
        {isDark ? "☀️" : "🌙"}
      </div>

      <div className="register-container">
        <h1 className="title">Create an Account</h1>

        {/* USER SWITCH */}
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

          <button
            className={userType === "admin" ? "active" : ""}
            onClick={() => setUserType("admin")}
          >
            Admin
          </button>
        </div>

        {/* FORM */}
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* STUDENT EXTRA FIELDS */}
          {userType === "student" && (
            <>
              <input
                type="text"
                name="rollNumber"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />

              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>

              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
              >
                <option value="">Select Section</option>
                <option value="1">B1</option>
                <option value="2">B2</option>
              </select>

              {/* AUTO PREVIEW */}
              <input
                type="text"
                readOnly
                value={generateBatch()}
                placeholder="Auto Batch (BTechX_CSE_BX)"
                style={{ background: "#ebebeb", fontWeight: "bold" }}
              />
            </>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="login-redirect-btn">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
