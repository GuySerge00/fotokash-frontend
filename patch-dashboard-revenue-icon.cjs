const fs = require('fs');
const path = 'src/pages/Dashboard/Dashboard.jsx';
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-dashboard-revenue-icon';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/Dashboard.jsx', src);
console.log('Backup : ' + bkdir + '/Dashboard.jsx');

const anchor = '{ id: "earnings", label: "Revenus",    icon: Icon.CreditCard(16) },';
const count = src.split(anchor).length - 1;
if (count !== 1) { console.error('Ancre trouvee ' + count + ' fois. Abandon.'); process.exit(1); }
src = src.split(anchor).join('{ id: "earnings", label: "Revenus",    icon: Icon.Coins(16) },');

fs.writeFileSync(path, src);
console.log('Dashboard.jsx patche : onglet Revenus utilise Icon.Coins.');
