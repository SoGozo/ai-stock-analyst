import { Pool } from "pg";
import { env } from "./env";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

export async function checkDbConnection(): Promise<void> {
  const client = await db.connect();
  client.release();
}
