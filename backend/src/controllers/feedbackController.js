import { query } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

// POST /api/events/:id/feedback
export const submitFeedback = async (req, res, next) => {
  try {
    const event_id = req.params.id;
    const user_id  = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    // Check user has a booking for this event
    const bookingCheck = await query(
      `SELECT b.id FROM bookings b
       JOIN ticket_types tt ON tt.id = b.ticket_type_id
       WHERE tt.event_id = $1 AND b.user_id = $2`,
      [event_id, user_id]
    );
    if (bookingCheck.rows.length === 0) {
      throw ApiError.forbidden('You can only leave feedback for events you attended');
    }

    const result = await query(
      `INSERT INTO feedback (event_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (event_id, user_id) DO UPDATE SET rating = $3, comment = $4
       RETURNING *`,
      [event_id, user_id, rating, comment || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/feedback  — all feedback across organizer's events
export const getOrganizerFeedback = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         f.id, f.rating, f.comment, f.submitted_at,
         u.full_name  AS user_name,
         e.id         AS event_id,
         e.title      AS event_title,
         ROUND(AVG(f2.rating) FILTER (WHERE f2.event_id = f.event_id), 1) AS event_avg_rating
       FROM feedback f
       JOIN users  u  ON u.id  = f.user_id
       JOIN events e  ON e.id  = f.event_id
       JOIN feedback f2 ON f2.event_id = f.event_id
       WHERE e.organizer_id = $1
       GROUP BY f.id, u.full_name, e.id, e.title
       ORDER BY f.submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id/feedback
export const getEventFeedback = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         f.id, f.rating, f.comment, f.submitted_at,
         u.full_name AS user_name,
         ROUND(AVG(f2.rating) OVER (), 1) AS avg_rating
       FROM feedback f
       JOIN users u ON u.id = f.user_id
       JOIN feedback f2 ON f2.event_id = f.event_id
       WHERE f.event_id = $1
       ORDER BY f.submitted_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
