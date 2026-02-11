import { describe, it, expect } from 'vitest';
import { getBankLogoUrl, getBankInitials, getCardNetworkLogoUrl } from './logos.js';

describe('logos', () => {
  describe('getBankLogoUrl', () => {
    it('returns local logo path for known bank', () => {
      expect(getBankLogoUrl('AMEX')).toBe('/logos/banks/AMEX.svg');
      expect(getBankLogoUrl('RBC')).toBe('/logos/banks/RBC.svg');
      expect(getBankLogoUrl('Scotia')).toBe('/logos/banks/Scotia.svg');
      expect(getBankLogoUrl('TD')).toBe('/logos/banks/TD.svg');
      expect(getBankLogoUrl('BMO')).toBe('/logos/banks/BMO.svg');
      expect(getBankLogoUrl('BNC')).toBe('/logos/banks/BNC.svg');
      expect(getBankLogoUrl('CIBC')).toBe('/logos/banks/CIBC.svg');
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
    it('returns CDN URL for visa, mastercard, amex', () => {
      expect(getCardNetworkLogoUrl('VISA')).toBe('https://cdn.worldvectorlogo.com/logos/visa-10.svg');
      expect(getCardNetworkLogoUrl('MASTERCARD')).toBe('https://cdn.worldvectorlogo.com/logos/mastercard-modern-design-.svg');
      expect(getCardNetworkLogoUrl('AMEX')).toBe('https://cdn.worldvectorlogo.com/logos/american-express-stacked.svg');
    });

    it('returns null for unknown type', () => {
      expect(getCardNetworkLogoUrl('OTHER')).toBeNull();
      expect(getCardNetworkLogoUrl('')).toBeNull();
      expect(getCardNetworkLogoUrl(null)).toBeNull();
    });
  });
});
