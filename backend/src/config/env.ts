import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4500,

  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl: process.env.DATABASE_URL || "",

  jwtSecret: process.env.JWT_SECRET || "",

  apiVersion: process.env.API_VERSION || "v1",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
};