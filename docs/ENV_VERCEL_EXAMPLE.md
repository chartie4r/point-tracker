# Vercel Environment Example

Use these values in Vercel → Project Settings → Environment Variables.

```bash
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
SESSION_SECRET="replace-with-long-random-secret-32chars-min"
CORS_ORIGIN="https://your-project.vercel.app"
APP_URL="https://your-project.vercel.app"
NODE_ENV="production"

# Optional
SUPERADMIN_EMAIL="admin@example.com"
SUPERADMIN_PASSWORD="replace-with-strong-password"
SUPERADMIN_NAME="Admin"
```
