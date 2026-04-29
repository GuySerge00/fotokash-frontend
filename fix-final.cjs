const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Ligne 1239 (index 1238) - changer l'init du screen
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useState("landing")') && lines[i].includes('screen')) {
    console.log('OLD line', i+1, ':', lines[i].trim());
    lines[i] = '  const [screen, setScreen] = useState(() => { var p = window.location.pathname; if (p.startsWith("/e/")) return "client"; return "landing"; });';
    console.log('NEW line', i+1, ':', lines[i].trim());
  }
  if (lines[i].includes('screenProps') && lines[i].includes('useState({})')) {
    console.log('OLD props line', i+1, ':', lines[i].trim());
    lines[i] = '  const [screenProps, setScreenProps] = useState(() => { var p = window.location.pathname; if (p.startsWith("/e/")) return { slug: p.replace("/e/", "") }; return {}; });';
    console.log('NEW props line', i+1, ':', lines[i].trim());
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
