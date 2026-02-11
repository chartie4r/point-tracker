/**
 * Downloads bank logos from Wikimedia Commons (same brands as on Brandfetch)
 * and saves them to frontend/public/logos/banks/.
 * Run from backend: node scripts/fetch-brandfetch-logos.js
 */
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../../frontend/public/logos/banks');

// Commons/Wikipedia Special:FilePath redirects to the actual file.
const COMMONS_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath';
const WIKI_EN_BASE = 'https://en.wikipedia.org/wiki/Special:FilePath';
const BANK_LOGO_SOURCES = [
  { id: 'TD', file: 'Toronto-Dominion_Bank_Logo.svg', base: COMMONS_BASE },
  { id: 'AMEX', file: 'American_Express_logo_(2018).svg', base: COMMONS_BASE },
  { id: 'BMO', file: 'BMO_Logo.svg', base: WIKI_EN_BASE },
  { id: 'BNC', file: 'National_Bank_Of_Canada.svg', base: COMMONS_BASE },
  { id: 'CIBC', file: 'CIBC_logo_2021.svg', base: WIKI_EN_BASE },
  { id: 'RBC', file: 'RBC_Royal_Bank.svg', base: WIKI_EN_BASE },
  { id: 'Scotia', file: 'Scotiabank_logo.svg', base: COMMONS_BASE },
];

async function download(url, outPath) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
}

async function main() {
  for (const { id, file, base } of BANK_LOGO_SOURCES) {
    const url = `${base}/${encodeURIComponent(file)}`;
    const ext = path.extname(file);
    const outPath = path.join(OUT_DIR, `${id}${ext}`);
    try {
      await download(url, outPath);
      console.log(`Saved ${id} -> ${outPath}`);
    } catch (e) {
      console.warn(`${id}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
