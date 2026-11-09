import request from "supertest";
import { Role } from "@prisma/client";

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { bearer, createJob, createUser, resetDb } from "../helpers";

describe("Jobs", () => {
  let admin: Awaited<ReturnType<typeof createUser>>;
  let recruiter: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    admin = await createUser(Role.ADMIN);
    recruiter = await createUser(Role.RECRUITER);
  });
  afterAll(() => prisma.$disconnect());

  const payload = () => ({
    title: "Ingénieur DevOps",
    description: "Pipelines CI/CD avec Jenkins",
    location: "Rennes",
    company: "SouverainTech",
    recruiterId: recruiter.id,
  });

  it("exige une authentification (401)", async () => {
    expect((await request(app).get("/v1/jobs")).status).toBe(401);
  });

  it("crée une offre (201) et refuse un corps invalide (400)", async () => {
    const ok = await request(app).post("/v1/jobs").set(bearer(recruiter)).send(payload());
    expect(ok.status).toBe(201);
    expect(ok.body.data.title).toBe("Ingénieur DevOps");

    const ko = await request(app).post("/v1/jobs").set(bearer(recruiter)).send({ title: "x" });
    expect(ko.status).toBe(400);
  });

  it("liste, lit et met à jour une offre", async () => {
    const job = await createJob(recruiter.id);

    const list = await request(app).get("/v1/jobs").set(bearer(recruiter));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const get = await request(app).get(`/v1/jobs/${job.id}`).set(bearer(recruiter));
    expect(get.status).toBe(200);

    const put = await request(app)
      .put(`/v1/jobs/${job.id}`)
      .set(bearer(recruiter))
      .send({ location: "Nantes" });
    expect(put.status).toBe(200);
    expect(put.body.data.location).toBe("Nantes");
  });

  it("retourne 404 pour une offre inconnue", async () => {
    const res = await request(app).get("/v1/jobs/inconnu").set(bearer(recruiter));
    expect(res.status).toBe(404);
  });

  it("DELETE réservé à ADMIN", async () => {
    const job = await createJob(recruiter.id);

    expect((await request(app).delete(`/v1/jobs/${job.id}`).set(bearer(recruiter))).status).toBe(403);
    expect((await request(app).delete(`/v1/jobs/${job.id}`).set(bearer(admin))).status).toBe(200);
  });
});
