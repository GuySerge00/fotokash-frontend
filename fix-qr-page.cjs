const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

// Trouver le début et la fin du composant QrPhotoPage
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function QrPhotoPage(')) {
    startIdx = i;
    console.log('QrPhotoPage starts at line', i + 1);
  }
  if (startIdx > 0 && i > startIdx && lines[i].trim() === '}' && endIdx === -1) {
    // Vérifier que c'est bien la fermeture de la fonction principale
    // En comptant les accolades
    let depth = 0;
    for (let j = startIdx; j <= i; j++) {
      for (let ch of lines[j]) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
    }
    if (depth === 0) {
      endIdx = i;
      console.log('QrPhotoPage ends at line', i + 1);
      break;
    }
  }
}

if (startIdx === -1) {
  console.log('QrPhotoPage not found');
  process.exit();
}

let newComponent = [
  'function QrPhotoPage({ qrCode, onNavigate }) {',
  '  const [photo, setPhoto] = useState(null);',
  '  const [loading, setLoading] = useState(true);',
  '  const [error, setError] = useState(null);',
  '',
  '  useEffect(function() {',
  '    fetch(API + "/photos/qr/" + qrCode)',
  '      .then(function(r) { return r.json(); })',
  '      .then(function(d) {',
  '        if (d.photo) setPhoto(d.photo);',
  '        else setError("Photo introuvable.");',
  '        setLoading(false);',
  '      })',
  '      .catch(function() { setError("Erreur de connexion."); setLoading(false); });',
  '  }, []);',
  '',
  '  var downloadPhoto = function() {',
  '    if (!photo) return;',
  '    fetch(photo.watermarked_url || photo.thumbnail_url)',
  '      .then(function(r) { return r.blob(); })',
  '      .then(function(blob) {',
  '        var url = window.URL.createObjectURL(blob);',
  '        var a = document.createElement("a");',
  '        a.href = url;',
  '        a.download = "fotokash-" + photo.qr_code_id + ".jpg";',
  '        document.body.appendChild(a);',
  '        a.click();',
  '        document.body.removeChild(a);',
  '        window.URL.revokeObjectURL(url);',
  '      });',
  '  };',
  '',
  '  if (loading) return (',
  '    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>',
  '  );',
  '',
  '  if (error || !photo) return (',
  '    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textMuted, gap: 16 }}>',
  '      <p>{error || "Photo introuvable."}</p>',
  '      <Btn onClick={function() { onNavigate("landing"); }}>Retour</Btn>',
  '    </div>',
  '  );',
  '',
  '  return (',
  '    <div style={{ minHeight: "100vh", background: T.bg, padding: 24 }}>',
  '      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>',
  '        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Icon.Camera(14)}</div>',
  '        <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>',
  '      </header>',
  '      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>',
  '        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{photo.event_name || "Photo FotoKash"}</h2>',
  '        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Code: {photo.qr_code_id}</p>',
  '        <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>',
  '          <img src={photo.watermarked_url || photo.thumbnail_url} alt="" style={{ width: "100%", display: "block" }} />',
  '        </div>',
  '        <Btn onClick={downloadPhoto} style={{ width: "100%", justifyContent: "center", padding: "14px 0", background: T.green }}>',
  '          Telecharger en HD',
  '        </Btn>',
  '      </div>',
  '    </div>',
  '  );',
  '}',
];

lines.splice(startIdx, endIdx - startIdx + 1, ...newComponent);
fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('QrPhotoPage replaced with JSX version');
