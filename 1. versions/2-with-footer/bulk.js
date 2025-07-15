import fs from 'fs';
import path from 'path';

const filesArray = [
  "alchemist-2024.json",
  "artificer-2024.json",
  "artificer-cantrips.json",
  "artificer-magic-items.json",
  "artificer-spells-first.json",
  "artificer-spells-second.json",
  "artificer-spells-third.json",
  "artificer-spells.json",
  "artificer-tables.json"
];

const currentDir = path.dirname(new URL(import.meta.url).pathname);
const OUTPUT_DIR = path.join(currentDir, 'output')

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// load the files into an object of arrays

const files = filesArray.map(file => {
  const filePath = path.join(currentDir, file);
  console.log("🚀 ~ filePath:", filePath)
  const data = fs.readFileSync(
    filePath,
    'utf8'
  );
  const json = JSON.parse(data)
    .map(item => {
      const isSpell = item.tags.includes('spell');
      const isCantrip = item.tags.includes('cantrip');
      const isSpellOrCantrip = isSpell || isCantrip;
      const artificerLevel = item.tags.find(tag => tag.includes('artificer-level-'))?.split('artificer-level-')[1]

      if(isSpellOrCantrip) {
        const spellLevel = item.tags.find(tag => tag.includes('spell-level-'))?.split('spell-level-')[1]
        item['card_level'] = +spellLevel;
      } else if(artificerLevel) {
        item['card_level'] = +artificerLevel;
      }
      return item;
    })
  return {
    [file]: json,
  };
});



for (const fileObj of files) {
  for (const [filename, data] of Object.entries(fileObj)) {
    fs.writeFileSync(`${ OUTPUT_DIR}/${filename}`, JSON.stringify(data, null, 2));
  }
}