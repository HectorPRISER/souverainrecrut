import { Router } from "express";
import { Role } from "@prisma/client";

import { dashboardController } from "../controllers/dashboard.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";

const router = Router();

/**
 * ==========================================
 * Dashboard Routes
 * ==========================================
 */

router.get(
  "/stats",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  dashboardController.getStatistics
);

export default router;