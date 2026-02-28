import Semester from "../models/semester.model.js";
import Program from "../models/program.model.js";
import Course from "../models/course.model.js";

// Create a new semester
export const createSemester = async (req, res) => {
  try {
    const { program, number } = req.body;

    // Validate input
    if (!program || !number) {
      return res.status(400).json({
        success: false,
        message: "Program and semester number are required",
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

    // Check if semester already exists for this program
    const existingSemester = await Semester.findOne({ program, number });
    if (existingSemester) {
      return res.status(400).json({
        success: false,
        message: "Semester already exists for this program",
      });
    }

    // Create semester
    const semester = await Semester.create({
      program,
      number,
    });

    const populatedSemester = await Semester.findById(semester._id).populate(
      "program",
      "name durationYears"
    );

    res.status(201).json({
      success: true,
      semester: populatedSemester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all semesters (with optional program filter)
export const getAllSemesters = async (req, res) => {
  try {
    const { program } = req.query;

    const filter = program ? { program } : {};
    const semesters = await Semester.find(filter)
      .populate("program", "name durationYears")
      .sort({ program: 1, number: 1 });

    res.status(200).json({
      success: true,
      count: semesters.length,
      semesters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single semester by ID
export const getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id).populate(
      "program",
      "name durationYears"
    );
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    res.status(200).json({
      success: true,
      semester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update semester
export const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { program, number } = req.body;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
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
    const updatedProgram = program || semester.program;
    const updatedNumber = number || semester.number;

    if (program || number) {
      const existingSemester = await Semester.findOne({
        program: updatedProgram,
        number: updatedNumber,
        _id: { $ne: id },
      });

      if (existingSemester) {
        return res.status(400).json({
          success: false,
          message: "Semester already exists for this program",
        });
      }
    }

    // Update fields
    if (program) semester.program = program;
    if (number) semester.number = number;

    await semester.save();

    const populatedSemester = await Semester.findById(id).populate(
      "program",
      "name durationYears"
    );

    res.status(200).json({
      success: true,
      semester: populatedSemester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete semester
export const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    // Check if semester has associated courses
    const courseCount = await Course.countDocuments({ semester: id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete semester. It has ${courseCount} associated course(s)`,
      });
    }

    await Semester.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Semester deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
