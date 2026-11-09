import { Request, Response } from "express";

import { ApplicationService } from "../services/application.service";

import { asyncHandler } from "../utils/async-handler";
import {
  buildPaginationMeta,
  getPagination,
} from "../utils/pagination";

const applicationService = new ApplicationService();

export class ApplicationController {
  /**
   * ==========================================
   * GET /applications
   * ==========================================
   * Retourne la liste paginée des candidatures.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(
      req.query.page as string,
      req.query.limit as string
    );

    const result = await applicationService.getAll(skip, limit);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: buildPaginationMeta(
        page,
        limit,
        result.total,
      ),
    });
  });

  /**
   * ==========================================
   * GET /applications/:id
   * ==========================================
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const application = await applicationService.getById(id);

    res.status(200).json({
      success: true,
      data: application,
    });
  });

  /**
   * ==========================================
   * POST /applications
   * ==========================================
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const application = await applicationService.create(req.body);

    res.status(201).json({
      success: true,
      data: application,
    });
  });

  /**
   * ==========================================
   * PUT /applications/:id
   * ==========================================
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const application = await applicationService.update(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  });

  /**
   * ==========================================
   * DELETE /applications/:id
   * ==========================================
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const application = await applicationService.delete(id);

    res.status(200).json({
      success: true,
      data: application,
    });
  });
}

export const applicationController =
  new ApplicationController();