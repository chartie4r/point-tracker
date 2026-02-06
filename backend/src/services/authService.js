import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function toSafeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? 'user',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function register({ email, password, name }) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) throw new Error('Email is required');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new Error('An account with this email already exists');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      name: (name || '').trim() || null,
    },
  });
  return toSafeUser(user);
}

export async function login({ email, password }) {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized || !password) throw new Error('Email and password are required');
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) throw new Error('Invalid email or password');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid email or password');
  return toSafeUser(user);
}

export async function findUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSafeUser(user) : null;
}

export async function updateProfile(userId, { name, email }) {
  const data = {};
  if (name !== undefined) data.name = (name || '').trim() || null;
  if (email !== undefined) {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) throw new Error('Email cannot be empty');
    const existing = await prisma.user.findFirst({
      where: { email: normalized, id: { not: userId } },
    });
    if (existing) throw new Error('An account with this email already exists');
    data.email = normalized;
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return toSafeUser(user);
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 8) throw new Error('New password must be at least 8 characters');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new Error('Current password is incorrect');
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  return true;
}

export async function createPasswordResetToken(email) {
  const normalized = (email || '').trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return null; // Don't reveal whether email exists
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpires },
  });
  return { resetToken, email: user.email };
}

export async function resetPasswordWithToken(token, newPassword) {
  if (!token || !newPassword || newPassword.length < 8) {
    throw new Error('Token and new password (min 8 characters) are required');
  }
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });
  if (!user) throw new Error('Invalid or expired reset link');
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpires: null },
  });
  return toSafeUser(user);
}

/**
 * Ensures a superadmin user exists from config (SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD).
 * Called at startup: creates the user if missing, or updates role + password if existing.
 */
export async function ensureSuperadminFromConfig() {
  const email = (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || '';
  const name = (process.env.SUPERADMIN_NAME || '').trim() || null;

  if (!email || !password || password.length < 8) {
    return null;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'superadmin', passwordHash },
    });
    return email;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'superadmin',
    },
  });
  return email;
}
