import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createBooking, checkInBooking } from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/bookings          — create a booking (authenticated user)
router.post('/', protect, createBooking);

// POST /api/bookings/checkin  — verify QR and check in attendee (organizer/admin)
router.post('/checkin', protect, checkInBooking);

export default router;
