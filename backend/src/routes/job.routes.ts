import { Router } from "express";
import { Role } from "@prisma/client";

import { jobController } from "../controllers/job.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createJobSchema,
  updateJobSchema,
} from "../validators/job.schema";

const router = Router();

/**
 * ==========================================
 * Job Routes
 * ==========================================
 */

router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  jobController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  jobController.getById
);

router.post(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(createJobSchema),
  jobController.create
);

router.put(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(updateJobSchema),
  jobController.update
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  jobController.delete
);

export default router;