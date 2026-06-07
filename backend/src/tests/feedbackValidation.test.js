import { describe, it, expect } from 'vitest';

/**
 * Test Suite 3: Feedback / rating validation
 *
 * The feedback controller validates that rating is between 1–5.
 * This suite tests that validation logic in isolation.
 */

/** Mirrors the validation in feedbackController.js */
const validateRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null; // valid
};

describe('Feedback rating validation', () => {
  it('accepts rating of 1 (minimum)', () => {
    expect(validateRating(1)).toBeNull();
  });

  it('accepts rating of 5 (maximum)', () => {
    expect(validateRating(5)).toBeNull();
  });

  it('accepts rating of 3 (midpoint)', () => {
    expect(validateRating(3)).toBeNull();
  });

  it('rejects rating of 0', () => {
    expect(validateRating(0)).not.toBeNull();
  });

  it('rejects rating of 6 (above maximum)', () => {
    expect(validateRating(6)).not.toBeNull();
  });

  it('rejects null / undefined rating', () => {
    expect(validateRating(null)).not.toBeNull();
    expect(validateRating(undefined)).not.toBeNull();
  });

  it('rejects negative rating', () => {
    expect(validateRating(-1)).not.toBeNull();
  });

  it('error message is descriptive', () => {
    const msg = validateRating(10);
    expect(msg).toBe('Rating must be between 1 and 5');
  });
});
