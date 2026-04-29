const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let count = 0;

// Fix tous les Ã suivi d'un caractère
const fixes = [
  [/Ã©/g, 'é'], [/Ã¨/g, 'è'], [/Ãª/g, 'ê'], [/Ã /g, 'à'],
  [/Ã¢/g, 'â'], [/Ã®/g, 'î'], [/Ã´/g, 'ô'], [/Ã¹/g, 'ù'],
  [/Ã»/g, 'û'], [/Ã§/g, 'ç'], [/Ã‰/g, 'É'], [/Ã€/g, 'À'],
  [/Ã‡/g, 'Ç'], [/Â©/g, '©'], [/Â·/g, '·'],
];

fixes.forEach(function(pair) {
  var matches = c.match(pair[0]);
  if (matches) {
    count += matches.length;
    c = c.replace(pair[0], pair[1]);
  }
});

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed', count, 'characters');
