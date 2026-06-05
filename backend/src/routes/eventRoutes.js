import express from 'express';
import { body, validationResult } from 'express-validator';
import { getEvents, getEventById, createEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const validateEvent = [
  // organizer_id - from req.user.id in the controller.
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 chars'),
  body('total_capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('event_date').isISO8601().toDate().custom((value) => {
    if (value < new Date()) {
      throw new Error('Event date must be in the future');
    }
    return true;
  }),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must be 50 chars or fewer'),
];

router.route('/')
  .get(getEvents)
  .post(protect, validateEvent, createEvent); // protect: must be logged in to create

router.route('/:id')
  .get(getEventById);

export default router;