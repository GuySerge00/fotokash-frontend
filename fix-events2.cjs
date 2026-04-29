const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Trouver le début du bloc: "{e.name}" (la div qui affiche le nom de l'événement)
let nameLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('fontWeight: 600, fontSize: 15') && lines[i].includes('name')) {
    nameLineIdx = i;
    console.log('Name line at', i + 1);
    break;
  }
}

if (nameLineIdx === -1) {
  console.log('Name line not found');
  process.exit();
}

// Remonter d'une ligne pour la div parent
let blockStart = nameLineIdx - 1;

// Trouver la fin: chercher le </div> qui ferme le bloc d'un événement complet
// Après le bouton Supprimer, il y a </div> pour les actions puis </div> pour la card
let lastTrash = -1;
for (let i = blockStart; i < lines.length; i++) {
  if (lines[i].includes('Icon.Trash')) {
    lastTrash = i;
  }
  // On a dépassé le bloc events
  if (i > blockStart + 60) break;
}

// Depuis le dernier Trash, trouver les </div> de fermeture
let blockEnd = lastTrash;
let divCount = 0;
for (let i = lastTrash; i < lastTrash + 20; i++) {
  if (lines[i].includes('</button>')) {
    blockEnd = i;
    // Chercher le prochain </div> (ferme actions div)
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') {
        blockEnd = j;
        break;
      }
    }
    break;
  }
}

console.log('Replacing lines', blockStart + 1, 'to', blockEnd + 1);
console.log('Lines to remove:', blockEnd - blockStart + 1);

let newLines = [
  '              <div>',
  '                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{e.name}</div>',
  '                <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>',
  '                  {e.date && <span>{new Date(e.date).toLocaleDateString("fr-FR")}</span>}',
  '                  {e.location && <span>{e.location}</span>}',
  '                  <span style={{ color: T.accent, cursor: "pointer", textDecoration: "underline" }} onClick={function(ev) { ev.stopPropagation(); navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(function() { alert("Lien copie : https://fotokash.com/e/" + e.slug); }); }}>Copier le lien</span>',
  '                </div>',
  '              </div>',
  '              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>',
  '                <span style={{ fontSize: 12, color: T.textDim }}>{e.photos_count || 0} photo{(e.photos_count || 0) !== 1 ? "s" : ""}</span>',
  '                <button onClick={function(ev) { ev.stopPropagation(); if (window.confirm("Supprimer cet evenement et toutes ses photos ?")) { fetch(API + "/events/" + e.id, { method: "DELETE", headers: { Authorization: "Bearer " + token } }).then(function(r) { if (r.ok) setEvents(function(prev) { return prev.filter(function(x) { return x.id !== e.id; }); }); }); } }} style={{ background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.red, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>',
  '                  {Icon.Trash(12)} Supprimer',
  '                </button>',
  '              </div>',
];

lines.splice(blockStart, blockEnd - blockStart + 1, ...newLines);

// Nettoyer les corruptions markdown restantes dans tout le fichier
let result = lines.join('\n');
// Fix [e.xxx] patterns - ne pas utiliser regex car le terminal les corrompt aussi
// Utiliser indexOf en boucle
let pairs = [
  ['e.name', 'e.name'],
  ['e.date', 'e.date'],
  ['e.id', 'e.id'],
  ['e.photos', 'e.photos'],
  ['x.id', 'x.id'],
  ['T.red', 'T.red'],
  ['T.green', 'T.green'],
];

// Les corruptions sont du format [mot](http://mot)
// Mais on a vu que les bytes sont propres - c'est juste l'affichage du terminal
// Verifions d'abord
for (let p of pairs) {
  let search = '[' + p[0] + '](http://' + p[0] + ')';
  if (result.includes(search)) {
    while (result.includes(search)) {
      result = result.replace(search, p[1]);
    }
    console.log('Fixed corruption:', p[0]);
  }
}

fs.writeFileSync(path, result, 'utf8');
console.log('Done');
