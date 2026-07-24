const fs = require('fs');
const path = 'src/pages/Dashboard/Dashboard.jsx';
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-dashboard-subtab';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/Dashboard.jsx', src);
console.log('Backup : ' + bkdir + '/Dashboard.jsx');

// 1. import
const importAnchor = 'import AccountTab from "./AccountTab";';
if (src.split(importAnchor).length - 1 !== 1) { console.error('Ancre import non unique. Abandon.'); process.exit(1); }
src = src.split(importAnchor).join(importAnchor + '\nimport SubscriptionTab from "./SubscriptionTab";');

// 2. entree dans le tableau tabs, juste avant "Compte"
const tabsAnchor = '    { id: "account", label: "Compte",      icon: Icon.Users(16) },';
if (src.split(tabsAnchor).length - 1 !== 1) { console.error('Ancre tabs non unique. Abandon.'); process.exit(1); }
src = src.split(tabsAnchor).join(
  '    { id: "subscription", label: "Abonnement", icon: Icon.CreditCard(16) },\n' + tabsAnchor
);

// 3. rendu conditionnel, juste avant celui de account
const renderAnchor = '        {tab === "account" && <AccountTab token={token} user={user} onUserUpdate={setUser} />}';
if (src.split(renderAnchor).length - 1 !== 1) { console.error('Ancre rendu non unique. Abandon.'); process.exit(1); }
src = src.split(renderAnchor).join(
  '        {tab === "subscription" && <SubscriptionTab token={token} user={user} onUserUpdate={setUser} />}\n' + renderAnchor
);

fs.writeFileSync(path, src);
console.log('Dashboard.jsx patche : onglet Abonnement ajoute.');
