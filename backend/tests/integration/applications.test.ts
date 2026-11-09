import request from "supertest";
import { ApplicationStatus, Role } from "@prisma/client";

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

describe("Applications", () => {
  let admin: Awaited<ReturnType<typeof createUser>>;
  let recruiter: Awaited<ReturnType<typeof createUser>>;
  let candidateId: string;
  let jobId: string;

  beforeEach(async () => {
    await resetDb();
    admin = await createUser(Role.ADMIN);
    recruiter = await createUser(Role.RECRUITER);
    candidateId = (await createCandidate()).id;
    jobId = (await createJob(recruiter.id)).id;
  });
  afterAll(() => prisma.$disconnect());

  it("exige une authentification (401)", async () => {
    expect((await request(app).get("/v1/applications")).status).toBe(401);
  });

  it("crée une candidature avec statut PENDING par défaut (201)", async () => {
    const res = await request(app)
      .post("/v1/applications")
      .set(bearer(recruiter))
      .send({ candidateId, jobId });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe(ApplicationStatus.PENDING);
  });

  it("valide le corps (400) et gère une clé étrangère inexistante (500)", async () => {
    const invalid = await request(app)
      .post("/v1/applications")
      .set(bearer(recruiter))
      .send({ candidateId: "" });
    expect(invalid.status).toBe(400);

    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const fk = await request(app)
      .post("/v1/applications")
      .set(bearer(recruiter))
      .send({ candidateId: "inconnu", jobId: "inconnu" });
    expect(fk.status).toBe(500);
    spy.mockRestore();
  });

  it("liste, lit et change le statut d'une candidature", async () => {
    const application = await createApplication(candidateId, jobId);

    const list = await request(app).get("/v1/applications").set(bearer(recruiter));
    expect(list.status).toBe(200);
    expect(list.body.pagination.total).toBe(1);

    const get = await request(app).get(`/v1/applications/${application.id}`).set(bearer(recruiter));
    expect(get.status).toBe(200);

    const put = await request(app)
      .put(`/v1/applications/${application.id}`)
      .set(bearer(recruiter))
      .send({ status: ApplicationStatus.ACCEPTED });
    expect(put.status).toBe(200);
    expect(put.body.data.status).toBe(ApplicationStatus.ACCEPTED);
  });

  it("refuse un statut invalide (400) et une candidature inconnue (404)", async () => {
    const application = await createApplication(candidateId, jobId);

    const bad = await request(app)
      .put(`/v1/applications/${application.id}`)
      .set(bearer(recruiter))
      .send({ status: "INCONNU" });
    expect(bad.status).toBe(400);

    const missing = await request(app).get("/v1/applications/inconnu").set(bearer(recruiter));
    expect(missing.status).toBe(404);
  });

  it("DELETE réservé à ADMIN", async () => {
    const application = await createApplication(candidateId, jobId);

    const forbidden = await request(app)
      .delete(`/v1/applications/${application.id}`)
      .set(bearer(recruiter));
    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .delete(`/v1/applications/${application.id}`)
      .set(bearer(admin));
    expect(ok.status).toBe(200);
  });
});
