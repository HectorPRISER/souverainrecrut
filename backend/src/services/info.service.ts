import { env } from "../config/env";
import { appVersion } from "../config/version";

export class InfoService {
  /**
   * Retourne les informations générales de l'API.
   */
  getInfo() {
    return {
      name: "SouverainRecrut API",
      version: appVersion,
      environment: env.nodeEnv,
      apiVersion: env.apiVersion,
      documentation: "/api-docs",
      health: `/${env.apiVersion}/health`,
      readiness: `/${env.apiVersion}/ready`,
      node: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}