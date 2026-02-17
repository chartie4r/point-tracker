export function assertVercelProductionReadiness() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;

  const required = ['DATABASE_URL', 'SESSION_SECRET', 'APP_URL'];
  const missing = required.filter((name) => !String(process.env[name] || '').trim());

  if (missing.length > 0) {
    throw new Error(
      `[Config] Missing required environment variable(s) in production: ${missing.join(', ')}`,
    );
  }

  // Guard against weak defaults accidentally carried into production
  if (process.env.SESSION_SECRET === 'point-tracker-dev-secret-change-in-production') {
    throw new Error('[Config] SESSION_SECRET is using the development default in production');
  }
}
