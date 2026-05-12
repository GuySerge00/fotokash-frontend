// fix-testimonials-before-pricing.cjs
// Inverse les sections Témoignages et Tarifs sur la landing page
// Usage: node fix-testimonials-before-pricing.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');

// Le bloc Pricing (lignes 226-258 environ)
const PRICING_BLOCK = `      {/* Pricing */}
      <div style={{
        padding: "60px 24px", borderTop: \`1px solid \${T.border}\`,
        textAlign: "center",
      }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tarifs simples</h2>
        <p style={{ color: T.textMuted, marginBottom: 36, fontSize: 14 }}>Pour les clients qui achètent les photos</p>
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 700,
          margin: "0 auto",
        }}>
          {[
            { photos: "1 photo", price: "200 FCFA" },
            { photos: "6 photos", price: "500 FCFA", highlight: true },
            { photos: "10+ photos", price: "1 000 FCFA" },
          ].map((p, i) => (
            <div key={i} style={{
              flex: "1 1 180px", background: T.card,
              border: \`1px solid \${p.highlight ? T.accent : T.border}\`,
              borderRadius: T.radius, padding: "28px 20px",
              boxShadow: p.highlight ? \`0 0 30px \${T.accentDim}\` : "none",
            }}>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>{p.photos}</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700,
                color: p.highlight ? T.accent : T.text,
              }}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>


      {/* Témoignages */}`;

const PRICING_ONLY = `      {/* Pricing */}
      <div style={{
        padding: "60px 24px", borderTop: \`1px solid \${T.border}\`,
        textAlign: "center",
      }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tarifs simples</h2>
        <p style={{ color: T.textMuted, marginBottom: 36, fontSize: 14 }}>Pour les clients qui achètent les photos</p>
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 700,
          margin: "0 auto",
        }}>
          {[
            { photos: "1 photo", price: "200 FCFA" },
            { photos: "6 photos", price: "500 FCFA", highlight: true },
            { photos: "10+ photos", price: "1 000 FCFA" },
          ].map((p, i) => (
            <div key={i} style={{
              flex: "1 1 180px", background: T.card,
              border: \`1px solid \${p.highlight ? T.accent : T.border}\`,
              borderRadius: T.radius, padding: "28px 20px",
              boxShadow: p.highlight ? \`0 0 30px \${T.accentDim}\` : "none",
            }}>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>{p.photos}</div>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700,
                color: p.highlight ? T.accent : T.text,
              }}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>`;

// Le bloc Témoignages complet
const TEMOIGNAGES_BLOCK = `      {/* Témoignages */}
      <div style={{
        padding: "80px 24px", borderTop: \`1px solid \${T.border}\`,
        textAlign: "center", background: T.bg,
      }}>
        <div style={{
          color: T.accent, fontSize: 12, fontWeight: 700,
          marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          TÉMOIGNAGES
        </div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, marginBottom: 48, color: T.text }}>
          Ils utilisent <span style={{ color: T.accent }}>FotoKash</span>
        </h2>
        <div style={{
          display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap",
          maxWidth: 960, margin: "0 auto",
        }}>
          {[
            {
              quote: "J'ai retrouvé toutes mes photos de mariage en 5 secondes. Incroyable !",
              name: "Aya Kouamé",
              role: "Mariée, Abidjan",
              initials: "AK",
            },
            {
              quote: "Mes clients récupèrent leurs photos sans que j'aie à les trier. Un gain de temps énorme.",
              name: "Ibrahim Traoré",
              role: "Photographe événementiel",
              initials: "IT",
            },
            {
              quote: "Le mode live a transformé nos événements. Les invités adorent voir leurs photos en direct.",
              name: "Marie Bamba",
              role: "Organisatrice événements",
              initials: "MB",
            },
          ].map((t, i) => (
            <div key={i} style={{
              flex: "1 1 260px", maxWidth: 300,
              background: T.card,
              border: \`1px solid \${T.border}\`,
              borderRadius: T.radius, padding: "28px 24px",
              textAlign: "left",
            }}>
              <p style={{
                color: T.textMuted, fontSize: 14, lineHeight: 1.7,
                marginBottom: 24, fontStyle: "italic",
              }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: T.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>`;

// Stratégie : remplacer "Pricing + Témoignages" par "Témoignages + Pricing"

// Etape 1 : Remplacer le bloc Pricing suivi de {/* Témoignages */} par juste le marker témoignages
if (code.includes(PRICING_BLOCK)) {
  // Remplacer Pricing+anchor par juste l'anchor témoignages
  code = code.replace(PRICING_BLOCK, '{/* Témoignages */}');
  console.log('OK: Bloc Pricing retire de sa position originale.');
} else {
  console.error('ERREUR: Bloc Pricing+Temoignages anchor non trouve!');
  process.exit(1);
}

// Etape 2 : Maintenant le bloc Témoignages est toujours là. On insère Pricing APRES lui.
// Chercher la fin du bloc Témoignages (juste avant {/* Footer */})
const FOOTER_ANCHOR = '      {/* Footer */}';

if (code.includes(FOOTER_ANCHOR)) {
  code = code.replace(FOOTER_ANCHOR, '\n\n' + PRICING_ONLY + '\n\n' + FOOTER_ANCHOR);
  console.log('OK: Bloc Pricing insere entre Temoignages et Footer.');
} else {
  console.error('ERREUR: Footer anchor non trouve!');
  process.exit(1);
}

fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE ===');
console.log('Ordre: Hero -> Temoignages -> Tarifs -> Footer');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
