import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import { cardsRouter } from './routes/cards.js';
import { snapshotsRouter } from './routes/snapshots.js';
import { scraperRouter } from './routes/scraper.js';
import { availableCardsRouter } from './routes/availableCards.js';
import { authRouter } from './routes/auth.js';
import { requireAuth, requireSuperadmin } from './middleware/auth.js';
import { ensureSuperadminFromConfig } from './services/authService.js';

const SESSION_SECRET = process.env.SESSION_SECRET || 'point-tracker-dev-secret-change-in-production';

let superadminInitDone = false;
async function ensureSuperadminOnce() {
  if (superadminInitDone) return;
  superadminInitDone = true;
  try {
    const email = await ensureSuperadminFromConfig();
    if (email) console.log('[Config] Default superadmin ensured:', email);
  } catch (err) {
    console.error('[Config] ensureSuperadmin failed:', err.message);
  }
}

const app = express();
app.use(async (req, res, next) => {
  await ensureSuperadminOnce();
  next();
});
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [SESSION_SECRET],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }),
);

app.use('/api/auth', authRouter);
app.use('/api/cards', requireAuth, cardsRouter);
app.use('/api/available-cards', requireAuth, availableCardsRouter);
app.use('/api/scrape', requireAuth, requireSuperadmin, scraperRouter);
app.use('/api', requireAuth, snapshotsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
