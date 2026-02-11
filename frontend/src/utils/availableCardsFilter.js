/**
 * Pure filter and sort for available (catalog) cards.
 * Used by AvailableCardsList and by unit tests.
 */

/**
 * @param {Array<{ bank?: string, type?: string, pointsType?: string, annualCost?: number | null }>} cards
 * @param {{ filterBank: string, filterType: string, filterPointsType: string, filterNoAnnualCost: boolean }} filters
 * @returns {typeof cards}
 */
export function filterCards(cards, { filterBank, filterType, filterPointsType, filterNoAnnualCost }) {
  let list = [...cards];
  if (filterBank) list = list.filter((c) => c.bank === filterBank);
  if (filterType) list = list.filter((c) => c.type === filterType);
  if (filterPointsType) list = list.filter((c) => c.pointsType === filterPointsType);
  if (filterNoAnnualCost) list = list.filter((c) => c.annualCost == null || c.annualCost === 0);
  return list;
}

/**
 * @param {Array<{ cardName?: string, welcomeValueY1?: number | null }>} cards
 * @param {string} sortOrder - 'valueY1Desc' | 'valueY1Asc' | '' (name)
 * @returns {typeof cards}
 */
export function sortCards(cards, sortOrder) {
  const list = [...cards];
  if (sortOrder === 'valueY1Desc') {
    list.sort((a, b) => (b.welcomeValueY1 ?? -1) - (a.welcomeValueY1 ?? -1));
  } else if (sortOrder === 'valueY1Asc') {
    list.sort((a, b) => (a.welcomeValueY1 ?? 1e9) - (b.welcomeValueY1 ?? 1e9));
  } else {
    list.sort((a, b) => (a.cardName || '').localeCompare(b.cardName || ''));
  }
  return list;
}
