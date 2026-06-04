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

  const result = await query(
    `${ENRICHED_SELECT} GROUP BY e.id ORDER BY e.${column} ${order}`
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

export const create = async (eventData) => {
  const { organizer_id, title, description, location, event_date, total_capacity, agenda_data, category } = eventData;
  const result = await query(
    `INSERT INTO events (organizer_id, title, description, location, event_date, total_capacity, agenda_data, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [organizer_id, title, description, location, event_date, total_capacity, JSON.stringify(agenda_data || []), category || 'General']
  );
  return result.rows[0];
};