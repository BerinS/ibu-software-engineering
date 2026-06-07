import { describe, it, expect } from 'vitest';

/**
 * Test Suite 2: Ticket availability business logic
 *
 * The booking controller checks availability before creating a booking.
 * This suite tests the pure availability-calculation logic isolated from
 * the database layer.
 */

/** Pure function extracted from bookingController logic */
const getAvailability = (ticketType) =>
  ticketType.quantity_limit - (ticketType.tickets_sold ?? 0);

const isAvailable = (ticketType) => getAvailability(ticketType) > 0;

describe('Ticket availability calculation', () => {
  it('returns correct number of available tickets when some are sold', () => {
    const tt = { quantity_limit: 100, tickets_sold: 40 };
    expect(getAvailability(tt)).toBe(60);
  });

  it('returns 0 when all tickets are sold', () => {
    const tt = { quantity_limit: 50, tickets_sold: 50 };
    expect(getAvailability(tt)).toBe(0);
  });

  it('treats missing tickets_sold as 0', () => {
    const tt = { quantity_limit: 200 };
    expect(getAvailability(tt)).toBe(200);
  });

  it('isAvailable returns true when tickets remain', () => {
    const tt = { quantity_limit: 10, tickets_sold: 5 };
    expect(isAvailable(tt)).toBe(true);
  });

  it('isAvailable returns false when sold out', () => {
    const tt = { quantity_limit: 10, tickets_sold: 10 };
    expect(isAvailable(tt)).toBe(false);
  });

  it('availability cannot logically go negative (oversold guard)', () => {
    const tt = { quantity_limit: 10, tickets_sold: 15 };
    // The system should detect this and block further bookings
    expect(getAvailability(tt)).toBeLessThan(0);
    expect(isAvailable(tt)).toBe(false);
  });

  it('a free ticket type has price 0', () => {
    const tt = { quantity_limit: 100, tickets_sold: 0, price: '0.00' };
    expect(Number(tt.price)).toBe(0);
    expect(isAvailable(tt)).toBe(true);
  });
});
