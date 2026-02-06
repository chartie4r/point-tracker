import { PrismaClient } from '@prisma/client';
import { scrapeSingleMilesopediaCard } from './milesopediaScraper.js';

const prisma = new PrismaClient();

const CARD_TYPE = ['VISA', 'MASTERCARD', 'AMEX'];
const CARD_STATUS = ['Open', 'Closed', 'Refused', 'To_Open'];
const POINTS_TYPE = ['Aeroplan', 'BNC', 'Marriott_Bonvoy', 'CIBC', 'RBC', 'Cashback', 'Scene', 'TD', 'VIP_Porter'];
const BANK = ['AMEX', 'BMO', 'BNC', 'CIBC', 'RBC', 'Scotia', 'TD'];

function validateCardBody(body, isUpdate = false) {
  const err = new Error();
  err.name = 'ValidationError';
  if (!isUpdate) {
    if (!body.cardName || typeof body.cardName !== 'string' || !body.cardName.trim()) {
      err.message = 'cardName is required';
      throw err;
    }
    if (!body.type || !CARD_TYPE.includes(body.type)) {
      err.message = 'type must be one of: ' + CARD_TYPE.join(', ');
      throw err;
    }
    if (!body.status || !CARD_STATUS.includes(body.status)) {
      err.message = 'status must be one of: ' + CARD_STATUS.join(', ');
      throw err;
    }
    if (!body.pointsType || !POINTS_TYPE.includes(body.pointsType)) {
      err.message = 'pointsType must be one of: ' + POINTS_TYPE.join(', ');
      throw err;
    }
    if (!body.bank || !BANK.includes(body.bank)) {
      err.message = 'bank must be one of: ' + BANK.join(', ');
      throw err;
    }
  }
  if (body.type !== undefined && !CARD_TYPE.includes(body.type)) {
    err.message = 'type must be one of: ' + CARD_TYPE.join(', ');
    throw err;
  }
  if (body.status !== undefined && !CARD_STATUS.includes(body.status)) {
    err.message = 'status must be one of: ' + CARD_STATUS.join(', ');
    throw err;
  }
  if (body.pointsType !== undefined && !POINTS_TYPE.includes(body.pointsType)) {
    err.message = 'pointsType must be one of: ' + POINTS_TYPE.join(', ');
    throw err;
  }
  if (body.bank !== undefined && !BANK.includes(body.bank)) {
    err.message = 'bank must be one of: ' + BANK.join(', ');
    throw err;
  }
  if (body.lineOfCredit !== undefined && body.lineOfCredit != null && (typeof body.lineOfCredit !== 'number' || body.lineOfCredit < 0)) {
    err.message = 'lineOfCredit must be a non-negative number';
    throw err;
  }
  if (body.annualCost !== undefined && body.annualCost != null && (typeof body.annualCost !== 'number' || body.annualCost < 0)) {
    err.message = 'annualCost must be a non-negative number';
    throw err;
  }
  if (body.expenses !== undefined && body.expenses != null && (typeof body.expenses !== 'number' || body.expenses < 0)) {
    err.message = 'expenses must be a non-negative number';
    throw err;
  }
  if (body.pointsValue !== undefined && body.pointsValue != null && (typeof body.pointsValue !== 'number' || body.pointsValue < 0)) {
    err.message = 'pointsValue must be a non-negative number';
    throw err;
  }
  if (body.progression !== undefined && body.progression != null) {
    const p = Number(body.progression);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      err.message = 'progression must be a number between 0 and 100';
      throw err;
    }
  }
}

function parseDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toCardPayload(body) {
  const payload = {};
  if (body.cardName !== undefined) payload.cardName = String(body.cardName).trim();
  if (body.type !== undefined) payload.type = body.type;
  if (body.status !== undefined) payload.status = body.status;
  if (body.pointsType !== undefined) payload.pointsType = body.pointsType;
  if (body.bank !== undefined) payload.bank = body.bank;
  if (body.lineOfCredit !== undefined) payload.lineOfCredit = body.lineOfCredit == null ? null : Number(body.lineOfCredit);
  if (body.openDate !== undefined) payload.openDate = parseDate(body.openDate);
  if (body.closeDate !== undefined) payload.closeDate = parseDate(body.closeDate);
  if (body.possibleReopenDate !== undefined) payload.possibleReopenDate = parseDate(body.possibleReopenDate);
  if (body.annualCost !== undefined) payload.annualCost = body.annualCost == null ? null : Number(body.annualCost);
  if (body.progression !== undefined) payload.progression = body.progression == null ? null : Number(body.progression);
  if (body.expenses !== undefined) payload.expenses = body.expenses == null ? null : Number(body.expenses);
  if (body.deadline !== undefined) payload.deadline = parseDate(body.deadline);
  if (body.pointsValue !== undefined) payload.pointsValue = body.pointsValue == null ? null : Number(body.pointsValue);
  if (body.pointsDetails !== undefined) payload.pointsDetails = body.pointsDetails == null ? null : String(body.pointsDetails);
  if (body.milesopediaUrl !== undefined) payload.milesopediaUrl = body.milesopediaUrl == null ? null : String(body.milesopediaUrl);
  if (body.milesopediaSlug !== undefined) payload.milesopediaSlug = body.milesopediaSlug == null ? null : String(body.milesopediaSlug);
  return payload;
}

function serializeCard(card) {
  if (!card) return null;
  return {
    id: card.id,
    userId: card.userId,
    cardName: card.cardName,
    type: card.type,
    status: card.status,
    pointsType: card.pointsType,
    bank: card.bank,
    lineOfCredit: card.lineOfCredit,
    openDate: card.openDate?.toISOString().slice(0, 10) ?? null,
    closeDate: card.closeDate?.toISOString().slice(0, 10) ?? null,
    possibleReopenDate: card.possibleReopenDate?.toISOString().slice(0, 10) ?? null,
    annualCost: card.annualCost,
    progression: card.progression != null ? Number(card.progression) : null,
    expenses: card.expenses,
    deadline: card.deadline?.toISOString().slice(0, 10) ?? null,
    pointsValue: card.pointsValue,
    pointsDetails: card.pointsDetails,
    milesopediaUrl: card.milesopediaUrl,
    milesopediaSlug: card.milesopediaSlug,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export async function listCards(userId) {
  const cards = await prisma.card.findMany({
    where: { userId: userId || null },
    orderBy: { cardName: 'asc' },
    include: {
      snapshots: {
        orderBy: { weekStartDate: 'desc' },
        take: 1,
      },
    },
  });
  return cards.map((c) => ({
    ...serializeCard(c),
    lastSnapshot: c.snapshots[0]
      ? {
          weekStartDate: c.snapshots[0].weekStartDate.toISOString().slice(0, 10),
          pointsValue: c.snapshots[0].pointsValue,
          expenses: c.snapshots[0].expenses,
        }
      : null,
  }));
}

export async function getCard(id, userId) {
  const card = await prisma.card.findFirst({
    where: { id, userId: userId || null },
    include: { snapshots: { orderBy: { weekStartDate: 'desc' } } },
  });
  if (!card) return null;
  return {
    ...serializeCard(card),
    snapshots: card.snapshots.map((s) => ({
      id: s.id,
      cardId: s.cardId,
      weekStartDate: s.weekStartDate.toISOString().slice(0, 10),
      pointsValue: s.pointsValue,
      expenses: s.expenses,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}

export async function createCard(body, userId) {
  validateCardBody(body, false);
  const payload = toCardPayload(body);
  payload.userId = userId || null;
  const card = await prisma.card.create({ data: payload });
  return serializeCard(card);
}

export async function updateCard(id, body, userId) {
  validateCardBody(body, true);
  const card = await prisma.card.findFirst({
    where: { id, userId: userId || null },
  });
  if (!card) return null;
  const payload = toCardPayload(body);
  const updated = await prisma.card.update({
    where: { id },
    data: payload,
  });
  return serializeCard(updated);
}

export async function deleteCard(id, userId) {
  try {
    const card = await prisma.card.findFirst({
      where: { id, userId: userId || null },
    });
    if (!card) return false;
    await prisma.card.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e.code === 'P2025') return false;
    throw e;
  }
}

export async function refreshCardFromMilesopedia(id, userId) {
  const card = await prisma.card.findFirst({
    where: { id, userId: userId || null },
  });
  if (!card) {
    const err = new Error('Card not found');
    err.name = 'NotFoundError';
    throw err;
  }

  let url = card.milesopediaUrl;

  // Fallback: try to resolve URL from scraped catalog using slug
  if (!url && card.milesopediaSlug) {
    const scraped = await prisma.scrapedCard.findUnique({
      where: { milesopediaSlug: card.milesopediaSlug },
    });
    if (scraped?.milesopediaUrl) {
      url = scraped.milesopediaUrl;
    }
  }

  if (!url) {
    const err = new Error('This card is not linked to Milesopedia (missing URL/slug).');
    err.name = 'ValidationError';
    throw err;
  }

  const scraped = await scrapeSingleMilesopediaCard(url);

  const updatePayload = toCardPayload({
    // Only update fields that come from Milesopedia
    cardName: scraped.cardName,
    type: scraped.type,
    pointsType: scraped.pointsType,
    bank: scraped.bank,
    annualCost: scraped.annualCost,
    milesopediaUrl: scraped.milesopediaUrl || url,
    milesopediaSlug: scraped.milesopediaSlug,
  });

  const updated = await prisma.card.update({
    where: { id },
    data: updatePayload,
  });

  return serializeCard(updated);
}
