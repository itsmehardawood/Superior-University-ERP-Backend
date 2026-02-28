import express from "express";
import {
  markAttendance,
  getAttendanceByCourse,
  getAllAttendance,
} from "../controllers/attendance.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Teacher routes
router.post("/", protect, authorizeRoles("teacher"), markAttendance);
router.get("/course/:courseId", protect, authorizeRoles("teacher", "admin"), getAttendanceByCourse);

// Admin routes
router.get("/all", protect, authorizeRoles("admin"), getAllAttendance);

export default router;