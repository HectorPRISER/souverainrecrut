import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const createApplicationSchema = z.object({
  candidateId: z
    .string()
    .min(1, "Le candidat est obligatoire."),

  jobId: z
    .string()
    .min(1, "L'offre est obligatoire."),

  status: z
    .nativeEnum(ApplicationStatus)
    .optional(),
});

export const updateApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});