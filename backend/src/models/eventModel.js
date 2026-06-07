import { query } from '../config/db.js';

export const findAll = async (sortBy = 'event_date', sortOrder = 'DESC') => {
  // SQL injection prevention
  const validColumns = ['title', 'event_date', 'total_capacity', 'location'];
  const validOrders = ['ASC', 'DESC'];

  const column = validColumns.includes(sortBy) ? sortBy : 'event_date';
  const order = validOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  // query construction with dynamic sorting
  const result = await query(`SELECT * FROM events ORDER BY ${column} ${order}`);
  return result.rows;
};

export const findById = async (id) => {
  const result = await query('SELECT * FROM events WHERE id = $1', [id]);
  return result.rows[0];
};

export const create = async (eventData) => {
  const { organizer_id, title, description, location, event_date, total_capacity, agenda_data } = eventData;
  const result = await query(
    `INSERT INTO events (organizer_id, title, description, location, event_date, total_capacity, agenda_data) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [organizer_id, title, description, location, event_date, total_capacity, JSON.stringify(agenda_data)]
  );
  return result.rows[0];
};