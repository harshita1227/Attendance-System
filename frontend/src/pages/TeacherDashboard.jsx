import React, { useEffect, useState } from "react";
import "./TeacherDashboard.css";

const AttendanceSession = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionSuccess, setSessionSuccess] = useState("");
  const [error, setError] = useState("");

  // NEW STATES  
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);

  // Load Teacher Data
  useEffect(() => {
    const storedTeacher = JSON.parse(localStorage.getItem("teacherData"));
    const token = localStorage.getItem("teacherToken");

    if (storedTeacher && token) {
      setTeacher(storedTeacher);
      setLoading(false);
    } else {
      setError("Please login again.");
    }
  }, []);

  // Create Attendance Session
  const handleCreateSession = async () => {
    if (!teacher?._id) {
      setError("Teacher information missing. Please login again.");
      return;
    }

    try {
      setCreatingSession(true);
      setError("");
      setSessionError("");
      setSessionSuccess("");

      const response = await fetch("http://localhost:5000/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacher._id }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to create session");

      setSessionCode(data.sessionCode);
      setSessionId(data.sessionId);
      setQrData(data.sessionCode);

      setSessionSuccess("New attendance session started!");
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setCreatingSession(false);
    }
  };

  // NEW: LOAD ATTENDANCE LIST  
  const loadAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/session/${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }
      setAttendanceList(data.attendees);
      setShowAttendanceModal(true);
    } catch (err) {
      alert("Error loading attendance");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("teacherData");
    localStorage.removeItem("teacherToken");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {teacher?.name} 👋
        </h2>
        <p className="text-gray-600">Email: {teacher?.email}</p>
      </div>

      {/* Attendance Card */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">

          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            ⏰ Attendance Session
          </h3>

          <button
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg mb-6 transition-colors"
            onClick={handleCreateSession}
            disabled={creatingSession}
          >
            {creatingSession ? "Starting..." : "▶ Start Session"}
          </button>

          {sessionSuccess && <div className="text-sm text-green-600 mb-4">{sessionSuccess}</div>}
          {sessionError && <div className="text-sm text-red-500 mb-4">{sessionError}</div>}

          {sessionCode ? (
            <>
              <div className="text-lg text-gray-600 mb-2">
                Active Session ID:{" "}
                <span className="font-semibold text-gray-800">{sessionId}</span>
              </div>

              <div className="text-2xl font-bold text-gray-800 mb-4">
                Session Code: {sessionCode}
              </div>

              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`}
                  alt="QR Code"
                  className="border-4 border-gray-200 rounded"
                />
              </div>

              {/* 🔥 NEW BUTTON */}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg mt-3"
                onClick={loadAttendance}
              >
                📋 View Attendance
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-500 mb-6">
              No active session yet. Start one to generate a code and QR.
            </div>
          )}

          <button
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg mt-6"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </div>
      </div>

      {/* -------------- ATTENDANCE MODAL -------------- */}
      {showAttendanceModal && (
        <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close" onClick={() => setShowAttendanceModal(false)}>
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">📋 Attendance List</h2>

            {attendanceList.length === 0 ? (
              <p className="text-gray-500">No students have marked attendance yet.</p>
            ) : (
              <ul className="attendance-list">
                {attendanceList.map((s, index) => (
                  <li key={index} className="attendance-item">
                    <span>👤 {s.name}</span>
                    <span>🎓 {s.rollNumber}</span>
                    <span>⏰ {new Date(s.time).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceSession;
