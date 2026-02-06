import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { scrapeSingleMilesopediaCard } from '../services/milesopediaScraper.js';
import { requireSuperadmin } from '../middleware/auth.js';

export const availableCardsRouter = Router();
const prisma = new PrismaClient();

function serialize(card) {
  return {
    id: card.id,
    cardName: card.cardName,
    type: card.type,
    bank: card.bank,
    pointsType: card.pointsType,
    annualCost: card.annualCost,
    welcomeValueY1: card.welcomeValueY1,
    welcomeValueY2: card.welcomeValueY2,
    minSpend: card.minSpend,
    bonusDetails: card.bonusDetails,
    milesopediaUrl: card.milesopediaUrl,
    milesopediaSlug: card.milesopediaSlug,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

availableCardsRouter.get('/', async (req, res) => {
  try {
    const [cards, catalogRefresh] = await Promise.all([
      prisma.scrapedCard.findMany({ orderBy: { cardName: 'asc' } }),
      prisma.catalogRefresh.findUnique({ where: { id: 'catalog' } }).catch(() => null),
    ]);
    const lastRefreshedAt = catalogRefresh?.completedAt?.toISOString() ?? null;
    res.json({ cards: cards.map(serialize), lastRefreshedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

availableCardsRouter.post('/:id/refresh', requireSuperadmin, async (req, res) => {
  try {
    console.log('[AvailableCards] POST /:id/refresh', req.params.id);
    const existing = await prisma.scrapedCard.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Catalog card not found' });
    }
    if (!existing.milesopediaUrl) {
      return res.status(400).json({ error: 'This catalog card has no Milesopedia URL to refresh from.' });
    }

    console.log('[AvailableCards] Fetching', existing.milesopediaUrl);
    const scraped = await scrapeSingleMilesopediaCard(existing.milesopediaUrl);
    console.log('[AvailableCards] Parsed welcomeValueY1:', scraped.welcomeValueY1);

    const updated = await prisma.scrapedCard.update({
      where: { id: existing.id },
      data: {
        cardName: scraped.cardName,
        type: scraped.type,
        bank: scraped.bank,
        pointsType: scraped.pointsType,
        annualCost: scraped.annualCost ?? null,
        welcomeValueY1: scraped.welcomeValueY1 ?? null,
        welcomeValueY2: scraped.welcomeValueY2 ?? null,
        minSpend: scraped.minSpend ?? null,
        bonusDetails: scraped.bonusDetails ?? null,
        milesopediaUrl: scraped.milesopediaUrl || existing.milesopediaUrl,
        milesopediaSlug: scraped.milesopediaSlug || existing.milesopediaSlug,
      },
    });

    res.json(serialize(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
