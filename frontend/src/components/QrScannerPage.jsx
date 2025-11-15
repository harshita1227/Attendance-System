import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./QrScannerPage.css";

export default function QrScannerPage({ student, onClose }) {
  const [sessionCode, setSessionCode] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 220, height: 220 } },
      false
    );

    scanner.render(
      (decoded) => {
        setSessionCode(decoded);
        setScanStatus("QR detected successfully!");
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const handleSubmit = async () => {
    if (!sessionCode.trim()) {
      return alert("Please enter a session code");
    }

    alert("Attendance Marked Successfully!");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content qr-modal">

        <button className="modal-close" onClick={onClose}>✖</button>

        <h2 className="modal-title">📷 Scan Attendance QR</h2>

        <div id="qr-reader" className="qr-box"></div>

        {scanStatus && <p className="success-text">{scanStatus}</p>}

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

        <button className="btn-primary btn-large" onClick={handleSubmit}>
          Mark Attendance
        </button>
      </div>
    </div>
  );
}
