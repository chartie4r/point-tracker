# Point Tracker API - production image (SQLite data in /data via volume)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
# Ensure SQLite schema exists (idempotent); then start the server
CMD ["sh", "-c", "npx prisma db push --skip-generate 2>/dev/null || true; exec node src/index.js"]
