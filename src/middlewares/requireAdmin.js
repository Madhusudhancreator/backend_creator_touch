/**
 * requireAdmin.js — role guard middleware.
 * Must be used after authenticate. Allows only users with role === 'admin'.
 */

module.exports = function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next({ status: 403, message: 'Forbidden.' });
};
