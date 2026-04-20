/**
 * authenticate.js — JWT middleware.
 * Reads Authorization: Bearer <token>, verifies with JWT_SECRET,
 * and attaches req.user = { id, email, role, status }.
 */

const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next({ status: 401, message: 'Unauthorized.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id:     payload.id,
      email:  payload.email,
      role:   payload.role,
      status: payload.status,
    };
    next();
  } catch {
    next({ status: 401, message: 'Unauthorized.' });
  }
};
