import { Router } from "express";

import { authController } from "../controllers/auth.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * ==========================================
 * Authentication Routes
 * ==========================================
 */

// Connexion
router.post("/login", authController.login);

// Profil de l'utilisateur connecté
router.get(
  "/me",
  authMiddleware,
  authController.me
);

export default router;