import fs from 'fs';

const data = fs.readFileSync('Artificer 2024.json', 'utf8');
const json = JSON.parse(data);

json.sort((a, b) => a.icon.localeCompare(b.icon));

fs.writeFileSync('Artificer 2024 sorted.json', JSON.stringify(json, null, 2));