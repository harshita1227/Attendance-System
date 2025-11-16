import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QrScannerPage.css";

export default function QrScannerPage({ student, onClose }) {
  const [sessionCode, setSessionCode] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    // Function to remove duplicate videos
    const removeDuplicateVideos = () => {
      const qrReader = document.getElementById("qr-reader");
      if (qrReader) {
        const videos = qrReader.querySelectorAll("video");
        if (videos.length > 1) {
          // Keep only the first video, remove all others
          for (let i = 1; i < videos.length; i++) {
            videos[i].remove();
          }
        }
      }
    };

    // Clean up duplicate videos multiple times
    const cleanupTimers = [
      setTimeout(removeDuplicateVideos, 300),
      setTimeout(removeDuplicateVideos, 600),
      setTimeout(removeDuplicateVideos, 1000),
      setTimeout(removeDuplicateVideos, 1500)
    ];

    // MutationObserver to watch for new video elements
    const observer = new MutationObserver(() => {
      removeDuplicateVideos();
    });

    const qrReader = document.getElementById("qr-reader");
    if (qrReader) {
      observer.observe(qrReader, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      cleanupTimers.forEach(t => clearTimeout(t));
      observer.disconnect();
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.error("QR reader element not found");
        setScanStatus("Scanner element not found. Please refresh.");
        setIsLoading(false);
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Get available cameras and use the first one (back camera preferred, then front)
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Prefer back camera, fallback to first available
        const backCamera = devices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText) => {
            setSessionCode(decodedText);
            setScanStatus("QR detected successfully!");
            html5QrCode.stop();
          },
          (errorMessage) => {
            // Ignore scanning errors
          }
        );
        
        // Aggressively remove duplicate videos multiple times
        const removeDupes = () => {
          const qrReader = document.getElementById("qr-reader");
          if (qrReader) {
            const videos = qrReader.querySelectorAll("video");
            if (videos.length > 1) {
              // Remove all except first
              for (let i = videos.length - 1; i > 0; i--) {
                videos[i].remove();
              }
            }
            // Also remove duplicate containers
            const dashboards = qrReader.querySelectorAll("#qr-reader__dashboard");
            if (dashboards.length > 1) {
              for (let i = dashboards.length - 1; i > 0; i--) {
                dashboards[i].remove();
              }
            }
          }
        };
        
        // Remove duplicates at multiple intervals
        setTimeout(removeDupes, 200);
        setTimeout(removeDupes, 500);
        setTimeout(removeDupes, 800);
        setTimeout(removeDupes, 1200);
        
        setIsLoading(false);
      } else {
        setScanStatus("No camera found. Please enter session code manually.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      setScanStatus("Camera access denied or not available. Please enter session code manually.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionCode.trim()) {
      return alert("Please enter a session code");
    }

    alert("Attendance Marked Successfully!");
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}>✖</button>

        <h2 className="modal-title">📷 Scan Attendance QR</h2>

        <div id="qr-reader" className="qr-box"></div>

        {isLoading && <p style={{ color: '#667eea', textAlign: 'center' }}>Starting camera...</p>}
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