import { describe, it, expect } from 'vitest';

/**
 * Test Suite 4: Event capacity vs ticket-type quantity validation
 *
 * The event creation route has a cross-field validator that ensures the sum
 * of all ticket-type quantities does not exceed the event's total_capacity.
 * This suite tests that cross-field rule in isolation.
 */

/** Mirrors the cross-field validator in eventRoutes.js */
const validateTicketCapacity = (totalCapacity, ticketTypes) => {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return null;

  const cap = parseInt(totalCapacity, 10);
  if (isNaN(cap)) return null; // let individual validators catch this

  const totalQty = ticketTypes.reduce((sum, tt) => {
    const qty = parseInt(tt?.quantity_limit, 10);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);

  if (totalQty > cap) {
    return `Total ticket quantity (${totalQty}) exceeds event capacity (${cap})`;
  }
  return null;
};

describe('Event capacity vs ticket-type quantity cross-field validation', () => {
  it('passes when total ticket quantities equal capacity', () => {
    const ticketTypes = [
      { name: 'VIP',     quantity_limit: 50 },
      { name: 'Regular', quantity_limit: 50 },
    ];
    expect(validateTicketCapacity(100, ticketTypes)).toBeNull();
  });

  it('passes when total ticket quantities are less than capacity', () => {
    const ticketTypes = [{ name: 'General', quantity_limit: 80 }];
    expect(validateTicketCapacity(200, ticketTypes)).toBeNull();
  });

  it('fails when ticket quantities exceed capacity', () => {
    const ticketTypes = [
      { name: 'VIP',     quantity_limit: 60 },
      { name: 'Regular', quantity_limit: 60 },
    ];
    const result = validateTicketCapacity(100, ticketTypes);
    expect(result).not.toBeNull();
    expect(result).toContain('120');
    expect(result).toContain('100');
  });

  it('passes when no ticket types are defined', () => {
    expect(validateTicketCapacity(500, [])).toBeNull();
    expect(validateTicketCapacity(500, null)).toBeNull();
  });

  it('ignores ticket types with invalid quantity_limit when summing', () => {
    const ticketTypes = [
      { name: 'Valid',   quantity_limit: 40 },
      { name: 'Invalid', quantity_limit: 'abc' },
    ];
    // Only 40 counted — should pass for capacity 100
    expect(validateTicketCapacity(100, ticketTypes)).toBeNull();
  });

  it('single ticket type exactly at capacity passes', () => {
    const ticketTypes = [{ name: 'General', quantity_limit: 500 }];
    expect(validateTicketCapacity(500, ticketTypes)).toBeNull();
  });

  it('single ticket type one over capacity fails', () => {
    const ticketTypes = [{ name: 'General', quantity_limit: 501 }];
    expect(validateTicketCapacity(500, ticketTypes)).not.toBeNull();
  });
});
