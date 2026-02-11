import { describe, it, expect } from 'vitest';
import { CARD_FIXTURES } from '../../../test/cardFixtures.js';
import { filterCards, sortCards } from './availableCardsFilter.js';

describe('availableCardsFilter', () => {
  describe('filterCards', () => {
    it('returns all cards when no filters', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: '',
        filterType: '',
        filterPointsType: '',
        filterNoAnnualCost: false,
      });
      expect(result).toHaveLength(20);
    });

    it('filters by bank', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: 'AMEX',
        filterType: '',
        filterPointsType: '',
        filterNoAnnualCost: false,
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => c.bank === 'AMEX')).toBe(true);
    });

    it('filters by type', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: '',
        filterType: 'VISA',
        filterPointsType: '',
        filterNoAnnualCost: false,
      });
      expect(result.every((c) => c.type === 'VISA')).toBe(true);
    });

    it('filters by pointsType', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: '',
        filterType: '',
        filterPointsType: 'Aeroplan',
        filterNoAnnualCost: false,
      });
      expect(result.every((c) => c.pointsType === 'Aeroplan')).toBe(true);
    });

    it('filters no annual cost', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: '',
        filterType: '',
        filterPointsType: '',
        filterNoAnnualCost: true,
      });
      expect(result.every((c) => c.annualCost == null || c.annualCost === 0)).toBe(true);
    });

    it('combines bank and no annual cost', () => {
      const result = filterCards(CARD_FIXTURES, {
        filterBank: 'AMEX',
        filterType: '',
        filterPointsType: '',
        filterNoAnnualCost: true,
      });
      expect(result.every((c) => c.bank === 'AMEX' && (c.annualCost == null || c.annualCost === 0))).toBe(true);
    });
  });

  describe('sortCards', () => {
    it('sorts by valueY1Desc (highest first)', () => {
      const result = sortCards(CARD_FIXTURES, 'valueY1Desc');
      expect(result).toHaveLength(20);
      for (let i = 1; i < result.length; i++) {
        const a = result[i - 1].welcomeValueY1 ?? -1;
        const b = result[i].welcomeValueY1 ?? -1;
        expect(a).toBeGreaterThanOrEqual(b);
      }
    });

    it('sorts by valueY1Asc (lowest first)', () => {
      const result = sortCards(CARD_FIXTURES, 'valueY1Asc');
      expect(result).toHaveLength(20);
      for (let i = 1; i < result.length; i++) {
        const a = result[i - 1].welcomeValueY1 ?? 1e9;
        const b = result[i].welcomeValueY1 ?? 1e9;
        expect(a).toBeLessThanOrEqual(b);
      }
    });

    it('sorts by name when sortOrder is empty', () => {
      const result = sortCards(CARD_FIXTURES, '');
      expect(result).toHaveLength(20);
      for (let i = 1; i < result.length; i++) {
        const a = (result[i - 1].cardName || '').toLowerCase();
        const b = (result[i].cardName || '').toLowerCase();
        expect(a <= b).toBe(true);
      }
    });

    it('does not mutate original array', () => {
      const copy = [...CARD_FIXTURES];
      const firstId = copy[0].id;
      sortCards(copy, 'valueY1Desc');
      expect(copy[0].id).toBe(firstId);
    });
  });
});
