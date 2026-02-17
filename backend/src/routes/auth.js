import { Router } from 'express';
import {
  register,
  login,
  findUserById,
  updateProfile,
  changePassword,
  createPasswordResetToken,
  resetPasswordWithToken,
} from '../services/authService.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const user = await register(req.body);
    req.session.userId = user.id;
    req.session.role = user.role;
    res.status(201).json({ user });
  } catch (err) {
    const status = err.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const user = await login(req.body);
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

authRouter.post('/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

authRouter.get('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const user = await findUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.patch('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const user = await updateProfile(req.session.userId, req.body);
    res.json({ user });
  } catch (err) {
    const status = err.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

authRouter.post('/change-password', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.session.userId, currentPassword, newPassword);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const result = await createPasswordResetToken(req.body.email);
    if (!result) {
      return res.json({ message: 'If an account exists, a reset link was sent.' });
    }
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password/${result.resetToken}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Password reset link:', resetUrl);
    }
    res.json({ message: 'If an account exists, a reset link was sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await resetPasswordWithToken(token, newPassword);
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
