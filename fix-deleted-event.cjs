// fix-deleted-event.cjs
// Affiche un message propre quand un événement supprimé/introuvable est accédé
// Usage: node fix-deleted-event.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');
let changes = 0;

// ============================================================
// 1. Ajouter un state "notFound" dans ClientPage
// ============================================================
const OLD_STATES = `function ClientPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState([]);`;

const NEW_STATES = `function ClientPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);`;

if (code.includes(OLD_STATES)) {
  code = code.replace(OLD_STATES, NEW_STATES);
  changes++;
  console.log('OK: state notFound ajoute.');
} else {
  console.error('ERREUR: anchor states non trouvee!');
}

// ============================================================
// 2. Modifier le useEffect fetch pour gérer le 404
// ============================================================
const OLD_FETCH = `useEffect(() => {
    setLoading(true);
    fetch(API + \`/events/\${slug || "demo"}/public\`)
      .then((r) => r.json())
      .then((d) => {
        var evt = d.event || { name: "Événement démo", date: "2026-04-19" };
        setEvent(evt);
        setPhotographerPlan(evt.photographer_plan || 'free');
        setMobileMoneyEnabled(evt.mobile_money_enabled || false);
        if (evt.id) {
          fetch(API + "/photos/event/" + evt.id + "/public")
            .then((r2) => r2.json())
            .then((d2) => { setPhotos(d2.photos || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => { setLoading(false); });
   fetch(API + "/photos/pricing").then(r => r.json()).then(d => setPricing(d)).catch(() => {});
  }, [slug]);`;

const NEW_FETCH = `useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(API + \`/events/\${slug || "demo"}/public\`)
      .then((r) => {
        if (!r.ok) {
          // Événement supprimé ou introuvable
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (!d.event) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        var evt = d.event;
        setEvent(evt);
        setPhotographerPlan(evt.photographer_plan || 'free');
        setMobileMoneyEnabled(evt.mobile_money_enabled || false);
        if (evt.id) {
          fetch(API + "/photos/event/" + evt.id + "/public")
            .then((r2) => r2.json())
            .then((d2) => { setPhotos(d2.photos || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
   fetch(API + "/photos/pricing").then(r => r.json()).then(d => setPricing(d)).catch(() => {});
  }, [slug]);`;

if (code.includes(OLD_FETCH)) {
  code = code.replace(OLD_FETCH, NEW_FETCH);
  changes++;
  console.log('OK: useEffect modifie pour gerer le 404.');
} else {
  console.error('ERREUR: anchor useEffect fetch non trouvee!');
}

// ============================================================
// 3. Ajouter l'écran "galerie indisponible" après le loading check
//    On cherche le return loading existant et on ajoute le notFound juste après
// ============================================================
// Cherchons le pattern du loading return dans ClientPage
// On va chercher le premier "if (loading)" qui suit le useEffect modifié

// Trouvons d'abord ce qui suit le useEffect dans la fonction de rendu
// On doit ajouter le rendu notFound. Cherchons le pattern de rendu existant.

// Cherchons un endroit sûr : après togglePhoto et avant le return principal
const TOGGLE_PHOTO = `const togglePhoto = (id) => {
    if (matchedIds === null || !matchedIds.includes(id)) return;
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };`;

const TOGGLE_PHOTO_WITH_NOTFOUND = `const togglePhoto = (id) => {
    if (matchedIds === null || !matchedIds.includes(id)) return;
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  // Écran galerie supprimée / introuvable
  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          maxWidth: 440, textAlign: "center", background: T.card,
          border: "1px solid " + T.border, borderRadius: T.radius,
          padding: "48px 32px",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
          <h2 style={{
            fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700,
            color: T.text, marginBottom: 12,
          }}>
            Galerie indisponible
          </h2>
          <p style={{
            color: T.textMuted, fontSize: 14, lineHeight: 1.7,
            marginBottom: 28,
          }}>
            Cette galerie n'est plus disponible. Elle a peut-être été supprimée par le photographe.
          </p>
          <p style={{
            color: T.textMuted, fontSize: 13, lineHeight: 1.6,
            marginBottom: 28, padding: "16px", background: T.cardAlt,
            borderRadius: T.radiusSm, border: "1px solid " + T.border,
          }}>
            Pour retrouver vos photos, contactez directement le photographe de l'événement.
          </p>
          <button onClick={() => onNavigate("landing")} style={{
            background: T.accent, color: "#fff", border: "none",
            borderRadius: T.radiusSm, padding: "12px 28px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: T.font,
          }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }`;

if (code.includes(TOGGLE_PHOTO)) {
  code = code.replace(TOGGLE_PHOTO, TOGGLE_PHOTO_WITH_NOTFOUND);
  changes++;
  console.log('OK: Ecran "galerie indisponible" ajoute.');
} else {
  console.error('ERREUR: anchor togglePhoto non trouvee!');
}

// ============================================================
// Écrire le résultat
// ============================================================
fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE === (' + changes + ' corrections appliquees)');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
