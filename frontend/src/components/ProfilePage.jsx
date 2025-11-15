import React, { useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage({ student, onClose }) {
  const [form, setForm] = useState({
    name: student?.name || "",
    email: student?.email || "",
    rollNumber: student?.rollNumber || "",
    branch: student?.branch || "",
    year: student?.year || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    // save updated profile to localStorage
    localStorage.setItem("studentData", JSON.stringify(form));

    alert("Profile updated successfully!");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal">

        <button className="modal-close" onClick={onClose}>✖</button>

        <h2 className="modal-title">👤 Student Profile</h2>

        <form onSubmit={handleUpdate} className="modal-form">

          <label>Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Roll Number</label>
          <input
            type="text"
            name="rollNumber"
            className="form-input"
            value={form.rollNumber}
            onChange={handleChange}
            required
            disabled
          />

          <label>Branch</label>
          <input
            type="text"
            name="branch"
            className="form-input"
            value={form.branch}
            onChange={handleChange}
          />

          <label>Year</label>
          <input
            type="text"
            name="year"
            className="form-input"
            value={form.year}
            onChange={handleChange}
          />

          <button type="submit" className="btn-primary btn-large">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
