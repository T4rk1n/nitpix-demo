// Capture visual snapshots of every page in site/ at a couple of widths.
// This plays the role dash.testing's percy_snapshot() plays in plotly/dash:
// tests produce PNGs into a directory, and nitpix does everything after that.
import { chromium } from 'playwright';
import { mkdirSync, readdirSync } from 'fs';
import path from 'path';

const SITE_DIR = path.resolve('site');
const OUT_DIR = process.env.NITPIX_SNAPSHOT_DIR || 'nitpix-snapshots';
const WIDTHS = [800, 1280];

const pages = readdirSync(SITE_DIR).filter((f) => f.endsWith('.html'));
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
for (const file of pages) {
  const name = file.replace(/\.html$/, '');
  for (const width of WIDTHS) {
    const page = await browser.newPage({
      viewport: { width, height: 800 },
      deviceScaleFactor: 1,
    });
    await page.goto(`file://${path.join(SITE_DIR, file)}`);
    const out = path.join(OUT_DIR, `${name}@${width}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`captured ${out}`);
    await page.close();
  }
}
await browser.close();
