import { query } from '../config/db.js';

export const create = async (bookingData) => {
  const { user_id, ticket_type_id, status, qr_hash } = bookingData;
  const result = await query(
    'INSERT INTO bookings (user_id, ticket_type_id, status, qr_hash) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, ticket_type_id, status, qr_hash]
  );
  return result.rows[0];
};

// Used by organizers for QR Validation
export const verifyTicket = async (qrHash) => {
  const result = await query(
    `SELECT b.*, u.full_name, e.title 
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN ticket_types tt ON b.ticket_type_id = tt.id
     JOIN events e ON tt.event_id = e.id
     WHERE b.qr_hash = $1`,
    [qrHash]
  );
  return result.rows[0];
};

// update check-in status 
export const checkIn = async (bookingId) => {
  const result = await query(
    'UPDATE bookings SET checked_in_at = NOW() WHERE id = $1 RETURNING *',
    [bookingId]
  );
  return result.rows[0];
};