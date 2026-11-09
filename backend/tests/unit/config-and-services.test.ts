import { ApplicationStatus, Role } from "@prisma/client";

import { prisma } from "../../src/config/prisma";
import { ApplicationRepository } from "../../src/repositories/application.repository";
import { CandidateRepository } from "../../src/repositories/candidate.repository";
import { JobRepository } from "../../src/repositories/job.repository";
import { UserRepository } from "../../src/repositories/user.repository";
import { ApplicationService } from "../../src/services/application.service";
import { CandidateService } from "../../src/services/candidate.service";
import { JobService } from "../../src/services/job.service";
import { UserService } from "../../src/services/user.service";
import {
  createApplication,
  createCandidate,
  createJob,
  createUser,
  resetDb,
} from "../helpers";

describe("config/env : valeurs par défaut et surcharge", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
    jest.resetModules();
  });

  it("utilise les valeurs par défaut quand rien n'est défini", () => {
    for (const k of ["PORT", "NODE_ENV", "DATABASE_URL", "JWT_SECRET", "API_VERSION", "FRONTEND_URL"]) {
      delete process.env[k];
    }
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { env } = require("../../src/config/env");
      expect(env).toEqual({
        port: 4500,
        nodeEnv: "development",
        databaseUrl: "",
        jwtSecret: "",
        apiVersion: "v1",
        frontendUrl: "http://localhost:5173",
      });
    });
  });

  it("lit les variables d'environnement", () => {
    process.env.PORT = "4000";
    process.env.NODE_ENV = "production";
    jest.isolateModules(() => {
      const { env } = require("../../src/config/env");
      expect(env.port).toBe(4000);
      expect(env.nodeEnv).toBe("production");
    });
  });
});

describe("middleware de log", () => {
  const saved = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = saved;
    jest.resetModules();
  });

  it("choisit le format 'combined' en production", () => {
    process.env.NODE_ENV = "production";
    jest.isolateModules(() => {
      const { loggerMiddleware } = require("../../src/middlewares/logger.middleware");
      expect(typeof loggerMiddleware).toBe("function");
    });
  });
});

describe("services : paramètres de pagination par défaut", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("getAll() sans argument", async () => {
    const recruiter = await createUser(Role.RECRUITER);
    const candidate = await createCandidate();
    const job = await createJob(recruiter.id);
    await createApplication(candidate.id, job.id);

    expect((await new UserService().getAll()).total).toBe(1);
    expect((await new CandidateService().getAll()).total).toBe(1);
    expect((await new JobService().getAll()).total).toBe(1);
    expect((await new ApplicationService().getAll()).total).toBe(1);

    expect((await new UserRepository().findAll()).total).toBe(1);
    expect((await new CandidateRepository().findAll()).total).toBe(1);
    expect((await new JobRepository().findAll()).total).toBe(1);
    expect((await new ApplicationRepository().findAll()).total).toBe(1);
  });

  it("ApplicationService.updateStatus change le statut ou lève 404", async () => {
    const recruiter = await createUser(Role.RECRUITER);
    const candidate = await createCandidate();
    const job = await createJob(recruiter.id);
    const application = await createApplication(candidate.id, job.id);
    const service = new ApplicationService();

    const updated = await service.updateStatus(application.id, ApplicationStatus.REJECTED);
    expect(updated.status).toBe(ApplicationStatus.REJECTED);

    await expect(service.updateStatus("inconnu", ApplicationStatus.ACCEPTED)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
