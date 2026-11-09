// Variables d'environnement chargées avant chaque fichier de test.
// DATABASE_URL peut être surchargée (CI) ; par défaut : base de test locale.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-only-secret";
process.env.API_VERSION = "v1";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://test:test@localhost:5433/souverainrecrut_test";
