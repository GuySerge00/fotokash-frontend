const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Remplacer tout le bloc useEffect auto-login
let oldEffect = `if (window.location.pathname.startsWith("/e/")) {
      // Ne pas auto-login sur les pages client
    } else if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: \`Bearer \${token}\` } })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => { var u = d.user || d.photographer || d; setUser(u); setScreen(u.role === "admin" ? "admin" : "dashboard"); })
        .catch(() => { localStorage.removeItem("fotokash_token"); setToken(null); });
    }`;

let newEffect = `var currentPath = window.location.pathname;
    if (currentPath.startsWith("/e/")) {
      // Page client - ne pas auto-login
      return;
    }
    if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: \`Bearer \${token}\` } })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => { var u = d.user || d.photographer || d; setUser(u); setScreen(u.role === "admin" ? "admin" : "dashboard"); })
        .catch(() => { localStorage.removeItem("fotokash_token"); setToken(null); });
    }`;

if (c.includes(oldEffect)) {
  c = c.replace(oldEffect, newEffect);
  console.log('Effect v2 updated');
} else {
  // Essayer l'ancienne version
  let oldEffect2 = `if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: \`Bearer \${token}\` } })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => { var u = d.user || d.photographer || d; setUser(u); setScreen(u.role === "admin" ? "admin" : "dashboard"); })
        .catch(() => { localStorage.removeItem("fotokash_token"); setToken(null); });
    }`;

  if (c.includes(oldEffect2)) {
    c = c.replace(oldEffect2, newEffect);
    console.log('Effect v1 updated');
  } else {
    console.log('Effect NOT FOUND - searching...');
    let idx = c.indexOf('auth/me');
    if (idx !== -1) {
      console.log('Found auth/me at:', idx);
      console.log('Context:', c.substring(idx - 100, idx + 100));
    }
  }
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
