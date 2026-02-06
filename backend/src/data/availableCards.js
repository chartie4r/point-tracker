/**
 * Curated list of available credit cards (Canada). Used for "Available cards" catalog.
 * Fields: cardName, type, bank, pointsType, annualCost (optional)
 */
export const AVAILABLE_CARDS = [
  // American Express
  { cardName: 'Carte Aéroplan American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Aeroplan', annualCost: 120 },
  { cardName: 'Carte Prestige Aéroplan American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Aeroplan', annualCost: 599 },
  { cardName: 'Carte Marriott Bonvoy American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Marriott_Bonvoy', annualCost: 120 },
  { cardName: 'Carte Marriott Bonvoy Entreprise American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Marriott_Bonvoy', annualCost: 150 },
  { cardName: 'Carte Cobalt American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Aeroplan', annualCost: 156 },
  { cardName: 'Carte en Or pour PME avec primes American Express', type: 'AMEX', bank: 'AMEX', pointsType: 'Aeroplan', annualCost: 199 },
  // BMO
  { cardName: 'Carte Mastercard BMO Ascend World Elite', type: 'MASTERCARD', bank: 'BMO', pointsType: 'BNC', annualCost: 150 },
  { cardName: 'Carte BMO Récompenses World Elite', type: 'MASTERCARD', bank: 'BMO', pointsType: 'Cashback', annualCost: 120 },
  // BNC (Banque Nationale)
  { cardName: 'Carte Mastercard World Elite de la Banque Nationale', type: 'MASTERCARD', bank: 'BNC', pointsType: 'BNC', annualCost: 150 },
  { cardName: 'Carte Mastercard Platine de la Banque Nationale', type: 'MASTERCARD', bank: 'BNC', pointsType: 'BNC', annualCost: 70 },
  // CIBC
  { cardName: 'Carte Aventura Visa Infinite CIBC', type: 'VISA', bank: 'CIBC', pointsType: 'CIBC', annualCost: 139 },
  { cardName: 'Carte Aventura Visa Infinite Privilege CIBC', type: 'VISA', bank: 'CIBC', pointsType: 'CIBC', annualCost: 499 },
  // RBC
  { cardName: 'Carte Visa RBC Avion Infinite', type: 'VISA', bank: 'RBC', pointsType: 'RBC', annualCost: 120 },
  { cardName: 'Carte Visa RBC ION', type: 'VISA', bank: 'RBC', pointsType: 'RBC', annualCost: 0 },
  { cardName: 'Carte Visa RBC ION+', type: 'VISA', bank: 'RBC', pointsType: 'RBC', annualCost: 48 },
  // Scotia
  { cardName: 'Carte Visa Infinite Passeport Banque Scotia', type: 'VISA', bank: 'Scotia', pointsType: 'Scene', annualCost: 150 },
  { cardName: 'Carte American Express Or Banque Scotia', type: 'AMEX', bank: 'Scotia', pointsType: 'Scene', annualCost: 99 },
  // TD
  { cardName: 'Carte Visa Infinite TD Aéroplan', type: 'VISA', bank: 'TD', pointsType: 'Aeroplan', annualCost: 139 },
  { cardName: 'Carte Visa Infinite TD Classe ultime Voyages', type: 'VISA', bank: 'TD', pointsType: 'TD', annualCost: 599 },
  { cardName: 'Carte Primes TD Visa Infinite', type: 'VISA', bank: 'TD', pointsType: 'TD', annualCost: 139 },
  // Other
  { cardName: 'Carte Mastercard World Elite MBNA Récompenses', type: 'MASTERCARD', bank: 'TD', pointsType: 'Cashback', annualCost: 120 },
];

export function getAvailableCards() {
  return AVAILABLE_CARDS;
}
