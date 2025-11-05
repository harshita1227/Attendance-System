import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";
import "./LoginPage.css";

const LoginPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rollNumber: "",
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

  // ✅ Fixed handleSubmit
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
        // ✅ Detect userType safely (works for any backend structure)
        const type =
          data.userType ||
          data.user?.userType ||
          data.student?.userType ||
          data.teacher?.userType ||
          userType;

        // ✅ Extract user data safely
        const userData = data.user || data.student || data.teacher || {};

        // ✅ Save to localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        alert(`✅ ${data.message || "Login successful!"}`);

        // ✅ Redirect based on user type
        if (type === "student") {
          navigate("/student-dashboard");
        } else if (type === "teacher") {
          navigate("/teacher-dashboard");
        } else {
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
