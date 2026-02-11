/**
 * Pure helpers for grouping and summarizing cards (catalog or user cards).
 * Used by API and future dashboard/analytics.
 */

/**
 * @param {Array<{ status: string }>} cards
 * @returns {{ open: Array, closed: Array, toOpen: Array, refused: Array }}
 */
export function groupCardsByStatus(cards) {
  const open = [];
  const closed = [];
  const toOpen = [];
  const refused = [];
  for (const c of cards) {
    const s = (c.status || '').toString();
    if (s === 'Open') open.push(c);
    else if (s === 'Closed') closed.push(c);
    else if (s === 'To_Open') toOpen.push(c);
    else if (s === 'Refused') refused.push(c);
  }
  return { open, closed, toOpen, refused };
}

/**
 * @param {Array<{ bank?: string, welcomeValueY1?: number | null, annualCost?: number | null }>} cards
 * @returns {{ totalCards: number, byBank: Record<string, number>, totalWelcomeValueY1: number, withNoAnnualCost: number, withWelcomeBonus: number }}
 */
export function computeCatalogStats(cards) {
  const byBank = {};
  let totalWelcomeValueY1 = 0;
  let withNoAnnualCost = 0;
  let withWelcomeBonus = 0;
  for (const c of cards) {
    const bank = c.bank || 'Other';
    byBank[bank] = (byBank[bank] || 0) + 1;
    const y1 = c.welcomeValueY1;
    if (y1 != null && typeof y1 === 'number' && !c.noWelcomeBonus) {
      totalWelcomeValueY1 += y1;
      withWelcomeBonus += 1;
    }
    if (c.annualCost == null || c.annualCost === 0) withNoAnnualCost += 1;
  }
  return {
    totalCards: cards.length,
    byBank,
    totalWelcomeValueY1,
    withNoAnnualCost,
    withWelcomeBonus,
  };
}
