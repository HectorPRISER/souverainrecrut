import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app.error";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        status: err.statusCode,
        message: err.message,
      },
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      status: 500,
      message: "Erreur interne du serveur.",
    },
  });
};