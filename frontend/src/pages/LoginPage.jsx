import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";
import { useTheme } from "../context/ThemeContext"; 
import "./LoginPage.css";

const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [userType, setUserType] = useState("student");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rollNumber: "",
    year: "",
    branch: "",
    batch: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,

          // only for students
          rollNumber: userType === "student" ? formData.rollNumber : "",
          userType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message || "Login successful!"}`);

        const type =
          data.userType ||
          data.user?.role ||
          data.student?.role ||
          data.teacher?.role ||
          userType;

        const userData = data.user || data.student || data.teacher || {};

        if (type === "student") {
          localStorage.setItem("studentData", JSON.stringify(userData));
          navigate("/student-dashboard");
        } 
        else if (type === "teacher") {
          localStorage.setItem("teacherData", JSON.stringify(userData));
          navigate("/teacher-dashboard");
        } 
        else if (type === "admin") {
          localStorage.setItem("adminData", JSON.stringify(userData));
          navigate("/admin-dashboard");
        }
      } else {
        alert(`❌ ${data.message || "Invalid credentials!"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => navigate("/register");

  return (
    <div className={`login-container ${theme}`}>
      <ThreeBackground />

      <div className="login-box">
        <div className="toggle-container">
          <button onClick={toggleTheme} className="theme-toggle-icon">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <h2 className="login-title">Welcome Back!</h2>

        {/* Buttons */}
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

        <form className="login-form" onSubmit={handleSubmit}>
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
                
              </select>

              <input
                type="text"
                name="batch"
                placeholder="Batch (e.g., B1)"
                value={formData.batch}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="register-link">
          <p>
            Not registered yet?{" "}
            <button onClick={goToRegister} className="register-btn">
              Register now!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
