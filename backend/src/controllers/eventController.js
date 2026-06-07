import * as Event from '../models/eventModel.js';
import { validationResult } from 'express-validator';

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
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// POST /api/events
export const createEvent = async (req, res, next) => {
  // validation error check from route middleware
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
};