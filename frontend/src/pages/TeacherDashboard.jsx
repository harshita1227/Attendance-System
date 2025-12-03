// ----------------------------------------------
// TeacherDashboard.jsx (FULLY FIXED + UPDATED FLAG LOGIC + BATCH COUNTS + REGISTERED STUDENTS)
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

  // Additional stat: total students in the batch
  const [totalBatchStudents, setTotalBatchStudents] = useState(0);

  // Registered students list (full objects) for this batch
  const [registeredStudents, setRegisteredStudents] = useState([]);

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

  // Auto-refresh timetable every 20 seconds
  useEffect(() => {
    if (!teacher?._id) return;

    const id = setInterval(loadTeacherTimetable, 20000);
    return () => clearInterval(id);
  }, [teacher, loadTeacherTimetable]);

  // ----------------------------------------------
  // FETCH TOTAL REGISTERED STUDENTS FOR A BATCH (and full list)
  // ----------------------------------------------
  const fetchRegisteredStudents = async (batch) => {
    if (!batch) return;
    try {
      // fetch full student list for the batch (server route should return { students: [...] })
      const res = await fetch(
        `http://localhost:5000/api/students/batch/${encodeURIComponent(batch)}`
      );
      if (!res.ok) {
        console.warn("Registered students fetch failed");
        setRegisteredStudents([]);
        setTotalBatchStudents(0);
        return;
      }
      const data = await res.json();
      // data.students expected to be an array of student objects
      setRegisteredStudents(data.students || []);
      setTotalBatchStudents((data.students && data.students.length) || 0);
    } catch (err) {
      console.error("Batch students fetch error:", err);
      setRegisteredStudents([]);
      setTotalBatchStudents(0);
    }
  };

  // ----------------------------------------------
  // DETECT CURRENT CLASS
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

    // If we found an active class, fetch batch registered students for it
    if (active && active.batch) {
      fetchRegisteredStudents(active.batch);
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

      // Give backend time to initialize then fetch live students
      setTimeout(fetchLiveStudents, 800);

      // ensure registered list is up-to-date
      if (currentClass?.batch) fetchRegisteredStudents(currentClass.batch);
    } catch (err) {
      alert("Error starting live class");
    }
  };

  // ----------------------------------------------
  // FETCH LIVE STUDENTS (teacher view)
  // ----------------------------------------------
  const fetchLiveStudents = async () => {
    if (!teacher?._id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/live/${teacher._id}`);
      const data = await res.json();

      if (data.active) {
        setLiveStudents(data.students || []);
        setLiveSessionId(data.sessionId);
        // keep registered list in sync (if we have a current class)
        if (currentClass?.batch) fetchRegisteredStudents(currentClass.batch);
      } else {
        setLiveStudents([]);
      }
    } catch (err) {
      console.error("Error fetching live students:", err);
    }
  };

  // auto-refresh modal every 4 sec
  useEffect(() => {
    if (!showLiveModal) return;

    fetchLiveStudents();
    const id = setInterval(fetchLiveStudents, 4000);

    return () => clearInterval(id);
  }, [showLiveModal]);

  // ----------------------------------------------
  // FLAG STUDENT → Remove from live list & mark ABSENT
  // ----------------------------------------------
  const flagStudent = async (studentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/live/flag/${liveSessionId}/${studentId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      // Remove from live students in UI immediately
      setLiveStudents((prev) => prev.filter((s) => s.studentId !== studentId));

      // Optionally: remove from registered list's "present" mapping (we keep registered list intact;
      // present/absent is computed in modal using liveStudents vs registeredStudents)
      alert("🚩 Student marked absent & removed from live class");
    } catch (err) {
      alert("Error flagging student");
    }
  };

  // ----------------------------------------------
  // CREATE QR SESSION
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

  // compute derived numbers
  const joinedCount = liveStudents.length;
  const totalCount = totalBatchStudents || 0;
  const notJoined = Math.max(0, totalCount - joinedCount);
  const percentage = totalCount ? Math.round((joinedCount / totalCount) * 100) : 0;

  return (
    <div className="teacher-wrap">
      {/* WELCOME */}
      <div className="welcome">Welcome, {teacher?.name}</div>

      {/* TODAY’S TIMETABLE */}
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

      {/* LIVE CLASS */}
      <div className="card">
        <h3>🟢 Live Class</h3>

        {currentClass ? (
          <>
            <p>
              Current: <b>{currentClass.subject}</b> (
              {currentClass.batch.toUpperCase()})
            </p>

            {/* NEW STATS */}
            <p>👥 Total Students (registered): <b>{totalCount}</b></p>
            <p>🟢 Joined Live: <b>{joinedCount}</b></p>
            <p>❌ Not Joined: <b>{notJoined}</b></p>
            <p>📊 Join Percentage: <b>{percentage}%</b></p>

            <button className="start-live-btn" onClick={startLiveClass}>
              Start Live Class
            </button>

            {liveSessionId && (
              <>
                <button
                  onClick={() => {
                    // ensure we have fresh data before opening modal
                    fetchLiveStudents();
                    if (currentClass?.batch) fetchRegisteredStudents(currentClass.batch);
                    setShowLiveModal(true);
                  }}
                  className="view-live-btn"
                >
                  View Live Students
                </button>

                {/* CSV DOWNLOAD BUTTON */}
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

      {/* QR ATTENDANCE */}
      <div className="card">
        <h3>📷 QR Attendance</h3>

        <button onClick={createQR} disabled={creatingQR}>
          {creatingQR ? "Starting..." : "Start QR Session"}
        </button>

        {sessionCode && <p className="qr-code-text">Session Code: {sessionCode}</p>}
      </div>

      {/* LIVE STUDENTS MODAL */}
      {showLiveModal && (
        <LiveClassModal
          sessionId={liveSessionId}
          subject={currentClass?.subject}
          students={liveStudents}
          registeredStudents={registeredStudents}     // <-- full registered list
          registeredCount={totalBatchStudents}        // <-- count
          onClose={() => setShowLiveModal(false)}
          onFlag={flagStudent}
        />
      )}
    </div>
  );
}
