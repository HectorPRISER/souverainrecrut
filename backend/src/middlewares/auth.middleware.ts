import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../errors/app.error";

interface JwtPayload {
  id: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new AppError("Authentification requise.", 401));
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return next(new AppError("Token invalide.", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      env.jwtSecret
    ) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role as any,
    };

    next();
  } catch {
    next(new AppError("Token invalide ou expiré.", 401));
  }
};