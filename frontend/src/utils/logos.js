/**
 * Bank logos (local SVGs from public/logos/banks/).
 * Sourced from the same brands as Brandfetch: TD, AMEX, BMO, BNC, CIBC, RBC, Scotia.
 * Refresh with: node backend/scripts/fetch-brandfetch-logos.js (downloads from Wikimedia/Wikipedia).
 */
const BANK_LOGO_IDS = ['AMEX', 'BMO', 'BNC', 'CIBC', 'RBC', 'Scotia', 'TD'];

export function getBankLogoUrl(bank) {
  if (!bank) return null;
  const id = BANK_LOGO_IDS.find((b) => b === bank);
  if (!id) return null;
  return `/logos/banks/${encodeURIComponent(id)}.svg`;
}

export function getBankInitials(bank) {
  if (!bank) return '?';
  return bank.length >= 2 ? bank.slice(0, 2) : bank;
}

/** Card network logo URLs (local assets in public/logos/cards/). */
const CARD_NETWORK_LOGO_URLS = {
  visa: '/logos/cards/new_visa.svg',
  mastercard: '/logos/cards/new_mastercard.svg',
  amex: '/logos/cards/new_amex.svg',
};

export function getCardNetworkLogoUrl(type) {
  if (!type) return null;
  const key = String(type).toLowerCase().replace(/\s/g, '');
  return CARD_NETWORK_LOGO_URLS[key] ?? null;
}
