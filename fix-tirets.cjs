const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');
let count = 0;

for (let i = 0; i < lines.length; i++) {
  // Le tiret corrompu est sur 3 bytes: 0xC3 0xA2 suivi de â€" ou similaire
  // Cherchons le pattern exact dans les commentaires et le texte
  if (lines[i].includes('\u00e2\u0080\u0094')) {
    lines[i] = lines[i].replace(/\u00e2\u0080\u0094/g, ' - ');
    count++;
    console.log('Fixed line', i + 1);
  }
  // Pattern visible "â€""
  if (lines[i].includes('\u00e2\u20ac\u201c')) {
    lines[i] = lines[i].replace(/\u00e2\u20ac\u201c/g, ' - ');
    count++;
    console.log('Fixed line', i + 1, '(variant)');
  }
}

// Si rien trouvé, chercher par les bytes bruts
if (count === 0) {
  console.log('Trying raw byte search...');
  let buf = fs.readFileSync(path);
  // Chercher 0xC3 0xA2 0xE2 0x80 0x93 ou 0x94
  for (let i = 0; i < buf.length - 5; i++) {
    if (buf[i] === 0xC3 && buf[i+1] === 0xA2) {
      console.log('Found C3 A2 at offset', i, 'next bytes:', buf[i+2].toString(16), buf[i+3].toString(16), buf[i+4].toString(16));
    }
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Total fixed:', count);
