import Batch from "../models/batch.model.js";
import Program from "../models/program.model.js";
import User from "../models/user.model.js";

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    const { program, year } = req.body;

    // Validate input
    if (!program || !year) {
      return res.status(400).json({
        success: false,
        message: "Program and year are required",
      });
    }

    // Verify program exists
    const programExists = await Program.findById(program);
    if (!programExists) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Check if batch already exists for this program and year
    const existingBatch = await Batch.findOne({ program, year });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch already exists for this program and year",
      });
    }

    // Create batch
    const batch = await Batch.create({
      program,
      year,
    });

    const populatedBatch = await Batch.findById(batch._id).populate(
      "program",
      "name durationYears"
    );

    res.status(201).json({
      success: true,
      batch: populatedBatch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all batches (with optional program filter)
export const getAllBatches = async (req, res) => {
  try {
    const { program } = req.query;

    const filter = program ? { program } : {};
    const batches = await Batch.find(filter)
      .populate("program", "name durationYears")
      .sort({ year: -1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single batch by ID
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id).populate(
      "program",
      "name durationYears"
    );
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { program, year } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // If program is being updated, verify it exists
    if (program) {
      const programExists = await Program.findById(program);
      if (!programExists) {
        return res.status(404).json({
          success: false,
          message: "Program not found",
        });
      }
    }

    // Check if updated combination already exists
    const updatedProgram = program || batch.program;
    const updatedYear = year || batch.year;

    if (program || year) {
      const existingBatch = await Batch.findOne({
        program: updatedProgram,
        year: updatedYear,
        _id: { $ne: id },
      });

      if (existingBatch) {
        return res.status(400).json({
          success: false,
          message: "Batch already exists for this program and year",
        });
      }
    }

    // Update fields
    if (program) batch.program = program;
    if (year) batch.year = year;

    await batch.save();

    const populatedBatch = await Batch.findById(id).populate(
      "program",
      "name durationYears"
    );

    res.status(200).json({
      success: true,
      batch: populatedBatch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete batch
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Check if batch has associated students
    const studentCount = await User.countDocuments({ batch: id, role: "student" });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch. It has ${studentCount} associated student(s)`,
      });
    }

    await Batch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
