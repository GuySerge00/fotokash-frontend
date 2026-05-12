// fix-notfound-contact.cjs
// Met à jour l'écran notFound pour afficher le contact du photographe
// Usage: node fix-notfound-contact.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');
let changes = 0;

// ============================================================
// 1. Ajouter un state pour stocker les infos du photographe supprimé
// ============================================================
const OLD_NOTFOUND_STATE = `const [notFound, setNotFound] = useState(false);`;
const NEW_NOTFOUND_STATE = `const [notFound, setNotFound] = useState(false);
  const [deletedInfo, setDeletedInfo] = useState(null);`;

if (code.includes(OLD_NOTFOUND_STATE)) {
  code = code.replace(OLD_NOTFOUND_STATE, NEW_NOTFOUND_STATE);
  changes++;
  console.log('OK: state deletedInfo ajoute.');
} else {
  console.error('ERREUR: state notFound non trouve!');
}

// ============================================================
// 2. Modifier le useEffect fetch pour récupérer les infos du photographe sur 410
// ============================================================
const OLD_FETCH_410 = `      .then((r) => {
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
        }`;

const NEW_FETCH_410 = `      .then((r) => {
        if (r.status === 410) {
          // Événement supprimé — récupérer les infos du photographe
          return r.json().then((data) => {
            setDeletedInfo(data);
            setNotFound(true);
            setLoading(false);
            return null;
          });
        }
        if (!r.ok) {
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
        }`;

if (code.includes(OLD_FETCH_410)) {
  code = code.replace(OLD_FETCH_410, NEW_FETCH_410);
  changes++;
  console.log('OK: Fetch modifie pour gerer le 410.');
} else {
  console.error('ERREUR: Fetch 410 anchor non trouvee!');
}

// ============================================================
// 3. Remplacer le bloc notFound par un écran avec contact photographe
// ============================================================
const OLD_NOTFOUND_UI = `  // Écran galerie supprimée / introuvable
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

const NEW_NOTFOUND_UI = `  // Écran galerie supprimée / introuvable
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
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(232,89,60,0.12)", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700,
            color: T.text, marginBottom: 12,
          }}>
            Galerie indisponible
          </h2>
          <p style={{
            color: T.textMuted, fontSize: 14, lineHeight: 1.7,
            marginBottom: 24,
          }}>
            {deletedInfo && deletedInfo.event_name
              ? "La galerie \\u00ab " + deletedInfo.event_name + " \\u00bb n'est plus disponible."
              : "Cette galerie n'est plus disponible. Elle a peut-\\u00eatre \\u00e9t\\u00e9 supprim\\u00e9e par le photographe."}
          </p>
          {deletedInfo && deletedInfo.photographer_name && (
            <div style={{
              padding: "16px", background: T.cardAlt,
              borderRadius: T.radiusSm, border: "1px solid " + T.border,
              marginBottom: 24, textAlign: "left",
            }}>
              <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 8 }}>Photographe de l'\\u00e9v\\u00e9nement</p>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{deletedInfo.photographer_name}</p>
              {deletedInfo.photographer_phone && (
                <p style={{ color: T.textMuted, fontSize: 13 }}>{deletedInfo.photographer_phone}</p>
              )}
            </div>
          )}
          {deletedInfo && deletedInfo.photographer_phone && (
            <a
              href={"https://wa.me/" + (deletedInfo.photographer_phone || "").replace(/[^0-9]/g, "")}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#25D366", color: "#fff", border: "none",
                borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14,
                fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                textDecoration: "none", marginBottom: 12,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.616l4.529-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.386 0-4.586-.826-6.32-2.21l-.44-.362-2.89.942.96-2.84-.378-.462A9.935 9.935 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Contacter sur WhatsApp
            </a>
          )}
          {(!deletedInfo || !deletedInfo.photographer_phone) && (
            <p style={{
              color: T.textMuted, fontSize: 13, lineHeight: 1.6,
              marginBottom: 24, padding: "16px", background: T.cardAlt,
              borderRadius: T.radiusSm, border: "1px solid " + T.border,
            }}>
              Pour retrouver vos photos, contactez directement le photographe de l'\\u00e9v\\u00e9nement.
            </p>
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onNavigate("landing")} style={{
              background: T.accentDim, color: T.accent, border: "none",
              borderRadius: T.radiusSm, padding: "10px 24px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}>
              Retour \\u00e0 l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }`;

if (code.includes(OLD_NOTFOUND_UI)) {
  code = code.replace(OLD_NOTFOUND_UI, NEW_NOTFOUND_UI);
  changes++;
  console.log('OK: Ecran notFound mis a jour avec contact photographe + WhatsApp.');
} else {
  console.error('ERREUR: Bloc notFound UI non trouve!');
}

fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE === (' + changes + ' corrections appliquees)');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
