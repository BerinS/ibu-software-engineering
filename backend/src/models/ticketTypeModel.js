import { query } from '../config/db.js';

export const findByEventId = async (eventId) => {
  const result = await query('SELECT * FROM ticket_types WHERE event_id = $1', [eventId]);
  return result.rows;
};

export const create = async (ticketData) => {
  const { event_id, name, price, quantity_limit } = ticketData;
  const result = await query(
    'INSERT INTO ticket_types (event_id, name, price, quantity_limit) VALUES ($1, $2, $3, $4) RETURNING *',
    [event_id, name, price, quantity_limit]
  );
  return result.rows[0];
};