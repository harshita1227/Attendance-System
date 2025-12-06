// ----------------------------------------------
// TeacherDashboard.jsx (UPDATED FOR REAL PRESENT/ABSENT)
// ----------------------------------------------

import React, { useEffect, useState, useCallback } from "react";
import "./TeacherDashboard.css";
import LiveClassModal from "../components/LiveClassModal";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const [todaySlots, setTodaySlots] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);

  // Live class states
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [liveStudents, setLiveStudents] = useState([]);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Batch stats
  const [totalBatchStudents, setTotalBatchStudents] = useState(0);
  const [registeredStudents, setRegisteredStudents] = useState([]); // <--- NEW

  // QR
  const [sessionCode, setSessionCode] = useState("");
  const [creatingQR, setCreatingQR] = useState(false);

  // normalize batch string
  const normalize = (b) => (b ? b.trim().toLowerCase() : "");

  // ----------------------------------------------
  // LOAD TEACHER DATA
  // ----------------------------------------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("teacherData"));
    if (!stored) return;

    stored.batch = normalize(stored.batch);
    setTeacher(stored);
    setLoading(false);
  }, []);

  // ----------------------------------------------
  // FETCH TODAY'S TIMETABLE
  // ----------------------------------------------
  const loadTeacherTimetable = useCallback(async () => {
    if (!teacher?._id) return;

    const day = new Date().toLocaleString("en-US", { weekday: "long" });

    try {
      const res = await fetch(
        `http://localhost:5000/api/timetable/teacher/${teacher._id}`
      );

      const slots = await res.json();

      const today = slots.filter((s) => s.day === day);
      today.forEach((s) => (s.batch = normalize(s.batch)));

      setTodaySlots(today);
      detectCurrentClass(today);
    } catch (err) {
      console.error("Error loading timetable:", err);
    }
  }, [teacher]);

  useEffect(() => {
    loadTeacherTimetable();
  }, [loadTeacherTimetable]);

  useEffect(() => {
    if (!teacher?._id) return;

    const id = setInterval(loadTeacherTimetable, 20000);
    return () => clearInterval(id);
  }, [teacher, loadTeacherTimetable]);

  // ----------------------------------------------
  // FETCH REGISTERED STUDENTS LIST FOR REAL ABSENT
  // ----------------------------------------------
  const fetchRegisteredStudents = async (batch) => {
    if (!batch) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/batch/students/${encodeURIComponent(batch)}`
      );

      if (!res.ok) {
        console.log("Registered student list fetch failed");
        return;
      }

      const data = await res.json();
      setRegisteredStudents(data.students || []);
      setTotalBatchStudents(data.students?.length || 0);
    } catch (err) {
      console.log("Registered list error:", err);
    }
  };

  // ----------------------------------------------
  // DETECT CURRENT CLASS → LOAD FULL STUDENT LIST
  // ----------------------------------------------
  const detectCurrentClass = (slots) => {
    const now = new Date();

    const active = slots.find((slot) => {
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const [eh, em] = slot.endTime.split(":").map(Number);

      const start = new Date();
      start.setHours(sh, sm, 0, 0);

      const end = new Date();
      end.setHours(eh, em, 0, 0);

      return now >= start && now <= end;
    });

    setCurrentClass(active || null);

    if (active) {
      fetchRegisteredStudents(active.batch); // <--- NEW
    } else {
      setRegisteredStudents([]);
      setTotalBatchStudents(0);
    }
  };

  // ----------------------------------------------
  // START LIVE CLASS
  // ----------------------------------------------
  const startLiveClass = async () => {
    if (!currentClass) return alert("❌ No class is currently running!");

    try {
      const res = await fetch("http://localhost:5000/api/live/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher._id,
          subject: currentClass.subject,
          batch: normalize(currentClass.batch),
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      setLiveSessionId(data.sessionId);
      setShowLiveModal(true);

      setTimeout(fetchLiveStudents, 800);

    } catch (err) {
      alert("Error starting live class");
    }
  };

  // ----------------------------------------------
  // FETCH LIVE STUDENTS
  // ----------------------------------------------
  const fetchLiveStudents = async () => {
    if (!teacher?._id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/live/${teacher._id}`);
      const data = await res.json();

      if (data.active) {
        setLiveStudents(data.students || []);
        setLiveSessionId(data.sessionId);
      } else {
        setLiveStudents([]);
      }
    } catch (err) {
      console.error("Error fetching live students:", err);
    }
  };

  useEffect(() => {
    if (!showLiveModal) return;

    fetchLiveStudents();
    const id = setInterval(fetchLiveStudents, 4000);

    return () => clearInterval(id);
  }, [showLiveModal]);

  // ----------------------------------------------
  // FLAG STUDENT
  // ----------------------------------------------
  const flagStudent = async (studentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/live/flag/${liveSessionId}/${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      setLiveStudents((prev) =>
        prev.filter((s) => s.studentId !== studentId)
      );

      alert("🚩 Student flagged & marked absent");
    } catch (err) {
      alert("Error flagging student");
    }
  };

  // ----------------------------------------------
  // CREATE QR
  // ----------------------------------------------
  const createQR = async () => {
    setCreatingQR(true);

    try {
      const res = await fetch("http://localhost:5000/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacher._id }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      setSessionCode(data.sessionCode);
    } catch (err) {
      alert("Error creating QR session");
    } finally {
      setCreatingQR(false);
    }
  };

  // ----------------------------------------------
  // UI
  // ----------------------------------------------
  if (loading) return <div>Loading...</div>;

  const joinedCount = liveStudents.length;
  const totalCount = totalBatchStudents;
  const notJoined = totalCount - joinedCount;
  const percentage = totalCount
    ? Math.round((joinedCount / totalCount) * 100)
    : 0;

  return (
    <div className="teacher-wrap">
      <div className="welcome">Welcome, {teacher?.name}</div>

      {/* Timetable */}
      <div className="card">
        <h3>📅 Today’s Timetable</h3>

        {todaySlots.length === 0 ? (
          <p>No class today.</p>
        ) : (
          todaySlots.map((s) => (
            <div
              key={s._id}
              className={`slot-item ${
                currentClass?._id === s._id ? "active-class" : ""
              }`}
            >
              <b>{s.subject}</b> — {s.batch.toUpperCase()}
              <br />
              {s.startTime} – {s.endTime}
            </div>
          ))
        )}
      </div>

      {/* Live class */}
      <div className="card">
        <h3>🟢 Live Class</h3>

        {currentClass ? (
          <>
            <p>
              Current: <b>{currentClass.subject}</b> (
              {currentClass.batch.toUpperCase()})
            </p>

            <p>👥 Total Registered: <b>{totalCount}</b></p>
            <p>🟢 Joined Live: <b>{joinedCount}</b></p>
            <p>❌ Not Joined: <b>{notJoined}</b></p>
            <p>📊 Attendance: <b>{percentage}%</b></p>

            <button className="start-live-btn" onClick={startLiveClass}>
              Start Live Class
            </button>

            {liveSessionId && (
              <>
                <button
                  onClick={() => setShowLiveModal(true)}
                  className="view-live-btn"
                >
                  View Live Students
                </button>

                <button
                  className="download-btn"
                  onClick={() =>
                    window.open(
                      `http://localhost:5000/api/attendance/session/${liveSessionId}/csv`,
                      "_blank"
                    )
                  }
                >
                  ⬇️ Download Attendance CSV
                </button>
              </>
            )}
          </>
        ) : (
          <p>❌ No class running right now</p>
        )}
      </div>

      {/* QR */}
      <div className="card">
        <h3>📷 QR Attendance</h3>

        <button onClick={createQR} disabled={creatingQR}>
          {creatingQR ? "Starting..." : "Start QR Session"}
        </button>

        {sessionCode && <p>Session Code: {sessionCode}</p>}
      </div>

      {/* Modal */}
      {showLiveModal && (
        <LiveClassModal
          sessionId={liveSessionId}
          subject={currentClass?.subject}
          students={liveStudents}
          registeredStudents={registeredStudents}   // <--- FULL LIST
          registeredCount={totalCount}             // <--- COUNT
          onClose={() => setShowLiveModal(false)}
          onFlag={flagStudent}
        />
      )}
    </div>
  );
}
