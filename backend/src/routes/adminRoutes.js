import express from 'express';
import { param, body } from 'express-validator';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getStats,
  getUsers, updateUserRole, deleteUser,
  getAllEvents, approveEvent, rejectEvent, deleteEvent,
  getAllBookings, deleteBooking,
  getAllFeedback, deleteFeedback,
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * All routes in this file require:
 *   1. A valid JWT (protect)
 *   2. role === 'admin' (requireRole)
 *
 * Applying both as router-level middleware means it is impossible to add a
 * new route here and accidentally leave it unprotected.
 */
router.use(protect, requireRole('admin'));

// ── Validation helpers ─────────────────────────────────────────────────────

const validateId = param('id')
  .isInt({ min: 1 }).withMessage('ID must be a positive integer')
  .toInt();

const validateRole = body('role')
  .isIn(['attendee', 'organizer', 'admin'])
  .withMessage('Role must be attendee, organizer, or admin');

// ── Stats ──────────────────────────────────────────────────────────────────

router.get('/stats', getStats);

// ── Users ──────────────────────────────────────────────────────────────────

router.get('/users', getUsers);

router.patch('/users/:id/role', [validateId, validateRole], updateUserRole);

router.delete('/users/:id', [validateId], deleteUser);

// ── Events ─────────────────────────────────────────────────────────────────

router.get('/events', getAllEvents);

router.patch('/events/:id/approve', [validateId], approveEvent);

router.patch('/events/:id/reject', [validateId], rejectEvent);

router.delete('/events/:id', [validateId], deleteEvent);

// ── Bookings ───────────────────────────────────────────────────────────────

router.get('/bookings', getAllBookings);

router.delete('/bookings/:id', [validateId], deleteBooking);

// ── Feedback ───────────────────────────────────────────────────────────────

router.get('/feedback', getAllFeedback);

router.delete('/feedback/:id', [validateId], deleteFeedback);

export default router;
