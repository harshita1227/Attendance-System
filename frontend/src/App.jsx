import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard";
import AttendanceSession from "./pages/AttendenceSession.jsx";

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

        {/* Teacher Dashboard */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

         
        <Route path="/attendance-session/:classId" element={<AttendanceSession />} />

        
      </Routes>
    </BrowserRouter>
   
  );
}

export default App;