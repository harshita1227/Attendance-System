import React from "react";
import "./TimetableCard.css";

export default function TimetableCard({ timetable }) {
  if (!timetable || timetable.length === 0)
    return <p>No timetable found.</p>;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="timetable-box">
      <h3>Your Timetable</h3>

      {timetable.map((cls, index) => (
        <div key={index} className="timetable-item">
          <div><b>{cls.subject}</b> ({cls.batch})</div>
          <div>{days[cls.dayOfWeek]}</div>
          <div>{cls.startTime} - {cls.endTime}</div>
        </div>
      ))}
    </div>
  );
}
