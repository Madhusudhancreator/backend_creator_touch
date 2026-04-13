/**
 * Creates the blogs table in PostgreSQL.
 * Run once: node src/config/migrate_blogs.js
 */

require("dotenv").config();
const { query, pool } = require("./db");

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id         SERIAL      PRIMARY KEY,
      slug       TEXT        NOT NULL UNIQUE,
      tag        TEXT        NOT NULL DEFAULT '',
      title      TEXT        NOT NULL,
      excerpt    TEXT        NOT NULL DEFAULT '',
      img        TEXT        NOT NULL DEFAULT '',
      read_time  TEXT        NOT NULL DEFAULT '',
      body       JSONB       NOT NULL DEFAULT '[]',
      published  BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Index for ORDER BY created_at DESC (used in findAll)
  await query(`
    CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs (created_at DESC);
  `);

  console.log("✓ blogs table ready");
  console.log("✓ blogs_created_at_idx index ready");
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
