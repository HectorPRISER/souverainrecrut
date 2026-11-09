import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app.error";

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentification requise.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Accès refusé. Permissions insuffisantes.", 403)
      );
    }

    next();
  };