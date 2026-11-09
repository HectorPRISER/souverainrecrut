import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log("=================================");
  console.log("🚀 SouverainRecrut Backend");
  console.log(`🌍 Environment : ${env.nodeEnv}`);
  console.log(`📍 URL : http://localhost:${env.port}`);
  console.log(`📌 API Version : ${env.apiVersion}`);
  console.log("=================================");
});