import { describe, it, expect, vi } from 'vitest';
import { createMemoryRateLimiter } from './rateLimit.js';

function createRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('createMemoryRateLimiter', () => {
  it('allows requests within the configured limit', () => {
    const limiter = createMemoryRateLimiter({ windowMs: 60_000, maxRequests: 2, now: () => 1000 });
    const next = vi.fn();
    const req = { ip: '127.0.0.1', headers: {} };

    limiter(req, createRes(), next);
    limiter(req, createRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });

  it('blocks requests above the configured limit', () => {
    const limiter = createMemoryRateLimiter({ windowMs: 60_000, maxRequests: 1, now: () => 2000 });
    const next = vi.fn();
    const req = { ip: '127.0.0.1', headers: {} };

    limiter(req, createRes(), next);

    const blockedRes = createRes();
    limiter(req, blockedRes, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.body).toEqual({
      error: 'Too many auth attempts. Please try again later.',
    });
    expect(blockedRes.headers['Retry-After']).toBeDefined();
  });
});
