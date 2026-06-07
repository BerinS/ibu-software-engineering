import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * protect — verifies the Bearer JWT in the Authorization header.
 * On success, attaches req.user = { id, full_name, email, role }.
 * On failure, passes a 401 error to the next error handler.
 */
export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Not authorised — no token provided'));
  }

  try {
    const token = auth.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (!result.rows[0]) {
      return next(ApiError.unauthorized('Not authorised — user no longer exists'));
    }

    req.user = result.rows[0];
    next();
  } catch {
    next(ApiError.unauthorized('Not authorised — invalid or expired token'));
  }
};

/**
 * requireRole(...roles) — role guard, always used after protect().
 * Example: router.delete('/...', protect, requireRole('admin'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  next(ApiError.forbidden(`Access denied — requires role: ${roles.join(' or ')}`));
};
