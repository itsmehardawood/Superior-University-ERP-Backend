import express from "express";
import protect from "../middleware/auth.middleware.js";
import { loginUser, getProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;
