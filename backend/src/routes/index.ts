import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import candidateRoutes from "./candidate.routes";
import jobRoutes from "./job.routes";
import applicationRoutes from "./application.routes";
import dashboardRoutes from "./dashboard.routes";
import healthRoutes from "./health.routes";
import infoRoutes from "./info.routes";

const router = Router();

/**
 * ==========================================
 * API Routes
 * ==========================================
 */

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/candidates", candidateRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/dashboard", dashboardRoutes);

/**
 * ==========================================
 * API Information
 * ==========================================
 */

router.use("/", infoRoutes);

/**
 * ==========================================
 * Health Check
 * ==========================================
 */

router.use("/", healthRoutes);

export default router;