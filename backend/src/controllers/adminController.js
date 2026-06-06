import { validationResult } from 'express-validator';
import adminService from '../services/adminService.js';

// ── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Forwards service errors to the Express error handler.
 * AdminService attaches a .statusCode property to domain errors so the
 * errorHandler can return the correct HTTP status code.
 */
const handleError = (err, res, next) => {
  res.status(err.statusCode || 500);
  next(err);
};

/** Checks express-validator results and short-circuits with 400 if invalid. */
const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

// ── Stats ──────────────────────────────────────────────────────────────────

export const getStats = async (req, res, next) => {
  try {
    res.json(await adminService.getStats());
  } catch (err) { handleError(err, res, next); }
};

// ── Users ──────────────────────────────────────────────────────────────────

export const getUsers = async (req, res, next) => {
  try {
    res.json(await adminService.getUsers());
  } catch (err) { handleError(err, res, next); }
};

export const updateUserRole = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    const updated = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user.id          // requesting admin — used for self-change guard
    );
    res.json(updated);
  } catch (err) { handleError(err, res, next); }
};

export const deleteUser = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.deleteUser(req.params.id, req.user.id));
  } catch (err) { handleError(err, res, next); }
};

// ── Events ─────────────────────────────────────────────────────────────────

export const getAllEvents = async (req, res, next) => {
  try {
    res.json(await adminService.getAllEvents());
  } catch (err) { handleError(err, res, next); }
};

export const approveEvent = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.approveEvent(req.params.id));
  } catch (err) { handleError(err, res, next); }
};

export const rejectEvent = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.rejectEvent(req.params.id));
  } catch (err) { handleError(err, res, next); }
};

export const deleteEvent = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.deleteEvent(req.params.id));
  } catch (err) { handleError(err, res, next); }
};

// ── Bookings ───────────────────────────────────────────────────────────────

export const getAllBookings = async (req, res, next) => {
  try {
    res.json(await adminService.getAllBookings());
  } catch (err) { handleError(err, res, next); }
};

export const deleteBooking = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.deleteBooking(req.params.id));
  } catch (err) { handleError(err, res, next); }
};

// ── Feedback ───────────────────────────────────────────────────────────────

export const getAllFeedback = async (req, res, next) => {
  try {
    res.json(await adminService.getAllFeedback());
  } catch (err) { handleError(err, res, next); }
};

export const deleteFeedback = async (req, res, next) => {
  if (!checkValidation(req, res)) return;
  try {
    res.json(await adminService.deleteFeedback(req.params.id));
  } catch (err) { handleError(err, res, next); }
};
