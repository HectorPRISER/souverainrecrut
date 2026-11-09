import { Request, Response } from "express";

import { JobService } from "../services/job.service";

import { asyncHandler } from "../utils/async-handler";
import {
  buildPaginationMeta,
  getPagination,
} from "../utils/pagination";

const jobService = new JobService();

export class JobController {
  /**
   * ==========================================
   * GET /jobs
   * ==========================================
   * Retourne la liste paginée des offres.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(
      req.query.page as string,
      req.query.limit as string
    );

    const result = await jobService.getAll(skip, limit);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: buildPaginationMeta(
        page,
        limit,
        result.total
      ),
    });
  });

  /**
   * ==========================================
   * GET /jobs/:id
   * ==========================================
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const job = await jobService.getById(id);

    res.status(200).json({
      success: true,
      data: job,
    });
  });

  /**
   * ==========================================
   * POST /jobs
   * ==========================================
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const job = await jobService.create(req.body);

    res.status(201).json({
      success: true,
      data: job,
    });
  });

  /**
   * ==========================================
   * PUT /jobs/:id
   * ==========================================
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const job = await jobService.update(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: job,
    });
  });

  /**
   * ==========================================
   * DELETE /jobs/:id
   * ==========================================
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const job = await jobService.delete(id);

    res.status(200).json({
      success: true,
      data: job,
    });
  });
}

export const jobController = new JobController();