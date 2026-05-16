import { useState, useEffect } from "react";
import { T, API } from "../utils/tokens";
import { Icon } from "../utils/icons";
import { Btn } from "../components/Btn";


export default function LandingPage({ onNavigate, platform }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav className="landing-nav" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 20px", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: T.accent,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>{Icon.Camera(20)}</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" onClick={() => onNavigate("auth", { mode: "login" })}>Connexion</Btn>
          <Btn onClick={() => onNavigate("auth", { mode: "signup" })}>Inscription</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "60px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* BG glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${T.accentDim} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", animation: "fadeUp 0.6s ease" }}>
          <div style={{
            display: "inline-block", background: T.accentDim, color: T.accent,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            marginBottom: 24, letterSpacing: "0.05em",
          }}>
            PLATEFORME PHOTO ÉVÉNEMENTIELLE
          </div>
          <h1 style={{
            fontFamily: T.fontDisplay, fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
            lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 700, marginBottom: 20,
          }}>
            Vos photos,{" "}
            <span style={{ color: T.accent }}>vendues</span>{" "}
            en un clic
          </h1>
          <p style={{
            color: T.textMuted, fontSize: 17, lineHeight: 1.7, maxWidth: 520,
            margin: "0 auto 36px",
          }}>
            Photographe événementiel en Côte d'Ivoire ? Uploadez vos photos, laissez la
            reconnaissance faciale faire le tri, et vendez via Mobile Money.
          </p>
          <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 4 }}>Inscription gratuite. Aucune carte bancaire requise.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => onNavigate("auth", { mode: "signup" })} style={{ padding: "14px 32px", fontSize: 15 }}>
              Créer mon compte gratuitement {Icon.ArrowRight(16)}
            </Btn>
            </div>
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex", gap: 24, marginTop: 64, flexWrap: "wrap", justifyContent: "center",
          animation: "fadeUp 0.8s ease",
        }}>
          {[
            { icon: Icon.Camera(16), text: "Upload en lot" },
            { icon: Icon.Search(16), text: "Recherche par selfie" },
            { icon: Icon.QrCode(16), text: "QR code unique" },
            { icon: Icon.CreditCard(16), text: "Mobile Money" },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.card, border: `1px solid ${T.border}`,
              padding: "10px 18px", borderRadius: 10, fontSize: 13, color: T.textMuted,
            }}>
              <span style={{ color: T.accent }}>{f.icon}</span> {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Comment ça marche */}
      <div style={{
        padding: "80px 24px", borderTop: `1px solid ${T.border}`,
        textAlign: "center",
      }}>
        <div style={{
          color: T.accent, fontSize: 12, fontWeight: 700,
          marginBottom: 16, letterSpacing: "0.1em",
        }}>COMMENT ÇA MARCHE</div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, marginBottom: 48, color: T.text }}>
          3 étapes. <span style={{ color: T.accent }}>Zéro</span> complication.
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20, maxWidth: 800, margin: "0 auto",
        }}>
          {[
            { step: "Étape 1", title: "Uploadez vos photos", desc: "Glissez-déposez vos photos d événement. Traitement facial automatique.", color: T.accent, icon: Icon.Upload(22) },
            { step: "Étape 2", title: "Vos clients se retrouvent", desc: "Un selfie suffit. Leurs photos sont identifiées en 3 secondes.", color: T.green, icon: Icon.Camera(22) },
            { step: "Étape 3", title: "Vous êtes payé", desc: "Paiement Orange Money, MTN MoMo ou Wave. Direct sur votre compte.", color: T.gold, icon: Icon.CreditCard(22) },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: T.radius, padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: s.color + "18", color: s.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 8 }}>{s.step}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Stats live */}


{/* Témoignages */}
      <div style={{
        padding: "80px 24px", borderTop: `1px solid ${T.border}`,
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
              border: `1px solid ${T.border}`,
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
      </div>



      {/* Pricing */}
      <div style={{
        padding: "60px 24px", borderTop: `1px solid ${T.border}`,
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
              border: `1px solid ${p.highlight ? T.accent : T.border}`,
              borderRadius: T.radius, padding: "28px 20px",
              boxShadow: p.highlight ? `0 0 30px ${T.accentDim}` : "none",
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


      {/* Footer */}
      <footer style={{
        padding: "24px 32px", borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 12, color: T.textDim,
      }}>
        <span>{"© 2026 FotoKash · Abidjan, Côte d'Ivoire"}</span>
        <div style={{ display: "flex", gap: 16 }}>
          <span onClick={() => onNavigate("legal", { tab: "cgu" })} style={{ cursor: "pointer", color: T.textMuted, textDecoration: "underline" }}>CGU / CGV</span>
          <span onClick={() => onNavigate("legal", { tab: "confidentialite" })} style={{ cursor: "pointer", color: T.textMuted, textDecoration: "underline" }}>Politique de confidentialité</span>
        </div>
      </footer>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCREEN 2 â€” AUTH (Login / Signup)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

