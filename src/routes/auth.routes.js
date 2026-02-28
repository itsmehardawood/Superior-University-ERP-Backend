import express from "express";
import protect from "../middleware/auth.middleware.js";
import { loginUser, getProfile } from "../controllers/auth.controller.js";
import authorizeRoles from "../middleware/authorize.middleware.js";


const router = express.Router();

router.post("/login", loginUser);
router.get("/profile", protect, getProfile);



export default router;
