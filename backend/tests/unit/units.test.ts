import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

import { AppError } from "../../src/errors/app.error";
import { authorize } from "../../src/middlewares/authorize.middleware";
import { errorMiddleware } from "../../src/middlewares/error.middleware";
import { buildPaginationMeta, getPagination } from "../../src/utils/pagination";
import { InfoService } from "../../src/services/info.service";

const mockRes = () => {
  const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
};

describe("pagination", () => {
  it("applique les valeurs par défaut", () => {
    expect(getPagination()).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("borne page >= 1 et limit entre 1 et 100", () => {
    expect(getPagination("-5", "1000")).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(getPagination("3", "0")).toEqual({ page: 3, limit: 1, skip: 2 });
    expect(getPagination("2", "20").skip).toBe(20);
  });

  it("construit les métadonnées", () => {
    expect(buildPaginationMeta(1, 10, 25)).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });
});

describe("AppError", () => {
  it("porte statusCode et isOperational", () => {
    const err = new AppError("boom", 418);
    expect(err.statusCode).toBe(418);
    expect(err.isOperational).toBe(true);
    expect(new AppError("défaut").statusCode).toBe(500);
  });
});

describe("authorize", () => {
  it("401 sans utilisateur, 403 si rôle absent, next() sinon", () => {
    const next = jest.fn() as unknown as NextFunction;
    const guard = authorize(Role.ADMIN);

    guard({} as Request, mockRes(), next);
    expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(401);

    guard({ user: { id: "1", role: Role.RECRUITER } } as Request, mockRes(), next);
    expect((next as jest.Mock).mock.calls[1][0].statusCode).toBe(403);

    guard({ user: { id: "1", role: Role.ADMIN } } as Request, mockRes(), next);
    expect((next as jest.Mock).mock.calls[2]).toEqual([]);
  });
});

describe("errorMiddleware", () => {
  it("formate une AppError", () => {
    const res = mockRes();
    errorMiddleware(new AppError("nope", 404), {} as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("masque les erreurs inattendues en 500", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const res = mockRes();
    errorMiddleware(new Error("secret interne"), {} as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect((res.json as jest.Mock).mock.calls[0][0].error.message).toBe("Erreur interne du serveur.");
    spy.mockRestore();
  });
});

describe("InfoService", () => {
  it("retourne la version de Node", () => {
    expect(new InfoService().getInfo().node).toBe(process.version);
  });
});
