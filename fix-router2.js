const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Trouver le useEffect d'auto-login et ajouter une condition pour ne pas rediriger si on est sur /e/
let oldAutoLogin = 'if (token && !user) {';
let newAutoLogin = `if (window.location.pathname.startsWith("/e/")) {
      // Ne pas auto-login sur les pages client
    } else if (token && !user) {`;

if (c.includes(oldAutoLogin)) {
  c = c.replace(oldAutoLogin, newAutoLogin);
  console.log('Auto-login updated');
} else {
  console.log('Auto-login not found');
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
