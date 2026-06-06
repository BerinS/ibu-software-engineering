import { pool, query } from '../config/db.js';
import ApiError from '../utils/ApiError.js';


class AdminService {

  // ── Stats ─────────────────────────────────────────────────────────────────

  /**
   * Returns top-level KPIs for the dashboard stats bar.
   * Single round-trip via correlated subqueries.
   */
  async getStats() {
    const result = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM users)                             AS total_users,
        (SELECT COUNT(*)::int FROM events)                           AS total_events,
        (SELECT COUNT(*)::int FROM events WHERE status = 'pending')  AS pending_events,
        (SELECT COUNT(*)::int FROM bookings)                         AS total_bookings
    `);
    return result.rows[0];
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUsers() {
    const result = await query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  /**
   * Update a user's role.
   * Guards: role must be a valid enum value; admin cannot change their own role   
   */
  async updateUserRole(userId, newRole, requestingUserId) {
    const VALID_ROLES = ['attendee', 'organizer', 'admin'];
    if (!VALID_ROLES.includes(newRole)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
    }
    if (Number(userId) === Number(requestingUserId)) {
      throw ApiError.forbidden('You cannot change your own role');
    }

    const result = await query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, full_name, email, role, created_at`,
      [newRole, userId]
    );
    if (!result.rows[0]) throw ApiError.notFound('User');
    return result.rows[0];
  }

  /**
   * Delete a user.
   * ON DELETE CASCADE handles all their events, bookings, and feedback
   */
  async deleteUser(userId, requestingUserId) {
    if (Number(userId) === Number(requestingUserId)) {
      throw ApiError.forbidden('You cannot delete your own account');
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    if (!result.rows[0]) throw ApiError.notFound('User');
    return { deleted: true, id: Number(userId) };
  }

  // ── Events ────────────────────────────────────────────────────────────────

 
  async getAllEvents() {
    const result = await query(`
      SELECT
        e.*,
        u.full_name  AS organizer_name,
        u.email      AS organizer_email,
        COALESCE(SUM(tt.quantity_limit), e.total_capacity)::int AS total_tickets,
        COALESCE(SUM(tt.tickets_sold), 0)::int                  AS tickets_sold_count,
        MIN(tt.price)                                           AS price_from
      FROM events e
      LEFT JOIN users        u  ON u.id         = e.organizer_id
      LEFT JOIN ticket_types tt ON tt.event_id  = e.id
      GROUP BY e.id, u.full_name, u.email
      ORDER BY
        CASE e.status
          WHEN 'pending'  THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END,
        e.created_at DESC
    `);
    return result.rows;
  }

  
  async approveEvent(eventId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock-update on the specific row; only transitions from pending
      const eventResult = await client.query(
        `UPDATE events
         SET status = 'approved'
         WHERE id = $1 AND status = 'pending'
         RETURNING *`,
        [eventId]
      );

      if (!eventResult.rows[0]) {
        // Not found OR not in pending state — distinguish for a clear message
        const check = await client.query('SELECT status FROM events WHERE id = $1', [eventId]);
        if (!check.rows[0]) throw ApiError.notFound('Event');
        throw ApiError.badRequest(`Event cannot be approved — current status is '${check.rows[0].status}'`);
      }

      const event = eventResult.rows[0];

      // Promote organizer only if still 'attendee' (idempotent for already-organizer users)
      const promotionResult = await client.query(
        `UPDATE users
         SET role = 'organizer'
         WHERE id = $1 AND role = 'attendee'
         RETURNING id, full_name`,
        [event.organizer_id]
      );

      await client.query('COMMIT');

      return {
        event,
        organizerPromoted: promotionResult.rowCount > 0,
        promotedUser:      promotionResult.rows[0] ?? null,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Reject a pending event.
   * Only transitions from 'pending' — already-approved events cannot be rejected
   * via this path (prevents accidental re-status of live events).
   */
  async rejectEvent(eventId) {
    const result = await query(
      `UPDATE events
       SET status = 'rejected'
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [eventId]
    );
    if (!result.rows[0]) {
      const check = await query('SELECT status FROM events WHERE id = $1', [eventId]);
      if (!check.rows[0]) throw ApiError.notFound('Event');
      throw ApiError.badRequest(`Event cannot be rejected — current status is '${check.rows[0].status}'`);
    }
    return result.rows[0];
  }

  /**
   * Hard-delete an event.
   * ON DELETE CASCADE on ticket_types and bookings handles cleanup.
   */
  async deleteEvent(eventId) {
    const result = await query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [eventId]
    );
    if (!result.rows[0]) throw ApiError.notFound('Event');
    return { deleted: true, id: Number(eventId) };
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  async getAllBookings() {
    const result = await query(`
      SELECT
        b.id            AS booking_id,
        b.status,
        b.booked_at,
        b.checked_in_at,
        u.id            AS user_id,
        u.full_name     AS user_name,
        u.email         AS user_email,
        e.id            AS event_id,
        e.title         AS event_title,
        e.event_date,
        tt.id           AS ticket_type_id,
        tt.name         AS ticket_type_name,
        tt.price
      FROM bookings b
      JOIN users        u  ON u.id  = b.user_id
      JOIN ticket_types tt ON tt.id = b.ticket_type_id
      JOIN events       e  ON e.id  = tt.event_id
      ORDER BY b.booked_at DESC
    `);
    return result.rows;
  }

  async deleteBooking(bookingId) {
    const result = await query(
      'DELETE FROM bookings WHERE id = $1 RETURNING id',
      [bookingId]
    );
    if (!result.rows[0]) throw ApiError.notFound('Booking');
    return { deleted: true, id: Number(bookingId) };
  }

  // ── Feedback ──────────────────────────────────────────────────────────────

  async getAllFeedback() {
    const result = await query(`
      SELECT
        f.id,
        f.rating,
        f.comment,
        f.submitted_at,
        u.id        AS user_id,
        u.full_name AS user_name,
        e.id        AS event_id,
        e.title     AS event_title
      FROM feedback f
      JOIN users  u ON u.id = f.user_id
      JOIN events e ON e.id = f.event_id
      ORDER BY f.submitted_at DESC
    `);
    return result.rows;
  }

  async deleteFeedback(feedbackId) {
    const result = await query(
      'DELETE FROM feedback WHERE id = $1 RETURNING id',
      [feedbackId]
    );
    if (!result.rows[0]) throw ApiError.notFound('Feedback');
    return { deleted: true, id: Number(feedbackId) };
  }
}

// Singleton — one instance shared across the lifetime of the process.
// The pool is already a singleton from db.js, so this is safe.
export default new AdminService();
