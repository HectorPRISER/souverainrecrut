import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(150, "Le titre est trop long."),

  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères."),

  location: z
    .string()
    .min(2, "Le lieu est obligatoire."),

  company: z
    .string()
    .min(2, "Le nom de l'entreprise est obligatoire."),

  recruiterId: z
    .string()
    .min(1, "Le recruteur est obligatoire."),
});

export const updateJobSchema = createJobSchema.partial();