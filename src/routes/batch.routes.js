import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
} from "../controllers/batch.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Only admin can create, update, and delete batches
router.post("/", protect, authorizeRoles("admin"), createBatch);
router.get("/", protect, authorizeRoles("admin", "teacher"), getAllBatches);
router.get("/:id", protect, authorizeRoles("admin", "teacher"), getBatchById);
router.put("/:id", protect, authorizeRoles("admin"), updateBatch);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBatch);

export default router;
