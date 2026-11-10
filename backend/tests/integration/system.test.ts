import request from "supertest";
import { Role } from "@prisma/client";

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import {
  bearer,
  createApplication,
  createCandidate,
  createJob,
  createUser,
  resetDb,
} from "../helpers";

describe("Système : accueil, santé, info, docs, dashboard", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("GET / retourne le message d'accueil", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(require("../../package.json").version);
    expect(res.body.documentation).toBe("/api-docs");
  });

  it("n'expose pas l'en-tête X-Powered-By", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("GET /v1/health retourne UP", async () => {
    const res = await request(app).get("/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("UP");
  });

  it("GET /v1/ready retourne READY quand la base répond", async () => {
    const res = await request(app).get("/v1/ready");
    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe("CONNECTED");
  });

  it("GET /v1/ready retourne 503 quand la base est indisponible", async () => {
    const spy = jest.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(new Error("down"));
    const res = await request(app).get("/v1/ready");
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.data.database).toBe("DISCONNECTED");
    spy.mockRestore();
  });

  it("GET /v1/info retourne les informations de l'API", async () => {
    const res = await request(app).get("/v1/info");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("SouverainRecrut API");
    // la version exposée est celle de package.json (celle qui sert aussi de tag d'image)
    expect(res.body.data.version).toBe(require("../../package.json").version);
  });

  it("GET /api-docs sert l'interface Swagger", async () => {
    const res = await request(app).get("/api-docs/").redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger");
  });

  it("route inconnue : 404 JSON", async () => {
    const res = await request(app).get("/v1/nexiste-pas");
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain("/v1/nexiste-pas");
  });

  it("GET /v1/dashboard/stats compte les ressources", async () => {
    const recruiter = await createUser(Role.RECRUITER);
    const candidate = await createCandidate();
    const job = await createJob(recruiter.id);
    await createApplication(candidate.id, job.id);

    const res = await request(app).get("/v1/dashboard/stats").set(bearer(recruiter));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      users: 1,
      candidates: 1,
      jobs: 1,
      applications: 1,
      pendingApplications: 1,
    });
  });

  it("GET /v1/dashboard/stats exige un token", async () => {
    expect((await request(app).get("/v1/dashboard/stats")).status).toBe(401);
  });
});
