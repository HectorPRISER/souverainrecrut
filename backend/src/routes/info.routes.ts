import { Router } from "express";

import { infoController } from "../controllers/info.controller";

const router = Router();

/**
 * ==========================================
 * API Information Routes
 * ==========================================
 */

router.get("/info", infoController.getInfo);

export default router;