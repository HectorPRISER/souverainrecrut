import { execSync } from "node:child_process";

// Applique les migrations Prisma sur la base de test avant la suite.
export default async function globalSetup(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://test:test@localhost:5433/souverainrecrut_test";

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
