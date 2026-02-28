import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/student.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/authorize.middleware.js";

const router = express.Router();

// Only student can view their profile + attendance
router.get("/profile", protect, authorizeRoles("student"), getMyProfile);


router.put(
  "/profile",
  protect,
  authorizeRoles("student", "teacher", "admin"),
  updateMyProfile
);


export default router;