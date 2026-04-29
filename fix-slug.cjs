const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Trouver le bloc qui affiche le slug dans EventsTab
// Chercher "Voir page client"
let idx = c.indexOf('Voir page client');
if (idx === -1) {
  console.log('Not found: Voir page client');
  process.exit();
}

// Trouver le début de la ligne/bloc
let lineStart = c.lastIndexOf('{e.slug', idx);
let lineEnd = c.indexOf('}', idx) + 1;
// Prendre tout le bloc span
let spanStart = c.lastIndexOf('<span', lineStart);
let spanEnd = c.indexOf('</span>', lineEnd) + 7;

let oldBlock = c.substring(spanStart, spanEnd);
console.log('OLD:', oldBlock.substring(0, 100));

let newBlock = `<span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: T.accent, cursor: "pointer", textDecoration: "underline", fontSize: 12 }} onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(function() { alert("Lien copie !\\nhttps://fotokash.com/e/" + e.slug); }); }}>Copier le lien client</span>
                      <span style={{ color: T.textDim, cursor: "pointer", fontSize: 12 }} onClick={() => onNavigate("client", { slug: e.slug })}>Voir la galerie</span>
                    </span>`;

c = c.substring(0, spanStart) + newBlock + c.substring(spanEnd);

fs.writeFileSync(path, c, 'utf8');
console.log('Done - slug copy button added');
