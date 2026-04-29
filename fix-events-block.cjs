const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Trouver le bloc de chaque événement dans EventsTab
// Chercher la ligne avec "e.location" et le bloc slug corrompu
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{e.date &&') && lines[i].includes('Calendar')) {
    startLine = i;
  }
  if (startLine > 0 && lines[i].includes('photo_count') && lines[i].includes('photos_count')) {
    // C'est la fin du bloc infos, chercher la fin du div parent
    endLine = i;
    break;
  }
}

// Approche plus precise: trouver tout le bloc entre date/location et le bouton supprimer
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{e.date &&') && lines[i].includes('toLocaleDateString')) {
    startLine = i;
    console.log('Start found at line', i + 1);
  }
  if (startLine > 0 && i > startLine && lines[i].includes('Supprimer')) {
    endLine = i;
    console.log('End (Supprimer) found at line', i + 1);
    break;
  }
}

if (startLine === -1) {
  console.log('Block not found');
  process.exit();
}

// Trouver le vrai début du bloc info (la div qui contient date, location, slug)
let infoStart = startLine;
// Remonter pour trouver le <div> parent avec fontSize: 12, color: T.textMuted
for (let i = startLine; i >= startLine - 5; i--) {
  if (lines[i].includes('fontSize: 12') && lines[i].includes('textMuted')) {
    infoStart = i;
    break;
  }
}

// Trouver la fin: la div qui contient le bouton Supprimer et ses fermetures
let blockEnd = endLine;
for (let i = endLine; i < endLine + 15; i++) {
  if (lines[i].includes('</div>') && lines[i].trim() === '</div>') {
    blockEnd = i;
    break;
  }
}

console.log('Replacing lines', infoStart + 1, 'to', blockEnd + 1);

let newBlock = [
  '                <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>',
  '                  {e.date && <span>' + "{'\\u{1F4C5} ' + new Date(e.date).toLocaleDateString('fr-FR')}" + '</span>}',
  '                  {e.location && <span>{e.location}</span>}',
  '                  <span style={{ color: T.accent, cursor: "pointer", textDecoration: "underline" }} onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(function() { alert("Lien copie !\\nhttps://fotokash.com/e/" + e.slug); }); }}>Copier le lien</span>',
  '                  <span style={{ color: T.textDim, cursor: "pointer" }} onClick={() => onNavigate("client", { slug: e.slug })}>Voir galerie</span>',
  '                </div>',
  '              </div>',
  '              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>',
  '                <span style={{ fontSize: 12, color: T.textDim }}>{e.photos_count || 0} photo{(e.photos_count || 0) !== 1 ? "s" : ""}</span>',
  '                <button onClick={(ev) => {',
  '                  ev.stopPropagation();',
  '                  if (window.confirm("Supprimer cet evenement et toutes ses photos ?")) {',
  '                    fetch(API + "/events/" + e.id, {',
  '                      method: "DELETE",',
  '                      headers: { Authorization: "Bearer " + token },',
  '                    }).then(function(r) {',
  '                      if (r.ok) setEvents(function(prev) { return prev.filter(function(x) { return x.id !== e.id; }); });',
  '                    });',
  '                  }',
  '                }} style={{',
  '                  background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 6,',
  '                  padding: "4px 8px", cursor: "pointer", color: T.red, display: "flex",',
  '                  alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,',
  '                }}>',
  '                  {Icon.Trash(12)} Supprimer',
  '                </button>',
  '              </div>',
];

lines.splice(infoStart, blockEnd - infoStart + 1, ...newBlock);
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Events block replaced');
