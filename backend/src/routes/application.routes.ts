import { Router } from "express";
import { Role } from "@prisma/client";

import { applicationController } from "../controllers/application.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validators/application.schema";

const router = Router();

/**
 * ==========================================
 * Application Routes
 * ==========================================
 */

router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  applicationController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  applicationController.getById
);

router.post(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(createApplicationSchema),
  applicationController.create
);

router.put(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(updateApplicationSchema),
  applicationController.update
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  applicationController.delete
);

export default router;