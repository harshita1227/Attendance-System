import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AttendanceSession = () => {
  const { classId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTeacher = JSON.parse(localStorage.getItem("teacherData"));
    const token = localStorage.getItem("teacherToken");

    if (storedTeacher && token) {
      setTeacher(storedTeacher);
      createSession(storedTeacher._id);
      setLoading(false);
    } else {
      navigate("/login");
    }
  }, [navigate, classId]);

  // ✅ Create Session API
  const createSession = async (teacherId) => {
    try {
      const res = await fetch("http://localhost:5000/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, classId }),
      });

      const data = await res.json();
      setSessionCode(data.sessionCode);
      setSessionId(data.sessionId);
      setQrData(data.sessionCode);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    if (teacher && classId) {
      const interval = setInterval(() => {
        createSession(teacher._id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [teacher, classId]);

  if (loading) return <div>Loading session...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-center">
      <h2 className="text-3xl font-bold mb-2">
        Welcome, {teacher?.name || "Teacher"} 👋
      </h2>
      <p className="text-gray-600 mb-6">
        Attendance for class: <b>{classId}</b>
      </p>

      <div className="max-w-md mx-auto bg-white shadow-lg p-8 rounded-lg">
        <h3 className="text-2xl font-semibold mb-3">🕒 Attendance Session</h3>
        <p className="text-gray-500 mb-4">
          QR and session code auto-refresh every 30 seconds.
        </p>

        <div className="text-2xl font-bold mb-4">Session Code: {sessionCode}</div>

        <div className="flex justify-center mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`}
            alt="QR Code"
            className="border-4 border-gray-200 rounded"
          />
        </div>

        <button
          onClick={() => navigate("/teacher-dashboard")}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AttendanceSession;
