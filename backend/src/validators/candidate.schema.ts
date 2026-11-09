import { z } from "zod";

export const createCandidateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Le nom complet doit contenir au moins 3 caractères.")
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères."),

  email: z
    .email("Adresse email invalide.")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .min(8, "Le numéro de téléphone est trop court.")
    .max(20, "Le numéro de téléphone est trop long.")
    .optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();