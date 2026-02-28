import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // BSCS
    durationYears: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Program", programSchema);