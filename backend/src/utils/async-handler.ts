import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Enveloppe une fonction asynchrone et transmet
 * automatiquement les erreurs au middleware global.
 */
export const asyncHandler = (
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};