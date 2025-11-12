// import React from "react";
// import "./AttendanceSession.css";

// const AttendanceSession = () => {
//   const sessionCode = "261608";
//   const qrData = sessionCode; // for QR code generation

//   return (
//     <div>
//       {/* User welcome section */}
//       <div className="user-welcome">
//         <h2>
//           Welcome, neeraj sir <span role="img" aria-label="waving hand">👋</span>
//         </h2>
//         <p>Email: neerajbisht@gmail.com</p>
//       </div>

//       {/* Attendance session box */}
//       <div className="attendance-session">
//         <div className="session-content">
//           {/* QR Code left */}
//           <div className="qr-code">
//             <img
//               src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=100x100`}
//               alt="QR Code"
//               width="100"
//               height="100"
//             />
//           </div>

//           {/* Session info right */}
//           <div className="session-info">
//             <h3>
//               <span role="img" aria-label="clock">⏰</span> Attendance Session
//             </h3>
//             <p className="instruction">Click below to generate a join code and QR.</p>

//             <button className="refresh-btn" type="button">
//               🔄 Refresh Session
//             </button>

//             <div className="session-code">
//               Session Code: {sessionCode}
//             </div>

//             <div className="auto-refresh">
//               <span role="img" aria-label="refresh">🔄</span> Auto-refreshes every 1 minute for security.
//             </div>

//             <button className="logout-btn" type="button">
//               📜 Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AttendanceSession;


import React from "react";

const AttendanceSession = () => {
  const sessionCode = "261608";
  const qrData = sessionCode;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* User welcome section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, neeraj sir <span role="img" aria-label="waving hand">👋</span>
        </h2>
        <p className="text-gray-600">Email: neerajbisht@gmail.com</p>
      </div>

      {/* Attendance session box */}
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">
          {/* Session info */}
          <div className="w-full text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              <span role="img" aria-label="clock">⏰</span> Attendance Session
            </h3>
            <p className="text-gray-600 mb-4">
              Click below to generate a join code and QR.
            </p>

            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg mb-6 transition-colors">
              🔄 Refresh Session
            </button>

            <div className="text-2xl font-bold text-gray-800 mb-4">
              Session Code: {sessionCode}
            </div>

            {/* QR Code below session code */}
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`}
                alt="QR Code"
                className="border-4 border-gray-200 rounded"
              />
            </div>

            <div className="text-sm text-blue-600 mb-6 flex items-center justify-center gap-2">
              <span role="img" aria-label="refresh">🔄</span>
              <span>Auto-refreshes every 1 minute for security.</span>
            </div>

            <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              📜 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSession;
