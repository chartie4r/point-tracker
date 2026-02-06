/**
 * Local logo paths (public/logos/). No external API dependency.
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

export function getCardNetworkLogoUrl(type) {
  if (!type) return null;
  const key = String(type).toLowerCase().replace(/\s/g, '');
  if (key === 'visa' || key === 'mastercard' || key === 'amex') {
    return `/logos/cards/${key}.svg`;
  }
  return null;
}
