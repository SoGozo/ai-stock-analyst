import { createApp } from "./app";
import { env } from "./config/env";
import { checkDbConnection } from "./config/db";
import { checkRedisConnection, redis } from "./config/redis";

async function main() {
  await checkDbConnection();
  console.log("PostgreSQL connected");

  await redis.connect();
  await checkRedisConnection();
  console.log("Redis connected");

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
    console.log(`Health: http://localhost:${env.PORT}/health`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
