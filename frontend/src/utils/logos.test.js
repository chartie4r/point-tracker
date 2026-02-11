import { describe, it, expect } from 'vitest';
import { getBankLogoUrl, getBankInitials, getCardNetworkLogoUrl } from './logos.js';

describe('logos', () => {
  describe('getBankLogoUrl', () => {
    it('returns path for known bank', () => {
      expect(getBankLogoUrl('AMEX')).toBe('/logos/banks/AMEX.svg');
      expect(getBankLogoUrl('RBC')).toBe('/logos/banks/RBC.svg');
      expect(getBankLogoUrl('Scotia')).toBe('/logos/banks/Scotia.svg');
    });

    it('returns null for unknown bank', () => {
      expect(getBankLogoUrl('HSBC')).toBeNull();
      expect(getBankLogoUrl('')).toBeNull();
      expect(getBankLogoUrl(null)).toBeNull();
    });
  });

  describe('getBankInitials', () => {
    it('returns first two characters for long name', () => {
      expect(getBankInitials('AMEX')).toBe('AM');
      expect(getBankInitials('RBC')).toBe('RB');
    });

    it('returns single char or "?" for empty', () => {
      expect(getBankInitials('')).toBe('?');
      expect(getBankInitials(null)).toBe('?');
    });
  });

  describe('getCardNetworkLogoUrl', () => {
    it('returns path for visa, mastercard, amex', () => {
      expect(getCardNetworkLogoUrl('VISA')).toBe('/logos/cards/visa.svg');
      expect(getCardNetworkLogoUrl('MASTERCARD')).toBe('/logos/cards/mastercard.svg');
      expect(getCardNetworkLogoUrl('AMEX')).toBe('/logos/cards/amex.svg');
    });

    it('returns null for unknown type', () => {
      expect(getCardNetworkLogoUrl('OTHER')).toBeNull();
      expect(getCardNetworkLogoUrl('')).toBeNull();
      expect(getCardNetworkLogoUrl(null)).toBeNull();
    });
  });
});
