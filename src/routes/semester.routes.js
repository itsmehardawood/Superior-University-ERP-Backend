import express from "express";
import {
  createSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
} from "../controllers/semester.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Only admin can create, update, and delete semesters
router.post("/", protect, authorizeRoles("admin"), createSemester);
router.get("/", protect, authorizeRoles("admin", "teacher"), getAllSemesters);
router.get("/:id", protect, authorizeRoles("admin", "teacher"), getSemesterById);
router.put("/:id", protect, authorizeRoles("admin"), updateSemester);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSemester);

export default router;
