import { Router } from "express";

import { healthController } from "../controllers/health.controller";

const router = Router();

/**
 * ==========================================
 * Health Check Routes
 * ==========================================
 */

router.get("/health", healthController.health);

router.get("/ready", healthController.readiness);

export default router;