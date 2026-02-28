import Program from "../models/program.model.js";
import Semester from "../models/semester.model.js";

// Create a new program
export const createProgram = async (req, res) => {
  try {
    const { name, durationYears } = req.body;

    // Validate input
    if (!name || !durationYears) {
      return res.status(400).json({
        success: false,
        message: "Name and duration are required",
      });
    }

    // Check if program already exists
    const existingProgram = await Program.findOne({ name });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: "Program already exists",
      });
    }

    // Create program
    const program = await Program.create({
      name,
      durationYears,
    });

    res.status(201).json({
      success: true,
      program,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      programs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single program by ID
export const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.status(200).json({
      success: true,
      program,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update program
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, durationYears } = req.body;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== program.name) {
      const existingProgram = await Program.findOne({ name });
      if (existingProgram) {
        return res.status(400).json({
          success: false,
          message: "Program name already exists",
        });
      }
    }

    // Update fields
    if (name) program.name = name;
    if (durationYears) program.durationYears = durationYears;

    await program.save();

    res.status(200).json({
      success: true,
      program,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete program
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Check if program has associated semesters
    const semesterCount = await Semester.countDocuments({ program: id });
    if (semesterCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete program. It has ${semesterCount} associated semester(s)`,
      });
    }

    await Program.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
