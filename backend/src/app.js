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
import { createAuthRateLimiterFromEnv } from './middleware/rateLimit.js';
import { PrismaClient } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'point-tracker-dev-secret-change-in-production';

if (isProduction && (!process.env.SESSION_SECRET || SESSION_SECRET === 'point-tracker-dev-secret-change-in-production')) {
  throw new Error('[Config] SESSION_SECRET must be set in production and cannot use the default dev value');
}

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
const prisma = new PrismaClient();
const authRateLimiter = createAuthRateLimiterFromEnv();
app.set('trust proxy', 1);
app.use(async (req, res, next) => {
  await ensureSuperadminOnce();
  next();
});
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.replace(/\/$/, '')
  : true;
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: [SESSION_SECRET],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }),
);

app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/cards', requireAuth, cardsRouter);
// Catalogue (GET list + GET single) is public; POST :id/refresh requires auth in route
app.use('/api/available-cards', availableCardsRouter);
app.use('/api/scrape', requireAuth, requireSuperadmin, scraperRouter);
app.use('/api', requireAuth, snapshotsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

app.get('/api/readiness', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'ready',
      checks: {
        database: 'ok',
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'not_ready',
      checks: {
        database: 'error',
      },
      error: error.message,
    });
  }
});

export default app;
