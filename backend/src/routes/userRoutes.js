import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getMe,
  getMyEvents,
  getMyBookings,
  getUsers,
  getUserProfile,
} from '../controllers/userController.js';
import { getOrganizerFeedback } from '../controllers/feedbackController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Validation rules ───────────────────────────────────────────────────────

const registerValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email').trim().isEmail().withMessage('Please enter a valid email')
    .customSanitizer((v) => v.toLowerCase()),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email')
    .customSanitizer((v) => v.toLowerCase()),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Public routes ──────────────────────────────────────────────────────────

router.post('/register', registerValidation, registerUser);
router.post('/login',    loginValidation,    loginUser);

// ── Authenticated user routes ──────────────────────────────────────────────

router.get('/me',           protect, getMe);
router.get('/me/events',    protect, getMyEvents);
router.get('/me/bookings',  protect, getMyBookings);
router.get('/me/feedback',  protect, getOrganizerFeedback);

// ── Admin-only routes ──────────────────────────────────────────────────────

router.get('/', protect, requireRole('admin'), getUsers);

// ── General protected routes ───────────────────────────────────────────────

router.get('/profile/:id', protect, getUserProfile);

export default router;
