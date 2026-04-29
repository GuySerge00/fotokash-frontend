const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');
let count = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\u00c3\u00a0')) {
    console.log('Line', i+1, 'BEFORE:', lines[i].trim().substring(0, 80));
    lines[i] = lines[i].replace(/\u00c3\u00a0/g, '\u00e0');
    console.log('Line', i+1, 'AFTER:', lines[i].trim().substring(0, 80));
    count++;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed', count, 'lines');
