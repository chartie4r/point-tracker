import { describe, it, expect, vi, beforeEach } from 'vitest';

const mock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => ({ user: mock.user })) }));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((pw) => Promise.resolve('hashed-' + pw)),
    compare: vi.fn(() => Promise.resolve(false)),
  },
}));

import * as authService from './authService.js';

const created = new Date('2024-01-01T00:00:00.000Z');
const updated = new Date('2024-01-02T00:00:00.000Z');
function fakeUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    role: 'user',
    passwordHash: 'hashed-secret',
    createdAt: created,
    updatedAt: updated,
    ...overrides,
  };
}

describe('authService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare.mockResolvedValue(false);
  });

  describe('register', () => {
    it('throws when email is empty', async () => {
      await expect(authService.register({ email: '', password: 'password123', name: 'A' })).rejects.toThrow('Email is required');
      await expect(authService.register({ email: '   ', password: 'password123' })).rejects.toThrow('Email is required');
    });

    it('throws when password is shorter than 8 characters', async () => {
      await expect(authService.register({ email: 'a@b.co', password: 'short', name: 'A' })).rejects.toThrow(
        'Password must be at least 8 characters',
      );
    });

    it('throws when email already exists', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      await expect(
        authService.register({ email: 'existing@example.com', password: 'password123', name: 'A' }),
      ).rejects.toThrow('An account with this email already exists');
    });

    it('creates user and returns safe user when valid', async () => {
      mock.user.findUnique.mockResolvedValueOnce(null);
      mock.user.create.mockResolvedValueOnce(fakeUser({ email: 'new@example.com', name: 'Jane' }));
      const result = await authService.register({
        email: '  NEW@Example.COM  ',
        password: 'password123',
        name: '  Jane  ',
      });
      expect(result).toMatchObject({
        id: 'user-1',
        email: 'new@example.com',
        name: 'Jane',
        role: 'user',
      });
      expect(result.createdAt).toBe(created.toISOString());
      expect(mock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: expect.any(String),
          name: 'Jane',
        },
      });
    });
  });

  describe('login', () => {
    it('throws when email is empty', async () => {
      await expect(authService.login({ email: '', password: 'x' })).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('throws when password is missing', async () => {
      await expect(authService.login({ email: 'a@b.co', password: '' })).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('throws when user not found', async () => {
      mock.user.findUnique.mockResolvedValueOnce(null);
      await expect(authService.login({ email: 'nope@example.com', password: 'password123' })).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('throws when password is wrong', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      const bcrypt = (await import('bcryptjs')).default;
      bcrypt.compare.mockResolvedValueOnce(false);
      await expect(authService.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('returns safe user when credentials are correct', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      const bcrypt = (await import('bcryptjs')).default;
      bcrypt.compare.mockResolvedValueOnce(true);
      const result = await authService.login({ email: 'Test@Example.com', password: 'secret' });
      expect(result).toMatchObject({ id: 'user-1', email: 'test@example.com', name: 'Test', role: 'user' });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findUserById', () => {
    it('returns null when user not found', async () => {
      mock.user.findUnique.mockResolvedValueOnce(null);
      const result = await authService.findUserById('nope');
      expect(result).toBeNull();
    });

    it('returns safe user when found', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      const result = await authService.findUserById('user-1');
      expect(result).toMatchObject({ id: 'user-1', email: 'test@example.com' });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateProfile', () => {
    it('throws when email is set to empty', async () => {
      await expect(
        authService.updateProfile('user-1', { email: '   ' }),
      ).rejects.toThrow('Email cannot be empty');
    });

    it('throws when new email already exists for another user', async () => {
      mock.user.findFirst.mockResolvedValueOnce(fakeUser({ id: 'other' }));
      await expect(
        authService.updateProfile('user-1', { email: 'taken@example.com' }),
      ).rejects.toThrow('An account with this email already exists');
    });

    it('updates and returns safe user', async () => {
      mock.user.findFirst.mockResolvedValueOnce(null);
      mock.user.update.mockResolvedValueOnce(fakeUser({ name: 'New Name', email: 'new@example.com' }));
      const result = await authService.updateProfile('user-1', { name: 'New Name', email: 'new@example.com' });
      expect(result).toMatchObject({ name: 'New Name', email: 'new@example.com' });
      expect(mock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name', email: 'new@example.com' },
      });
    });
  });

  describe('changePassword', () => {
    it('throws when new password is shorter than 8', async () => {
      await expect(
        authService.changePassword('user-1', 'current', 'short'),
      ).rejects.toThrow('New password must be at least 8 characters');
    });

    it('throws when user not found', async () => {
      mock.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        authService.changePassword('nope', 'current', 'newpassword123'),
      ).rejects.toThrow('User not found');
    });

    it('throws when current password is incorrect', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      const bcrypt = (await import('bcryptjs')).default;
      bcrypt.compare.mockResolvedValueOnce(false);
      await expect(
        authService.changePassword('user-1', 'wrong', 'newpassword123'),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('updates password and returns true', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      mock.user.update.mockResolvedValueOnce({});
      const bcrypt = (await import('bcryptjs')).default;
      bcrypt.compare.mockResolvedValueOnce(true);
      const result = await authService.changePassword('user-1', 'current', 'newpassword123');
      expect(result).toBe(true);
      expect(mock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: expect.any(String) },
      });
    });
  });

  describe('createPasswordResetToken', () => {
    it('returns null when user not found (no email leak)', async () => {
      mock.user.findUnique.mockResolvedValueOnce(null);
      const result = await authService.createPasswordResetToken('nobody@example.com');
      expect(result).toBeNull();
    });

    it('returns resetToken and email when user exists', async () => {
      mock.user.findUnique.mockResolvedValueOnce(fakeUser());
      mock.user.update.mockResolvedValueOnce({});
      const result = await authService.createPasswordResetToken('test@example.com');
      expect(result).toMatchObject({ email: 'test@example.com' });
      expect(result.resetToken).toBeDefined();
      expect(typeof result.resetToken).toBe('string');
      expect(result.resetToken.length).toBeGreaterThan(0);
    });
  });

  describe('resetPasswordWithToken', () => {
    it('throws when token or newPassword missing', async () => {
      await expect(
        authService.resetPasswordWithToken('', 'newpass123'),
      ).rejects.toThrow('Token and new password (min 8 characters) are required');
      await expect(
        authService.resetPasswordWithToken('tok', 'short'),
      ).rejects.toThrow('Token and new password (min 8 characters) are required');
    });

    it('throws when token invalid or expired', async () => {
      mock.user.findFirst.mockResolvedValueOnce(null);
      await expect(
        authService.resetPasswordWithToken('bad-token', 'newpassword123'),
      ).rejects.toThrow('Invalid or expired reset link');
    });

    it('updates password and returns safe user', async () => {
      mock.user.findFirst.mockResolvedValueOnce(fakeUser());
      mock.user.update.mockResolvedValueOnce(fakeUser());
      const result = await authService.resetPasswordWithToken('valid-token', 'newpassword123');
      expect(result).toMatchObject({ id: 'user-1', email: 'test@example.com' });
      expect(mock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          passwordHash: expect.any(String),
          resetToken: null,
          resetTokenExpires: null,
        },
      });
    });
  });
});
