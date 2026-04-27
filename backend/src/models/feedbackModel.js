import { query } from '../config/db.js';

export const create = async (feedbackData) => {
  const { event_id, user_id, rating, comment } = feedbackData;
  const result = await query(
    'INSERT INTO feedback (event_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [event_id, user_id, rating, comment]
  );
  return result.rows[0];
};

export const getEventRatings = async (eventId) => {
  const result = await query(
    'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM feedback WHERE event_id = $1',
    [eventId]
  );
  return result.rows[0];
};