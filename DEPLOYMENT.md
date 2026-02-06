# Deploy Point Tracker (free tier)

Step-by-step to run the app on free hosting.

**Vercel only (backend + frontend on one platform):** see **[DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md)**. No Fly.io or Render; you use Neon (free PostgreSQL) and deploy everything on Vercel.

**Summary (Option A – recommended):**
1. Push the repo to GitHub.
2. Deploy backend on Fly.io (create app, volume, secrets, then `fly deploy` from `backend/`).
3. Deploy frontend on Vercel (set `VITE_API_URL` to your Fly URL).
4. Set `CORS_ORIGIN` on Fly to your Vercel URL.

---

Two ways to run the app for free:

- **Option A** – Backend on **Fly.io** (Node + SQLite), frontend on **Vercel**. No database change.
- **Option B** – Backend on **Render**, database on **Neon** (PostgreSQL), frontend on **Vercel**. Requires switching from SQLite to PostgreSQL.

Use **Option A** if you want the least changes. Use **Option B** if you prefer a managed database and don’t mind a small Prisma change.

---

## Option A: Fly.io (backend) + Vercel (frontend)

### What you need

- GitHub account
- [Fly.io](https://fly.io) account (free)
- [Vercel](https://vercel.com) account (free)

### Step 1 – Push code to GitHub

1. Create a new repo on GitHub (e.g. `PointTracker`).
2. In your project folder:

```bash
cd C:\dev\PointTracker
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PointTracker.git
git push -u origin main
```

(If the repo already exists and is connected, just push your latest changes.)

### Step 2 – Deploy the backend on Fly.io

The repo includes `backend/fly.toml` and `backend/Dockerfile`. You only need to create a volume, set secrets, and deploy.

1. **Install the Fly CLI**  
   https://fly.io/docs/hub/install/  
   **Windows (PowerShell):** `iwr https://fly.io/install.ps1 -useb | iex`

2. **Log in and create the app** (from project root):

   ```bash
   cd C:\dev\PointTracker
   fly auth login
   cd backend
   fly launch --no-deploy
   ```

   When prompted:
   - **App name:** e.g. `pointtracker-api` (or leave default).
   - **Region:** pick one close to you (e.g. `yyz` for Toronto).
   - **Postgres / Redis:** No.
   - **Deploy now:** No.

3. **Create a volume** (same region as the app; replace `yyz` with your region):

   ```bash
   fly volumes create pointtracker_data --size 1 --region yyz
   ```

4. **Set secrets** (replace the values; you can set `CORS_ORIGIN` after deploying the frontend):

   ```bash
   fly secrets set DATABASE_URL="file:/data/dev.db" --app pointtracker-api
   fly secrets set SESSION_SECRET="PUT_A_LONG_RANDOM_STRING_HERE_32_CHARS_MIN" --app pointtracker-api
   fly secrets set CORS_ORIGIN="https://your-app.vercel.app" --app pointtracker-api
   ```

   You can update `CORS_ORIGIN` later: set the secret again, then run `fly deploy --app pointtracker-api` from `backend/`.

5. **Deploy** (from `backend/`):

   ```bash
   cd C:\dev\PointTracker\backend
   fly deploy
   ```

   The Dockerfile runs `prisma db push` on startup so the SQLite schema is created on first run. If deploy fails, check: `fly logs --app pointtracker-api`.

6. **Note your backend URL** (e.g. `https://pointtracker-api.fly.dev`) for the frontend and for updating `CORS_ORIGIN`.

### Step 3 – Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New Project** → import your `PointTracker` repo.
3. **Configure:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment variables** (add before deploying):
   - `VITE_API_URL` = `https://pointtracker-api.fly.dev` (your Fly backend URL; no trailing slash)
5. Deploy. Vercel will give you a URL like `https://pointtracker-xxx.vercel.app`.
6. **CORS:** In Fly, set the frontend URL as allowed origin:

   ```bash
   fly secrets set CORS_ORIGIN="https://pointtracker-xxx.vercel.app" --app pointtracker-api
   ```

   Redeploy the backend if needed so the new secret is used: `fly deploy --app pointtracker-api` (from the folder where you run deploy).

7. (Optional) Set a **custom domain** for the frontend in Vercel, then set `CORS_ORIGIN` to that domain and update `VITE_API_URL` if you point the domain at the frontend.

### Step 4 – Superadmin (optional)

To create the default superadmin account, set Fly secrets:

```bash
fly secrets set SUPERADMIN_EMAIL="your@email.com" --app pointtracker-api
fly secrets set SUPERADMIN_PASSWORD="a-secure-password" --app pointtracker-api
fly secrets set SUPERADMIN_NAME="Admin" --app pointtracker-api
```

Restart the app so it runs startup logic: `fly apps restart pointtracker-api`.

---

## Option B: Render (backend) + Neon (PostgreSQL) + Vercel (frontend)

This keeps the app free by using Neon’s free PostgreSQL and Render’s free web service. The backend must use PostgreSQL instead of SQLite.

### Step 1 – Switch backend to PostgreSQL

1. Create a free database at [neon.tech](https://neon.tech). Create a project and copy the connection string (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).

2. In your project, update Prisma to use PostgreSQL:

   **backend/prisma/schema.prisma** – change the datasource:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Install the PostgreSQL driver (optional; Prisma includes it):

   ```bash
   cd backend
   npm install pg
   ```

4. Generate and create the schema (locally, with Neon’s URL in `.env`):

   ```bash
   cd backend
   # In .env set DATABASE_URL to your Neon connection string
   npx prisma generate
   npx prisma db push
   ```

5. Commit and push the changes.

### Step 2 – Deploy backend on Render

1. Go to [render.com](https://render.com), sign in with GitHub.
2. **New → Web Service**. Connect the `PointTracker` repo.
3. **Configure:**
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npx prisma db push && node src/index.js`  
     (or use migrations: `npx prisma migrate deploy && node src/index.js`)
   - **Plan:** Free
4. **Environment variables** (add in Render dashboard):
   - `DATABASE_URL` = your Neon connection string
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `SESSION_SECRET` = a long random string
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app` (you’ll set this after deploying the frontend)
   - Optional: `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME`
5. Create the service. Note the URL (e.g. `https://pointtracker-api.onrender.com`).

### Step 3 – Deploy frontend on Vercel

Same as Option A, Step 3, but set:

- `VITE_API_URL` = your Render backend URL (e.g. `https://pointtracker-api.onrender.com`).

Then in Render, set `CORS_ORIGIN` to your Vercel URL (e.g. `https://pointtracker-xxx.vercel.app`).

### Step 4 – Render free tier note

On the free plan, the service sleeps after ~15 minutes of no traffic. The first request after that can take 30–60 seconds. For always-on, you’d need a paid plan or use Fly.io (Option A).

---

## Checklist (either option)

- [ ] Backend `SESSION_SECRET` is a long random value (not the default).
- [ ] `CORS_ORIGIN` on the backend equals your frontend URL (no trailing slash).
- [ ] Frontend `VITE_API_URL` equals your backend URL (no trailing slash).
- [ ] Database is created and schema applied (`prisma db push` or `prisma migrate deploy`).
- [ ] (Optional) Superadmin env vars set if you use the config superadmin feature.

---

## Quick reference

| Item           | Option A (Fly + Vercel)     | Option B (Render + Neon + Vercel) |
|----------------|-----------------------------|------------------------------------|
| Backend host   | Fly.io                      | Render                             |
| Database       | SQLite (volume on Fly)      | PostgreSQL (Neon)                  |
| Frontend host  | Vercel                      | Vercel                             |
| Code change    | None (only deploy config)   | Prisma: `provider = "postgresql"`  |
| Cold starts    | Minimal (Fly free)          | Yes on Render free (~30–60 s)      |

If you tell me which option you prefer (A or B), I can adapt the steps to your repo layout (e.g. where `fly.toml` lives and exact deploy commands).
