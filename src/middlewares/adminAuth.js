/**
 * adminAuth — protects write routes.
 *
 * The caller must send the header:
 *   x-admin-key: <value of ADMIN_KEY in backend/.env>
 */
module.exports = function adminAuth(req, _res, next) {
  const configuredKey = process.env.ADMIN_KEY;

  if (!configuredKey) {
    return next({ status: 503, message: "ADMIN_KEY is not configured on the server." });
  }

  if (req.headers["x-admin-key"] !== configuredKey) {
    return next({ status: 401, message: "Unauthorized — invalid or missing x-admin-key header." });
  }

  next();
};
