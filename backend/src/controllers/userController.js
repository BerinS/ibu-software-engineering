import * as User from '../models/userModel.js';
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

// ── helpers ────────────────────────────────────────────────────────────────

const safeUser = (user, token) => ({
  id:         user.id,
  full_name:  user.full_name,
  email:      user.email,
  role:       user.role,
  created_at: user.created_at ?? null,
  token,
});

// ── Auth ───────────────────────────────────────────────────────────────────

// POST /api/users/register
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { full_name, email, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      throw ApiError.badRequest('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Role is always 'attendee' on self-registration
    // Admins promote users to 'organizer' after approving their first event
    const user = await User.create({ full_name, email, password_hash, role: 'attendee' });

    res.status(201).json(safeUser(user, generateToken(user.id)));
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return res.json(safeUser(user, generateToken(user.id)));
    }

    throw ApiError.unauthorized('Invalid email or password');
  } catch (error) {
    next(error);
  }
};

// ── Authenticated user ─────────────────────────────────────────────────────

// GET /api/users/me
// profile of the currently authenticated user
export const getMe = (req, res) => {
  res.json(req.user); // attached by protect()
};

// GET /api/users/me/events
// events for which the logged-in user is organizer
export const getMyEvents = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         e.*,
         COALESCE(SUM(tt.quantity_limit), e.total_capacity)::int          AS total_tickets,
         COALESCE(SUM(tt.tickets_sold), 0)::int                           AS tickets_sold_count,
         COALESCE(SUM(tt.quantity_limit) - SUM(tt.tickets_sold),
                  e.total_capacity)::int                                  AS tickets_available,
         MIN(tt.price)                                                    AS price_from
       FROM events e
       LEFT JOIN ticket_types tt ON tt.event_id = e.id
       WHERE e.organizer_id = $1
       GROUP BY e.id
       ORDER BY e.event_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me/bookings
// logged-in user's bookings 
export const getMyBookings = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         b.id             AS booking_id,
         b.status,
         b.booked_at,
         b.qr_hash,
         e.id             AS event_id,
         e.title,
         e.location,
         e.event_date,
         e.category,
         tt.name          AS ticket_type_name,
         tt.price
       FROM bookings b
       JOIN ticket_types tt ON tt.id  = b.ticket_type_id
       JOIN events e        ON e.id   = tt.event_id
       WHERE b.user_id = $1
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /api/users  
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/profile/:id  any authenticated user
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('User');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
