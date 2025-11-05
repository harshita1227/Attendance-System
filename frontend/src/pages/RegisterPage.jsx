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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("⚠️ Passwords do not match!");
      return;
    }

    // Validation for roll number (only for students)
    if (userType === "student" && !formData.rollNumber.trim()) {
      alert("⚠️ Please enter your roll number!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          rollNumber: userType === "student" ? formData.rollNumber : "",
          password: formData.password,
          userType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message || "Registration successful!"}`);
        navigate("/login");
      } else {
        alert(`❌ ${data.message || "Registration failed!"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Server error. Please try again later.");
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

          {userType === "student" && (
            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
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
          <button
            onClick={() => navigate("/login")}
            className="login-redirect-btn"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
