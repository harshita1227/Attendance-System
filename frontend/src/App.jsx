import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect / to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Registration page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Dashboard */}
        <Route path="/student-dashboard" element={<StudentDashboard/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
