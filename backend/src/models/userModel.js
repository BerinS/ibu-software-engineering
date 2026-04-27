import { query } from '../config/db.js';

export const findAll = async () => {
  const result = await query('SELECT id, full_name, email, role, created_at FROM users');
  return result.rows;
};

export const findById = async (id) => {
  const result = await query('SELECT id, full_name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const findByEmail = async (email) => {
  // fetching password_hash for login verification
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const create = async ({ full_name, email, password_hash, role }) => {
  const result = await query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
    [full_name, email, password_hash, role || 'attendee']
  );
  return result.rows[0];
};