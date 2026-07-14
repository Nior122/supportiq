import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load DATABASE_URL from .env file
const envPath = resolve(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
const dbMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!dbMatch) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(dbMatch[1]);

const statements = [
  "CREATE EXTENSION IF NOT EXISTS vector",
  "CREATE EXTENSION IF NOT EXISTS citext",
];

for (const stmt of statements) {
  console.log(`Executing: ${stmt}`);
  try {
    await sql(stmt);
    console.log("  ✓ Success");
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
    // Don't exit on error — extension may already exist
  }
}

console.log("\nExtensions setup complete.");
