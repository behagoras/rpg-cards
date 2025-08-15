import fs from 'fs';

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

const OUTPUT_DIR = 'output'

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// load the files into an object of arrays

const files = filesArray.map(file => {
  const data = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(data)
    .map(item => {
      let footer = ''
      const {tags} = item

      const artificerLevel = tags
        .find(tag => tag.includes('artificer-level-'))
        ?.split('artificer-level-')[1]
      const spellLevel = tags
        .find(tag => tag.includes('spell-level-'))
        ?.split('spell-level-')[1]

      const isAlchemist = tags.includes('alchemist');
      const isSpell = tags.includes('spell');
      const isCantrip = tags.includes('cantrip');


      if(isCantrip) return {...item, contents: [...item.contents, `footer | Artificer Cantrip`]}
      if(!artificerLevel) return item

      if(!!spellLevel) {
        if(isAlchemist) {
          footer = `footer | Spell Level ${spellLevel} / Alchemist Level ${artificerLevel}`
        } else {
          footer = `footer | Spell Level ${spellLevel} / Artificer Level ${artificerLevel}`
        }
      } else if(isAlchemist) {
        footer = `footer | Alchemist Level ${artificerLevel} / Feature`
      } else {
        footer = `footer | Artificer Level ${artificerLevel} / Feature`
      }




      return {...item, contents: [...item.contents, footer]}
    })
  return {
    [file]: json,
  };
});



for (const fileObj of files) {
  for (const [filename, data] of Object.entries(fileObj)) {
    fs.writeFileSync(`${OUTPUT_DIR}/${filename}`, JSON.stringify(data, null, 2));
  }
}