import * as Event      from '../models/eventModel.js';
import * as TicketType from '../models/ticketTypeModel.js';

import { pool, query } from '../config/db.js';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// GET /api/events?sortBy=title&order=asc
export const getEvents = async (req, res, next) => {
  try {
    const { sortBy, order } = req.query;
    const events = await Event.findAll(sortBy, order);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id/tickets
export const getEventTickets = async (req, res, next) => {
  try {
    const tickets = await TicketType.findByEventId(req.params.id);
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) throw ApiError.notFound('Event');
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id  — organizer updates their own event
export const updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;
    const role    = req.user.role;

    // Fetch existing event
    const existing = await Event.findById(eventId);
    if (!existing) throw ApiError.notFound('Event');

    // Only the organizer or an admin can edit
    if (role !== 'admin' && existing.organizer_id !== userId) {
      throw ApiError.forbidden('You do not have permission to edit this event');
    }

    const { title, description, location, event_date, total_capacity, category, speakers_data, custom_fields } = req.body;

    const result = await query(
      `UPDATE events
         SET title          = COALESCE($1, title),
             description    = COALESCE($2, description),
             location       = COALESCE($3, location),
             event_date     = COALESCE($4, event_date),
             total_capacity = COALESCE($5, total_capacity),
             category       = COALESCE($6, category),
             speakers_data  = COALESCE($7, speakers_data),
             custom_fields  = COALESCE($8, custom_fields)
       WHERE id = $9
       RETURNING *`,
      [
        title        || null,
        description  !== undefined ? description : null,
        location     || null,
        event_date   || null,
        total_capacity ? parseInt(total_capacity, 10) : null,
        category     || null,
        speakers_data !== undefined ? JSON.stringify(speakers_data) : null,
        custom_fields !== undefined ? JSON.stringify(custom_fields) : null,
        eventId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/events/:id/cancel  — organizer cancels their own event
export const cancelEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;
    const role    = req.user.role;

    const existing = await Event.findById(eventId);
    if (!existing) throw ApiError.notFound('Event');

    if (role !== 'admin' && existing.organizer_id !== userId) {
      throw ApiError.forbidden('You do not have permission to cancel this event');
    }

    const result = await query(
      `UPDATE events SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [eventId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events  (protected — req.user is set by authMiddleware)
 *
 * Accepts an optional `ticket_types` array in the request body.
 *
 */
export const createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // cover_image filename comes from multer (req.file)
  const { ticket_types, ...eventBody } = req.body;
  const eventData = {
    ...eventBody,
    organizer_id: req.user.id,
    cover_image:  req.file?.filename ?? null,
  };
  const normalizedTicketTypes = Array.isArray(ticket_types) ? ticket_types : [];

  // ── Fast path: no ticket types ─────────────────────────────────────────────
  if (normalizedTicketTypes.length === 0) {
    try {
      const newEvent = await Event.create(eventData);
      return res.status(201).json(newEvent);
    } catch (error) {
      return next(error);
    }
  }

  // ── Transactional path: create event + all ticket types atomically ─────────
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newEvent = await Event.create(eventData, client);

    const createdTicketTypes = [];
    for (const tt of normalizedTicketTypes) {
      const created = await TicketType.create(
        {
          event_id:       newEvent.id,
          name:           tt.name.trim(),
          price:          Number(tt.price) || 0,
          quantity_limit: parseInt(tt.quantity_limit, 10),
        },
        client
      );
      createdTicketTypes.push(created);
    }

    await client.query('COMMIT');
    res.status(201).json({ ...newEvent, ticket_types: createdTicketTypes });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
