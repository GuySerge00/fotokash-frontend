const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Trouver le bouton retour dans ClientPage (le bouton avec ←)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onNavigate("dashboard")') && lines[i].includes('8592')) {
    // C'est la ligne du bouton retour, chercher le bloc complet
    // Remonter pour trouver le début du <button
    let startLine = i;
    for (let j = i; j >= i - 5; j--) {
      if (lines[j].includes('<button onClick')) {
        startLine = j;
        break;
      }
    }
    // Trouver la fin </button>
    let endLine = i;
    for (let j = i; j <= i + 3; j++) {
      if (lines[j].includes('</button>')) {
        endLine = j;
        break;
      }
    }
    console.log('Removing back button from line', startLine + 1, 'to', endLine + 1);
    lines.splice(startLine, endLine - startLine + 1);
    break;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
