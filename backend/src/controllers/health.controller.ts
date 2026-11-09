import { Request, Response } from "express";

import { HealthService } from "../services/health.service";
import { asyncHandler } from "../utils/async-handler";

const healthService = new HealthService();

export class HealthController {
  /**
   * ==========================================
   * GET /health
   * ==========================================
   * Vérifie que l'API est opérationnelle.
   */
  health = asyncHandler(async (_req: Request, res: Response) => {
    const result = await healthService.health();

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * ==========================================
   * GET /ready
   * ==========================================
   * Vérifie que l'application est prête
   * à recevoir des requêtes.
   */
  readiness = asyncHandler(async (_req: Request, res: Response) => {
    const result = await healthService.readiness();

    const statusCode =
      result.status === "READY" ? 200 : 503;

    res.status(statusCode).json({
      success: result.status === "READY",
      data: result,
    });
  });
}

export const healthController = new HealthController();