
// Re-export everything from the new modular services
export * from "./services/db";

// Re-export getDb from connection
export { getDb } from "./services/db/connection";
