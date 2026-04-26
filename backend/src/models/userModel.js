import { query } from '../config/db.js';

export const findAll = async () => {
  const result = await query('SELECT id, full_name, email, role FROM users');
  return result.rows;
};