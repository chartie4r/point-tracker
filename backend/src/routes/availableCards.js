import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { scrapeSingleMilesopediaCard } from '../services/milesopediaScraper.js';
import { requireAuth, requireSuperadmin } from '../middleware/auth.js';

export const availableCardsRouter = Router();
const prisma = new PrismaClient();

function serializeLevel(level) {
  return {
    id: level.id,
    order: level.order,
    spendAmount: level.spendAmount,
    monthsFromOpen: level.monthsFromOpen,
    rewardPoints: level.rewardPoints,
  };
}

function serialize(card) {
  const out = {
    id: card.id,
    cardName: card.cardName,
    type: card.type,
    bank: card.bank,
    pointsType: card.pointsType,
    annualCost: card.annualCost,
    welcomeValueY1: card.welcomeValueY1,
    welcomeValueY2: card.welcomeValueY2,
    noWelcomeBonus: card.noWelcomeBonus === true,
    minSpend: card.minSpend,
    minSpendNotes: card.minSpendNotes ?? null,
    bonusDetails: card.bonusDetails,
    milesopediaUrl: card.milesopediaUrl,
    milesopediaSlug: card.milesopediaSlug,
    subscribeUrl: card.subscribeUrl ?? null,
    firstYearFree: card.firstYearFree === true,
    loungeAccess: card.loungeAccess === true,
    loungeAccessDetails: card.loungeAccessDetails ?? null,
    noForeignTransactionFee: card.noForeignTransactionFee === true,
    travelInsurance: card.travelInsurance === true,
    travelInsuranceDetails: card.travelInsuranceDetails ?? null,
    annualTravelCredit: card.annualTravelCredit ?? null,
    isBusiness: card.isBusiness === true,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
  if (card.bonusLevels) {
    out.bonusLevels = card.bonusLevels.map(serializeLevel);
  }
  return out;
}

availableCardsRouter.get('/', async (req, res) => {
  try {
    const [cards, catalogRefresh] = await Promise.all([
      prisma.scrapedCard.findMany({
        orderBy: { cardName: 'asc' },
        include: { bonusLevels: { orderBy: { order: 'asc' } } },
      }),
      prisma.catalogRefresh.findUnique({ where: { id: 'catalog' } }).catch(() => null),
    ]);
    const lastRefreshedAt = catalogRefresh?.completedAt?.toISOString() ?? null;
    res.json({ cards: cards.map(serialize), lastRefreshedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

availableCardsRouter.get('/:id', async (req, res) => {
  try {
    const card = await prisma.scrapedCard.findUnique({
      where: { id: req.params.id },
      include: { bonusLevels: { orderBy: { order: 'asc' } } },
    });
    if (!card) {
      return res.status(404).json({ error: 'Catalog card not found' });
    }
    res.json(serialize(card));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

availableCardsRouter.post('/:id/refresh', requireAuth, requireSuperadmin, async (req, res) => {
  try {
    const useAi = req.query.useAi === 'true' || req.body?.useAi === true;
    console.log('[AvailableCards] POST /:id/refresh', req.params.id, useAi ? '(AI)' : '');
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
    const scraped = await scrapeSingleMilesopediaCard(existing.milesopediaUrl, { useAi });
    console.log('[AvailableCards] Parsed welcomeValueY1:', scraped.welcomeValueY1);

    await prisma.scrapedCard.update({
      where: { id: existing.id },
      data: {
        cardName: scraped.cardName,
        type: scraped.type,
        bank: scraped.bank,
        pointsType: scraped.pointsType,
        annualCost: scraped.annualCost ?? null,
        welcomeValueY1: scraped.welcomeValueY1 ?? null,
        welcomeValueY2: scraped.welcomeValueY2 ?? null,
        noWelcomeBonus: scraped.noWelcomeBonus === true,
        minSpend: scraped.minSpend ?? null,
        minSpendNotes: scraped.minSpendNotes ?? null,
        bonusDetails: scraped.bonusDetails ?? null,
        milesopediaUrl: scraped.milesopediaUrl || existing.milesopediaUrl,
        milesopediaSlug: scraped.milesopediaSlug || existing.milesopediaSlug,
        subscribeUrl: scraped.subscribeUrl ?? existing.subscribeUrl ?? null,
        firstYearFree: scraped.firstYearFree === true,
        loungeAccess: scraped.loungeAccess === true,
        loungeAccessDetails: scraped.loungeAccessDetails ?? null,
        noForeignTransactionFee: scraped.noForeignTransactionFee === true,
        travelInsurance: scraped.travelInsurance === true,
        travelInsuranceDetails: scraped.travelInsuranceDetails ?? null,
        annualTravelCredit: scraped.annualTravelCredit ?? null,
      },
    });

    await prisma.scrapedBonusLevel.deleteMany({ where: { scrapedCardId: existing.id } });
    if (scraped.bonusLevels && scraped.bonusLevels.length > 0) {
      await prisma.scrapedBonusLevel.createMany({
        data: scraped.bonusLevels.map((l, i) => ({
          scrapedCardId: existing.id,
          order: l.order ?? i + 1,
          spendAmount: l.spendAmount ?? null,
          monthsFromOpen: l.monthsFromOpen ?? null,
          rewardPoints: l.rewardPoints ?? null,
        })),
      });
    }

    const updated = await prisma.scrapedCard.findUnique({
      where: { id: existing.id },
      include: { bonusLevels: { orderBy: { order: 'asc' } } },
    });
    res.json(serialize(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
