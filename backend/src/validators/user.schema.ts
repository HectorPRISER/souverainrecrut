import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(100, "Le prénom est trop long."),

  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom est trop long."),

  email: z
    .string()
    .email("Adresse email invalide."),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères."),

  role: z
    .nativeEnum(Role)
    .optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(100, "Le prénom est trop long.")
    .optional(),

  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(100, "Le nom est trop long.")
    .optional(),

  email: z
    .string()
    .email("Adresse email invalide.")
    .optional(),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .optional(),

  role: z
    .nativeEnum(Role)
    .optional(),
});