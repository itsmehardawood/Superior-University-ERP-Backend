import express from "express";
import {
  registerUser,
  createStudent,
  getAllUsers,
  getAllStudents,
  getAllTeachers,
} from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/", protect, authorizeRoles("admin"), createStudent);

router.get(
  "/students",
  protect,
  authorizeRoles("admin", "teacher"),
  getAllStudents,
);

router.get(
  "/teachers",
  protect,
  authorizeRoles("admin"),
  getAllTeachers,
);

// Admin-only route
router.get("/all", protect, authorizeRoles("admin"), getAllUsers);

export default router;
