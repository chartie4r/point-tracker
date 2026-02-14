import { describe, it, expect, vi } from 'vitest';

// Single mock instance so cardService and tests use the same prisma
const mockPrisma = {
  card: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  cardBonusLevel: {
    createMany: vi.fn().mockResolvedValue(undefined),
    deleteMany: vi.fn().mockResolvedValue(undefined),
  },
  $transaction: vi.fn(async (cb) => cb(mockPrisma)),
};
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Import after mock so cardService gets mockPrisma
const cardService = await import('./cardService.js');

const validBody = {
  cardName: 'Test Card',
  type: 'VISA',
  status: 'Open',
  pointsType: 'Aeroplan',
  bank: 'AMEX',
};

describe('cardService', () => {
  describe('createCard validation', () => {
    it('throws ValidationError when cardName is missing', async () => {
      const body = { ...validBody, cardName: '' };
      await expect(cardService.createCard(body, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'cardName is required',
      });
    });

    it('throws ValidationError when cardName is only whitespace', async () => {
      await expect(cardService.createCard({ ...validBody, cardName: '   ' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'cardName is required',
      });
    });

    it('throws ValidationError when type is invalid', async () => {
      await expect(cardService.createCard({ ...validBody, type: 'INVALID' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('type must be one of'),
      });
    });

    it('throws ValidationError when status is invalid', async () => {
      await expect(cardService.createCard({ ...validBody, status: 'Pending' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('status must be one of'),
      });
    });

    it('throws ValidationError when pointsType is invalid', async () => {
      await expect(cardService.createCard({ ...validBody, pointsType: 'Miles' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('pointsType must be one of'),
      });
    });

    it('throws ValidationError when bank is invalid', async () => {
      await expect(cardService.createCard({ ...validBody, bank: 'HSBC' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('bank must be one of'),
      });
    });

    it('throws ValidationError when annualCost is negative', async () => {
      await expect(cardService.createCard({ ...validBody, annualCost: -1 }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'annualCost must be a non-negative number',
      });
    });

    it('throws ValidationError when progression is greater than 100', async () => {
      await expect(cardService.createCard({ ...validBody, progression: 101 }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'progression must be a number between 0 and 100',
      });
    });

    it('throws ValidationError when lineOfCredit is negative', async () => {
      await expect(cardService.createCard({ ...validBody, lineOfCredit: -100 }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'lineOfCredit must be a non-negative number',
      });
    });

    it('throws ValidationError when bonusLevels is not an array', async () => {
      await expect(cardService.createCard({ ...validBody, bonusLevels: 'invalid' }, 'user-1')).rejects.toMatchObject({
        name: 'ValidationError',
        message: 'bonusLevels must be an array',
      });
    });

    it('throws ValidationError when bonusLevel requirementType is invalid', async () => {
      await expect(
        cardService.createCard(
          {
            ...validBody,
            bonusLevels: [{ order: 1, requirementType: 'invalid', spendAmount: 1000, monthsFromOpen: 3 }],
          },
          'user-1',
        ),
      ).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('requirementType must be one of'),
      });
    });

    it('accepts valid body and does not throw (create is mocked)', async () => {
      const createdAt = new Date('2024-01-01T00:00:00.000Z');
      const updatedAt = new Date('2024-01-02T00:00:00.000Z');
      const mockCard = {
        id: 'card-123',
        userId: 'user-1',
        cardName: 'Test Card',
        type: 'VISA',
        status: 'Open',
        pointsType: 'Aeroplan',
        bank: 'AMEX',
        lineOfCredit: null,
        openDate: null,
        closeDate: null,
        possibleReopenDate: null,
        annualCost: null,
        progression: null,
        expenses: null,
        deadline: null,
        pointsValue: null,
        rewardPoints: null,
        pointsDetails: null,
        milesopediaUrl: null,
        milesopediaSlug: null,
        createdAt,
        updatedAt,
      };
      mockPrisma.card.create.mockResolvedValueOnce(mockCard);
      mockPrisma.card.findUnique.mockResolvedValueOnce({ ...mockCard, bonusLevels: [] });

      const result = await cardService.createCard(validBody, 'user-1');
      expect(result).not.toBeNull();
      expect(result.id).toBe('card-123');
      expect(result.cardName).toBe('Test Card');
      expect(result.type).toBe('VISA');
      expect(result.status).toBe('Open');
      expect(result.pointsType).toBe('Aeroplan');
      expect(result.bank).toBe('AMEX');
      expect(result.createdAt).toBe(createdAt.toISOString());
      expect(result.updatedAt).toBe(updatedAt.toISOString());
    });
  });

  describe('updateCard validation', () => {
    it('throws ValidationError when type is invalid on update', async () => {
      mockPrisma.card.findFirst.mockResolvedValueOnce({ id: 'card-1' });
      await expect(
        cardService.updateCard('card-1', { type: 'INVALID' }, 'user-1'),
      ).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('type must be one of'),
      });
    });

    it('throws ValidationError when progression is out of range on update', async () => {
      mockPrisma.card.findFirst.mockResolvedValueOnce({ id: 'card-1' });
      await expect(
        cardService.updateCard('card-1', { progression: -1 }, 'user-1'),
      ).rejects.toMatchObject({
        name: 'ValidationError',
        message: expect.stringContaining('progression must be a number between 0 and 100'),
      });
    });
  });
});
