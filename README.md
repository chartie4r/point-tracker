# Point Tracker

Track points and miles across credit cards. Node.js (Express) backend + Vue 3 frontend, SQLite (no Docker), optional Milesopedia scraper.

## Prerequisites

- Node.js 18+
- npm or yarn

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Optional: edit .env to change DATABASE_URL (default: file:./prisma/dev.db)
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The SQLite file is created at `backend/prisma/dev.db`. No database server or Docker required.

API runs at http://localhost:3000.

Health checks:
- Liveness: `GET /api/health`
- Readiness (includes DB ping): `GET /api/readiness`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173 (proxies `/api` to the backend).

## Scripts

- **Backend**: `npm run dev` (watch mode), `npm start`, `npm run db:push`, `npm run db:studio`
- **Frontend**: `npm run dev`, `npm run build`, `npm run preview`

## Environment

- `backend/.env`: `DATABASE_URL` (default `file:./prisma/dev.db`), `PORT` (default 3000), `SCRAPER_RATE_LIMIT_MS` (default 3000), `SESSION_SECRET`, `CORS_ORIGIN`
- Auth protection knobs: `AUTH_RATE_LIMIT_WINDOW_MS` (default 900000), `AUTH_RATE_LIMIT_MAX_REQUESTS` (default 10)
