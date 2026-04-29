const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Ligne 1176 (index 1175) - trouver le bloc button complet
let btnStart = 1175;
let btnEnd = btnStart;

// Trouver la fin du bouton (</button>)
for (let i = btnStart; i < btnStart + 5; i++) {
  if (lines[i].includes('</button>')) {
    btnEnd = i;
    break;
  }
}

console.log('Removing lines', btnStart + 1, 'to', btnEnd + 1);
console.log('Content:', lines[btnStart].trim().substring(0, 60));

lines.splice(btnStart, btnEnd - btnStart + 1);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
