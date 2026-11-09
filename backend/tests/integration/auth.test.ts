import request from "supertest";
import { Role } from "@prisma/client";

import app from "../../src/app";
import { prisma } from "../../src/config/prisma";
import { PASSWORD, bearer, createUser, resetDb } from "../helpers";

describe("Auth", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("POST /v1/auth/login retourne un token et masque le mot de passe", async () => {
    const user = await createUser(Role.ADMIN, "admin@example.com");

    const res = await request(app)
      .post("/v1/auth/login")
      .send({ email: user.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe("admin@example.com");
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("refuse un mot de passe incorrect (401)", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/v1/auth/login")
      .send({ email: user.email, password: "mauvais-mot-de-passe" });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Email ou mot de passe invalide.");
  });

  it("refuse un email inconnu (401)", async () => {
    const res = await request(app)
      .post("/v1/auth/login")
      .send({ email: "inconnu@example.com", password: PASSWORD });

    expect(res.status).toBe(401);
  });

  it("GET /v1/auth/me retourne le profil sans mot de passe", async () => {
    const user = await createUser(Role.RECRUITER);
    const res = await request(app).get("/v1/auth/me").set(bearer(user));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.password).toBeUndefined();
  });

  it("GET /v1/auth/me sans token (401)", async () => {
    const res = await request(app).get("/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Authentification requise.");
  });

  it("GET /v1/auth/me avec un schéma d'autorisation invalide (401)", async () => {
    const res = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", "Basic abcdef");
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Token invalide.");
  });

  it("GET /v1/auth/me avec un token falsifié (401)", async () => {
    const res = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", "Bearer pas.un.jwt");
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Token invalide ou expiré.");
  });

  it("GET /v1/auth/me pour un utilisateur supprimé (404)", async () => {
    const user = await createUser();
    const headers = bearer(user);
    await prisma.user.delete({ where: { id: user.id } });

    const res = await request(app).get("/v1/auth/me").set(headers);
    expect(res.status).toBe(404);
  });
});
