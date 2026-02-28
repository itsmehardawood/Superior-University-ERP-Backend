import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

export const markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    if (!studentId || !courseId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Normalize date (remove time part)
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // 1️⃣ Get student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.semester) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to any semester",
      });
    }

    // 2️⃣ Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 3️⃣ Check teacher is assigned to this course
    if (!course.teacher || course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this course",
      });
    }

    // 4️⃣ Check course belongs to student's semester
    if (course.semester.toString() !== student.semester.toString()) {
      return res.status(400).json({
        success: false,
        message: "Course does not belong to student's semester",
      });
    }

    // 5️⃣ Prevent duplicate attendance
    const existingAttendance = await Attendance.findOne({
      studentId,
      courseId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    // 6️⃣ Create attendance
    const attendance = await Attendance.create({
      studentId,
      courseId,
      semester: student.semester,
      date: attendanceDate,
      status: status.toLowerCase(),
      markedBy: req.user._id,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("studentId", "fullName email")
      .populate("courseId", "name code")
      .populate("markedBy", "fullName");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get attendance records by course
export const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, studentId } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
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

    // Build filter
    const filter = { courseId };
    
    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      filter.date = attendanceDate;
    }
    
    if (studentId) {
      filter.studentId = studentId;
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("studentId", "fullName email")
      .populate("courseId", "name code")
      .populate("markedBy", "fullName")
      .sort({ date: -1, studentId: 1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      course: {
        name: course.name,
        code: course.code,
      },
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all attendance records (Admin only)
export const getAllAttendance = async (req, res) => {
  try {
    const { courseId, studentId, date } = req.query;

    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      filter.date = attendanceDate;
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("studentId", "fullName email")
      .populate("courseId", "name code")
      .populate("markedBy", "fullName")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};