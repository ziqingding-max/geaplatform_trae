
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from './_core/env';

// Re-export everything from the new modular services
export * from "./services/db";

// Re-export getDb from connection to maintain backward compatibility
// while ensuring it's the same singleton instance used by services
export { getDb } from "./services/db/connection";
