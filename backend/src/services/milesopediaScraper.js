import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const BASE_URL = 'https://milesopedia.com';
const SITEMAP_URL = `${BASE_URL}/card-sitemap.xml`;
const RATE_LIMIT_MS = Number(process.env.SCRAPER_RATE_LIMIT_MS) || 3000;

const prisma = new PrismaClient();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const BANK_MAP = {
  'american express': 'AMEX',
  'amex': 'AMEX',
  'banque nationale': 'BNC',
  'bnc': 'BNC',
  'bmo': 'BMO',
  'cibc': 'CIBC',
  'rbc': 'RBC',
  'banque royale': 'RBC',
  'scotia': 'Scotia',
  'banque scotia': 'Scotia',
  'td': 'TD',
};

// Order matters: most specific first so "rbc avion" wins over "avion", "cibc aventura" over "aventura".
const POINTS_TYPE_MAP = [
  ['points privilèges', 'Aeroplan'],
  ['points-privileges', 'Aeroplan'],
  ['aéroplan', 'Aeroplan'],
  ['aeroplan', 'Aeroplan'],
  ['bnc récompenses', 'BNC'],
  ['récompenses bnc', 'BNC'],
  ['marriott bonvoy', 'Marriott_Bonvoy'],
  ['bonvoy', 'Marriott_Bonvoy'],
  ['marriott', 'Marriott_Bonvoy'],
  ['cibc aventura', 'CIBC'],
  ['aventura', 'CIBC'],
  ['rbc avion', 'RBC'],
  ['avion', 'RBC'],
  ['viporter', 'VIP_Porter'],
  ['vip porter', 'VIP_Porter'],
  // Scene (Scotiabank): specific before generic
  ['scotia scene', 'Scene'],
  ['scotia scène', 'Scene'],
  ['carte scène', 'Scene'],
  ['carte scene', 'Scene'],
  ['points scène', 'Scene'],
  ['points scene', 'Scene'],
  ['scène scotia', 'Scene'],
  ['scene scotia', 'Scene'],
  ['scène', 'Scene'],
  ['scene', 'Scene'],
  // Cashback: specific before generic (Scotiabank and others)
  ['scotia cashback', 'Cashback'],
  ['carte cashback', 'Cashback'],
  ['remise en argent', 'Cashback'],
  ['remise', 'Cashback'],
  ['cashback', 'Cashback'],
  ['primes td', 'TD'],
  ['td rewards', 'TD'],
  ['rewards td', 'TD'],
  ['bnc', 'BNC'],
  ['td', 'TD'],
];

// Scotia cards are almost always Scene or Cashback; use when bank is Scotia and we need to disambiguate.
const SCOTIA_POINTS_MAP = [
  ['scotia scene', 'Scene'],
  ['scotia scène', 'Scene'],
  ['carte scène', 'Scene'],
  ['points scène', 'Scene'],
  ['scène', 'Scene'],
  ['scene', 'Scene'],
  ['scotia cashback', 'Cashback'],
  ['carte cashback', 'Cashback'],
  ['remise en argent', 'Cashback'],
  ['remise', 'Cashback'],
  ['cashback', 'Cashback'],
];

const CARD_TYPE_MAP = {
  'american express': 'AMEX',
  'amex': 'AMEX',
  'mastercard': 'MASTERCARD',
  'master card': 'MASTERCARD',
  'master-card': 'MASTERCARD',
  'visa': 'VISA',
};

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchMap(text, map) {
  const t = normalize(text);
  const entries = Array.isArray(map) ? map : Object.entries(map);
  for (const [key, value] of entries) {
    const k = normalize(key);
    if (k && t.includes(k)) return value;
  }
  return null;
}

/** Match points type from slug (hyphenated). Prefer program names in slug for accuracy. */
function pointsTypeFromSlug(slugNorm) {
  if (!slugNorm || typeof slugNorm !== 'string') return null;
  const s = slugNorm.toLowerCase();
  if (s.includes('aeroplan')) return 'Aeroplan';
  if (s.includes('avion')) return 'RBC';
  if (s.includes('aventura')) return 'CIBC';
  if (s.includes('bonvoy') || s.includes('marriott')) return 'Marriott_Bonvoy';
  // Scotia: scene and cashback (check before generic td/bnc so scotia-scene wins)
  if (s.includes('scene')) return 'Scene';
  if (s.includes('cashback')) return 'Cashback';
  if (s.includes('viporter') || s.includes('vip-porter')) return 'VIP_Porter';
  if (s.includes('privilege')) return 'Aeroplan';
  if (s.includes('bnc') && (s.includes('recompenses') || s.includes('rewards'))) return 'BNC';
  if (s.includes('bnc')) return 'BNC';
  if (s.includes('td')) return 'TD';
  return null;
}

function extractNumber(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.replace(/\s/g, '').match(/(\d[\d\s]*)/);
  return m ? parseInt(m[1].replace(/\s/g, ''), 10) : null;
}

/** Normalize spaces: nbsp (\\u00a0) and HTML entity &nbsp; so dollar parsing works */
function normalizeSpaces(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\u00a0/g, ' ').replace(/&nbsp;/gi, ' ');
}

/** Extract dollar value from text (e.g. "1 500 $", "1,500$", "300 $", "300&nbsp;$"). Prefers number followed by $ */
function extractDollarValue(str) {
  if (!str || typeof str !== 'string') return null;
  const s = normalizeSpaces(str);
  // Prefer pattern: number immediately before $ (e.g. "300 $" or "1 500 $")
  const withDollar = s.match(/(\d[\d\s,]*)\s*\$/);
  if (withDollar) {
    const n = parseInt(withDollar[1].replace(/[\s,]/g, ''), 10);
    if (Number.isFinite(n) && n >= 0 && n < 1000000) return n;
  }
  const cleaned = s.replace(/\s/g, '').replace(/,/g, '');
  const m = cleaned.match(/(\d+)\$?/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 0 && n < 1000000 ? n : null;
}

/**
 * Extract structured card data from Milesopedia's embedded JSON (e.g. in script/data).
 * Returns partial object with annualCost, minSpend, welcomeBonusPoints, etc. when found.
 */
function extractEmbeddedCardData(html) {
  const out = {};
  if (!html || typeof html !== 'string') return out;

  // "annual_fee":"180" or "annual_fee": "180"
  const annualFeeM = html.match(/"annual_fee"\s*:\s*"(\d+)"/);
  if (annualFeeM) {
    const n = parseInt(annualFeeM[1], 10);
    if (!Number.isNaN(n) && n < 10000) out.annualCost = n;
  }

  // "minimum_spending":"40000$" (may be escaped in HTML; capture digits after key)
  const minSpendM = html.match(/minimum_spending[^0-9]*(\d+)/);
  if (minSpendM) {
    const n = parseInt(minSpendM[1], 10);
    if (!Number.isNaN(n) && n >= 100 && n < 10000000) out.minSpend = n;
  }

  // "mc_welcome_bonus_amount":"75000"
  const welcomePointsM = html.match(/"mc_welcome_bonus_amount"\s*:\s*"(\d+)"/);
  if (welcomePointsM) {
    const n = parseInt(welcomePointsM[1], 10);
    if (!Number.isNaN(n) && n > 0) out.welcomeBonusPoints = n;
  }

  // "main":{"value":"400",...} - first year dollar value (main.value in embedded card JSON)
  const mainStart = html.indexOf('"main"');
  if (mainStart !== -1) {
    const slice = html.slice(mainStart, mainStart + 800);
    const valueM = slice.match(/"value"\s*:\s*"(\d+)"/);
    if (valueM) {
      const n = parseInt(valueM[1], 10);
      if (!Number.isNaN(n) && n >= 0 && n < 100000) out.welcomeValueY1 = n;
    }
  }

  // Rewards/points program from embedded JSON (e.g. "rewards_program":"Aeroplan", "program":"Avion")
  const programKeys = [
    /"rewards_program"\s*:\s*"([^"]+)"/,
    /"points_program"\s*:\s*"([^"]+)"/,
    /"program"\s*:\s*"([^"]+)"/,
    /"reward_program"\s*:\s*"([^"]+)"/,
  ];
  for (const re of programKeys) {
    const m = html.match(re);
    if (m && m[1]) {
      const v = normalize(m[1]);
      if (v.includes('aeroplan') || v.includes('privilege')) {
        out.pointsType = 'Aeroplan';
        break;
      }
      if (v.includes('avion')) {
        out.pointsType = 'RBC';
        break;
      }
      if (v.includes('aventura')) {
        out.pointsType = 'CIBC';
        break;
      }
      if (v.includes('bonvoy') || v.includes('marriott')) {
        out.pointsType = 'Marriott_Bonvoy';
        break;
      }
      if (v.includes('scene')) {
        out.pointsType = 'Scene';
        break;
      }
      if (v.includes('cashback') || v.includes('remise')) {
        out.pointsType = 'Cashback';
        break;
      }
      if (v.includes('vip') && v.includes('porter')) {
        out.pointsType = 'VIP_Porter';
        break;
      }
      if (v.includes('bnc')) {
        out.pointsType = 'BNC';
        break;
      }
      if (v.includes('td')) {
        out.pointsType = 'TD';
        break;
      }
    }
  }

  // Card network/type from embedded JSON (e.g. "card_network":"Visa", "network":"mastercard")
  const networkKeys = [
    /"card_network"\s*:\s*"([^"]+)"/,
    /"payment_network"\s*:\s*"([^"]+)"/,
    /"network"\s*:\s*"([^"]+)"/,
    /"card_type"\s*:\s*"([^"]+)"/,
    /"cardType"\s*:\s*"([^"]+)"/,
  ];
  for (const re of networkKeys) {
    const m = html.match(re);
    if (m && m[1]) {
      const v = normalize(m[1]);
      if (v.includes('amex') || v.includes('american')) {
        out.type = 'AMEX';
        break;
      }
      if (v.includes('master')) {
        out.type = 'MASTERCARD';
        break;
      }
      if (v.includes('visa')) {
        out.type = 'VISA';
        break;
      }
    }
  }

  return out;
}

/**
 * Extract welcome offer dollar value (e.g. "une valeur pouvant aller jusqu'à 1 500 $") from page text.
 */
function extractWelcomeDollarValue(html) {
  // "valeur pouvant aller jusqu'à 1 500 $" (apostrophe may be ' or ')
  const m = html.match(/valeur\s+pouvant\s+aller\s+jusqu['\u2019]?\s*à\s+(\d[\d\s]*)\s*\$?/i)
    || html.match(/jusqu['\u2019]?\s*à\s+(\d[\d\s]*)\s*\$?\s*†/i)
    || html.match(/(\d[\d\s]{2,6})\s*\$?\s*†[^0-9]*\)\s*:/i);  // "1 500 $†) :"
  if (m) {
    const n = parseInt(m[1].replace(/\s/g, ''), 10);
    if (!Number.isNaN(n) && n >= 100 && n < 1000000) return n;
  }
  return null;
}

async function fetchPage(url, tries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PointTracker/1.0 (Personal points tracker; respectful crawler)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.text();
    } catch (err) {
      lastError = err;
      const message = String(err?.message || '');
      const isTransient =
        /socket hang up/i.test(message) ||
        /ECONNRESET/i.test(message) ||
        /ETIMEDOUT/i.test(message) ||
        /ENOTFOUND/i.test(message);

      if (!isTransient || attempt === tries) {
        throw err;
      }

      // Backoff before retrying
      const backoff = RATE_LIMIT_MS * attempt;
      console.warn(`Fetch failed for ${url} (attempt ${attempt}/${tries}): ${message}. Retrying in ${backoff}ms…`);
      await delay(backoff);
    }
  }
  throw lastError;
}

export async function scrapeMilesopediaCards() {
  console.log('[Milesopedia] Refresh all cards: starting…');
  // Use Milesopedia card sitemap for a complete list of credit-card URLs
  const xml = await fetchPage(SITEMAP_URL);
  await delay(RATE_LIMIT_MS);
  const $ = cheerio.load(xml, { xmlMode: true });

  const cardLinks = [];
  $('url').each((_, el) => {
    // Prefer French card URL if available, otherwise fall back to <loc>
    let url = $(el).find('xhtml\\:link[hreflang="fr-CA"]').attr('href');
    if (!url) {
      url = $(el).find('loc').first().text().trim();
    }
    if (!url) return;

    // Restrict to credit-card pages
    if (!url.includes('/cartes-de-credit/') && !url.includes('/en/credit-cards/')) return;

    const full = url.startsWith('http') ? url : new URL(url, BASE_URL).href;
    if (!cardLinks.some((c) => c.url === full)) {
      const slug = full.replace(/\/$/, '').split('/').pop();
      cardLinks.push({ url: full, slug });
    }
  });

  console.log(`[Milesopedia] Sitemap: ${cardLinks.length} card URL(s) to scrape`);
  const results = [];
  const total = cardLinks.length;
  const dbPayload = (c) => ({
    cardName: c.cardName,
    type: c.type,
    bank: c.bank,
    pointsType: c.pointsType,
    annualCost: c.annualCost ?? null,
    welcomeValueY1: c.welcomeValueY1 ?? null,
    welcomeValueY2: c.welcomeValueY2 ?? null,
    minSpend: c.minSpend ?? null,
    bonusDetails: c.bonusDetails ?? null,
    milesopediaUrl: c.milesopediaUrl ?? null,
    milesopediaSlug: c.milesopediaSlug,
  });

  for (let i = 0; i < cardLinks.length; i++) {
    const { url, slug } = cardLinks[i];
    try {
      const pageHtml = await fetchPage(url);
      await delay(RATE_LIMIT_MS);
      const card = parseCardDetail(pageHtml, url, slug);
      if (!card.cardName) continue;
      results.push(card);

      try {
        await prisma.scrapedCard.upsert({
          where: { milesopediaSlug: card.milesopediaSlug },
          create: dbPayload(card),
          update: dbPayload(card),
        });
        console.log(`[Milesopedia] DB updated: ${card.cardName} (${card.bank}, ${card.milesopediaSlug})`);
      } catch (dbErr) {
        console.warn(`[Milesopedia] DB upsert failed for ${card.milesopediaSlug}:`, dbErr.message);
      }

      if ((i + 1) % 20 === 0 || i === total - 1) {
        console.log(`[Milesopedia] Progress: ${i + 1}/${total} pages, ${results.length} card(s) parsed & saved`);
      }
    } catch (e) {
      console.warn(`[Milesopedia] Skip ${url}:`, e.message);
    }
  }

  console.log(`[Milesopedia] Scrape done: ${results.length} card(s) processed`);
  try {
    const completedAt = new Date();
    await prisma.catalogRefresh.upsert({
      where: { id: 'catalog' },
      create: { id: 'catalog', completedAt },
      update: { completedAt },
    });
    console.log(`[Milesopedia] Catalog refresh date saved: ${completedAt.toISOString()}`);
  } catch (err) {
    console.warn('[Milesopedia] Failed to save catalog refresh date:', err.message);
  }

  return results;
}

export async function scrapeSingleMilesopediaCard(url) {
  console.log('[Milesopedia] scrapeSingleMilesopediaCard:', url);
  const pageHtml = await fetchPage(url);
  const slug = url.replace(/\/$/, '').split('/').pop();
  return parseCardDetail(pageHtml, url, slug);
}

function parseCardDetail(html, url, slug) {
  const $ = cheerio.load(html);

  // Prefer embedded JSON when present (authoritative on Milesopedia)
  const embedded = extractEmbeddedCardData(html);
  const welcomeDollarY1 = extractWelcomeDollarValue(html);

  let cardName = $('h1').first().text().trim() || $('title').text().split('|')[0].trim();
  if (!cardName) {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) cardName = ogTitle.replace(/\s*\|\s*Milesopedia.*$/i, '').trim();
  }

  const bodyText = $('body').text();
  const slugNorm = normalize(slug || '');
  const slugWithSpaces = slugNorm.replace(/-/g, ' ');

  // Card type: 1) embedded JSON, 2) URL slug, 3) card name only (reduces false positives from body), 4) card name + body
  let type = embedded.type ?? null;
  if (!type) {
    // Slug: check AMEX/Mastercard before Visa so "amex" in slug wins; use \b-style by checking hyphen/word boundaries
    if (slugWithSpaces.includes('american express') || slugWithSpaces.includes('amex')) type = 'AMEX';
    else if (slugWithSpaces.includes('mastercard') || slugWithSpaces.includes('master card') || /(^|\s)mc(\s|$)/.test(slugWithSpaces)) type = 'MASTERCARD';
    else if (slugWithSpaces.includes('visa')) type = 'VISA';
  }
  if (!type) type = matchMap(cardName, CARD_TYPE_MAP);
  if (!type) type = matchMap(cardName + ' ' + bodyText, CARD_TYPE_MAP);

  // Prefer bank from URL slug (e.g. carte-affaires-cibc-visa-aeroplan -> CIBC)
  let bank = null;
  for (const [key, value] of Object.entries(BANK_MAP)) {
    if (slugNorm.includes(key.replace(/\s/g, '-'))) {
      bank = value;
      break;
    }
  }
  if (!bank) bank = matchMap(cardName + ' ' + bodyText, BANK_MAP);

  // Points type: 1) embedded JSON, 2) URL slug (very reliable on Milesopedia), 3) card name then full text
  let pointsType = embedded.pointsType ?? null;
  if (!pointsType) pointsType = pointsTypeFromSlug(slugNorm);
  if (!pointsType) pointsType = matchMap(cardName, POINTS_TYPE_MAP);
  if (!pointsType) pointsType = matchMap(cardName + ' ' + bodyText, POINTS_TYPE_MAP);

  // Scotia cards are almost always Scene or Cashback; if we have Scotia and got something else (or nothing), re-check for Scene/Cashback only
  if (bank === 'Scotia' && pointsType !== 'Scene' && pointsType !== 'Cashback') {
    const scotiaType = matchMap(cardName + ' ' + bodyText + ' ' + slugWithSpaces, SCOTIA_POINTS_MAP);
    if (scotiaType) pointsType = scotiaType;
  }

  // Annual cost: embedded first, then DOM (prefer short "Frais annuels" + number)
  let annualCost = embedded.annualCost ?? null;
  if (annualCost === null) {
    const feeMatch = bodyText.match(/Frais\s+annuels\s*(\d[\d\s]*)\s*\$?/i) || bodyText.match(/frais\s+annuels\s*(\d[\d\s]*)\s*\$?/i);
    if (feeMatch) {
      const n = parseInt(feeMatch[1].replace(/\s/g, ''), 10);
      if (!Number.isNaN(n) && n < 10000) annualCost = n;
    }
  }
  if (annualCost === null) {
    $('*').each((_, el) => {
      const text = $(el).text();
      if (text.length > 10 && text.length < 80 && (normalize(text).includes('frais annuels') || normalize(text).includes('carte principale'))) {
        const num = extractNumber(text);
        if (num !== null && num < 10000) annualCost = num;
      }
    });
  }

  // Welcome bonus: #welcome_offer_year_one (Y1) and the div right after (Y2)
  // Structure: <div id="welcome_offer_year_one"><span class="text-black">300&nbsp;$</span></div>
  let welcomeValueY1 = null;
  let welcomeValueY2 = null;
  const y1El = $('#welcome_offer_year_one').length ? $('#welcome_offer_year_one') : $('[id*="welcome_offer_year"]').first();
  if (y1El.length) {
    const getElText = ($el) =>
      normalizeSpaces(
        $el.find('.text-black').first().text().trim() ||
          $el.find('span').first().text().trim() ||
          $el.text().trim(),
      );
    const y1Text = getElText(y1El);
    welcomeValueY1 = extractDollarValue(y1Text);
    if (welcomeValueY1 === null) {
      const n = extractNumber(y1Text);
      if (n !== null && n >= 0 && n < 1000000) welcomeValueY1 = n;
    }
    console.log('[Milesopedia] #welcome_offer_year_one in DOM, y1Text:', JSON.stringify(y1Text), '-> welcomeValueY1:', welcomeValueY1);
    if (!y1Text || welcomeValueY1 === null) {
      // Div exists but empty (likely JS-rendered content). Try raw HTML in case value is in the response.
      const rawY1Match = html.match(/id=["']welcome_offer_year_one["'][^>]*>([\s\S]*?)<\/div\s*>/i);
      if (rawY1Match && rawY1Match[1].replace(/\s/g, '').length > 0) {
        const rawY1Text = normalizeSpaces(
          rawY1Match[1]
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\u00a0/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .trim(),
        );
        let rawVal = extractDollarValue(rawY1Text);
        if (rawVal === null) {
          const n = extractNumber(rawY1Text);
          if (n !== null && n >= 0 && n < 1000000) rawVal = n;
        }
        if (rawVal !== null) {
          welcomeValueY1 = rawVal;
          console.log('[Milesopedia] welcomeValueY1 from raw HTML (DOM was empty):', welcomeValueY1);
        }
      }
    }
    const y2El = y1El.next('div').length ? y1El.next('div') : y1El.next();
    if (y2El.length) {
      const y2Text = getElText(y2El);
      welcomeValueY2 = extractDollarValue(y2Text);
      if (welcomeValueY2 === null) {
        const n = extractNumber(y2Text);
        if (n !== null && n >= 0 && n < 100000) welcomeValueY2 = n;
      }
      if (welcomeValueY2 === 2) welcomeValueY2 = null;
    }
  } else {
    console.log('[Milesopedia] #welcome_offer_year_one not in DOM, trying raw HTML fallback');
    const rawY1Match = html.match(/id=["']welcome_offer_year_one["'][^>]*>([\s\S]*?)<\/div\s*>/i);
    if (rawY1Match) {
      const rawY1Text = normalizeSpaces(
        rawY1Match[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\u00a0/g, ' ')
          .replace(/&nbsp;/gi, ' ')
          .trim(),
      );
      welcomeValueY1 = extractDollarValue(rawY1Text);
      if (welcomeValueY1 === null) {
        const n = extractNumber(rawY1Text);
        if (n !== null && n >= 0 && n < 1000000) welcomeValueY1 = n;
      }
      console.log('[Milesopedia] Raw HTML welcome_offer_year_one -> welcomeValueY1:', welcomeValueY1);
    }
  }
  // Fallback: embedded JSON main.value (first year dollar value) - used when DOM/raw HTML have no value (e.g. JS-rendered page)
  if (welcomeValueY1 === null && embedded.welcomeValueY1 != null) {
    welcomeValueY1 = embedded.welcomeValueY1;
    console.log('[Milesopedia] welcomeValueY1 from embedded JSON (main.value):', welcomeValueY1);
  }
  // Fallback: regex "valeur pouvant aller jusqu'à X $"
  if (welcomeValueY1 === null) {
    welcomeValueY1 = welcomeDollarY1 ?? null;
  }
  // Fallback: DOM scan for "Valeur de l'offre 1ère année" (same element or next sibling has the $ amount)
  if (welcomeValueY1 === null) {
    $('*').each((_, el) => {
      const $el = $(el);
      const raw = $el.text().trim();
      if (!raw || raw.length > 200) return;
      const t = normalize(raw);
      const isY1Label =
        t.includes('valeur de l\'offre 1ere annee') ||
        t.includes('valeur de l\'offre 1ère annee') ||
        t.includes('valeur de la premiere annee') ||
        t.includes('valeur de la première annee');
      if (isY1Label) {
        const n = extractDollarValue(raw) ?? extractNumber(raw);
        if (n !== null && n >= 0 && n < 100000) welcomeValueY1 = n;
        if (welcomeValueY1 === null && $el.next().length) {
          const nextVal = extractDollarValue($el.next().text().trim()) ?? extractNumber($el.next().text().trim());
          if (nextVal !== null && nextVal >= 0 && nextVal < 100000) welcomeValueY1 = nextVal;
        }
      }
      if (t.includes('annee 2 et suivantes') || t.includes('année 2 et suivantes')) {
        const n = extractNumber(raw);
        if (n !== null && n !== 2 && n < 100000) welcomeValueY2 = n;
      }
    });
  }

  // Minimum spend: embedded first, then "Achats minimum requis" in DOM
  let minSpend = embedded.minSpend ?? null;
  if (minSpend === null) {
    const minMatch = bodyText.match(/Achats?\s+minimum\s+requis\s*(\d[\d\s]*)\s*\$?/i) || bodyText.match(/minimum\s+spending["\s:]+(\d[\d\s]*)\s*\$?/i);
    if (minMatch) {
      const n = parseInt(minMatch[1].replace(/\s/g, ''), 10);
      if (!Number.isNaN(n) && n > 0 && n < 10000000) minSpend = n;
    }
  }
  const spends = [];
  const bonusLines = [];
  $('li, p').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    const t = normalize(raw);
    const isBonusLine =
      t.includes('prime de bienvenue') ||
      t.startsWith('obtenez ') ||
      t.startsWith('obtenez jusqu') ||
      t.startsWith('les nouveaux') ||
      t.startsWith('les nouvelles');
    if (!isBonusLine) return;
    bonusLines.push(raw);
    if (minSpend === null && raw.includes('$')) {
      const matches = raw.replace(/\s/g, '').match(/(\d[\d]*)/g);
      if (matches) {
        for (const m of matches) {
          const n = parseInt(m, 10);
          if (!Number.isNaN(n) && n >= 1000 && n < 1000000) spends.push(n);
        }
      }
    }
  });
  if (minSpend === null && spends.length) minSpend = Math.max(...spends);

  const bonusDetails = bonusLines.length ? bonusLines.join('\n') : null;

  return {
    cardName: cardName || 'Unknown',
    type: type || 'VISA',
    status: 'To_Open',
    pointsType: pointsType || 'Aeroplan',
    bank: bank || 'TD',
    annualCost: annualCost ?? null,
    welcomeValueY1: welcomeValueY1 ?? null,
    welcomeValueY2: welcomeValueY2 ?? null,
    minSpend: minSpend ?? null,
    bonusDetails,
    milesopediaUrl: url,
    milesopediaSlug: slug,
  };
}
