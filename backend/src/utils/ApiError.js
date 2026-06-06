/**
 * ApiError — Factory Method pattern for HTTP error creation.
 *
 * Problem it solves: error creation was inconsistent across the codebase.
 * Some controllers manually called `res.status(N)` before throwing a plain
 * `new Error(msg)`. The AdminService used private helper methods that
 * duplicated the same shape. Every pattern was slightly different, making
 * the error-handling flow hard to reason about.
 *
 * Solution: one class, one place. Every intentional HTTP error in the system
 * is created through a static factory method here. Each instance carries a
 * `statusCode` property that the errorHandler reads directly — no need for
 * the controller to call `res.status()` before throwing.
 *
 * Usage:
 *   throw ApiError.notFound('Event');
 *   throw ApiError.badRequest('Email already in use');
 *   return next(ApiError.unauthorized('Token expired'));
 *
 * The `isApiError` flag lets the errorHandler (or future logging middleware)
 * distinguish expected domain errors from unexpected runtime crashes.
 */
class ApiError extends Error {
  /**
   * @param {string} message    - Human-readable error description
   * @param {number} statusCode - HTTP status code to send in the response
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
    this.name = 'ApiError';

    // Maintains a clean stack trace in V8 (Node.js / Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Factory methods ────────────────────────────────────────────────────────

  /** 400 — malformed input or a violated business rule */
  static badRequest(message = 'Bad request') {
    return new ApiError(message, 400);
  }

  /** 401 — missing, invalid, or expired credentials */
  static unauthorized(message = 'Not authorised') {
    return new ApiError(message, 401);
  }

  /** 403 — authenticated but not permitted */
  static forbidden(message = 'Access denied') {
    return new ApiError(message, 403);
  }

  /** 404 — resource does not exist */
  static notFound(resource = 'Resource') {
    return new ApiError(`${resource} not found`, 404);
  }

  /** 500 — unexpected server-side failure */
  static internal(message = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

export default ApiError;
