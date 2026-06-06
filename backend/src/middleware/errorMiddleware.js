/**
 * Central error handler.
 *
 * Status code resolution order:
 *   1. err.statusCode  — set by ApiError factory methods (preferred)
 *   2. res.statusCode  — set manually by older controller code (fallback)
 *   3. 500             — unexpected runtime error
 *
 * This ordering means ApiError instances need no `res.status()` call before
 * being thrown/passed to next(), while legacy code that still sets res.status()
 * manually continues to work without any changes.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode ||
    (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};