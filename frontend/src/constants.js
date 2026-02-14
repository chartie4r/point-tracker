export const CARD_TYPES = ['VISA', 'MASTERCARD', 'AMEX'];
export const CARD_STATUSES = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Refused', label: 'Refused' },
  { value: 'To_Open', label: 'To Open' },
];
export const POINTS_TYPES = [
  'Aeroplan', 'Amex_Privileges', 'BNC', 'Marriott_Bonvoy', 'CIBC', 'RBC', 'Cashback', 'Scene', 'TD', 'VIP_Porter',
];
export const BANKS = ['AMEX', 'BMO', 'BNC', 'CIBC', 'RBC', 'Scotia', 'TD'];

/** Bank brand color (hex) for credit card artwork. Used on catalogue and card details. */
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

export function pointsTypeLabel(v) {
  return (v || '').replace(/_/g, ' ');
}

/** Accent/tint key for card UI (ContentCard tint, ProgressBar variant). One per points type. */
const POINTS_TYPE_ACCENT = {
  Aeroplan: 'violet',
  Amex_Privileges: 'sky',
  BNC: 'emerald',
  Marriott_Bonvoy: 'amber',
  CIBC: 'sky',
  RBC: 'rose',
  Cashback: 'teal',
  Scene: 'indigo',
  TD: 'fuchsia',
  VIP_Porter: 'cyan',
};

export function getPointsTypeAccent(pointsType) {
  return POINTS_TYPE_ACCENT[pointsType] || 'violet';
}
