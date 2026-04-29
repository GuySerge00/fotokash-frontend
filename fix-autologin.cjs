const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useEffect(() => {') && lines[i+1] && lines[i+1].includes('var currentPath')) {
    console.log('Found auto-login useEffect at line', i + 1);
    // Trouver la fin du useEffect (la ligne avec }, [token])
    let endIdx = -1;
    for (let j = i; j < i + 20; j++) {
      if (lines[j].includes('}, [token]')) {
        endIdx = j;
        break;
      }
    }
    if (endIdx === -1) {
      console.log('End not found');
      break;
    }
    console.log('End at line', endIdx + 1);
    
    // Remplacer tout le bloc
    let newBlock = [
      '  useEffect(() => {',
      '    var currentPath = window.location.pathname;',
      '    if (currentPath.startsWith("/e/")) return;',
      '    if (currentPath.startsWith("/p/")) return;',
      '    if (token && !user) {',
      '      fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })',
      '        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })',
      '        .then(function(d) { var u = d.user || d.photographer || d; setUser(u); setScreen(u.role === "admin" ? "admin" : "dashboard"); })',
      '        .catch(function() { localStorage.removeItem("fotokash_token"); setToken(null); });',
      '    }',
      '  }, [token]);',
    ];
    
    lines.splice(i, endIdx - i + 1, ...newBlock);
    console.log('Auto-login block replaced');
    break;
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
