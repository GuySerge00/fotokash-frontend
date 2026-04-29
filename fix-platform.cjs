const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// 1. Ajouter les states platform dans FotoKashApp
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [token, setToken]')) {
    let insertLine = i + 1;
    lines.splice(insertLine, 0,
      '  const [platform, setPlatform] = useState({ name: "FotoKash", email: "contact@fotokash.com" });',
      '  useEffect(function() { fetch(API + "/photos/platform").then(function(r) { return r.json(); }).then(function(d) { setPlatform(d); }).catch(function() {}); }, []);'
    );
    console.log('Platform state added at line', insertLine + 1);
    break;
  }
}

// 2. Passer platform comme prop aux composants
// LandingPage
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{screen === "landing"') && lines[i].includes('LandingPage')) {
    lines[i] = lines[i].replace('onNavigate={navigate}', 'onNavigate={navigate} platform={platform}');
    console.log('Platform prop added to LandingPage');
    break;
  }
}

// 3. Modifier LandingPage pour utiliser platform
// Trouver la declaration de LandingPage
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function LandingPage(')) {
    lines[i] = lines[i].replace('{ onNavigate }', '{ onNavigate, platform }');
    console.log('LandingPage receives platform prop');
    break;
  }
}

// 4. Remplacer le texte "FotoKash" fixe dans le footer par platform.name et platform.email
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('2026 FotoKash') && lines[i].includes("Abidjan")) {
    lines[i] = '        <span>{"\u00a9 2026 " + (platform ? platform.name : "FotoKash") + " \u00b7 Abidjan, C\u00f4te d\'Ivoire"}</span>';
    console.log('Footer copyright updated at line', i + 1);
  }
  if (lines[i].includes('fotokash.com') && lines[i].includes('</span>') && lines[i].includes('</footer>') === false && i > 200 && i < 260) {
    lines[i] = '        <span>{platform ? platform.email : "contact@fotokash.com"}</span>';
    console.log('Footer email updated at line', i + 1);
  }
}

// 5. Chercher et remplacer le texte statique "fotokash.com" dans le footer
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<span>fotokash.com</span>') {
    lines[i] = '        <span>{platform ? platform.email : "contact@fotokash.com"}</span>';
    console.log('Footer static email updated at line', i + 1);
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
