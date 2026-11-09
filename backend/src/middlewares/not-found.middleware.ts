import { Request, Response } from "express";

/**
 * Middleware exécuté lorsqu'aucune route
 * ne correspond à la requête.
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    error: {
      status: 404,
      message: `Route ${req.originalUrl} introuvable.`,
    },
  });
};