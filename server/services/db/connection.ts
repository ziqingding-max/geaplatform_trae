
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../drizzle/schema";
import * as relations from "../../../drizzle/relations";

let _db: ReturnType<typeof drizzle<typeof schema & typeof relations>> | null = null;

export function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        max: 10, // Connection pool size
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzle(client, { schema: { ...schema, ...relations } });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
