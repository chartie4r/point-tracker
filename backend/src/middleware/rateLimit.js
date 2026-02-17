const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 10;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getClientIp(req) {
  if (req.ip) return req.ip;
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function createMemoryRateLimiter({
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
  now = () => Date.now(),
} = {}) {
  const hitsByIp = new Map();

  return (req, res, next) => {
    const currentTime = now();
    const ip = getClientIp(req);
    const entry = hitsByIp.get(ip);

    if (!entry || currentTime - entry.windowStart >= windowMs) {
      hitsByIp.set(ip, { count: 1, windowStart: currentTime });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (currentTime - entry.windowStart)) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      return res.status(429).json({
        error: 'Too many auth attempts. Please try again later.',
      });
    }

    entry.count += 1;
    return next();
  };
}

export function createAuthRateLimiterFromEnv() {
  const windowMs = parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS);
  const maxRequests = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, DEFAULT_MAX_REQUESTS);
  return createMemoryRateLimiter({ windowMs, maxRequests });
}
