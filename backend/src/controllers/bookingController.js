import { query } from '../config/db.js';
import * as Booking from '../models/bookingModel.js';
import ApiError from '../utils/ApiError.js';
import { randomUUID } from 'crypto';

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { ticket_type_id } = req.body;
    const user_id = req.user.id;

    if (!ticket_type_id) throw ApiError.badRequest('ticket_type_id is required');

    // Check ticket availability
    const ttResult = await query(
      'SELECT * FROM ticket_types WHERE id = $1',
      [ticket_type_id]
    );
    const tt = ttResult.rows[0];
    if (!tt) throw ApiError.notFound('Ticket type');

    const available = tt.quantity_limit - tt.tickets_sold;
    if (available <= 0) throw ApiError.badRequest('No tickets available');

    // Check if user already booked this ticket type
    const existing = await query(
      'SELECT id FROM bookings WHERE user_id = $1 AND ticket_type_id = $2',
      [user_id, ticket_type_id]
    );
    if (existing.rows.length > 0) throw ApiError.badRequest('You already have a ticket for this event');

    // Generate unique QR hash
    const qr_hash = randomUUID();

    // Create booking
    const booking = await Booking.create({ user_id, ticket_type_id, status: 'confirmed', qr_hash });

    // Increment tickets_sold
    await query(
      'UPDATE ticket_types SET tickets_sold = tickets_sold + 1 WHERE id = $1',
      [ticket_type_id]
    );

    res.status(201).json({ ...booking, qr_hash });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id/attendees  (organizer only)
export const getEventAttendees = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         u.id, u.full_name, u.email,
         b.id        AS booking_id,
         b.status,
         b.booked_at,
         b.checked_in_at,
         tt.name     AS ticket_type_name,
         tt.price
       FROM bookings b
       JOIN users        u  ON u.id  = b.user_id
       JOIN ticket_types tt ON tt.id = b.ticket_type_id
       WHERE tt.event_id = $1
       ORDER BY b.booked_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
