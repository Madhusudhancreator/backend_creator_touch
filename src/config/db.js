/**
 * db.js — PostgreSQL connection pool.
 *
 * Requires DATABASE_URL in backend/.env:
 *   postgres://user:password@host/dbname?sslmode=require
 */

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to backend/.env");
}

// Strip ?sslmode=... from the URL — we set ssl options explicitly below.
// This prevents pg-connection-string from emitting the SSL deprecation warning.
const connectionString = process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]*/i, "$1").replace(/[?&]$/, "");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

/**
 * Runs a parameterised query and returns the pg QueryResult.
 * @param {string} text   SQL string with $1, $2 … placeholders
 * @param {any[]}  params Bound parameter values
 */
async function query(text, params) {
  const start  = Date.now();
  const result = await pool.query(text, params);
  const ms     = Date.now() - start;
  if (ms > 500) console.warn(`[db] Slow query (${ms}ms): ${text.slice(0, 80)}`);
  return result;
}

module.exports = { query, pool };
