import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

/**
 * protect — verifies the Bearer JWT in the Authorization header.
 * On success, attaches req.user = { id, full_name, email, role }.
 * On failure, passes a 401 error to the next error handler.
 */
export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorised — no token provided'));
  }

  try {
    const token = auth.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, full_name, email, role FROM users WHERE id = $1',
      [id]
    );

    if (!result.rows[0]) {
      res.status(401);
      return next(new Error('Not authorised — user no longer exists'));
    }

    req.user = result.rows[0];
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorised — invalid or expired token'));
  }
};

/**
 * requireRole(...roles) — role guard, always used after protect().
 * Example: router.delete('/...', protect, requireRole('admin'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  res.status(403);
  next(new Error(`Access denied — requires role: ${roles.join(' or ')}`));
};
