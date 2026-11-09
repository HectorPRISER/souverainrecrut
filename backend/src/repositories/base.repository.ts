import { prisma } from "../config/prisma";

/**
 * Repository de base.
 *
 * Tous les repositories utiliseront cette même
 * instance Prisma.
 */
export abstract class BaseRepository {
  protected prisma = prisma;
}