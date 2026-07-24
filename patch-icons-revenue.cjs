const fs = require('fs');
const path = 'src/utils/icons.jsx';
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-icons-revenue';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/icons.jsx', src);
console.log('Backup : ' + bkdir + '/icons.jsx');

const anchor = '  CreditCard: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,';
const count = src.split(anchor).length - 1;
if (count !== 1) { console.error('Ancre trouvee ' + count + ' fois. Abandon.'); process.exit(1); }

const insert = anchor + '\n  Coins: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>,';
src = src.split(anchor).join(insert);

fs.writeFileSync(path, src);
console.log('icons.jsx patche : icone Coins ajoutee (pour Revenus).');
