import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma.
 *
 * Une seule instance est utilisée dans toute l'application.
 * Cela évite de créer plusieurs connexions à PostgreSQL.
 */
export const prisma = new PrismaClient();