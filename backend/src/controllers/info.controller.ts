import { Request, Response } from "express";

import { InfoService } from "../services/info.service";
import { asyncHandler } from "../utils/async-handler";

const infoService = new InfoService();

export class InfoController {
  /**
   * ==========================================
   * GET /info
   * ==========================================
   * Retourne les informations générales de l'API.
   */
  getInfo = asyncHandler(async (_req: Request, res: Response) => {
    const info = infoService.getInfo();

    res.status(200).json({
      success: true,
      data: info,
    });
  });
}

export const infoController = new InfoController();