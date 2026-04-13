const db = require("../config/db");

const SELECT = `
  SELECT id, full_name, phone, email, service, budget, message, read, created_at
  FROM contacts
`;

function findAll() {
  return db.query(`${SELECT} ORDER BY created_at DESC`).then((r) => r.rows);
}

function create({ full_name, phone, email, service, budget, message }) {
  return db
    .query(
      `INSERT INTO contacts (full_name, phone, email, service, budget, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, phone, email, service, budget, message, read, created_at`,
      [full_name, phone || "", email, service || "", budget || "", message]
    )
    .then((r) => r.rows[0]);
}

function markRead(id, read) {
  return db
    .query(
      `UPDATE contacts SET read = $2 WHERE id = $1
       RETURNING id, read`,
      [id, read]
    )
    .then((r) => r.rows[0] ?? null);
}

function remove(id) {
  return db
    .query("DELETE FROM contacts WHERE id = $1 RETURNING id", [id])
    .then((r) => r.rows.length > 0);
}

module.exports = { findAll, create, markRead, remove };
