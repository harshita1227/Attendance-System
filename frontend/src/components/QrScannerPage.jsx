import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QrScannerPage.css";

export default function QrScannerPage({ student, onClose }) {
  const [sessionCode, setSessionCode] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const scannerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(startScanner, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // 🚀 Start QR Scanner
  const startScanner = async () => {
    try {
      const element = document.getElementById("qr-reader");
      if (!element) return;

      const qrScanner = new Html5Qrcode("qr-reader");
      scannerRef.current = qrScanner;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setScanStatus("No camera found. Enter code manually.");
        setIsLoading(false);
        return;
      }

      // Prefer BACK camera
      const backCam = cameras.find(cam =>
        cam.label.toLowerCase().includes("back")
      );

      const cameraId = backCam ? backCam.id : cameras[0].id;

      await qrScanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },

        // 🔥 SUCCESS
        (decodedText) => {
          setSessionCode(decodedText);
          setScanStatus("QR Detected!");
          qrScanner.stop();

          markAttendance(decodedText);
        },

        // Ignore scanning errors
        () => {}
      );

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setScanStatus("Camera error. Try again / Enter code manually.");
      setIsLoading(false);
    }
  };

  // 🎯 Mark Attendance Backend API
  const markAttendance = async (code) => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student._id,
          sessionCode: code,
          // BONUS (backend does not require this but useful)
          name: student.name,
          rollNumber: student.rollNumber
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Attendance Marked Successfully!");
        onClose();
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error, try again.");
    }
  };

  // Manual ENTRY of session code
  const handleManualSubmit = () => {
    if (!sessionCode.trim()) return alert("Enter session code");
    markAttendance(sessionCode);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>✖</button>

        <h2 className="modal-title">📷 Scan Attendance QR</h2>

        {/* QR Scanner Box */}
        <div id="qr-reader" className="qr-box"></div>

        {isLoading && <p className="loading">Starting camera…</p>}
        {scanStatus && <p className="success-text">{scanStatus}</p>}

        {/* Manual Code Input */}
        <div className="manual-input">
          <label>Enter Session Code (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
        </div>

        <button className="btn-primary btn-large" onClick={handleManualSubmit}>
          Mark Attendance
        </button>

      </div>
    </div>
  );
}
