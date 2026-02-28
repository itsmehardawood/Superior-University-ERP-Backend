import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "teacher"],
      default: "student",
    },

    // 🔹 Academic Info (for students only)
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },

    // 🔹 Profile Info (editable by user)
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String }, // store image URL
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
