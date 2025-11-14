import React, { useEffect, useState } from "react";

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

  // ✅ Fetch teacher data from localStorage or API
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const storedTeacher = JSON.parse(localStorage.getItem("teacherData"));
        const token = localStorage.getItem("teacherToken");

        if (storedTeacher && token) {
          setTeacher(storedTeacher);
          setLoading(false);
        } else {
          setError("Please login again.");
        }
      } catch (err) {
        console.error("Error loading teacher data:", err);
        setError("Failed to load teacher data.");
      }
    };

    fetchTeacher();
  }, []);

  // ✅ Hit backend to create a new session and receive session code + id
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId: teacher._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create session");
      }

      const code = data.sessionCode || "";
      const id = data.sessionId || "";

      setSessionCode(code);
      setQrData(code);
      setSessionId(id);
      setSessionSuccess("New attendance session started!");
    } catch (err) {
      console.error("Create session error:", err);
      setSessionError(err.message || "Unable to create session. Try again.");
    } finally {
      setCreatingSession(false);
    }
  };

  const hasActiveSession = Boolean(sessionCode);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("teacherData");
    localStorage.removeItem("teacherToken");
    window.location.href = "/login"; // redirect to login
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* ✅ Dynamic Teacher Welcome */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {teacher?.name || "Teacher"}{" "}
          <span role="img" aria-label="waving hand">
            👋
          </span>
        </h2>
        <p className="text-gray-600">
          Email: {teacher?.email || "Not available"}
        </p>
      </div>

      {/* ✅ Attendance Session Box */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">
          <div className="w-full text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              <span role="img" aria-label="clock">
                ⏰
              </span>{" "}
              Attendance Session
            </h3>

            <p className="text-gray-600 mb-4">
              Click the button below to start a new attendance session.
            </p>

            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg mb-6 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleCreateSession}
              disabled={creatingSession}
            >
              {creatingSession ? "Starting..." : "▶ Start Session"}
            </button>

            {sessionSuccess && (
              <div className="text-sm text-green-600 mb-4">
                {sessionSuccess}
              </div>
            )}

            {sessionError && (
              <div className="text-sm text-red-500 mb-4">{sessionError}</div>
            )}

            {hasActiveSession ? (
              <>
                <div className="text-lg text-gray-600 mb-2">
                  Active Session ID:{" "}
                  <span className="font-semibold text-gray-800">
                    {sessionId}
                  </span>
                </div>

                <div className="text-2xl font-bold text-gray-800 mb-4">
                  Session Code: {sessionCode}
                </div>

                {/* ✅ Corrected QR Code */}
                <div className="flex justify-center mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`}
                    alt="QR Code"
                    className="border-4 border-gray-200 rounded"
                  />
                </div>

                <div className="text-sm text-blue-600 mb-6 flex items-center justify-center gap-2">
                  <span role="img" aria-label="info">
                    ℹ
                  </span>
                  <span>
                    Share the code or QR with students to mark attendance.
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 mb-6">
                No active session yet. Start one to generate a code and QR.
              </div>
            )}

            <button
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSession;
