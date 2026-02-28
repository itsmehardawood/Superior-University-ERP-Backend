import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    year: { type: Number, required: true }, // 2022
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);