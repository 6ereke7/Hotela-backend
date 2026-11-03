import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL ?? "";
const normalizedDatabaseUrl =
  databaseUrl && process.env.DB_SSL === "true" && !/[?&]sslmode=/.test(databaseUrl)
    ? `${databaseUrl.includes("?") ? databaseUrl : `${databaseUrl}?`}sslmode=require`
    : databaseUrl;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizedDatabaseUrl,
  },
});