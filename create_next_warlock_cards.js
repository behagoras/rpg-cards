const fs = require('fs');
const path = require('path');

// Configuration
const SPELLS_DIR = path.resolve(__dirname, '1. warlock/spells-by-level');
const OUTPUT_FILE = path.resolve(__dirname, '1. warlock/warlock-next-cards.json');

// Requested spells (order preserved in output)
const REQUESTED_SPELLS = [
  'Expeditious retreat',
  'detect magic',
  'comprehend languages',
  'counterspell',
  'fear',
  'remove course' // typo handled below
];

// Known typo/alias fixes
const TITLE_ALIASES = new Map([
  ['remove course', 'Remove Curse']
]);

function normalizeTitle(title) {
  return String(title).trim().toLowerCase();
}

function resolveRequestedTitles(requested) {
  return requested.map((t) => {
    const normalized = normalizeTitle(t);
    if (TITLE_ALIASES.has(normalized)) {
      return TITLE_ALIASES.get(normalized);
    }
    // Capitalize each word for better matching against file titles
    return normalized
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  });
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function loadAllSpellsFromDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Spells directory not found: ${dirPath}`);
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.json') && !/readme/i.test(f));

  const allSpells = [];
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const data = readJson(filePath);
      if (Array.isArray(data)) {
        allSpells.push(...data);
      } else {
        // Ignore non-array JSON files
      }
    } catch (err) {
      console.warn(`Skipping ${file}: ${err.message}`);
    }
  }
  return allSpells;
}

function buildTitleIndex(spells) {
  const index = new Map();
  for (const spell of spells) {
    if (spell && spell.title) {
      index.set(normalizeTitle(spell.title), spell);
    }
  }
  return index;
}

function selectSpellsByTitles(spellIndex, requestedTitles) {
  const results = [];
  const missing = [];

  for (const title of requestedTitles) {
    const normalized = normalizeTitle(title);
    const found = spellIndex.get(normalized);
    if (found) {
      results.push(found);
    } else {
      missing.push(title);
    }
  }

  return { results, missing };
}

function writeOutput(filePath, spells) {
  const json = JSON.stringify(spells, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
}

function main() {
  try {
    const requestedResolved = resolveRequestedTitles(REQUESTED_SPELLS);
    const allSpells = loadAllSpellsFromDirectory(SPELLS_DIR);
    const index = buildTitleIndex(allSpells);

    // Preserve the original request order by looking up resolved titles
    const { results, missing } = selectSpellsByTitles(index, requestedResolved);

    // Write output
    writeOutput(OUTPUT_FILE, results);

    console.log('✅ Created warlock next cards file');
    console.log(`📁 File: ${OUTPUT_FILE}`);
    console.log(`📊 Total cards: ${results.length}`);
    if (results.length) {
      console.log('📋 Cards:');
      results.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2, ' ')}. ${s.title} (Level ${s.card_level || '?'})`));
    }
    if (missing.length) {
      console.log('\n⚠️  Not found:');
      missing.forEach((t) => console.log(`  - ${t}`));
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}


