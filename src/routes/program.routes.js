import express from "express";
import {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "../controllers/program.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Only admin can create, update, and delete programs
router.post("/", protect, authorizeRoles("admin"), createProgram);
router.get("/", protect, authorizeRoles("admin", "teacher"), getAllPrograms);
router.get("/:id", protect, authorizeRoles("admin", "teacher"), getProgramById);
router.put("/:id", protect, authorizeRoles("admin"), updateProgram);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProgram);

export default router;
