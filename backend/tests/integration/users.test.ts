import request from "supertest";
import { Role } from "@prisma/client";

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { bearer, createUser, resetDb } from "../helpers";

const newUser = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  password: "motdepasse1",
};

describe("Users (ADMIN uniquement)", () => {
  let admin: Awaited<ReturnType<typeof createUser>>;
  let recruiter: Awaited<ReturnType<typeof createUser>>;

  beforeEach(async () => {
    await resetDb();
    admin = await createUser(Role.ADMIN);
    recruiter = await createUser(Role.RECRUITER);
  });
  afterAll(() => prisma.$disconnect());

  it("refuse l'accès à un RECRUITER (403) et sans token (401)", async () => {
    const forbidden = await request(app).get("/v1/users").set(bearer(recruiter));
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.message).toMatch(/Accès refusé/);

    const anonymous = await request(app).get("/v1/users");
    expect(anonymous.status).toBe(401);
  });

  it("liste les utilisateurs avec pagination", async () => {
    const res = await request(app)
      .get("/v1/users?page=1&limit=1")
      .set(bearer(admin));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  it("crée un utilisateur avec mot de passe haché (201)", async () => {
    const res = await request(app).post("/v1/users").set(bearer(admin)).send(newUser);

    expect(res.status).toBe(201);
    const stored = await prisma.user.findUnique({ where: { email: newUser.email } });
    expect(stored).not.toBeNull();
    expect(stored!.password).not.toBe(newUser.password);
    expect(stored!.role).toBe(Role.RECRUITER);
  });

  it("refuse un email déjà utilisé (409)", async () => {
    const res = await request(app)
      .post("/v1/users")
      .set(bearer(admin))
      .send({ ...newUser, email: recruiter.email });

    expect(res.status).toBe(409);
  });

  it("valide le corps de la requête (400)", async () => {
    const res = await request(app)
      .post("/v1/users")
      .set(bearer(admin))
      .send({ firstName: "J", email: "pas-un-email", password: "court" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
  });

  it("lit, met à jour puis supprime un utilisateur", async () => {
    const get = await request(app).get(`/v1/users/${recruiter.id}`).set(bearer(admin));
    expect(get.status).toBe(200);

    const put = await request(app)
      .put(`/v1/users/${recruiter.id}`)
      .set(bearer(admin))
      .send({ firstName: "Modifié" });
    expect(put.status).toBe(200);
    expect(put.body.data.firstName).toBe("Modifié");

    const del = await request(app).delete(`/v1/users/${recruiter.id}`).set(bearer(admin));
    expect(del.status).toBe(200);

    const gone = await request(app).get(`/v1/users/${recruiter.id}`).set(bearer(admin));
    expect(gone.status).toBe(404);
  });

  it("retourne 404 pour un identifiant inconnu (PUT, DELETE)", async () => {
    const put = await request(app).put("/v1/users/inconnu").set(bearer(admin)).send({ firstName: "Zoé" });
    expect(put.status).toBe(404);
    const del = await request(app).delete("/v1/users/inconnu").set(bearer(admin));
    expect(del.status).toBe(404);
  });

  it("retourne 500 générique sur conflit d'unicité non géré (PUT email déjà pris)", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const res = await request(app)
      .put(`/v1/users/${recruiter.id}`)
      .set(bearer(admin))
      .send({ email: admin.email });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe("Erreur interne du serveur.");
    spy.mockRestore();
  });
});
