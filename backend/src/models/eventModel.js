import { query } from '../config/db.js';

// Enriches each event row with aggregated ticket availability from ticket_types.
// When no ticket types exist for an event, tickets_available falls back to total_capacity.
const ENRICHED_SELECT = `
  SELECT
    e.*,
    COALESCE(SUM(tt.quantity_limit), e.total_capacity)::int          AS total_tickets,
    COALESCE(SUM(tt.tickets_sold), 0)::int                           AS tickets_sold_count,
    COALESCE(SUM(tt.quantity_limit) - SUM(tt.tickets_sold),
             e.total_capacity)::int                                  AS tickets_available,
    MIN(tt.price)                                                    AS price_from
  FROM events e
  LEFT JOIN ticket_types tt ON tt.event_id = e.id
`;

export const findAll = async (sortBy = 'event_date', sortOrder = 'DESC') => {
  const validColumns = ['title', 'event_date', 'total_capacity', 'location'];
  const validOrders = ['ASC', 'DESC'];

  const column = validColumns.includes(sortBy) ? sortBy : 'event_date';
  const order = validOrders.includes(sortOrder?.toUpperCase?.()) ? sortOrder.toUpperCase() : 'DESC';

  // Public feed: only surface approved events.
  // Admin access to all-status events goes through GET /api/admin/events.
  const result = await query(
    `${ENRICHED_SELECT} WHERE e.status = 'approved' GROUP BY e.id ORDER BY e.${column} ${order}`
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await query(
    `${ENRICHED_SELECT} WHERE e.id = $1 GROUP BY e.id`,
    [id]
  );
  return result.rows[0];
};

/**
 * Create an event.
 *
 * @param {object}      eventData - Fields to insert.
 * @param {object|null} client    - Optional pg client for use inside a transaction.
 *                                  When omitted the module-level pool query is used.
 */
export const create = async (eventData, client = null) => {
  const {
    organizer_id, title, description, location, event_date,
    total_capacity, agenda_data, category, cover_image,
  } = eventData;
  const run = client ? (sql, params) => client.query(sql, params) : query;
  const result = await run(
    `INSERT INTO events
       (organizer_id, title, description, location, event_date,
        total_capacity, agenda_data, category, cover_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      organizer_id,
      title,
      description || null,
      location,
      event_date,
      total_capacity,
      JSON.stringify(agenda_data || []),
      category || 'General',
      cover_image || null,
    ]
  );
  return result.rows[0];
};