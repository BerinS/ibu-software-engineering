import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test Suite 5: User model — findByEmail / create (mocked db)
 *
 * Tests the User model functions using a mocked database layer so that no
 * real PostgreSQL connection is required. The mock replaces `../config/db.js`
 * with a controlled stub.
 */

// ── Mock the database module ───────────────────────────────────────────────
vi.mock('../config/db.js', () => ({
  query: vi.fn(),
}));

import { query } from '../config/db.js';
import * as UserModel from '../models/userModel.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('User model — findByEmail', () => {
  it('returns the user row when found', async () => {
    const mockUser = { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'attendee' };
    query.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await UserModel.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(query).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('email'),
      ['test@example.com']
    );
  });

  it('returns undefined when user does not exist', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const result = await UserModel.findByEmail('nobody@example.com');
    expect(result).toBeUndefined();
  });
});

describe('User model — create', () => {
  it('inserts a new user and returns the created row', async () => {
    const newUser = {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: 'hashed_password_123',
    };
    const createdRow = { id: 42, ...newUser, role: 'attendee', created_at: new Date() };
    query.mockResolvedValueOnce({ rows: [createdRow] });

    const result = await UserModel.create(newUser);
    expect(result).toEqual(createdRow);
    expect(query).toHaveBeenCalledOnce();
    // Ensure password_hash (not plain password) is passed to the query
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT'),
      expect.arrayContaining(['jane@example.com', 'hashed_password_123'])
    );
  });

  it('propagates database errors', async () => {
    query.mockRejectedValueOnce(new Error('DB connection failed'));

    await expect(
      UserModel.create({ full_name: 'X', email: 'x@x.com', password_hash: 'h' })
    ).rejects.toThrow('DB connection failed');
  });
});

describe('User model — findById', () => {
  it('returns the user by id', async () => {
    const mockUser = { id: 5, email: 'user5@example.com', full_name: 'User Five', role: 'organizer' };
    query.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await UserModel.findById(5);
    expect(result).toEqual(mockUser);
    expect(query).toHaveBeenCalledWith(expect.any(String), [5]);
  });

  it('returns undefined when id does not exist', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const result = await UserModel.findById(9999);
    expect(result).toBeUndefined();
  });
});
