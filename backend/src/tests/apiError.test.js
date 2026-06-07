import { describe, it, expect } from 'vitest';
import ApiError from '../utils/ApiError.js';

/**
 * Test Suite 1: ApiError utility (Factory Method pattern)
 *
 * Tests the core error-creation factory that is used throughout all controllers.
 * These are pure unit tests — no database or HTTP server involved.
 */
describe('ApiError — factory methods', () => {
  it('badRequest creates a 400 error with the given message', () => {
    const err = ApiError.badRequest('Invalid input');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.isApiError).toBe(true);
    expect(err.name).toBe('ApiError');
  });

  it('unauthorized creates a 401 error', () => {
    const err = ApiError.unauthorized('Token expired');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token expired');
  });

  it('forbidden creates a 403 error', () => {
    const err = ApiError.forbidden('Access denied');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Access denied');
  });

  it('notFound creates a 404 error and appends "not found" to the resource name', () => {
    const err = ApiError.notFound('Event');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Event not found');
  });

  it('internal creates a 500 error', () => {
    const err = ApiError.internal('Something crashed');
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Something crashed');
  });

  it('uses default messages when no argument is provided', () => {
    expect(ApiError.badRequest().message).toBe('Bad request');
    expect(ApiError.unauthorized().message).toBe('Not authorised');
    expect(ApiError.forbidden().message).toBe('Access denied');
    expect(ApiError.notFound().message).toBe('Resource not found');
    expect(ApiError.internal().message).toBe('Internal server error');
  });

  it('is instanceof Error so it can be caught with try/catch', () => {
    const err = ApiError.badRequest('test');
    expect(err instanceof Error).toBe(true);
  });
});
