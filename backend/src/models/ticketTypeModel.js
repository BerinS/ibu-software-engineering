import { query } from '../config/db.js';

export const findByEventId = async (eventId) => {
  const result = await query('SELECT * FROM ticket_types WHERE event_id = $1', [eventId]);
  return result.rows;
};

/**
 * Create a ticket type.
 *
 * @param {object}      ticketData - Fields to insert.
 * @param {object|null} client     - Optional pg client for use inside a transaction.
 *                                   When omitted the module-level pool query is used.
 */
export const create = async (ticketData, client = null) => {
  const { event_id, name, price, quantity_limit } = ticketData;
  const run = client ? (sql, params) => client.query(sql, params) : query;
  const result = await run(
    'INSERT INTO ticket_types (event_id, name, price, quantity_limit) VALUES ($1, $2, $3, $4) RETURNING *',
    [event_id, name, price, quantity_limit]
  );
  return result.rows[0];
};