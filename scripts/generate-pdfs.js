#!/usr/bin/env node
/*
Generate PDFs for every deck JSON under a given root (e.g., Cards/5e).

Usage: node scripts/generate-pdfs.js [inputDir] [outputDir]
Defaults: inputDir = ./Cards/5e, outputDir = ./Cards/5e/output
*/

const fs = require('fs');
const path = require('path');

async function main() {
  const puppeteer = require('puppeteer');

  const repoRoot = path.resolve(__dirname, '..');
  const generatorDir = path.resolve(repoRoot, 'generator');
  const inputDir = path.resolve(process.argv[2] || path.join(repoRoot, 'Cards/5e'));
  const outputDir = path.resolve(process.argv[3] || path.join(repoRoot, 'Cards/5e/output'));

  const outputHtml = 'file://' + path.join(generatorDir, 'output.html');
  const jqueryPath = path.join(generatorDir, 'lib/jquery/jquery.min.js');
  const commonJsPath = path.join(generatorDir, 'js/common.js');
  const cardsJsPath = path.join(generatorDir, 'js/cards.js');

  /**
   * Recursively list .json files under a directory.
   */
  function listJsonFiles(dir) {
    const out = [];
    (function walk(current) {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.')) continue;
        const p = path.join(current, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile() && e.name.toLowerCase().endsWith('.json')) out.push(p);
      }
    })(dir);
    return out;
  }

  /** Ensure directory exists */
  function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
  }

  /** Read and normalize deck JSON */
  function readDeck(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    // Accept either an array of cards, or an object with a top-level array property
    if (Array.isArray(parsed)) return parsed;
    for (const key of ['cards', 'deck', 'items']) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }
    throw new Error(`Unsupported deck format in ${filePath}`);
  }

  const files = listJsonFiles(inputDir);
  if (!files.length) {
    console.error(`No JSON files found in ${inputDir}`);
    process.exit(1);
  }

  ensureDir(outputDir);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
    ],
    defaultViewport: { width: 1920, height: 1080 },
  });

  try {
    for (const jsonPath of files) {
      const rel = path.relative(inputDir, jsonPath);
      const outPdfPath = path.join(outputDir, rel.replace(/\.json$/i, '.pdf'));
      ensureDir(path.dirname(outPdfPath));

      let deck;
      try {
        deck = readDeck(jsonPath);
      } catch (e) {
        console.warn(`[SKIP] ${rel}: ${e.message}`);
        continue;
      }

      const page = await browser.newPage();
      try {
        await page.goto(outputHtml, { waitUntil: 'load' });

        // Load required scripts for rendering
        await page.addScriptTag({ path: jqueryPath });
        await page.addScriptTag({ path: commonJsPath });
        await page.addScriptTag({ path: cardsJsPath });

        // Generate and inject the HTML
        await page.evaluate((deckData) => {
          // Ensure options; rely on defaults from cards.js
          const options = window.card_default_options ? window.card_default_options() : {};
          // Respect CSS @page size in PDF
          options.page_width = options.page_width || '210mm';
          options.page_height = options.page_height || '297mm';
          const html = window.card_pages_generate_html(deckData, options);

          // Insert similar to output.js
          const div = document.createElement('div');
          div.setAttribute('class', 'output-container');
          div.id = 'output-container';
          div.innerHTML = html;
          document.body.innerHTML = '';
          document.body.appendChild(div);
        }, deck);

        // Give the page a tick to layout fonts/icons
        await page.waitForTimeout(200);

        await page.pdf({
          path: outPdfPath,
          printBackground: true,
          preferCSSPageSize: true,
        });
        console.log(`[OK] ${rel} -> ${path.relative(process.cwd(), outPdfPath)}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


