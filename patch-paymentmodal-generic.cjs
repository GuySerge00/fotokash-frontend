const fs = require('fs');
const path = 'src/components/PaymentStatusModal.jsx';
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-paymentmodal-generic';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/PaymentStatusModal.jsx', src);
console.log('Backup : ' + bkdir + '/PaymentStatusModal.jsx');

const anchor1 = "export default function PaymentStatusModal({ transactionId, amount, onSuccess, onError, onCancel }) {";
const count1 = src.split(anchor1).length - 1;
if (count1 !== 1) { console.error('Ancre 1 trouvee ' + count1 + ' fois. Abandon.'); process.exit(1); }
src = src.split(anchor1).join(
  "export default function PaymentStatusModal({ transactionId, amount, onSuccess, onError, onCancel, statusUrl, dataKey }) {\n" +
  "  const url = statusUrl || ('/api/payments/' + transactionId + '/status');\n" +
  "  const key = dataKey || 'transaction';"
);

const anchor2 = "const res = await fetch('/api/payments/' + transactionId + '/status');\n        if (!res.ok) return;\n        const data = await res.json();\n        const tx = data.transaction;";
const count2 = src.split(anchor2).length - 1;
if (count2 !== 1) { console.error('Ancre 2 trouvee ' + count2 + ' fois. Abandon.'); process.exit(1); }
src = src.split(anchor2).join(
  "const res = await fetch(url);\n        if (!res.ok) return;\n        const data = await res.json();\n        const tx = data[key];"
);

fs.writeFileSync(path, src);
console.log('PaymentStatusModal.jsx generalise : statusUrl/dataKey optionnels, retrocompatible.');
