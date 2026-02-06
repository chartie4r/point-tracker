import app from './app.js';
import { ensureSuperadminFromConfig } from './services/authService.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const superadminEmail = await ensureSuperadminFromConfig();
    if (superadminEmail) {
      console.log(`[Config] Default superadmin ensured: ${superadminEmail}`);
    }
  } catch (err) {
    console.error('[Config] Failed to ensure superadmin from config:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Point Tracker API running on http://localhost:${PORT}`);
  });
}

start();
