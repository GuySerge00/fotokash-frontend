const fs = require('fs');
const path = 'src/pages/Dashboard/EventsTab.jsx';
function replaceOnce(content, find, replace, label) {
  const parts = content.split(find);
  if (parts.length !== 2) throw new Error('Ancre "' + label + '" trouvee ' + (parts.length - 1) + ' fois. Abandon.');
  return parts.join(replace);
}
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-frontend-eventstab-icon';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/EventsTab.jsx', src);
console.log('Backup : ' + bkdir + '/EventsTab.jsx');

const anchor = '                        { icon: "💰", label: "Modifier la tarification", action: () => openPricingEdit(e) },';
const replacement =
  '                        { icon: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1a2.5 2.5 0 0 1-2.5-1.5"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>), label: "Modifier la tarification", action: () => openPricingEdit(e) },';

src = replaceOnce(src, anchor, replacement, 'icone SVG tarification');
fs.writeFileSync(path, src);
console.log('EventsTab.jsx patche : icone SVG (cercle + symbole monetaire) pour Modifier la tarification.');
