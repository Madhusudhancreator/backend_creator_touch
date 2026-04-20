/**
 * usersController.js — handlers for /api/users routes.
 * All routes require authenticate + requireAdmin.
 */

const repo = require('../repositories/usersRepository');

/**
 * GET /api/users
 * Returns all users (excluding password_hash).
 */
async function getAll(req, res, next) {
  try {
    const users = await repo.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/pending
 * Returns users with status = 'pending'.
 */
async function getPending(req, res, next) {
  try {
    const users = await repo.findPending();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/approve
 * Sets user status to 'active'.
 */
async function approve(req, res, next) {
  try {
    const { id } = req.params;
    const user = await repo.updateStatus(id, 'active');
    if (!user) return next({ status: 404, message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/reject
 * Sets user status to 'rejected'.
 */
async function reject(req, res, next) {
  try {
    const { id } = req.params;
    const user = await repo.updateStatus(id, 'rejected');
    if (!user) return next({ status: 404, message: 'User not found.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:id
 * Hard-deletes a user.
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await repo.remove(id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getPending, approve, reject, remove };
