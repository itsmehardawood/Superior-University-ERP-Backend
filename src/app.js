import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Logger
app.use(morgan("dev"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Superior ERP Backend Running 🚀",
  });
});

export default app;