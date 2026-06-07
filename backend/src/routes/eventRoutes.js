import express from 'express';
import { body } from 'express-validator';
import { getEvents, getEventById, getEventTickets, createEvent } from '../controllers/eventController.js';
import { protect }           from '../middleware/authMiddleware.js';
import { uploadEventCover }  from '../middleware/upload.js';

const router = express.Router();

/**
 * After multer parses a multipart/form-data request, every text field arrives
 * in req.body as a plain string.  ticket_types was serialised as a JSON string
 * on the client; this middleware deserialises it back to an array so that
 * express-validator's wildcard rules (ticket_types.*) see the correct shape.
 */
const parseMultipartJson = (req, _res, next) => {
  if (typeof req.body.ticket_types === 'string') {
    try {
      req.body.ticket_types = JSON.parse(req.body.ticket_types);
    } catch {
      // Malformed JSON — leave undefined so validation rejects it
      req.body.ticket_types = undefined;
    }
  }
  next();
};

/**
 * Validation rules for POST /api/events.
 *
 * organizer_id is sourced from req.user in the controller — never accepted from
 * the request body (prevents ID spoofing).
 *
 * ticket_types is optional.  Individual item validators only run when the array
 * is present and non-empty (express-validator wildcard behaviour).
 *
 * A cross-field validator ensures that the sum of ticket quantities cannot
 * exceed total_capacity before the request ever reaches the controller.
 */
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be 5–255 characters'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Description must be 3,000 characters or fewer'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 255 })
    .withMessage('Location must be 255 characters or fewer'),

  body('total_capacity')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Capacity must be between 1 and 100,000'),

  body('event_date')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) throw new Error('Event date must be in the future');
      return true;
    }),

  body('category')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['General', 'Technology', 'Music', 'Business', 'Sports', 'Arts',
           'Food & Drink', 'Health & Wellness', 'Education', 'Community'])
    .withMessage('Invalid category'),

  // ── Ticket types ────────────────────────────────────────────────────────────

  body('ticket_types')
    .optional()
    .isArray({ max: 10 })
    .withMessage('At most 10 ticket types allowed'),

  body('ticket_types.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ticket type name is required')
    .isLength({ max: 50 })
    .withMessage('Ticket type name must be 50 characters or fewer'),

  body('ticket_types.*.price')
    .isFloat({ min: 0, max: 99999.99 })
    .withMessage('Price must be between 0 and 99,999.99'),

  body('ticket_types.*.quantity_limit')
    .isInt({ min: 1 })
    .withMessage('Ticket quantity must be at least 1'),

  // Cross-field: total ticket quantities must not exceed total_capacity
  body('ticket_types')
    .optional()
    .custom((ticketTypes, { req }) => {
      if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return true;

      const cap = parseInt(req.body.total_capacity, 10);
      if (isNaN(cap)) return true; // total_capacity validator handles this separately

      const totalQty = ticketTypes.reduce((sum, tt) => {
        const qty = parseInt(tt?.quantity_limit, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      }, 0);

      if (totalQty > cap) {
        throw new Error(
          `Total ticket quantity (${totalQty}) exceeds event capacity (${cap})`
        );
      }
      return true;
    }),
];

// Middleware order matters:
//  1. protect          — verify JWT, attach req.user
//  2. uploadEventCover — parse multipart body, save file → req.file, text → req.body
//  3. parseMultipartJson — deserialise ticket_types JSON string → array
//  4. validateEvent    — run all validation rules against the now-shaped req.body
//  5. createEvent      — business logic

router.route('/')
  .get(getEvents)
  .post(protect, uploadEventCover, parseMultipartJson, validateEvent, createEvent);

router.route('/:id')
  .get(getEventById);

router.route('/:id/tickets')
  .get(getEventTickets);

export default router;
