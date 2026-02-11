/**
 * Optional AI extraction for Milesopedia card pages.
 * When ANTHROPIC_API_KEY is set, uses Claude to read page text and extract structured data
 * (e.g. minimum spend in dollars, not points; minSpendNotes like "6 000 $ in 6 months + 1 purchase in month 15").
 * Use as fallback or to override when rule-based parsing is missing or wrong.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
const USE_AI = Boolean(ANTHROPIC_API_KEY);

const SYSTEM_PROMPT = `You are a precise data extractor for Canadian credit card offer pages (Milesopedia). 
Extract ONLY the following from the given page text. Return valid JSON with these keys (use null for missing):
- minSpend: number | null — The minimum SPEND in DOLLARS (CAD) required to get the welcome bonus. NOT the number of points. E.g. if the offer says "spend 6 000 $ in 6 months" then minSpend is 6000. If it says "80 000 points after spending 6 000 $" the minSpend is 6000 (dollars), not 80000.
- minSpendNotes: string | null — Short human-readable condition, e.g. "6 000 $ in 6 months + 1 purchase in month 15" or "3 000 $ in 3 months". Keep it concise, in the same language as the page (French or English).
- welcomeValueY1: number | null — First year welcome offer value in dollars (CAD) if stated. Null if not stated or "no welcome offer".
Return ONLY the JSON object, no markdown or explanation.`;

/**
 * @param {string} pageText - Plain text from the card page (offer section, fees, welcome bonus)
 * @returns {Promise<{ minSpend?: number | null, minSpendNotes?: string | null, welcomeValueY1?: number | null }>}
 */
export async function extractCardDataWithAi(pageText) {
  if (!USE_AI || !pageText || pageText.length < 100) {
    return {};
  }
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const truncated = pageText.slice(0, 12000);
    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Extract from this credit card page:\n\n${truncated}` }],
    });
    const content = message.content;
    const textBlock = Array.isArray(content) ? content.find((b) => b.type === 'text') : null;
    const raw = textBlock?.text ?? (typeof content === 'string' ? content : '');
    if (!raw) return {};
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(jsonStr);
    const out = {};
    if (typeof parsed.minSpend === 'number' && parsed.minSpend >= 0 && parsed.minSpend < 10000000) {
      out.minSpend = parsed.minSpend;
    }
    if (typeof parsed.minSpendNotes === 'string' && parsed.minSpendNotes.trim()) {
      out.minSpendNotes = parsed.minSpendNotes.trim().slice(0, 500);
    }
    if (typeof parsed.welcomeValueY1 === 'number' && parsed.welcomeValueY1 >= 0 && parsed.welcomeValueY1 < 1000000) {
      out.welcomeValueY1 = parsed.welcomeValueY1;
    }
    return out;
  } catch (err) {
    console.warn('[Milesopedia AI] Extraction failed:', err.message);
    return {};
  }
}

export function isAiExtractionEnabled() {
  return USE_AI;
}
