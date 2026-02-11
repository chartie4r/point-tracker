import { describe, it, expect } from 'vitest';
import { CARD_TYPES, CARD_STATUSES, POINTS_TYPES, BANKS, pointsTypeLabel } from './constants.js';

describe('constants', () => {
  describe('CARD_TYPES', () => {
    it('includes VISA, MASTERCARD, AMEX', () => {
      expect(CARD_TYPES).toContain('VISA');
      expect(CARD_TYPES).toContain('MASTERCARD');
      expect(CARD_TYPES).toContain('AMEX');
      expect(CARD_TYPES).toHaveLength(3);
    });
  });

  describe('CARD_STATUSES', () => {
    it('has value and label for each status', () => {
      expect(CARD_STATUSES).toEqual(
        expect.arrayContaining([
          { value: 'Open', label: 'Open' },
          { value: 'Closed', label: 'Closed' },
          { value: 'Refused', label: 'Refused' },
          { value: 'To_Open', label: 'To Open' },
        ]),
      );
      expect(CARD_STATUSES).toHaveLength(4);
    });
  });

  describe('POINTS_TYPES', () => {
    it('includes Aeroplan, Cashback, Scene, and others', () => {
      expect(POINTS_TYPES).toContain('Aeroplan');
      expect(POINTS_TYPES).toContain('Cashback');
      expect(POINTS_TYPES).toContain('Scene');
      expect(POINTS_TYPES.length).toBeGreaterThan(5);
    });
  });

  describe('BANKS', () => {
    it('includes major Canadian banks', () => {
      expect(BANKS).toContain('AMEX');
      expect(BANKS).toContain('RBC');
      expect(BANKS).toContain('TD');
      expect(BANKS).toContain('Scotia');
      expect(BANKS.length).toBeGreaterThan(0);
    });
  });

  describe('pointsTypeLabel', () => {
    it('replaces underscores with spaces', () => {
      expect(pointsTypeLabel('Marriott_Bonvoy')).toBe('Marriott Bonvoy');
      expect(pointsTypeLabel('VIP_Porter')).toBe('VIP Porter');
    });

    it('returns empty string for null/undefined', () => {
      expect(pointsTypeLabel(null)).toBe('');
      expect(pointsTypeLabel(undefined)).toBe('');
    });

    it('returns string as-is when no underscores', () => {
      expect(pointsTypeLabel('Aeroplan')).toBe('Aeroplan');
      expect(pointsTypeLabel('Cashback')).toBe('Cashback');
    });
  });
});
