const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
// Le tiret em corrompu
let count = 0;
// Chercher toutes les variantes
let patterns = [
  [/\u00e2\u0080\u0094/g, ' - '],
  [/\u00e2\u0080\u0093/g, ' - '],
];
patterns.forEach(function(p) {
  let m = c.match(p[0]);
  if (m) { count += m.length; c = c.replace(p[0], p[1]); }
});
// Aussi chercher le texte visible
c = c.replace(/â€"/g, ' - ');
c = c.replace(/â€"/g, ' - ');
fs.writeFileSync(path, c, 'utf8');
console.log('Fixed dashes:', count);
