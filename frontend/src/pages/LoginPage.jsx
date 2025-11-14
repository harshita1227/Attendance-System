import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";
import { useTheme } from "../context/ThemeContext"; // ✅ Import global theme
import "./LoginPage.css";

const LoginPage = () => {
  const { theme, toggleTheme } = useTheme(); // ✅ Use global theme context
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rollNumber: "",
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
          rollNumber: userType === "student" ? formData.rollNumber : "",
          userType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message || "Login successful!"}`);

        const type =
          data.userType ||
          data.user?.userType ||
          data.student?.userType ||
          data.teacher?.userType ||
          userType;

        const userData = data.user || data.student || data.teacher || {};

        if (type === "student") {
          localStorage.setItem("studentData", JSON.stringify(userData));
          localStorage.setItem("studentToken", data.token || "dummy-token");
          navigate("/student-dashboard");
        } else if (type === "teacher") {
          localStorage.setItem("teacherData", JSON.stringify(userData));
          localStorage.setItem("teacherToken", data.token || "dummy-token");
          navigate("/teacher-dashboard");
        } else {
          localStorage.setItem("user", JSON.stringify(userData));
          navigate("/dashboard");
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
        {/* 🌙 Simple Theme Toggle Button */}
        <div className="toggle-container">
          <button onClick={toggleTheme} className="theme-toggle-icon">
            {theme === "light" ? "🌙" : "☀️"}
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
          {userType === "student" && (
            <input
              type="text"
              name="rollNumber"
              placeholder="Enter Roll Number"
              value={formData.rollNumber}
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
