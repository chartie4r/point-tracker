/**
 * Seed script for local/dev: creates a test user and one mock card for UI integration testing.
 * The same card id (mock-ui-catalogue) is used for both tracked and catalogue so the
 * "Tracked card view" / "Catalogue preview" toggle works without a 404.
 *
 * Run: npx prisma db seed
 *
 * After seeding (and logging in as the test user):
 * - Same card in both modes: /cards/mock-ui-catalogue and /cards/mock-ui-catalogue?mode=catalogue
 * - Catalogue list: /available-cards (includes mock card)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MOCK_USER_EMAIL = 'ui-test@example.com';
const MOCK_USER_PASSWORD = 'test-password-123';
const MOCK_CARD_ID = 'mock-ui-catalogue';
const MOCK_SLUG = 'mock-ui-catalogue';

async function main() {
  const passwordHash = await bcrypt.hash(MOCK_USER_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: MOCK_USER_EMAIL },
    update: {},
    create: {
      email: MOCK_USER_EMAIL,
      passwordHash,
      name: 'UI Test User',
      role: 'user',
    },
  });

  // Remove old seed card if it used a different id (so we only have one mock card)
  await prisma.cardBonusLevel.deleteMany({ where: { cardId: 'mock-ui-tracked' } });
  await prisma.card.deleteMany({ where: { id: 'mock-ui-tracked' } });

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 75);
  const openDate = new Date();
  openDate.setDate(openDate.getDate() - 15);

  const trackedCard = await prisma.card.upsert({
    where: { id: MOCK_CARD_ID },
    update: {},
    create: {
      id: MOCK_CARD_ID,
      userId: user.id,
      cardName: 'Mock Card (UI Test)',
      type: 'VISA',
      status: 'Open',
      pointsType: 'Aeroplan',
      bank: 'TD',
      lineOfCredit: 10000,
      openDate,
      deadline,
      annualCost: 139,
      progression: 55,
      expenses: 3300,
      rewardPoints: 55000,
      pointsValue: 850,
      bonusDetails: '50,000 pts after $3,000 spend in 3 months',
      milesopediaSlug: MOCK_SLUG,
    },
  });

  const trackedLevels = await prisma.cardBonusLevel.findMany({
    where: { cardId: trackedCard.id },
  });
  if (trackedLevels.length === 0) {
    await prisma.cardBonusLevel.create({
      data: {
        cardId: MOCK_CARD_ID,
        order: 1,
        spendAmount: 3000,
        monthsFromOpen: 3,
        requirementType: 'spend',
        rewardPoints: 50000,
      },
    });
  }

  const scrapedCard = await prisma.scrapedCard.upsert({
    where: { milesopediaSlug: MOCK_SLUG },
    update: {},
    create: {
      id: MOCK_CARD_ID,
      cardName: 'Mock Card (UI Test)',
      type: 'VISA',
      bank: 'TD',
      pointsType: 'Aeroplan',
      milesopediaSlug: MOCK_SLUG,
      annualCost: 139,
      welcomeValueY1: 800,
      welcomeValueY2: 200,
      noWelcomeBonus: false,
      minSpend: 3000,
      minSpendNotes: 'Within first 3 months',
      bonusDetails: '50,000 pts after $3,000 spend in 3 months',
    },
  });

  const scrapedLevels = await prisma.scrapedBonusLevel.findMany({
    where: { scrapedCardId: scrapedCard.id },
  });
  if (scrapedLevels.length === 0) {
    await prisma.scrapedBonusLevel.create({
      data: {
        scrapedCardId: scrapedCard.id,
        order: 1,
        spendAmount: 3000,
        monthsFromOpen: 3,
        rewardPoints: 50000,
      },
    });
  }

  console.log('Seed complete.');
  console.log('  Test user:', MOCK_USER_EMAIL, '/', MOCK_USER_PASSWORD);
  console.log('  Mock card (both views):', '/cards/' + MOCK_CARD_ID, '| catalogue:', '/cards/' + scrapedCard.id + '?mode=catalogue');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
