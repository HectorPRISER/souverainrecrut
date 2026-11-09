import request from "supertest";
import { Role } from "@prisma/client";

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { bearer, createCandidate, createUser, resetDb } from "../helpers";

describe("Candidates", () => {
  let admin: Awaited<ReturnType<typeof createUser>>;
  let recruiter: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    admin = await createUser(Role.ADMIN);
    recruiter = await createUser(Role.RECRUITER);
  });
  afterAll(() => prisma.$disconnect());

  it("exige une authentification (401)", async () => {
    expect((await request(app).get("/v1/candidates")).status).toBe(401);
  });

  it("crée un candidat avec email normalisé en minuscules (201)", async () => {
    const res = await request(app)
      .post("/v1/candidates")
      .set(bearer(recruiter))
      .send({ fullName: "Awa Camara", email: "AWA@Example.COM", phone: "+224620000002" });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("awa@example.com");
  });

  it("refuse un doublon d'email (409) et un corps invalide (400)", async () => {
    const existing = await createCandidate("dup@example.com");
    const dup = await request(app)
      .post("/v1/candidates")
      .set(bearer(recruiter))
      .send({ fullName: "Autre Nom", email: existing.email });
    expect(dup.status).toBe(409);

    const invalid = await request(app)
      .post("/v1/candidates")
      .set(bearer(recruiter))
      .send({ fullName: "A", email: "x" });
    expect(invalid.status).toBe(400);
  });

  it("liste, lit et met à jour un candidat", async () => {
    const c = await createCandidate();

    const list = await request(app).get("/v1/candidates").set(bearer(recruiter));
    expect(list.status).toBe(200);
    expect(list.body.pagination.total).toBe(1);

    const get = await request(app).get(`/v1/candidates/${c.id}`).set(bearer(recruiter));
    expect(get.status).toBe(200);

    const put = await request(app)
      .put(`/v1/candidates/${c.id}`)
      .set(bearer(recruiter))
      .send({ fullName: "Nouveau Nom" });
    expect(put.status).toBe(200);
    expect(put.body.data.fullName).toBe("Nouveau Nom");
  });

  it("retourne 404 pour un candidat inconnu", async () => {
    const res = await request(app).get("/v1/candidates/inconnu").set(bearer(recruiter));
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Candidat introuvable.");
  });

  it("DELETE réservé à ADMIN : RECRUITER 403, ADMIN 200", async () => {
    const c = await createCandidate();

    const forbidden = await request(app).delete(`/v1/candidates/${c.id}`).set(bearer(recruiter));
    expect(forbidden.status).toBe(403);

    const ok = await request(app).delete(`/v1/candidates/${c.id}`).set(bearer(admin));
    expect(ok.status).toBe(200);
    expect(await prisma.candidate.count()).toBe(0);
  });
});
