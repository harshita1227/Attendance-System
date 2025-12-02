import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ➤ Supports student / teacher / admin
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },

    /* -----------------------------------
       STUDENT FIELDS
    ----------------------------------- */

    rollNumber: {
      type: String,
      default: "",
    },

    year: {
      type: String,  // Example: "4th Year"
      default: "",
    },

    branch: {
      type: String,  // Example: "CSE"
      default: "",
    },

    batch: {
      type: String,  // Example: "BTech4_CSE_B1"
      default: "",
    },

    /* -----------------------------------
       FLAGGING / BLOCK SYSTEM
    ----------------------------------- */

    flagCount: {
      type: Number,
      default: 0,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
