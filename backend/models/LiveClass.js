import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    // 🔥 Only batch is needed (year/branch already inside batch)
    batch: {
      type: String,
      required: true,   // Example: "BTech4_CSE_B1"
    },

    // Indicates whether class is active right now
    isActive: {
      type: Boolean,
      default: true,
    },

    /* -------------------------------------------------
       Students joined live class
    --------------------------------------------------- */
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        name: { type: String, required: true },
        rollNumber: { type: String, required: true },

        loginTime: {
          type: Date,
          default: Date.now,
        },

        // Teacher flagging
        flagged: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// ⚡ Prevent same student joining twice (per teacher active session)
liveClassSchema.index(
  {
    teacherId: 1,
    "students.studentId": 1,
  },
  { unique: false }
);

export default mongoose.model("LiveClass", liveClassSchema);
