import React, { useEffect, useState } from "react";

const AttendanceSession = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionCode, setSessionCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [error, setError] = useState("");

  // ✅ Fetch teacher data from localStorage or API
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const storedTeacher = JSON.parse(localStorage.getItem("teacherData"));
        const token = localStorage.getItem("teacherToken");

        // If data exists in localStorage
        if (storedTeacher && token) {
          setTeacher(storedTeacher);
          generateSessionCode(); // generate new code on mount
          setLoading(false);
        } else {
          // If no local data, redirect or show error
          setError("Please login again.");
        }
      } catch (err) {
        console.error("Error loading teacher data:", err);
        setError("Failed to load teacher data.");
      }
    };

    fetchTeacher();
  }, []);

  // ✅ Function to generate random session code and QR
  const generateSessionCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
    setQrData(code);
  };

  // ✅ Auto-refresh QR and code every 1 min
  useEffect(() => {
    const interval = setInterval(generateSessionCode, 60000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("teacherData");
    localStorage.removeItem("teacherToken");
    window.location.href = "/login"; // redirect to login
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading your dashboard...
      </div>
    );
  }

  // ✅ Error state
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
              Click below to generate a join code and QR.
            </p>

            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg mb-6 transition-colors"
              onClick={generateSessionCode}
            >
              🔄 Refresh Session
            </button>

            <div className="text-2xl font-bold text-gray-800 mb-4">
              Session Code: {sessionCode}
            </div>

            {/* ✅ QR Code (Dynamic from API) */}
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`}
                alt="QR Code"
                className="border-4 border-gray-200 rounded"
              />
            </div>

            <div className="text-sm text-blue-600 mb-6 flex items-center justify-center gap-2">
              <span role="img" aria-label="refresh">
                🔄
              </span>
              <span>Auto-refreshes every 1 minute for security.</span>
            </div>

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
