/**
 * migrate_contacts.js — creates the contacts table.
 * Run once: node src/config/migrate_contacts.js
 */

require("dotenv").config();
const { query, pool } = require("./db");

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         SERIAL      PRIMARY KEY,
      full_name  TEXT        NOT NULL,
      phone      TEXT        NOT NULL DEFAULT '',
      email      TEXT        NOT NULL,
      service    TEXT        NOT NULL DEFAULT '',
      budget     TEXT        NOT NULL DEFAULT '',
      message    TEXT        NOT NULL,
      read       BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS contacts_read_idx ON contacts (read);
  `);

  console.log("✓ contacts table ready");
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
