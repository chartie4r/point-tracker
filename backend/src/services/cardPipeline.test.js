import { describe, it, expect } from 'vitest';
import { CARD_FIXTURES } from '../../../test/cardFixtures.js';
import { groupCardsByStatus, computeCatalogStats } from './cardPipeline.js';

describe('cardPipeline', () => {
  describe('groupCardsByStatus', () => {
    it('returns empty arrays when given no cards', () => {
      const result = groupCardsByStatus([]);
      expect(result.open).toEqual([]);
      expect(result.closed).toEqual([]);
      expect(result.toOpen).toEqual([]);
      expect(result.refused).toEqual([]);
    });

    it('groups a single card by status', () => {
      const result = groupCardsByStatus([{ status: 'Open' }]);
      expect(result.open).toHaveLength(1);
      expect(result.closed).toHaveLength(0);
      expect(result.toOpen).toHaveLength(0);
      expect(result.refused).toHaveLength(0);
    });

    it('groups all four statuses correctly', () => {
      const cards = [
        { id: 'a', status: 'Open' },
        { id: 'b', status: 'Closed' },
        { id: 'c', status: 'To_Open' },
        { id: 'd', status: 'Refused' },
      ];
      const result = groupCardsByStatus(cards);
      expect(result.open).toHaveLength(1);
      expect(result.open[0].id).toBe('a');
      expect(result.closed).toHaveLength(1);
      expect(result.closed[0].id).toBe('b');
      expect(result.toOpen).toHaveLength(1);
      expect(result.toOpen[0].id).toBe('c');
      expect(result.refused).toHaveLength(1);
      expect(result.refused[0].id).toBe('d');
    });

    it('groups CARD_FIXTURES (20 cards) by status with correct counts', () => {
      const result = groupCardsByStatus(CARD_FIXTURES);
      const total =
        result.open.length + result.closed.length + result.toOpen.length + result.refused.length;
      expect(total).toBe(20);

      // From fixtures: Open (many), Closed (e.g. card-04, 08, 16), To_Open (02, 10, 13, 19), Refused (06, 20)
      expect(result.open.length).toBeGreaterThan(0);
      expect(result.closed.length).toBeGreaterThan(0);
      expect(result.toOpen.length).toBeGreaterThan(0);
      expect(result.refused.length).toBeGreaterThan(0);

      const openIds = result.open.map((c) => c.id);
      expect(openIds).toContain('card-01');
      expect(openIds).toContain('card-03');
      expect(openIds).not.toContain('card-02');
      expect(result.closed.map((c) => c.id)).toContain('card-04');
      expect(result.toOpen.map((c) => c.id)).toContain('card-02');
      expect(result.refused.map((c) => c.id)).toContain('card-06');
      expect(result.refused.map((c) => c.id)).toContain('card-20');
    });

    it('treats missing or empty status as unknown (not placed in any bucket)', () => {
      const cards = [{ id: 'x', status: '' }, { id: 'y' }];
      const result = groupCardsByStatus(cards);
      expect(result.open).toHaveLength(0);
      expect(result.closed).toHaveLength(0);
      expect(result.toOpen).toHaveLength(0);
      expect(result.refused).toHaveLength(0);
    });
  });

  describe('computeCatalogStats', () => {
    it('returns zeros and empty byBank when given no cards', () => {
      const result = computeCatalogStats([]);
      expect(result.totalCards).toBe(0);
      expect(result.byBank).toEqual({});
      expect(result.totalWelcomeValueY1).toBe(0);
      expect(result.withNoAnnualCost).toBe(0);
      expect(result.withWelcomeBonus).toBe(0);
    });

    it('counts one card correctly', () => {
      const cards = [
        { bank: 'AMEX', welcomeValueY1: 500, noWelcomeBonus: false, annualCost: 120 },
      ];
      const result = computeCatalogStats(cards);
      expect(result.totalCards).toBe(1);
      expect(result.byBank).toEqual({ AMEX: 1 });
      expect(result.totalWelcomeValueY1).toBe(500);
      expect(result.withWelcomeBonus).toBe(1);
      expect(result.withNoAnnualCost).toBe(0);
    });

    it('skips welcome value when noWelcomeBonus is true', () => {
      const cards = [
        { bank: 'CIBC', welcomeValueY1: 100, noWelcomeBonus: true, annualCost: 0 },
      ];
      const result = computeCatalogStats(cards);
      expect(result.totalWelcomeValueY1).toBe(0);
      expect(result.withWelcomeBonus).toBe(0);
      expect(result.withNoAnnualCost).toBe(1);
    });

    it('aggregates CARD_FIXTURES with correct total and byBank', () => {
      const result = computeCatalogStats(CARD_FIXTURES);
      expect(result.totalCards).toBe(20);
      expect(Object.keys(result.byBank).length).toBeGreaterThan(0);
      expect(result.totalWelcomeValueY1).toBeGreaterThan(0);
      expect(result.withWelcomeBonus).toBeGreaterThan(0);
      expect(result.withNoAnnualCost).toBeGreaterThan(0);

      // Sum of byBank should equal totalCards
      const sumByBank = Object.values(result.byBank).reduce((a, b) => a + b, 0);
      expect(sumByBank).toBe(20);

      // Fixtures include AMEX, RBC, CIBC, BMO, Scotia, TD, BNC, etc.
      expect(result.byBank['AMEX']).toBeGreaterThan(0);
      expect(result.byBank['RBC']).toBeGreaterThan(0);
    });

    it('uses "Other" for missing bank', () => {
      const cards = [{ bank: null }, { bank: undefined }];
      const result = computeCatalogStats(cards);
      expect(result.byBank['Other']).toBe(2);
    });
  });
});
