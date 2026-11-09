import { prisma } from "../config/prisma";

export class HealthService {
  /**
   * Vérifie que l'API fonctionne.
   */
  async health() {
    return {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }

  /**
   * Vérifie que la base de données est disponible.
   */
  async readiness() {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: "READY",
        database: "CONNECTED",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "NOT_READY",
        database: "DISCONNECTED",
        timestamp: new Date().toISOString(),
      };
    }
  }
}