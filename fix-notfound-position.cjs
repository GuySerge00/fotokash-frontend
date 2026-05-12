// fix-notfound-position.cjs
// Déplace le bloc if(notFound) après tous les hooks pour éviter le crash React
// Usage: node fix-notfound-position.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');

// 1. Retirer le bloc notFound de sa position actuelle (entre togglePhoto et useState paymentLoading)
const NOTFOUND_BLOCK = `  // Écran galerie supprimée / introuvable
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
  }
`;

if (code.includes(NOTFOUND_BLOCK)) {
  code = code.replace(NOTFOUND_BLOCK, '');
  console.log('OK: Bloc notFound retire de sa position incorrecte.');
} else {
  console.error('ERREUR: Bloc notFound non trouve!');
  process.exit(1);
}

// 2. Insérer le bloc notFound juste avant le return principal de ClientPage
// Le return principal commence par "  return (\n    <div style={{ minHeight: \"100vh\", background: T.bg }}>"
const MAIN_RETURN = `  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Header */}`;

const NOTFOUND_BEFORE_RETURN = `  // Écran galerie supprimée / introuvable
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
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Header */}`;

if (code.includes(MAIN_RETURN)) {
  code = code.replace(MAIN_RETURN, NOTFOUND_BEFORE_RETURN);
  console.log('OK: Bloc notFound insere juste avant le return principal (apres tous les hooks).');
} else {
  console.error('ERREUR: Return principal de ClientPage non trouve!');
  process.exit(1);
}

fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE ===');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
