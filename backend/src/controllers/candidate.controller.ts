import { Request, Response } from "express";

import { CandidateService } from "../services/candidate.service";

import { asyncHandler } from "../utils/async-handler";
import {
  buildPaginationMeta,
  getPagination,
} from "../utils/pagination";

const candidateService = new CandidateService();

export class CandidateController {
  /**
   * ==========================================
   * GET /candidates
   * ==========================================
   * Retourne la liste paginée des candidats.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(
      req.query.page as string,
      req.query.limit as string
    );

    const result = await candidateService.getAll(skip, limit);

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
   * GET /candidates/:id
   * ==========================================
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const candidate = await candidateService.getById(id);

    res.status(200).json({
      success: true,
      data: candidate,
    });
  });

  /**
   * ==========================================
   * POST /candidates
   * ==========================================
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const candidate = await candidateService.create(req.body);

    res.status(201).json({
      success: true,
      data: candidate,
    });
  });

  /**
   * ==========================================
   * PUT /candidates/:id
   * ==========================================
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const candidate = await candidateService.update(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: candidate,
    });
  });

  /**
   * ==========================================
   * DELETE /candidates/:id
   * ==========================================
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const candidate = await candidateService.delete(id);

    res.status(200).json({
      success: true,
      data: candidate,
    });
  });
}

export const candidateController = new CandidateController();