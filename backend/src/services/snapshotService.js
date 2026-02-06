import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function serializeSnapshot(s) {
  return {
    id: s.id,
    cardId: s.cardId,
    weekStartDate: s.weekStartDate.toISOString().slice(0, 10),
    pointsValue: s.pointsValue,
    expenses: s.expenses,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
  };
}

async function ensureCardBelongsToUser(cardId, userId) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: userId || null },
  });
  if (!card) {
    const err = new Error('Card not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
}

export async function listSnapshotsByCard(cardId, { from, to } = {}, userId) {
  await ensureCardBelongsToUser(cardId, userId);
  const where = { cardId };
  if (from || to) {
    where.weekStartDate = {};
    if (from) where.weekStartDate.gte = parseDate(from);
    if (to) where.weekStartDate.lte = parseDate(to);
  }
  const snapshots = await prisma.weeklySnapshot.findMany({
    where,
    orderBy: { weekStartDate: 'desc' },
  });
  return snapshots.map(serializeSnapshot);
}

export async function getSnapshot(id, userId) {
  const s = await prisma.weeklySnapshot.findUnique({
    where: { id },
    include: { card: true },
  });
  if (!s) return null;
  if (userId != null && s.card.userId !== userId) return null;
  return serializeSnapshot(s);
}

export async function createSnapshot(cardId, body, userId) {
  await ensureCardBelongsToUser(cardId, userId);
  const weekStart = body.weekStartDate
    ? getWeekStart(parseDate(body.weekStartDate))
    : getWeekStart(new Date());
  const pointsValue = body.pointsValue != null ? Number(body.pointsValue) : 0;
  if (pointsValue < 0) {
    const err = new Error('pointsValue must be non-negative');
    err.name = 'ValidationError';
    throw err;
  }
  const expenses = body.expenses != null ? Number(body.expenses) : null;
  if (expenses != null && expenses < 0) {
    const err = new Error('expenses must be non-negative');
    err.name = 'ValidationError';
    throw err;
  }
  const snapshot = await prisma.weeklySnapshot.create({
    data: {
      cardId,
      weekStartDate: weekStart,
      pointsValue,
      expenses,
      notes: body.notes ? String(body.notes) : null,
    },
  });
  return serializeSnapshot(snapshot);
}

export async function updateSnapshot(id, body, userId) {
  const s = await prisma.weeklySnapshot.findUnique({
    where: { id },
    include: { card: true },
  });
  if (!s) return null;
  if (userId != null && s.card.userId !== userId) return null;
  const data = {};
  if (body.weekStartDate !== undefined) data.weekStartDate = getWeekStart(parseDate(body.weekStartDate));
  if (body.pointsValue !== undefined) {
    const v = Number(body.pointsValue);
    if (v < 0) {
      const err = new Error('pointsValue must be non-negative');
      err.name = 'ValidationError';
      throw err;
    }
    data.pointsValue = v;
  }
  if (body.expenses !== undefined) data.expenses = body.expenses == null ? null : Number(body.expenses);
  if (body.notes !== undefined) data.notes = body.notes == null ? null : String(body.notes);
  const snapshot = await prisma.weeklySnapshot.update({
    where: { id },
    data,
  });
  return serializeSnapshot(snapshot);
}

export async function deleteSnapshot(id, userId) {
  const s = await prisma.weeklySnapshot.findUnique({
    where: { id },
    include: { card: true },
  });
  if (!s) return false;
  if (userId != null && s.card.userId !== userId) return false;
  try {
    await prisma.weeklySnapshot.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e.code === 'P2025') return false;
    throw e;
  }
}
