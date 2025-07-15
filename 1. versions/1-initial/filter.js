import fs from 'fs';

const inputFile = process.argv[2] || "Artificer 2024.json"
const filterBy = process.argv[3] || "Level 3";
const outputFile = process.argv[4] && process.argv[4] !== 'null'
  ? process.argv[4]
  : inputFile.replace('.json', `-${filterBy}.json`);

const data = fs.readFileSync(inputFile, 'utf8');
let json = JSON.parse(data);

// json.sort((a, b) => a.icon.localeCompare(b.icon));
json = json.filter(card => card.contents.filter(content => {
  return content.includes(filterBy);
}).length > 0);

// console.log('json.length',json.length)
// console.log(json.map(el => el.contents.filter(content => content.includes(filterBy)).map(line => line.split('\n')[0]) ).join('\n')  );

fs.writeFileSync(outputFile, JSON.stringify(json, null, 2));