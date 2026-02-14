export const CARD_TYPES = ['VISA', 'MASTERCARD', 'AMEX'];
export const CARD_STATUSES = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Refused', label: 'Refused' },
  { value: 'To_Open', label: 'To Open' },
];
export const POINTS_TYPES = [
  'Aeroplan', 'Amex_Privileges', 'Avios', 'BMO_Recompenses', 'BNC', 'Marriott_Bonvoy', 'CIBC', 'RBC', 'Cashback', 'Scene', 'TD', 'VIP_Porter', 'WestJet_Rewards',
];
export const BANKS = ['AMEX', 'BMO', 'BNC', 'CIBC', 'RBC', 'Scotia', 'TD'];

const POINTS_TYPE_LABELS = {
  Avios: 'British Airways (Avios)',
  BMO_Recompenses: 'BMO Récompenses',
  BNC: 'BNC Récompenses',
  Cashback: 'Remises en argent',
  Scene: 'Scène+',
  TD: 'Primes TD',
  WestJet_Rewards: 'Récompenses WestJet',
};

export function pointsTypeLabel(v) {
  if (!v) return '';
  if (POINTS_TYPE_LABELS[v]) return POINTS_TYPE_LABELS[v];
  return v.replace(/_/g, ' ');
}

/** Bank brand color (hex) for credit card artwork. */
export const BANK_CARD_COLORS = {
  AMEX: '#006FCF',
  BMO: '#003B71',
  BNC: '#C41E3A',
  CIBC: '#B00B1C',
  RBC: '#0C4999',
  Scotia: '#E31837',
  TD: '#00A758',
};

export function getBankCardColor(bank) {
  return BANK_CARD_COLORS[bank] || '#4a2098';
}
