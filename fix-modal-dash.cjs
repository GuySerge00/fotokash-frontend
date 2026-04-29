const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Trouver la ligne du modal paiement avec le tiret corrompu
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('photo(s)') && lines[i].includes('fcfa(getPrice())')) {
    console.log('Line', i + 1, ':', lines[i].trim().substring(0, 80));
    // Remplacer toute la ligne
    lines[i] = '            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>{selectedPhotos.length} photo(s) - {fcfa(getPrice())}</p>';
    console.log('Fixed to:', lines[i].trim().substring(0, 80));
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
