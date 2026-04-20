/**
 * migrate_users.js — creates the users table and seeds the admin user.
 * Run once: node src/config/migrate_users.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./db');

async function migrate() {
  console.log('[migrate_users] Creating users table…');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL      PRIMARY KEY,
      name          TEXT        NOT NULL,
      email         TEXT        NOT NULL UNIQUE,
      password_hash TEXT        NOT NULL,
      role          TEXT        NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','employee')),
      status        TEXT        NOT NULL DEFAULT 'pending'  CHECK (status IN ('pending','active','rejected')),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log('[migrate_users] Table ready. Seeding admin user…');

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('[migrate_users] Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env — skipping seed.');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, 'admin', 'active')
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_NAME, ADMIN_EMAIL, password_hash]
  );

  console.log('[migrate_users] Done. Admin user seeded (or already exists).');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[migrate_users] Error:', err.message);
  process.exit(1);
});
