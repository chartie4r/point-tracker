import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { extractCardDataWithAi, isAiExtractionEnabled } from './milesopediaAiExtractor.js';

const BASE_URL = 'https://milesopedia.com';
const SITEMAP_URL = `${BASE_URL}/card-sitemap.xml`;
const RATE_LIMIT_MS = Number(process.env.SCRAPER_RATE_LIMIT_MS) || 3000;
const CONCURRENCY = Math.max(1, Math.min(50, Number(process.env.SCRAPER_CONCURRENCY) || 20));
const USE_PUPPETEER = process.env.SCRAPER_USE_PUPPETEER === 'true';

/** Whether the full catalog refresh (scrapeMilesopediaCards) will use Puppeteer for card pages. */
export function isPuppeteerEnabled() {
  return USE_PUPPETEER;
}

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
  // Points privilèges AMEX (before generic "points privilèges" -> Aeroplan)
  ['points privilèges american express', 'Amex_Privileges'],
  ['points privilèges amex', 'Amex_Privileges'],
  ['points-privileges american express', 'Amex_Privileges'],
  ['points-privileges amex', 'Amex_Privileges'],
  ['privilèges amex', 'Amex_Privileges'],
  ['points privilèges', 'Aeroplan'],
  ['points-privileges', 'Aeroplan'],
  ['aéroplan', 'Aeroplan'],
  ['aeroplan', 'Aeroplan'],
  // BNC: "Banque Nationale" appears in card names; match before generic "bnc"
  ['banque nationale', 'BNC'],
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
  // Points privilèges AMEX: slug often "points-privileges-american-express" or "...-amex"
  if ((s.includes('privilege') || s.includes('privileges')) && (s.includes('amex') || s.includes('american-express'))) return 'Amex_Privileges';
  if (s.includes('privilege')) return 'Aeroplan';
  // BNC: slug often "banque-nationale" or "bnc" (not always "bnc")
  if (s.includes('banque-nationale')) return 'BNC';
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

  // "minimum_spending":"6 000 $" or "40000$" - parse full value (spaces = French number formatting)
  const minSpendStrM = html.match(/"minimum_spending"\s*:\s*"([^"]+)"/);
  if (minSpendStrM) {
    const cleaned = minSpendStrM[1].replace(/\s/g, '').replace(/[^\d]/g, '');
    const n = parseInt(cleaned, 10);
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
      if ((v.includes('privilege') || v.includes('privileges')) && v.includes('amex')) {
        out.pointsType = 'Amex_Privileges';
        break;
      }
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
      if ((v.includes('banque') && v.includes('nationale')) || v.includes('bnc')) {
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

  // Lounge / VIP salon: embedded JSON keys (snake_case or camelCase)
  const loungeTrue = /"lounge_access"\s*:\s*(?:true|"true")/i.test(html)
    || /"has_lounge"\s*:\s*(?:true|"true")/i.test(html)
    || /"lounge"\s*:\s*(?:true|"true")/i.test(html)
    || /"salon_vip"\s*:\s*(?:true|"true")/i.test(html)
    || /"vip_lounge"\s*:\s*(?:true|"true")/i.test(html);
  if (loungeTrue) out.loungeAccess = true;
  // Array of advantages/benefits/features containing lounge/salon
  const advantagesM = html.match(/"avantages"\s*:\s*\[([^\]]+)\]/i) || html.match(/"benefits"\s*:\s*\[([^\]]+)\]/i) || html.match(/"features"\s*:\s*\[([^\]]+)\]/i);
  if (advantagesM && /lounge|salon|priority\s*pass|dragon\s*pass|vip\s*(?:salon|lounge)/i.test(advantagesM[1])) {
    out.loungeAccess = true;
  }

  // Annual travel credit (crédit voyages annuel): "annual_credit":"100" or "travel_benefits":"150" (BNC uses travel_benefits for $ amount)
  const annualCreditM = html.match(/"annual_credit"\s*:\s*"(\d+)"/);
  if (annualCreditM) {
    const n = parseInt(annualCreditM[1], 10);
    if (n >= 0 && n <= 2000) out.annualTravelCredit = n;
  }
  if (out.annualTravelCredit == null) {
    const travelBenefitsM = html.match(/"travel_benefits"\s*:\s*"(\d+)"/);
    if (travelBenefitsM) {
      const n = parseInt(travelBenefitsM[1], 10);
      if (n >= 50 && n <= 2000) out.annualTravelCredit = n;
    }
  }

  // First year free (frais annulés la 1re année): Milesopedia "first_year_fee":true means fee waived in Y1
  if (/"first_year_fee"\s*:\s*true/i.test(html) || /"first_year_fee"\s*:\s*"true"/i.test(html)) {
    out.firstYearFree = true;
  }

  return out;
}

/**
 * Extract lounge access from page HTML/text (FR + EN patterns).
 * Returns { loungeAccess: boolean, loungeAccessDetails: string | null }.
 */
function extractLoungeFromHtml(html) {
  const out = { loungeAccess: false, loungeAccessDetails: null };
  if (!html || typeof html !== 'string') return out;

  // French: accès aux salons, salons VIP, salon aéroport, Priority Pass, Dragon Pass, visites salon
  const frPatterns = [
    /acc[eè]s\s+aux\s+salons/i,
    /salons?\s+vip/i,
    /salon(s)?\s+(?:a[eé]roport|d['']?attente)/i,
    /priority\s+pass/i,
    /dragon\s+pass/i,
    /visites?\s+salon/i,
    /acc[eè]s\s+salon/i,
  ];
  // English
  const enPatterns = [
    /lounge\s+access/i,
    /airport\s+lounge/i,
    /complimentary\s+lounge/i,
    /priority\s+pass/i,
    /dragon\s+pass/i,
    /lounge\s+visits?/i,
    /vip\s+lounge/i,
  ];

  for (const re of [...frPatterns, ...enPatterns]) {
    if (re.test(html)) {
      out.loungeAccess = true;
      break;
    }
  }

  // Optional: capture a short detail (e.g. "Priority Pass, 4 visites/an" or "Complimentary lounge visits")
  if (out.loungeAccess) {
    const snippetRe = /(?:priority\s+pass|dragon\s+pass|acc[eè]s\s+salons?|lounge\s+access)[^.<>]{0,80}/gi;
    const m = html.match(snippetRe);
    if (m && m[0]) {
      const detail = m[0].replace(/\s+/g, ' ').replace(/<[^>]+>/g, '').trim().slice(0, 120);
      if (detail.length > 5) out.loungeAccessDetails = detail;
    }
  }

  return out;
}

/**
 * Extract "first year free" (frais annulés la 1re année) from page text.
 * Returns boolean.
 */
function extractFirstYearFreeFromHtml(html) {
  if (!html || typeof html !== 'string') return false;
  const fr = /aucuns?\s+frais\s+la\s+(?:premi[eè]re\s+ann[eé]e|1re\s+ann[eé]e)/i.test(html)
    || /(?:premi[eè]re\s+ann[eé]e|1re\s+ann[eé]e)\s+gratuite/i.test(html)
    || /remise\s+(?:sur\s+)?les?\s+frais\s+annuels\s+la\s+premi[eè]re\s+ann[eé]e/i.test(html)
    || /frais\s+annuels?\s+(?:rembours[eé]s|gratuits?|offerts?)\s+la\s+premi[eè]re\s+ann[eé]e/i.test(html)
    || /aucun\s+frais\s+la\s+premi[eè]re\s+ann[eé]e/i.test(html);
  const en = /first\s+year\s+free/i.test(html)
    || /no\s+annual\s+fee\s+(?:for\s+)?the\s+first\s+year/i.test(html)
    || /annual\s+fee\s+waived\s+(?:for\s+)?(?:the\s+)?first\s+year/i.test(html)
    || /fee\s+waived\s+first\s+year/i.test(html);
  return fr || en;
}

/**
 * Extract annual travel credit (crédit voyages annuel) in dollars from page text.
 * Returns number | null (e.g. 100, 150).
 */
function extractAnnualTravelCreditFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  // French: "crédit annuel de 100 $", "crédit voyage annuel de 150 $", "Crédit Annuel de 100 $", "remboursement... 150 $ par année"
  const frPatterns = [
    /cr[eé]dit\s+annuel\s+(?:pour\s+voyage\s+)?(?:de\s+)?(\d[\d\s]*)\s*\$/i,
    /cr[eé]dit\s+voyage(?:s)?\s+annuel\s+(?:de\s+)?(\d[\d\s]*)\s*\$/i,
    /cr[eé]dit\s+annuel\s+(\d[\d\s]*)\s*\$/i,
    /jusqu['\u2019]?\s*à\s+(\d[\d\s]*)\s*\$\s+de\s+remboursement\s+par\s+ann[eé]e/i,
    /(\d[\d\s]*)\s*\$\s+(?:cr[eé]dit\s+)?(?:voyage\s+)?annuel/i,
  ];
  for (const re of frPatterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const n = parseInt(m[1].replace(/\s/g, ''), 10);
      if (n >= 50 && n <= 2000) return n;
    }
  }
  // English: "annual travel credit of $100", "$100 annual travel credit"
  const enPatterns = [
    /annual\s+travel\s+credit\s+(?:of\s+)?\$?\s*(\d[\d,]*)/i,
    /\$?\s*(\d[\d,]*)\s+annual\s+travel\s+credit/i,
    /travel\s+credit\s+(?:of\s+)?\$?\s*(\d[\d,]*)\s+per\s+year/i,
  ];
  for (const re of enPatterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const n = parseInt(m[1].replace(/[\s,]/g, ''), 10);
      if (n >= 50 && n <= 2000) return n;
    }
  }
  return null;
}

/**
 * Detect explicit "no welcome bonus" (e.g. "Prime de bienvenue" + "Aucune offre de bienvenue" or embedded "welcome_bonus":"Aucune offre de bienvenue").
 * When true, first-year value should be shown as "No welcome offer" rather than 0$ or empty.
 */
function extractNoWelcomeBonus(html) {
  if (!html || typeof html !== 'string') return false;
  const lower = html.toLowerCase();
  // Embedded JSON: "welcome_bonus":"Aucune offre de bienvenue" or "No welcome offer"
  if (/["']welcome_bonus["']\s*:\s*["'](?:aucune\s+offre\s+de\s+bienvenue|no\s+welcome\s+offer)/i.test(html)) return true;
  // Page text: "Aucune offre de bienvenue" or "No welcome offer" (often under "Prime de bienvenue")
  if (/aucune\s+offre\s+de\s+bienvenue/i.test(html)) return true;
  if (/no\s+welcome\s+offer/i.test(html)) return true;
  return false;
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

/**
 * Parse integer from string with optional commas/spaces (e.g. "40,000" or "2 000").
 */
function parseIntFromText(str) {
  if (str == null || typeof str !== 'string') return null;
  const n = parseInt(str.replace(/\s/g, '').replace(/,/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Extract tiered bonus levels from "Our review" / "Notre avis" section or full page.
 * Returns Array<{ order, spendAmount, monthsFromOpen, rewardPoints }>. Falls back to single level from embedded JSON when present.
 */
function extractBonusLevelsFromHtml(html, embedded = {}) {
  if (!html || typeof html !== 'string') return [];

  // Prefer block that contains "Our review" / "Notre avis" to reduce false positives
  const reviewMatch = html.match(/(?:our\s+review|notre\s+avis)[\s\S]{0,12000}/i);
  const searchText = reviewMatch ? reviewMatch[0] : html;

  const levels = [];
  const seen = new Set();

  // EN: "40,000 points after $2,000 in purchases within the first three months"
  const enMonthsRe = /(\d{1,3}(?:,\d{3})*(?:\s\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+within\s+the\s+first\s+(\d+)\s+months?/gi;
  let m;
  while ((m = enMonthsRe.exec(searchText)) !== null) {
    const points = parseIntFromText(m[1]);
    const spend = parseIntFromText(m[2]);
    const months = parseInt(m[3], 10);
    if (points != null && spend != null && months >= 1 && months <= 120) {
      const key = `${points}-${spend}-${months}`;
      if (!seen.has(key)) {
        seen.add(key);
        levels.push({ order: levels.length + 1, spendAmount: spend, monthsFromOpen: months, rewardPoints: points });
      }
    }
  }

  // EN: "10,000 points after $40,000 in purchases in the first year"
  const enYearRe = /(\d{1,3}(?:,\d{3})*(?:\s\d{3})*)\s*points?\s+after\s+\$?([\d,]+)\s+in\s+purchases?\s+in\s+the\s+first\s+year/gi;
  while ((m = enYearRe.exec(searchText)) !== null) {
    const points = parseIntFromText(m[1]);
    const spend = parseIntFromText(m[2]);
    if (points != null && spend != null) {
      const key = `${points}-${spend}-12`;
      if (!seen.has(key)) {
        seen.add(key);
        levels.push({ order: levels.length + 1, spendAmount: spend, monthsFromOpen: 12, rewardPoints: points });
      }
    }
  }

  // FR: "X points après Y $ d'achats dans les Z premiers mois" / "dans la première année"
  const frMonthsRe = /(\d{1,3}(?:[\s,]?\d{3})*)\s*points?\s+apres\s+([\d\s]+)\s*\$?\s*(?:d['']achats?|en\s+achats?)?\s+dans\s+les\s+(\d+)\s+premiers\s+mois/gi;
  while ((m = frMonthsRe.exec(searchText)) !== null) {
    const points = parseIntFromText(m[1]);
    const spend = parseIntFromText(m[2]);
    const months = parseInt(m[3], 10);
    if (points != null && spend != null && months >= 1 && months <= 120) {
      const key = `${points}-${spend}-${months}`;
      if (!seen.has(key)) {
        seen.add(key);
        levels.push({ order: levels.length + 1, spendAmount: spend, monthsFromOpen: months, rewardPoints: points });
      }
    }
  }

  const frYearRe = /(\d{1,3}(?:[\s,]?\d{3})*)\s*points?\s+apres\s+([\d\s]+)\s*\$?\s*(?:d['']achats?|en\s+achats?)?\s+dans\s+la\s+premiere\s+annee/gi;
  while ((m = frYearRe.exec(searchText)) !== null) {
    const points = parseIntFromText(m[1]);
    const spend = parseIntFromText(m[2]);
    if (points != null && spend != null) {
      const key = `${points}-${spend}-12`;
      if (!seen.has(key)) {
        seen.add(key);
        levels.push({ order: levels.length + 1, spendAmount: spend, monthsFromOpen: 12, rewardPoints: points });
      }
    }
  }

  // Sort by monthsFromOpen so order is chronological; re-assign order 1,2,3...
  if (levels.length > 0) {
    levels.sort((a, b) => (a.monthsFromOpen ?? 99) - (b.monthsFromOpen ?? 99));
    levels.forEach((l, i) => {
      l.order = i + 1;
    });
    return levels;
  }

  // Fallback: single level from embedded JSON
  const spend = embedded.minSpend ?? null;
  const points = embedded.welcomeBonusPoints ?? null;
  if (spend == null || points == null) return [];

  let months = null;
  const timeframeM = html.match(/"minimum_spending_timeframe_months"\s*:\s*"([^"]+)"/);
  if (timeframeM) {
    const num = parseInt(timeframeM[1].replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num >= 1 && num <= 120) months = num;
  }
  if (months == null && /year|an(née|nee)?/i.test(html)) months = 12;

  return [{ order: 1, spendAmount: spend, monthsFromOpen: months, rewardPoints: points }];
}

/** Fetch HTML with node-fetch (no JS execution). Used for sitemap and when Puppeteer is disabled. */
async function fetchWithFetch(url, tries = 3) {
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

      const backoff = RATE_LIMIT_MS * attempt;
      console.warn(`Fetch failed for ${url} (attempt ${attempt}/${tries}): ${message}. Retrying in ${backoff}ms…`);
      await delay(backoff);
    }
  }
  throw lastError;
}

/** Fetch card page HTML with Puppeteer (JS-rendered content). Waits for welcome offer element or network idle. */
async function fetchWithPuppeteer(browser, url) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent('PointTracker/1.0 (Personal points tracker; respectful crawler)');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for JS-rendered content: welcome offer or fallback to short delay
    await Promise.race([
      page.waitForSelector('#welcome_offer_year_one, [id*="welcome_offer"]', { timeout: 8000 }).catch(() => {}),
      delay(3000),
    ]);
    return await page.content();
  } finally {
    await page.close().catch(() => {});
  }
}

/** Get card page HTML: Puppeteer if enabled (better accuracy), otherwise node-fetch. */
async function fetchCardPage(url, browser = null) {
  if (USE_PUPPETEER && browser) {
    return fetchWithPuppeteer(browser, url);
  }
  if (USE_PUPPETEER && !browser) {
    const { default: puppeteer } = await import('puppeteer');
    const b = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      return await fetchWithPuppeteer(b, url);
    } finally {
      await b.close().catch(() => {});
    }
  }
  return fetchWithFetch(url);
}

/**
 * @param {{ useAi?: boolean }} [options] - useAi: when true, call Claude to extract minSpend/minSpendNotes (default false to minimize API cost).
 */
export async function scrapeMilesopediaCards(options = {}) {
  const useAi = options.useAi === true;
  console.log('[Milesopedia] Refresh all cards: starting…', USE_PUPPETEER ? '(Puppeteer)' : '(fetch only)', useAi ? '(AI enabled)' : '(no AI)');
  // Sitemap is XML; always use fetch (no JS).
  const xml = await fetchWithFetch(SITEMAP_URL);
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

  console.log(`[Milesopedia] Sitemap: ${cardLinks.length} card URL(s) to scrape (concurrency: ${CONCURRENCY})`);
  let browser = null;
  if (USE_PUPPETEER) {
    try {
      const { default: puppeteer } = await import('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (err) {
      console.warn('[Milesopedia] Puppeteer launch failed, falling back to fetch:', err.message);
    }
  }

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
    noWelcomeBonus: c.noWelcomeBonus === true,
    minSpend: c.minSpend ?? null,
    minSpendNotes: c.minSpendNotes ?? null,
    bonusDetails: c.bonusDetails ?? null,
    milesopediaUrl: c.milesopediaUrl ?? null,
    milesopediaSlug: c.milesopediaSlug,
    subscribeUrl: c.subscribeUrl ?? null,
    firstYearFree: c.firstYearFree === true,
    loungeAccess: c.loungeAccess === true,
    loungeAccessDetails: c.loungeAccessDetails ?? null,
    noForeignTransactionFee: c.noForeignTransactionFee === true,
    travelInsurance: c.travelInsurance === true,
    travelInsuranceDetails: c.travelInsuranceDetails ?? null,
    annualTravelCredit: c.annualTravelCredit ?? null,
    isBusiness: c.isBusiness === true,
  });

  /** Process one card: fetch, parse, optionally AI. Returns { card, url, slug } or null on skip/failure. */
  async function fetchAndParseOne({ url, slug }) {
    try {
      const pageHtml = await fetchCardPage(url, browser);
      let card = parseCardDetail(pageHtml, url, slug);
      if (useAi) card = await mergeAiExtraction(pageHtml, card);
      if (!card.cardName) return null;
      return { card, url, slug };
    } catch (e) {
      console.warn(`[Milesopedia] Skip ${url}:`, e.message);
      return null;
    }
  }

  /** Save one parsed card to DB. */
  async function saveOne(card) {
    try {
      const saved = await prisma.scrapedCard.upsert({
        where: { milesopediaSlug: card.milesopediaSlug },
        create: dbPayload(card),
        update: dbPayload(card),
      });
      await prisma.scrapedBonusLevel.deleteMany({ where: { scrapedCardId: saved.id } });
      if (card.bonusLevels && card.bonusLevels.length > 0) {
        await prisma.scrapedBonusLevel.createMany({
          data: card.bonusLevels.map((l, i) => ({
            scrapedCardId: saved.id,
            order: l.order ?? i + 1,
            spendAmount: l.spendAmount ?? null,
            monthsFromOpen: l.monthsFromOpen ?? null,
            rewardPoints: l.rewardPoints ?? null,
          })),
        });
      }
      console.log(`[Milesopedia] DB updated: ${card.cardName} (${card.bank}, ${card.milesopediaSlug})`);
    } catch (dbErr) {
      console.warn(`[Milesopedia] DB upsert failed for ${card.milesopediaSlug}:`, dbErr.message);
    }
  }

  for (let i = 0; i < cardLinks.length; i += CONCURRENCY) {
    const batch = cardLinks.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((link) => fetchAndParseOne(link)));
    const parsed = settled
      .filter((p) => p.status === 'fulfilled' && p.value != null)
      .map((p) => p.value);
    for (const { card } of parsed) results.push(card);
    await Promise.all(parsed.map(({ card }) => saveOne(card)));
    if (i + batch.length < total) await delay(RATE_LIMIT_MS);
    console.log(`[Milesopedia] Progress: ${Math.min(i + CONCURRENCY, total)}/${total} pages, ${results.length} card(s) parsed & saved`);
  }

  if (browser) {
    await browser.close().catch(() => {});
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

/** Get plain text from page HTML for AI extraction (body text, normalized). */
function getPageTextForAi(html) {
  const $ = cheerio.load(html);
  return $('body').text().replace(/\s+/g, ' ').trim();
}

/** Merge AI-extracted data into card when OPENAI_API_KEY is set. */
async function mergeAiExtraction(html, card) {
  if (!isAiExtractionEnabled()) return card;
  const text = getPageTextForAi(html);
  const ai = await extractCardDataWithAi(text);
  const out = { ...card };
  if (ai.minSpend != null) out.minSpend = ai.minSpend;
  if (ai.minSpendNotes != null) out.minSpendNotes = ai.minSpendNotes;
  if (ai.welcomeValueY1 != null && !card.noWelcomeBonus) out.welcomeValueY1 = ai.welcomeValueY1;
  return out;
}

/**
 * @param {string} url - Milesopedia card page URL
 * @param {{ useAi?: boolean }} [options] - useAi: when true, run Claude extraction (default false)
 */
export async function scrapeSingleMilesopediaCard(url, options = {}) {
  const useAi = options.useAi === true;
  console.log('[Milesopedia] scrapeSingleMilesopediaCard:', url, USE_PUPPETEER ? '(Puppeteer)' : '', useAi ? '(AI)' : '');
  const pageHtml = await fetchCardPage(url);
  const slug = url.replace(/\/$/, '').split('/').pop();
  let card = parseCardDetail(pageHtml, url, slug);
  if (useAi) card = await mergeAiExtraction(pageHtml, card);
  return card;
}

function parseCardDetail(html, url, slug) {
  const $ = cheerio.load(html);

  // Detect explicit "no welcome bonus" (e.g. "Aucune offre de bienvenue") so we can show "No welcome offer" instead of 0$
  const noWelcomeBonus = extractNoWelcomeBonus(html);

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

  // AMEX: "Points privilèges" (without "Aeroplan") => Amex_Privileges
  const combinedNorm = normalize(cardName + ' ' + bodyText + ' ' + slugWithSpaces);
  if (bank === 'AMEX' && (pointsType === 'Aeroplan' || !pointsType)) {
    if (combinedNorm.includes('points privileges') && (combinedNorm.includes('amex') || combinedNorm.includes('american express'))) {
      pointsType = 'Amex_Privileges';
    }
  }

  // BNC: when bank is BNC and points type still unknown, default to BNC (Banque Nationale cards use BNC points)
  if (bank === 'BNC' && !pointsType) {
    pointsType = 'BNC';
  }

  // Annual cost (facturés annuellement): embedded "annual_fee" first, then DOM "Frais annuels X $".
  // Validation: only sanity bounds (0 <= n < 10000). No cross-check against another source; firstYearFree indicates when fee is waived in Y1.
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
    }
  }
  // Fallback: embedded JSON main.value (first year dollar value) - used when DOM/raw HTML have no value (e.g. JS-rendered page)
  if (welcomeValueY1 === null && embedded.welcomeValueY1 != null) {
    welcomeValueY1 = embedded.welcomeValueY1;
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
  const spends = []; // only dollar amounts (not points) for min spend
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
    // Only consider amounts in dollar context (e.g. "porté 6 000 $" or "6 000 $ à votre Carte"), not points ("80 000 points")
    if (minSpend === null && raw.includes('$')) {
      const dollarAmounts = raw.match(/(\d[\d\s]*)\s*\$/g);
      if (dollarAmounts) {
        for (const part of dollarAmounts) {
          const n = parseInt(part.replace(/\s/g, '').replace(/\$/g, ''), 10);
          if (!Number.isNaN(n) && n >= 100 && n < 10000000) spends.push(n);
        }
      }
    }
  });
  if (minSpend === null && spends.length) minSpend = Math.min(...spends); // use min so we get required spend (6k) not a higher number from same line

  const bonusDetails = bonusLines.length ? bonusLines.join('\n') : null;

  // When card explicitly has no welcome offer, set first year value to 0
  const finalWelcomeValueY1 = noWelcomeBonus ? 0 : (welcomeValueY1 ?? null);

  const bonusLevels = extractBonusLevelsFromHtml(html, embedded);

  // Lounge access: embedded JSON first, then HTML/text patterns (FR + EN)
  const loungeFromHtml = extractLoungeFromHtml(html);
  const loungeAccess = embedded.loungeAccess === true || loungeFromHtml.loungeAccess;
  const loungeAccessDetails = loungeFromHtml.loungeAccessDetails ?? (loungeAccess ? null : null);

  // Annual travel credit (crédit voyages annuel): embedded first, then HTML text
  const annualTravelCredit = embedded.annualTravelCredit ?? extractAnnualTravelCreditFromHtml(html) ?? null;

  // First year free (frais annulés la 1re année): embedded first, then HTML text. No external validation — we trust scraped source.
  const firstYearFree = embedded.firstYearFree === true || extractFirstYearFreeFromHtml(html);

  // Personal vs Business: slug (e.g. "aeroplan-business-amex", "carte-affaires") or page/embedded
  let isBusiness = false;
  if (/\b(affaires|business|entreprise|commercial)\b/.test(slugNorm) || /\b(affaires|business|entreprise)\b/.test(normalize(cardName))) {
    isBusiness = true;
  }
  if (!isBusiness && html) {
    const lower = html.toLowerCase();
    if (/"segment"\s*:\s*"?(business|affaires|entreprise)"/.test(lower) || /"card_category"\s*:\s*"?(business|affaires)"/.test(lower)) {
      isBusiness = true;
    }
  }

  // Subscribe/apply URL: look for CTA link (S'abonner, Postuler, Apply, etc.)
  let subscribeUrl = null;
  $('a[href^="http"]').each((_, el) => {
    const href = $(el).attr('href');
    const text = normalize($(el).text());
    if (!href || subscribeUrl) return;
    if (
      text.includes('s\'abonner') ||
      text.includes('postuler') ||
      text.includes('apply') ||
      text.includes('demander') ||
      text.includes('obtenir la carte')
    ) {
      subscribeUrl = href;
    }
  });

  return {
    cardName: cardName || 'Unknown',
    type: type || 'VISA',
    status: 'To_Open',
    pointsType: pointsType || 'Aeroplan',
    bank: bank || 'TD',
    annualCost: annualCost ?? null,
    welcomeValueY1: finalWelcomeValueY1,
    welcomeValueY2: welcomeValueY2 ?? null,
    noWelcomeBonus,
    minSpend: minSpend ?? null,
    minSpendNotes: null,
    bonusDetails,
    milesopediaUrl: url,
    milesopediaSlug: slug,
    subscribeUrl: subscribeUrl ?? null,
    firstYearFree,
    loungeAccess,
    loungeAccessDetails,
    noForeignTransactionFee: false,
    travelInsurance: false,
    travelInsuranceDetails: null,
    annualTravelCredit,
    isBusiness,
    bonusLevels,
  };
}
