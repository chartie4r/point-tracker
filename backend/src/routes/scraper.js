import { Router } from 'express';
import { scrapeMilesopediaCards, isPuppeteerEnabled } from '../services/milesopediaScraper.js';

export const scraperRouter = Router();

// Fire-and-forget: start catalog refresh in background, return 202 immediately
// Query or body: useAi=true to run AI extraction (Claude); default false to minimize cost.
scraperRouter.post('/milesopedia', async (req, res) => {
  const useAi = req.query.useAi === 'true' || req.body?.useAi === true;
  const puppeteer = isPuppeteerEnabled();
  console.log('[Scraper] POST /milesopedia — refresh all cards requested (fire-and-forget)', puppeteer ? '(Puppeteer)' : '', useAi ? '(AI)' : '');
  res.status(202).json({
    accepted: true,
    message: useAi
      ? 'Catalog refresh with AI started in the background. The catalog will update when complete.'
      : 'Catalog refresh started in the background. The catalog will update when complete.',
    puppeteer,
    useAi,
  });

  scrapeMilesopediaCards({ useAi })
    .then((cards) => {
      console.log(`[Scraper] Background refresh done: ${cards.length} card(s)`);
    })
    .catch((err) => {
      console.error('[Scraper] Background refresh error:', err.message);
    });
});
