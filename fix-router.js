const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Remplacer l'initialisation du screen pour détecter l'URL
let oldInit = 'const [screen, setScreen] = useState("landing");';
let newInit = `const [screen, setScreen] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith("/e/")) return "client";
    return "landing";
  });`;

if (c.includes(oldInit)) {
  c = c.replace(oldInit, newInit);
  console.log('Screen init updated');
} else {
  console.log('Screen init not found');
}

// Remplacer l'initialisation de screenProps pour passer le slug
let oldProps = 'const [screenProps, setScreenProps] = useState({});';
let newProps = `const [screenProps, setScreenProps] = useState(() => {
    const path = window.location.pathname;
    if (path.startsWith("/e/")) return { slug: path.replace("/e/", "") };
    return {};
  });`;

if (c.includes(oldProps)) {
  c = c.replace(oldProps, newProps);
  console.log('ScreenProps init updated');
} else {
  console.log('ScreenProps not found');
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
