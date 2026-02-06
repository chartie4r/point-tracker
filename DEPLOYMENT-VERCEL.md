# Deploy Point Tracker on Vercel only (free)

Backend and frontend both run on Vercel. The API runs as serverless functions; the database is **PostgreSQL** on [Neon](https://neon.tech) (free tier).

### What you need

- GitHub account  
- [Vercel](https://vercel.com) account (free)  
- [Neon](https://neon.tech) account (free PostgreSQL)

---

## Step 1 – Create the database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign in.
2. Create a new project (e.g. **Point Tracker**), choose a region.
3. Copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).  
   You’ll use it as `DATABASE_URL` in Step 3.

4. **(Optional)** Apply the schema once from your machine:
   - In the project root:
     ```bash
     cd backend
     set DATABASE_URL=your_neon_connection_string
     npx prisma db push --schema=prisma/schema.postgres.prisma
     ```
   - Or on macOS/Linux: `export DATABASE_URL="your_neon_connection_string"` then the same command.  
   If you skip this, the first deploy can run migrations (see Step 3).

---

## Step 2 – Push code to GitHub

From your project folder:

```bash
cd C:\dev\PointTracker
git add .
git commit -m "Add Vercel deployment"
git push origin main
```

(If the repo isn’t set up yet: create it on GitHub, then `git remote add origin ...` and push.)

---

## Step 3 – Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New Project** → import your **PointTracker** repo.
3. **Configure project**
   - **Root Directory:** leave as `.` (repo root).
   - **Framework Preset:** Other (or leave as detected).
   - **Build Command:** `npm run build`  
     (Uses root `package.json`: runs Prisma generate with Postgres schema, then builds the frontend.)
   - **Output Directory:** `frontend/dist`
   - **Install Command:**  
     `npm install --prefix frontend && npm install --prefix backend`

4. **Environment variables** (add before deploying):

   | Name             | Value                    | Notes |
   |------------------|--------------------------|--------|
   | `DATABASE_URL`   | Your Neon connection string | From Step 1. |
   | `SESSION_SECRET` | Long random string (e.g. 32+ chars) | Required. |
   | `CORS_ORIGIN`    | `https://your-project.vercel.app` | Your Vercel app URL; you can set this after the first deploy. |
   | `APP_URL`        | `https://your-project.vercel.app` | Used for password-reset links. |
   | `NODE_ENV`       | `production`            | Optional. |

   Optional (default superadmin, created on first API request):

   | Name                  | Value            |
   |-----------------------|------------------|
   | `SUPERADMIN_EMAIL`    | admin@example.com |
   | `SUPERADMIN_PASSWORD` | Secure password (8+ chars) |
   | `SUPERADMIN_NAME`     | Admin            |

5. Click **Deploy**.  
   The first deploy will:
   - Install frontend and backend dependencies.
   - Run `prisma generate` with the **Postgres** schema (so the serverless API uses PostgreSQL).
   - Build the frontend into `frontend/dist`.

6. **Apply the database schema** (if you didn’t in Step 1):
   - In the Vercel dashboard, open your project → **Settings** → **Environment Variables** and confirm `DATABASE_URL` is set.
   - Either:
     - Run locally once:
       ```bash
       cd backend
       set DATABASE_URL=your_neon_url
       npx prisma db push --schema=prisma/schema.postgres.prisma
       ```
     - Or use **Vercel** → **Settings** → **Functions** and run a one-off (if you add a small script), or run the same `prisma db push` from your machine with the same `DATABASE_URL`.

7. After deploy, open your app URL (e.g. `https://pointtracker-xxx.vercel.app`).
   - Set **`CORS_ORIGIN`** and **`APP_URL`** to that URL if you used a placeholder, then redeploy once.

---

## Step 4 – Frontend API URL

The frontend is served from the same domain as the API (e.g. `https://yourapp.vercel.app`).  
The app uses **relative** `/api` when `VITE_API_URL` is not set, so the same origin is used and you **don’t need** to set `VITE_API_URL` for Vercel.

If you ever deploy the frontend elsewhere, set:

- **`VITE_API_URL`** = `https://yourapp.vercel.app`  
  (no trailing slash)

---

## Summary

- **Frontend:** Built from `frontend/` and served from `frontend/dist` at `/`.
- **API:** All `/api/*` requests are handled by the serverless function in `api/[[...path]].js`, which uses the Express app in `backend/src/app.js`.
- **Database:** PostgreSQL on Neon; Prisma uses `backend/prisma/schema.postgres.prisma` for the Vercel build.
- **Sessions:** Stored in signed cookies (no Redis), so they work in serverless.

### Local development

- Keep using **SQLite** and `backend/prisma/schema.prisma` as you do now.
- Run the backend with `cd backend && npm run dev` and the frontend with `cd frontend && npm run dev`.
- For a **local build** that matches the current schema (SQLite), use:  
  `npm run build:local` from the repo root (uses `schema.prisma`).

### If something fails

- **Build:** Check the build logs. Ensure `DATABASE_URL` is set and that `npm run build` runs (Prisma generate + frontend build).
- **API 500:** Check **Vercel** → **Functions** → logs for the `/api` function. Ensure `DATABASE_URL` is correct and the Neon DB is reachable.
- **CORS:** Set `CORS_ORIGIN` to your exact Vercel URL (e.g. `https://pointtracker-xxx.vercel.app`).
