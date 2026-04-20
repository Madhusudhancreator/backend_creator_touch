/**
 * usersRepository.js — data access layer for the users table.
 */

const db = require('../config/db');

/**
 * Return all users ordered by created_at descending.
 */
async function findAll() {
  const result = await db.query(
    'SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

/**
 * Return a single user by id.
 */
async function findById(id) {
  const result = await db.query(
    'SELECT id, name, email, password_hash, role, status, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Return a single user by email (includes password_hash for auth).
 */
async function findByEmail(email) {
  const result = await db.query(
    'SELECT id, name, email, password_hash, role, status, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Return all users with status = 'pending'.
 */
async function findPending() {
  const result = await db.query(
    "SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE status = 'pending' ORDER BY created_at DESC"
  );
  return result.rows;
}

/**
 * Create a new employee user (role = 'employee', status = 'pending').
 */
async function create({ name, email, password_hash }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, 'employee', 'pending')
     RETURNING id, name, email, role, status, created_at, updated_at`,
    [name, email, password_hash]
  );
  return result.rows[0];
}

/**
 * Update a user's status and updated_at timestamp.
 */
async function updateStatus(id, status) {
  const result = await db.query(
    `UPDATE users SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, status, created_at, updated_at`,
    [status, id]
  );
  return result.rows[0] || null;
}

/**
 * Hard-delete a user by id.
 */
async function remove(id) {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findAll, findById, findByEmail, findPending, create, updateStatus, remove };
