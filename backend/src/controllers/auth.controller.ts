import { Request, Response } from "express";

import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";

import { asyncHandler } from "../utils/async-handler";

const authService = new AuthService();
const userService = new UserService();

export class AuthController {
  /**
   * ==========================================
   * POST /auth/login
   * ==========================================
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * ==========================================
   * GET /auth/me
   * ==========================================
   * Retourne le profil de l'utilisateur connecté.
   */
  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getProfile(req.user!.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export const authController = new AuthController();