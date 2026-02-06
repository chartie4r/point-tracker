export const CARD_TYPES = ['VISA', 'MASTERCARD', 'AMEX'];
export const CARD_STATUSES = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Refused', label: 'Refused' },
  { value: 'To_Open', label: 'To Open' },
];
export const POINTS_TYPES = [
  'Aeroplan', 'BNC', 'Marriott_Bonvoy', 'CIBC', 'RBC', 'Cashback', 'Scene', 'TD', 'VIP_Porter',
];
export const BANKS = ['AMEX', 'BMO', 'BNC', 'CIBC', 'RBC', 'Scotia', 'TD'];

export function pointsTypeLabel(v) {
  return (v || '').replace(/_/g, ' ');
}
