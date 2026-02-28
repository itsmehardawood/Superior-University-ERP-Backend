import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    number: {
      type: Number,
      required: true, // 1–8
    },
  },
  { timestamps: true }
);

export default mongoose.model("Semester", semesterSchema);