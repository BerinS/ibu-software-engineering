import * as Event from '../models/eventModel.js';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// GET GET /api/events?sortBy=title&order=asc
export const getEvents = async (req, res, next) => {
  try {
    // query parameters
    const { sortBy, order } = req.query;

    const events = await Event.findAll(sortBy, order);
    
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      throw ApiError.notFound('Event');
    }

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// POST /api/events  (protected — req.user is set by authMiddleware)
export const createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // organizer_id always comes from the verified token, never from the body.
    // Accepting it from the body would allow any user to spoof another user's ID.
    const eventData = { ...req.body, organizer_id: req.user.id };
    const newEvent = await Event.create(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};