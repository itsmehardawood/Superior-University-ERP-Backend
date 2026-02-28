import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignTeacherToCourse,
  getMyCourses,
  getStudentsInCourse,
} from "../controllers/course.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Teacher routes
router.get("/my-courses", protect, authorizeRoles("teacher"), getMyCourses);
router.get("/:id/students", protect, authorizeRoles("admin", "teacher"), getStudentsInCourse);

// Admin & Teacher routes
router.get("/", protect, authorizeRoles("admin", "teacher"), getAllCourses);
router.get("/:id", protect, authorizeRoles("admin", "teacher"), getCourseById);

// Admin only routes
router.post("/", protect, authorizeRoles("admin"), createCourse);
router.put("/:id", protect, authorizeRoles("admin"), updateCourse);
router.put("/:id/assign-teacher", protect, authorizeRoles("admin"), assignTeacherToCourse);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCourse);

export default router;
