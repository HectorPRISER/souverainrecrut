import { Router } from "express";
import { Role } from "@prisma/client";

import { candidateController } from "../controllers/candidate.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createCandidateSchema,
  updateCandidateSchema,
} from "../validators/candidate.schema";

const router = Router();

/**
 * ==========================================
 * Candidate Routes
 * ==========================================
 */

router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  candidateController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  candidateController.getById
);

router.post(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(createCandidateSchema),
  candidateController.create
);

router.put(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN, Role.RECRUITER),
  validate(updateCandidateSchema),
  candidateController.update
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(Role.ADMIN),
  candidateController.delete
);

export default router;