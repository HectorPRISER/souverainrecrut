import { Request, Response } from "express";

import { UserService } from "../services/user.service";

import { asyncHandler } from "../utils/async-handler";
import {
  buildPaginationMeta,
  getPagination,
} from "../utils/pagination";

const userService = new UserService();

export class UserController {
  /**
   * ==========================================
   * GET /users
   * ==========================================
   * Retourne la liste paginée des utilisateurs.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPagination(
      req.query.page as string,
      req.query.limit as string
    );

    const result = await userService.getAll(skip, limit);

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
   * GET /users/:id
   * ==========================================
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const user = await userService.getById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * ==========================================
   * POST /users
   * ==========================================
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  });

  /**
   * ==========================================
   * PUT /users/:id
   * ==========================================
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const user = await userService.update(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * ==========================================
   * DELETE /users/:id
   * ==========================================
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const user = await userService.delete(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export const userController = new UserController();