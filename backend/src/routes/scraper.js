import { Router } from 'express';
import { scrapeMilesopediaCards } from '../services/milesopediaScraper.js';

export const scraperRouter = Router();

// Fire-and-forget: start catalog refresh in background, return 202 immediately
scraperRouter.post('/milesopedia', async (req, res) => {
  console.log('[Scraper] POST /milesopedia — refresh all cards requested (fire-and-forget)');
  res.status(202).json({
    accepted: true,
    message: 'Catalog refresh started in the background. The catalog will update when complete.',
  });

  scrapeMilesopediaCards()
    .then((cards) => {
      console.log(`[Scraper] Background refresh done: ${cards.length} card(s)`);
    })
    .catch((err) => {
      console.error('[Scraper] Background refresh error:', err.message);
    });
});
