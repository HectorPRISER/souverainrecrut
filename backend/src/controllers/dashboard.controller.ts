import { Request, Response } from "express";

import { DashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/async-handler";

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * GET /dashboard/stats
   */
  getStatistics = asyncHandler(
    async (req: Request, res: Response) => {
      const stats = await dashboardService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );
}

export const dashboardController = new DashboardController();