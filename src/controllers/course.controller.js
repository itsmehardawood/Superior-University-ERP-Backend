import Course from "../models/course.model.js";
import Semester from "../models/semester.model.js";
import User from "../models/user.model.js";

// Admin creates a new course
export const createCourse = async (req, res) => {
  try {
    const { name, code, semester } = req.body;

    // Validate input
    if (!name || !code || !semester) {
      return res.status(400).json({
        success: false,
        message: "Name, code, and semester are required",
      });
    }

    // Verify semester exists
    const semesterExists = await Semester.findById(semester);
    if (!semesterExists) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    // Create course
    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      semester,
    });

    const populatedCourse = await Course.findById(course._id).populate({
      path: "semester",
      populate: { path: "program", select: "name durationYears" },
    });

    res.status(201).json({
      success: true,
      course: populatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all courses (with optional semester filter)
export const getAllCourses = async (req, res) => {
  try {
    const { semester } = req.query;

    const filter = semester ? { semester } : {};
    const courses = await Course.find(filter)
      .populate({
        path: "semester",
        populate: { path: "program", select: "name durationYears" },
      })
      .populate("teacher", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate({
        path: "semester",
        populate: { path: "program", select: "name durationYears" },
      })
      .populate("teacher", "fullName email");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, semester } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If semester is being updated, verify it exists
    if (semester) {
      const semesterExists = await Semester.findById(semester);
      if (!semesterExists) {
        return res.status(404).json({
          success: false,
          message: "Semester not found",
        });
      }
    }

    // If code is being updated, check if it already exists
    if (code && code.toUpperCase() !== course.code) {
      const existingCourse = await Course.findOne({ code: code.toUpperCase() });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: "Course code already exists",
        });
      }
    }

    // Update fields
    if (name) course.name = name;
    if (code) course.code = code.toUpperCase();
    if (semester) course.semester = semester;

    await course.save();

    const populatedCourse = await Course.findById(id).populate({
      path: "semester",
      populate: { path: "program", select: "name durationYears" },
    });

    res.status(200).json({
      success: true,
      course: populatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Assign teacher to course (Admin only)
export const assignTeacherToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if teacher exists and has teacher role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Assign teacher
    course.teacher = teacherId;
    await course.save();

    const populatedCourse = await Course.findById(id)
      .populate("teacher", "fullName email")
      .populate({
        path: "semester",
        populate: { path: "program", select: "name durationYears" },
      });

    res.status(200).json({
      success: true,
      message: "Teacher assigned successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get teacher's assigned courses
export const getMyCourses = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const courses = await Course.find({ teacher: teacherId })
      .populate({
        path: "semester",
        populate: { path: "program", select: "name durationYears" },
      })
      .populate("teacher", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get students enrolled in a course (based on semester)
export const getStudentsInCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const course = await Course.findById(id).populate("semester");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If user is teacher, verify they teach this course
    if (req.user.role === "teacher") {
      if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this course",
        });
      }
    }

    // Get all students in this semester
    const students = await User.find({
      role: "student",
      semester: course.semester._id,
    })
      .select("-password")
      .populate("program", "name durationYears")
      .populate("batch", "year")
      .populate("semester", "number")
      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      course: {
        name: course.name,
        code: course.code,
      },
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};