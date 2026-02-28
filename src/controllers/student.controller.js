import User from "../models/user.model.js";
import Attendance from "../models/attendance.model.js";
import Course from "../models/course.model.js";

// Student fetches their profile + attendance
export const getMyProfile = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1️⃣ Fetch student info
    const student = await User.findById(studentId).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 2️⃣ Fetch attendance records
    const attendanceRecords = await Attendance.find({ studentId })
      .populate("courseId", "name code") // get course name & code
      .populate("markedBy", "fullName") // get teacher name
      .sort({ date: -1 }); // latest first

    res.status(200).json({
      success: true,
      student,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { phone, address, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only update provided fields
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    const { password, ...userData } = user.toObject();

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};