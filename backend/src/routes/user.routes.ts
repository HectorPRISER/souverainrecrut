import { Router } from "express";
import { Role } from "@prisma/client";

import { userController } from "../controllers/user.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.schema";

const router = Router();

/**
 * ==========================================
 * User Routes
 * ==========================================
 */

router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN),
  userController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  userController.getById
);

router.post(
  "/",
  authMiddleware,
  authorize(Role.ADMIN),
  validate(createUserSchema),
  userController.create
);

router.put(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  validate(updateUserSchema),
  userController.update
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  userController.delete
);

export default router;