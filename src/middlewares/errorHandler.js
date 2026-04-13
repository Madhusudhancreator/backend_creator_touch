/**
 * errorHandler — global Express error handler.
 *
 * Must be the last app.use() call in app.js.
 * Errors should carry { status, message } so the right HTTP code is forwarded.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    error: { message: err.message || "Internal Server Error" },
  });
};
