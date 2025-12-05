import { Pool } from "pg";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error("❌ No SUPABASE_DB_URL found. Check Vercel env vars.");
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
