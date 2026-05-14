import SEOHead from './components/SEOHead';
import AdminLayout from "./admin/AdminLayout";
import LiveEventPage from "./LiveEventPage";
import LegalPage from "./LegalPage";
import { useState, useRef, useCallback, useEffect } from "react";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  FOTOKASH â€” Application complète React
//  Plateforme de vente de photos événementielles
//  Côte d'Ivoire · fotokash.com
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const API = import.meta.env.VITE_API_URL || "/api";

// â”€â”€â”€ Design Tokens â”€â”€â”€
const T = {
  accent: "#E8593C",
  accentDim: "rgba(232,89,60,0.12)",
  accentGlow: "rgba(232,89,60,0.25)",
  bg: "#0B0B0F",
  card: "#141419",
  cardAlt: "#1A1A22",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#F0F0F5",
  textMuted: "#8888A0",
  textDim: "#555568",
  green: "#4ADE80",
  red: "#EF4444",
  gold: "#FFB826",
  radius: 14,
  radiusSm: 10,
  font: "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

// â”€â”€â”€ Shared Styles â”€â”€â”€
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: ${T.font}; }
  ::selection { background: ${T.accent}; color: white; }
  input, select, textarea { font-family: ${T.font}; }
`;

// â”€â”€â”€ Icons (inline SVG) â”€â”€â”€
const Icon = {
  Camera: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Upload: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Calendar: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Image: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  BarChart: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  LogOut: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Search: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Phone: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  X: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ArrowRight: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  CreditCard: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  AlertCircle: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Trash: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
  QrCode: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>,
};

// â”€â”€â”€ Helper: format FCFA â”€â”€â”€
const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const formatSize = (b) => b < 1048576 ? (b / 1024).toFixed(1) + " Ko" : (b / 1048576).toFixed(1) + " Mo";

// â”€â”€â”€ Shared Button â”€â”€â”€
const Btn = ({ children, onClick, variant = "primary", disabled, style, ...rest }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all 0.2s", fontFamily: T.font, letterSpacing: "0.01em",
    opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary: { background: T.accent, color: "#fff" },
    ghost: { background: "transparent", color: T.textMuted, border: `1px solid ${T.border}` },
    dark: { background: T.cardAlt, color: T.text },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }} {...rest}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</span></button>;
};

// â”€â”€â”€ Shared Input â”€â”€â”€
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    <input
      {...props}
      style={{
        width: "100%", background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm, padding: "12px 16px", color: T.text,
        fontSize: 14, outline: "none", transition: "border-color 0.2s",
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = T.accent; props.onFocus?.(e); }}
      onBlur={(e) => { e.target.style.borderColor = T.border; props.onBlur?.(e); }}
    />
  </div>
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCREEN 1 â€” LANDING PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function LandingStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(API + "/live/stats/global").then(r => r.json()).then(d => setStats(d.stats)).catch(() => {});
  }, []);
  if (!stats) return null;
  const items = [
    { value: stats.photographers_count, label: "Photographes" },
    { value: stats.events_count, label: "Evenements" },
    { value: stats.photos_count, label: "Photos" },
    { value: stats.visitors_count, label: "Invites satisfaits" },
  ];
  return (
    <div style={{ padding: "40px 24px", borderTop: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: T.accent }}>{Number(item.value).toLocaleString("fr-FR")}+</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
function LandingPage({ onNavigate, platform }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 32px", borderBottom: `1px solid ${T.border}`,
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
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => onNavigate("auth", { mode: "signup" })} style={{ padding: "14px 32px", fontSize: 15 }}>
              Commencer gratuitement {Icon.ArrowRight(16)}
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
function AuthScreen({ mode: initialMode, onNavigate, onAuth }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Nom du studio requis";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = "Email invalide";
    if (!form.password || form.password.length < 8) errs.password = "Minimum 8 caractères";
    if (mode === "signup" && form.password !== form.confirm) errs.confirm = "Les mots de passe ne correspondent pas";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { studio_name: form.name, email: form.email, phone: form.phone, password: form.password };

      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      if (data.pending) {
        setError("");
        alert(data.message);
        setMode("login");
        return;
      }
      localStorage.setItem("fotokash_token", data.token);
      onAuth(data.user || data.photographer, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const inputBase = {
    width: "100%", padding: "11px 14px", borderRadius: T.radiusSm,
    border: "1px solid " + T.border, background: T.bg, color: T.text,
    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: T.font,
    transition: "border-color 0.2s",
  };

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {show
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  const FieldError = ({ msg }) => msg ? (
    <div style={{ color: T.red, fontSize: 11, marginTop: 5, marginBottom: 4 }}>{msg}</div>
  ) : null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.accentDim} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400, animation: "fadeUp 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28, cursor: "pointer" }} onClick={() => onNavigate("landing")}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: T.accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#fff", marginBottom: 12,
          }}>{Icon.Camera(24)}</div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700 }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </div>
          <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>
            La plateforme des photographes événementiels
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
          padding: "32px 28px",
        }}>
          {/* Toggle tabs */}
          <div style={{
            display: "flex", background: T.bg, borderRadius: T.radiusSm,
            padding: 3, marginBottom: 28,
          }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setFieldErrors({}); }} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                background: mode === m ? T.cardAlt : "transparent",
                color: mode === m ? T.text : T.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", fontFamily: T.font,
              }}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Champs inscription */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
                  Nom du studio <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{ ...inputBase, borderColor: fieldErrors.name ? T.red : T.border }}
                  placeholder="Ex: Studio Lumière CI"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors(p => ({ ...p, name: "" })); }}
                  onKeyDown={handleKeyDown}
                />
                <FieldError msg={fieldErrors.name} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Téléphone</label>
                <input
                  style={inputBase}
                  placeholder="+225 07 XX XX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
              Email <span style={{ color: T.red }}>*</span>
            </label>
            <input
              type="email"
              style={{ ...inputBase, borderColor: fieldErrors.email ? T.red : T.border }}
              placeholder="vous@email.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }}
              onKeyDown={handleKeyDown}
            />
            <FieldError msg={fieldErrors.email} />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                Mot de passe <span style={{ color: T.red }}>*</span>
              </label>
              {mode === "login" && (
                <span style={{ fontSize: 11, color: T.accent, cursor: "pointer" }}
                  onClick={() => alert("Contactez-nous sur WhatsApp pour réinitialiser votre mot de passe.")}>
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{ ...inputBase, paddingRight: 42, borderColor: fieldErrors.password ? T.red : T.border }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors(p => ({ ...p, password: "" })); }}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, display: "flex" }}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <FieldError msg={fieldErrors.password} />
            {mode === "signup" && form.password.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => {
                  const strength = form.password.length >= 12 ? 4 : form.password.length >= 10 ? 3 : form.password.length >= 8 ? 2 : 1;
                  const colors = ["", T.red, "#F59E0B", "#3B82F6", T.green];
                  return <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? colors[strength] : T.border, transition: "background 0.3s" }} />;
                })}
                <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 6 }}>
                  {form.password.length < 8 ? "Trop court" : form.password.length < 10 ? "Correct" : form.password.length < 12 ? "Bien" : "Fort"}
                </span>
              </div>
            )}
          </div>

          {/* Confirmer mot de passe (signup only) */}
          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
                Confirmer le mot de passe <span style={{ color: T.red }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  style={{ ...inputBase, paddingRight: 42, borderColor: fieldErrors.confirm ? T.red : form.confirm && form.confirm === form.password ? T.green : T.border }}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setFieldErrors(p => ({ ...p, confirm: "" })); }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, display: "flex" }}
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              <FieldError msg={fieldErrors.confirm} />
              {form.confirm && form.confirm === form.password && (
                <div style={{ color: T.green, fontSize: 11, marginTop: 5, marginBottom: 4 }}>✓ Les mots de passe correspondent</div>
              )}
            </div>
          )}

          {/* Erreur globale */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", color: T.red, padding: "10px 14px",
              borderRadius: 8, fontSize: 13, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {Icon.AlertCircle(14)} {error}
            </div>
          )}

          {/* Bouton submit */}
          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "13px 0" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                {mode === "login" ? "Connexion..." : "Création..."}
              </span>
            ) : (
              mode === "login" ? "Se connecter" : "Créer mon compte"
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ token }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState({ text: "", color: T.textMuted });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!currentPwd || !newPwd || !confirmPwd) { setMsg({ text: "Remplissez tous les champs.", color: T.red }); return false; }
    if (newPwd.length < 8) { setMsg({ text: "Le nouveau mot de passe doit faire au moins 8 caractères.", color: T.red }); return false; }
    if (newPwd !== confirmPwd) { setMsg({ text: "Les mots de passe ne correspondent pas.", color: T.red }); return false; }
    return true;
  };

  const handleChange = async () => {
    if (!validate()) return;
    setLoading(true);
    setMsg({ text: "Modification en cours...", color: T.textMuted });
    try {
      const res = await fetch(API + "/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "✓ Mot de passe modifié avec succès !", color: T.green });
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } else {
        setMsg({ text: data.error || "Erreur", color: T.red });
      }
    } catch {
      setMsg({ text: "Erreur de connexion.", color: T.red });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleChange(); };
  const eyeBtn = (show, setShow) => (
    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>
  );

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>Mon compte</h2>
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "28px 24px", maxWidth: 450 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Changer le mot de passe</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Mot de passe actuel</label>
          <div style={{ position: "relative" }}>
            <input type={showCurrent ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Votre mot de passe actuel" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showCurrent, setShowCurrent)}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nouveau mot de passe</label>
          <div style={{ position: "relative" }}>
            <input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Minimum 8 caractères" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showNew, setShowNew)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Retapez le nouveau mot de passe" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showConfirm, setShowConfirm)}
          </div>
        </div>
        {msg.text && <p style={{ fontSize: 13, marginBottom: 16, color: msg.color, minHeight: 20 }}>{msg.text}</p>}
        <button onClick={handleChange} disabled={loading} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: T.font }}>
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user: initialUser, token, onNavigate, onLogout, initialTab }) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState(initialTab || "stats");
  const [inactiveMsg, setInactiveMsg] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Recharger le profil à chaque visite pour synchro admin
  useEffect(() => {
    fetch(API + "/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const u = d.user || d;
        setUser(u);
        if (u.status === 'inactive') {
          setInactiveMsg(true);
          setTimeout(() => onLogout(), 3500);
        }
      })
      .catch(() => {});
  }, [token]);

  // Fetch events au montage (nécessaire pour badge live + tabs photos/events/live)
  useEffect(() => {
    setLoadingEvents(true);
    fetch(API + "/events", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, [token]);

  const liveCount = events.filter((e) => e.is_live).length;

  const tabs = [
    { id: "stats",   label: "Stats",       icon: Icon.BarChart(16) },
    { id: "photos",  label: "Photos",      icon: Icon.Image(16) },
    { id: "events",  label: "Événements",  icon: Icon.Calendar(16) },
    { id: "live",    label: "Live",        icon: Icon.Phone(16), badge: liveCount },
    { id: "account", label: "Compte",      icon: Icon.Users(16) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Bannière compte désactivé */}
      {inactiveMsg && (
        <div style={{ background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(239,68,68,0.3)", padding: "12px 28px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: T.red, fontSize: 16 }}>⚠</span>
          <span style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>Votre compte a été désactivé. Déconnexion en cours...</span>
        </div>
      )}

      {/* Top bar */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 28px", borderBottom: `1px solid ${T.border}`,
        background: T.card,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.accent,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>{Icon.Camera(16)}</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700 }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {liveCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{liveCount} live actif{liveCount > 1 ? "s" : ""}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: T.textMuted }}>
              {user?.studio_name || user?.name || "Photographe"}
            </span>
            {user?.plan && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: user.plan === "pro" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)",
                color: user.plan === "pro" ? T.gold : T.textDim,
                textTransform: "uppercase", letterSpacing: 1,
              }}>{user.plan}</span>
            )}
          </div>
          <button onClick={onLogout} style={{
            background: "transparent", border: "none", color: T.textMuted,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
          }}>
            {Icon.LogOut(14)} Déconnexion
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 4, padding: "12px 28px",
        borderBottom: `1px solid ${T.border}`, background: T.card,
        overflowX: "auto",
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); onNavigate("dashboard", { tab: t.id }); }} style={{
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            padding: "10px 18px", borderRadius: T.radiusSm, border: "none",
            background: tab === t.id ? T.accentDim : "transparent",
            color: tab === t.id ? T.accent : T.textMuted,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: T.font, transition: "all 0.2s", position: "relative",
          }}>
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span style={{
                background: T.red, color: "#fff", fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: 2,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "stats"   && <StatsTab token={token} user={user} onNavigate={(t) => { setTab(t); onNavigate("dashboard", { tab: t }); }} />}
        {tab === "photos"  && <PhotosTab token={token} events={events} />}
        {tab === "live"    && <LiveTab token={token} events={events} onNavigate={onNavigate} setEvents={setEvents} />}
        {tab === "events"  && <EventsTab token={token} events={events} setEvents={setEvents} loading={loadingEvents} onNavigate={onNavigate} />}
        {tab === "account" && <AccountTab token={token} />}
      </div>
    </div>
  );
}


function StatsTab({ token, user, onNavigate }) {
  const [data, setData] = useState({ photos: 0, events: 0, sales: 0, clients: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(API + "/events", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
      fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
    ])
    .then(function([eventsData, meData]) {
      const evts = eventsData.events || eventsData || [];
      const totalPhotos = evts.reduce((sum, e) => sum + (parseInt(e.photos_count) || 0), 0);
      const u = meData.user || meData || {};
      const totalRevenue = parseFloat(u.total_revenue) || 0;
      const totalClients = parseInt(u.total_clients) || evts.reduce((sum, e) => sum + (parseInt(e.photos_sold) || 0), 0);
      setData({ photos: totalPhotos, events: evts.length, sales: totalRevenue, clients: totalClients });
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [token, refreshKey]);

  const firstName = (user?.studio_name || user?.name || "").split(" ")[0] || "vous";
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const stats = [
    { label: "Photos uploadées",  value: String(data.photos),   icon: Icon.Image(20),      color: T.accent },
    { label: "Événements",        value: String(data.events),   icon: Icon.Calendar(20),   color: T.gold },
    { label: "Revenus",           value: fcfa(data.sales),      icon: Icon.CreditCard(20), color: T.green },
    { label: "Clients servis",    value: String(data.clients),  icon: Icon.Users(20),      color: "#818CF8" },
  ];

  const quickActions = [
    { label: "Créer un événement", tab: "events" },
    { label: "Uploader des photos", tab: "photos" },
    { label: "Démarrer un live", tab: "live" },
  ];

  if (loading) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700 }}>Tableau de bord</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "24px 20px" }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 12, width: "60%", marginBottom: 14, animation: "pulse 1.5s infinite" }} />
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 28, width: "40%", animation: "pulse 1.5s infinite" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Greeting + refresh */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Bonjour, {firstName} 👋
          </h2>
          <p style={{ color: T.textMuted, fontSize: 13 }}>{dateFormatted} · {data.events} événement{data.events !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "7px 14px", color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 6 }}
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {quickActions.map((a) => (
          <button key={a.tab} onClick={() => onNavigate(a.tab)} style={{
            background: T.card, border: "1px solid " + T.border, borderRadius: T.radius,
            padding: "14px 10px", textAlign: "center", cursor: "pointer",
            fontFamily: T.font, fontSize: 12, fontWeight: 600, color: T.textMuted,
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
            padding: "24px 20px", animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {data.events === 0 && (
        <div style={{
          marginTop: 28, background: T.card, borderRadius: T.radius,
          border: `1px solid ${T.border}`, padding: "32px 24px", textAlign: "center",
        }}>
          <div style={{ color: T.textMuted, marginBottom: 8 }}>{Icon.Camera(32)}</div>
          <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 4 }}>Commencez par créer un événement</p>
          <p style={{ color: T.textDim, fontSize: 12 }}>Allez dans l'onglet "Événements" pour démarrer</p>
        </div>
      )}
    </div>
  );
}


function PhotosTab({ token, events }) {
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const MAX_FILES = 50;

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [oversizedWarning, setOversizedWarning] = useState([]);
  const [limitWarning, setLimitWarning] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null); // { count, eventName }
  const fileInputRef = useRef(null);

  // Pré-sélection auto si 1 seul event ou 1 seul live
  useEffect(() => {
    if (events.length === 1) {
      setSelectedEvent(String(events[0].id));
    } else {
      const liveEvents = events.filter((e) => e.is_live);
      if (liveEvents.length === 1) setSelectedEvent(String(liveEvents[0].id));
    }
  }, [events]);

  // Fix cleanup : dépendance sur files pour révoquer les URLs
  useEffect(() => {
    return () => { files.forEach((f) => URL.revokeObjectURL(f.preview)); };
  }, [files]);

  const [duplicateWarning, setDuplicateWarning] = useState([]);

  // ── Compression côté client (réduit taille avant envoi serveur) ──
  const compressImage = (file, maxWidth = 3000, quality = 0.85) => {
    return new Promise((resolve) => {
      // Si le fichier est petit (< 2Mo), pas besoin de compresser
      if (file.size < 2 * 1024 * 1024) {
        resolve(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Si l'image est déjà petite, garder telle quelle
        if (img.width <= maxWidth && img.height <= maxWidth && file.size < 5 * 1024 * 1024) {
          resolve(file);
          return;
        }
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxWidth) {
          if (w > h) { h = Math.round(h * maxWidth / w); w = maxWidth; }
          else { w = Math.round(w * maxWidth / h); h = maxWidth; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: file.lastModified,
              });
              console.log("Compressed: " + file.name + " " + (file.size / 1024 / 1024).toFixed(1) + "Mo -> " + (compressed.size / 1024 / 1024).toFixed(1) + "Mo");
              resolve(compressed);
            } else {
              resolve(file); // Original plus petit, garder tel quel
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // En cas d'erreur, envoyer l'original
      };
      img.src = url;
    });
  };

  const processFiles = useCallback((newFiles) => {
    const imgs = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const oversized = imgs.filter((f) => f.size > MAX_FILE_SIZE);
    const valid = imgs.filter((f) => f.size <= MAX_FILE_SIZE);

    // Avertissement fichiers trop lourds (UI, pas alert)
    if (oversized.length > 0) {
      setOversizedWarning(oversized.map((f) => f.name));
      setTimeout(() => setOversizedWarning([]), 6000);
    }

    // Limite 50 photos + doublons
    setFiles((prev) => {
      // Détection doublons : même nom + même taille + même lastModified
      const existingKeys = new Set(prev.map((x) => x.name + "_" + x.size + "_" + x.file.lastModified));
      const dupes = valid.filter((f) => existingKeys.has(f.name + "_" + f.size + "_" + f.lastModified));
      const unique = valid.filter((f) => !existingKeys.has(f.name + "_" + f.size + "_" + f.lastModified));

      if (dupes.length > 0) {
        setDuplicateWarning(dupes.map((f) => f.name));
        setTimeout(() => setDuplicateWarning([]), 5000);
      }

      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) { setLimitWarning(true); setTimeout(() => setLimitWarning(false), 4000); return prev; }
      const allowed = unique.slice(0, remaining);
      if (allowed.length < unique.length) { setLimitWarning(true); setTimeout(() => setLimitWarning(false), 4000); }
      const withPreviews = allowed.map((file) => ({
        id: crypto.randomUUID(), file, name: file.name, size: file.size,
        preview: URL.createObjectURL(file), status: "pending", progress: 0,
      }));
      return [...prev, ...withPreviews];
    });
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }, [processFiles]);
  const removeFile = (id) => {
    setFiles((prev) => { const f = prev.find((x) => x.id === id); if (f) URL.revokeObjectURL(f.preview); return prev.filter((x) => x.id !== id); });
  };

  const uploadBatch = async (pending) => {
    const eventId = selectedEvent;
    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    for (let i = 0; i < pending.length; i += 5) {
      const batch = pending.slice(i, i + 5);
      const formData = new FormData();
      formData.append("event_id", eventId);
      // Compression côté client avant envoi
      const compressedFiles = await Promise.all(batch.map((f) => compressImage(f.file)));
      compressedFiles.forEach((f) => formData.append("photos", f));

      batch.forEach((f) => {
        setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "uploading", progress: 30 } : x));
      });

      try {
        const res = await fetch(API + "/photos/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          batch.forEach((f) => {
            setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "done", progress: 100 } : x));
          });
          doneCount += batch.length;
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        batch.forEach((f) => {
          setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "error", progress: 0 } : x));
        });
      }
      setUploadProgress({ done: doneCount, total: pending.length });
    }
    return doneCount;
  };

  const handleUpload = async () => {
    if (!selectedEvent || files.length === 0) return;
    setUploading(true);
    setUploadSummary(null);
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    const doneCount = await uploadBatch(pending);
    setUploading(false);
    // Résumé final
    if (doneCount > 0) {
      const ev = events.find((e) => String(e.id) === String(selectedEvent));
      setUploadSummary({ count: doneCount, eventName: ev ? ev.name : "l'événement" });
    }
  };

  const retryFile = async (fileItem) => {
    if (!selectedEvent) return;
    setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "uploading", progress: 30 } : x));
    const formData = new FormData();
    formData.append("event_id", selectedEvent);
    const compressedRetry = await compressImage(fileItem.file);
    formData.append("photos", compressedRetry);
    try {
      const res = await fetch(API + "/photos/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.ok) {
        setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "done", progress: 100 } : x));
      } else { throw new Error(); }
    } catch {
      setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "error", progress: 0 } : x));
    }
  };

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const doneCount = files.filter((f) => f.status === "done").length;
  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;
  const uploadPct = uploadProgress.total > 0 ? Math.round((uploadProgress.done / uploadProgress.total) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            {Icon.Upload(22)} Uploader des photos
          </h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Ajoutez vos photos à un événement pour les vendre</p>
        </div>
        {files.length > 0 && (
          <div style={{ fontSize: 12, color: T.textMuted }}>
            <strong style={{ color: T.text }}>{files.length}</strong> / {MAX_FILES} · {formatSize(totalSize)}
            {doneCount > 0 && <span style={{ color: T.green }}> · {doneCount} envoyée{doneCount > 1 ? "s" : ""}</span>}
          </div>
        )}
      </div>

      {/* Avertissement doublons */}
      {duplicateWarning.length > 0 && (
        <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "#a78bfa", fontSize: 14, flexShrink: 0 }}>⊘</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 2 }}>{duplicateWarning.length} doublon{duplicateWarning.length > 1 ? "s" : ""} ignoré{duplicateWarning.length > 1 ? "s" : ""}</p>
            <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{duplicateWarning.slice(0, 3).join(", ")}{duplicateWarning.length > 3 ? ` +${duplicateWarning.length - 3} autres` : ""}</p>
          </div>
          <button onClick={() => setDuplicateWarning([])} style={{ marginLeft: "auto", background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Avertissement fichiers trop lourds */}
      {oversizedWarning.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: T.gold, fontSize: 14, flexShrink: 0 }}>⚠</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.gold, marginBottom: 2 }}>{oversizedWarning.length} fichier{oversizedWarning.length > 1 ? "s" : ""} ignoré{oversizedWarning.length > 1 ? "s" : ""} (max 25 Mo)</p>
            <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{oversizedWarning.slice(0, 3).join(", ")}{oversizedWarning.length > 3 ? ` +${oversizedWarning.length - 3} autres` : ""}</p>
          </div>
          <button onClick={() => setOversizedWarning([])} style={{ marginLeft: "auto", background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Avertissement limite 50 */}
      {limitWarning && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: T.red }}>⚠ Maximum {MAX_FILES} photos par envoi atteint. Supprimez des photos ou envoyez d'abord la sélection actuelle.</p>
        </div>
      )}

      {/* Event selector */}
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px 22px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {Icon.Calendar(16)} Événement
        </div>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} style={{
          width: "100%", background: T.bg, border: "1px solid " + (selectedEvent ? T.accent : T.border),
          borderRadius: T.radiusSm, padding: "12px 16px", color: selectedEvent ? T.text : T.textMuted,
          fontSize: 14, outline: "none", cursor: "pointer", colorScheme: "dark",
        }}>
          <option value="">-- Sélectionner un événement --</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}{e.is_live ? " 🔴" : ""}</option>)}
        </select>
        {events.length === 0 && (
          <p style={{ fontSize: 12, color: T.gold, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {Icon.AlertCircle(14)} Créez d'abord un événement dans l'onglet "Événements"
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: dragOver ? T.accentDim : T.card,
          borderRadius: T.radius, border: "2px dashed " + (dragOver ? T.accent : "rgba(255,255,255,0.1)"),
          padding: "44px 24px", textAlign: "center", cursor: "pointer",
          transition: "all 0.3s", marginBottom: 18,
        }}
      >
        <div style={{ color: dragOver ? T.accent : T.textMuted, marginBottom: 14 }}>{Icon.Upload(32)}</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: dragOver ? T.text : T.textMuted, marginBottom: 4 }}>
          {dragOver ? "Déposez vos photos ici" : "Glissez-déposez vos photos"}
        </p>
        <p style={{ fontSize: 12, color: T.textMuted }}>
          ou <span style={{ color: T.accent, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>parcourir</span> · JPG, PNG, WebP · Max 25 Mo/photo · {MAX_FILES} max
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => { processFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      </div>

      {/* Photo grid */}
      {files.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Aperçu ({files.length})</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setFiles((p) => p.filter((f) => f.status !== "done"))} style={{ padding: "5px 12px", fontSize: 11 }}>Retirer envoyées</Btn>
              <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setUploadSummary(null); }} style={{
                background: "rgba(239,68,68,0.1)", color: T.red, border: "none", borderRadius: 8,
                padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>Tout supprimer</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {files.map((f) => {
              const ext = f.name.split(".").pop().toUpperCase().slice(0, 4);
              return (
                <div key={f.id} style={{
                  position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                  background: T.cardAlt, aspectRatio: "1",
                  border: "1px solid " + (f.status === "error" ? "rgba(239,68,68,0.4)" : f.status === "done" ? "rgba(74,222,128,0.3)" : T.border),
                }}>
                  <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {/* Watermark */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)", pointerEvents: "none" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 2, transform: "rotate(-25deg)", textTransform: "uppercase" }}>FOTOKASH</span>
                  </div>
                  {/* Format badge */}
                  <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 5px", fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>{ext}</div>
                  {/* Uploading spinner */}
                  {f.status === "uploading" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: T.accent, animation: "spin 0.7s linear infinite" }} />
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Envoi...</span>
                    </div>
                  )}
                  {/* Done check */}
                  {f.status === "done" && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: T.green, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                      {Icon.Check(12)}
                    </div>
                  )}
                  {/* Error + retry */}
                  {f.status === "error" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "3px 7px", color: T.red, fontSize: 10, fontWeight: 600 }}>Erreur</span>
                      <button onClick={() => retryFile(f)} style={{ background: T.accent, border: "none", borderRadius: 5, padding: "4px 10px", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Réessayer</button>
                    </div>
                  )}
                  {/* Remove btn */}
                  {f.status !== "uploading" && (
                    <button onClick={() => removeFile(f.id)} style={{
                      position: "absolute", top: f.status === "error" ? 4 : 4, right: 4, background: "rgba(0,0,0,0.6)",
                      border: "none", borderRadius: "50%", width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", opacity: 0.7,
                    }}>{Icon.X(10)}</button>
                  )}
                  {/* File info */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "16px 6px 6px" }}>
                    <p style={{ fontSize: 9, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{formatSize(f.size)}</p>
                  </div>
                </div>
              );
            })}
            {/* Add more tile */}
            <div onClick={() => fileInputRef.current?.click()} style={{
              borderRadius: T.radiusSm, border: "2px dashed rgba(255,255,255,0.1)",
              aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, cursor: "pointer", color: T.textMuted, fontSize: 11,
            }}>
              {Icon.Plus(18)}
              <span>Ajouter</span>
            </div>
          </div>

          {/* Résumé upload réussi */}
          {uploadSummary && !uploading && (
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: T.green, fontSize: 18 }}>✓</span>
              <p style={{ fontSize: 13, color: T.green }}>
                <strong>{uploadSummary.count}</strong> photo{uploadSummary.count > 1 ? "s" : ""} ajoutée{uploadSummary.count > 1 ? "s" : ""} à <strong>{uploadSummary.eventName}</strong>
              </p>
            </div>
          )}

          {/* Upload bar */}
          <div style={{
            background: T.card, borderRadius: T.radius, border: "1px solid " + T.border,
            padding: "18px 22px",
          }}>
            {/* Barre de progression globale */}
            {uploading && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
                  <span>Envoi en cours...</span>
                  <span style={{ color: T.accent, fontWeight: 600 }}>{uploadProgress.done} / {uploadProgress.total}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: uploadPct + "%", background: T.accent, borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                {!selectedEvent && <p style={{ fontSize: 12, color: T.accent, display: "flex", alignItems: "center", gap: 6 }}>{Icon.AlertCircle(14)} Sélectionnez un événement</p>}
                {selectedEvent && pendingCount > 0 && <p style={{ fontSize: 13, color: T.textMuted }}><strong style={{ color: T.text }}>{pendingCount}</strong> prête{pendingCount > 1 ? "s" : ""} · {formatSize(files.filter((f) => f.status === "pending").reduce((a, f) => a + f.size, 0))}</p>}
                {selectedEvent && pendingCount === 0 && doneCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 6 }}>{Icon.Check(14)} Toutes envoyées !</p>
                    <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setSelectedEvent(""); setUploadSummary(null); }} style={{ background: T.accentDim, border: "none", borderRadius: 8, padding: "5px 14px", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Terminer & vider</button>
                  </div>
                )}
              </div>
              <Btn onClick={handleUpload} disabled={!selectedEvent || pendingCount === 0 || uploading}>
                {uploading ? <span>Envoi en cours...</span> : <span>{Icon.Upload(16)} Envoyer ({pendingCount})</span>}
              </Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function EventPhotosViewer({ eventId, eventName, token, onClose }) {
  var photosState = useState([]);
  var loadingState = useState(true);
  var photos = photosState[0];
  var setPhotos = photosState[1];
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  useEffect(function() {
    fetch(API + "/photos/event/" + eventId + "/public")
      .then(function(r) { return r.json(); })
      .then(function(d) { setPhotos(d.photos || []); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, [eventId]);

  var deletePhoto = function(photoId) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    fetch(API + "/photos/" + photoId, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    }).then(function(r) {
      if (r.ok) setPhotos(function(prev) { return prev.filter(function(p) { return p.id !== photoId; }); });
    });
  };

  return (
    <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: 24, marginBottom: 20, animation: "slideDown 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{eventName}</h3>
          <p style={{ fontSize: 12, color: T.textMuted }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "8px 16px", color: T.textMuted, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>Fermer</button>
      </div>
      {loading ? (
        <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Chargement...</p>
      ) : photos.length === 0 ? (
        <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucune photo</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {photos.map(function(p) {
            return (
              <div key={p.id} style={{ position: "relative", borderRadius: T.radiusSm, overflow: "hidden", aspectRatio: "1", border: "1px solid " + T.border }}>
                <img src={p.thumbnail_url || p.watermarked_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <button onClick={function() { deletePhoto(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(239,68,68,0.85)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", fontSize: 12 }}>X</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Live Tab (dashboard photographe) ---
function LiveTab({ token, events, onNavigate, setEvents }) {
  const [liveEvent, setLiveEvent] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [uploadingLive, setUploadingLive] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const liveUploadRef = useRef(null);
  const pollRef = useRef(null);

  // FIX: setLoading(false) meme si aucun evenement
  useEffect(() => {
    const live = events.find(e => e.is_live);
    setLiveEvent(live || null);
    setLoading(false);
  }, [events]);

  useEffect(() => {
    if (!liveEvent) return;
    const fetchDash = () => {
      fetch(API + "/live/" + liveEvent.id + "/dashboard", { headers: { Authorization: "Bearer " + token } })
        .then(r => r.json())
        .then(d => { setDashData(d); setLastUpdated(new Date()); })
        .catch(() => {});
    };
    fetchDash();
    pollRef.current = setInterval(fetchDash, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [liveEvent, token]);

  // FIX: reset liveEvent apres arret
  const stopLive = () => {
    if (!liveEvent) return;
    fetch(API + "/live/" + liveEvent.id + "/stop", { method: "POST", headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(d => {
        if (d.event) {
          setEvents(prev => prev.map(x => x.id === liveEvent.id ? { ...x, is_live: false } : x));
          setLiveEvent(null);
          setDashData(null);
        }
      });
    setShowStopConfirm(false);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "Il y a " + diff + "s";
    if (diff < 3600) return "Il y a " + Math.floor(diff / 60) + " min";
    return "Il y a " + Math.floor(diff / 3600) + "h";
  };

  const lastUpdatedStr = () => {
    if (!lastUpdated) return "...";
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (diff < 5) return "a l instant";
    return "il y a " + diff + "s";
  };

  const handleLiveUpload = async (e) => {
    const picked = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/") && f.size <= 25 * 1024 * 1024);
    if (!picked.length || !liveEvent) return;
    setUploadingLive(true);
    setUploadDone(0);
    let done = 0;
    for (let i = 0; i < picked.length; i += 5) {
      const batch = picked.slice(i, i + 5);
      const fd = new FormData();
      fd.append("event_id", liveEvent.id);
      batch.forEach(f => fd.append("photos", f));
      try {
        const res = await fetch(API + "/photos/upload", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
        if (res.ok) done += batch.length;
      } catch {}
      setUploadDone(done);
    }
    setUploadingLive(false);
    e.target.value = "";
    fetch(API + "/live/" + liveEvent.id + "/dashboard", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => { setDashData(d); setLastUpdated(new Date()); }).catch(() => {});
  };

  if (loading) return <p style={{ color: T.textMuted, textAlign: "center", padding: 40 }}>Chargement...</p>;

  if (!liveEvent) return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Phone(32)}</div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Aucun evenement en direct</h2>
      <p style={{ color: T.textMuted, fontSize: 14 }}>Activez le mode live sur un evenement depuis l onglet Evenements</p>
    </div>
  );

  const stats = dashData?.stats || { photos_count: 0, visitors_count: 0, matches_count: 0, purchases_count: 0, revenue: 0 };
  const visitors = dashData?.visitors || [];
  const liveUrl = "https://fotokash.com/live/" + liveEvent.slug;
  const qrUrlSmall = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(liveUrl);
  const qrUrlLarge = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" + encodeURIComponent(liveUrl);

  return (
    <div>
      {showStopConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: "28px 28px 24px", maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ color: T.red, marginBottom: 12 }}>{Icon.AlertCircle(32)}</div>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Arreter le live ?</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Les invites ne pourront plus acceder a la page de l evenement. Cette action est irreversible.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="ghost" onClick={() => setShowStopConfirm(false)} style={{ padding: "10px 20px" }}>Annuler</Btn>
              <button onClick={stopLive} style={{ background: "rgba(239,68,68,0.9)", color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Oui, arreter</button>
            </div>
          </div>
        </div>
      )}

      {showQrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowQrModal(false)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, display: "inline-block" }} onClick={e => e.stopPropagation()}>
            <img src={qrUrlLarge} alt="QR Code" style={{ width: 280, height: 280, display: "block" }} />
          </div>
          <p style={{ color: T.accent, fontWeight: 700, fontSize: 16, marginTop: 16, textAlign: "center" }}>{liveUrl}</p>
          <p style={{ color: T.textMuted, fontSize: 12, marginTop: 8 }}>Tapez n importe ou pour fermer</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            {liveEvent.name}
            <span style={{ background: T.accent, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.font }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite", display: "inline-block" }}></span> En direct
            </span>
          </h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Dashboard temps reel</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accentDim, border: "1px solid rgba(232,89,60,0.3)", borderRadius: T.radiusSm, padding: "8px 14px", color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>
            <input ref={liveUploadRef} type="file" accept="image/*" multiple onChange={handleLiveUpload} style={{ display: "none" }} />
            {uploadingLive ? (uploadDone + " envoyee" + (uploadDone > 1 ? "s" : "") + "...") : "Ajouter des photos"}
          </label>
          <Btn variant="ghost" onClick={() => setShowStopConfirm(true)} style={{ color: T.red, borderColor: "rgba(239,68,68,0.3)" }}>Arreter le live</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Photos", value: stats.photos_count, sub: null, icon: Icon.Image(18), color: T.accent },
          { label: "Visiteurs", value: stats.visitors_count, sub: null, icon: Icon.Users(18), color: T.gold },
          { label: "Matches", value: stats.matches_count, sub: null, icon: Icon.Search(18), color: T.green },
          { label: "Achats", value: stats.purchases_count, sub: stats.revenue > 0 ? fcfa(stats.revenue) : null, icon: Icon.CreditCard(18), color: "#818CF8" },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 11, color: T.green, fontWeight: 600, marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 10, flexShrink: 0, cursor: "pointer" }} onClick={() => setShowQrModal(true)}>
          <img src={qrUrlSmall} alt="QR Code" style={{ width: 100, height: 100, display: "block" }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>Les invites scannent ce QR code pour retrouver leurs photos</p>
          <p style={{ fontSize: 14, color: T.accent, fontWeight: 600, marginBottom: 10, wordBreak: "break-all" }}>{liveUrl}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="dark" onClick={() => { navigator.clipboard.writeText(liveUrl); alert("Lien copie !"); }} style={{ padding: "6px 14px", fontSize: 12 }}>Copier le lien</Btn>
            <Btn variant="dark" onClick={() => onNavigate("live", { slug: liveEvent.slug })} style={{ padding: "6px 14px", fontSize: 12 }}>Voir la page</Btn>
            <Btn variant="dark" onClick={() => setShowQrModal(true)} style={{ padding: "6px 14px", fontSize: 12 }}>QR plein ecran</Btn>
            <Btn variant="dark" onClick={() => { const link = document.createElement("a"); link.href = qrUrlSmall; link.download = "FotoKash-QR-" + liveEvent.slug + ".png"; link.click(); }} style={{ padding: "6px 14px", fontSize: 12 }}>Telecharger QR</Btn>
            <a href={"https://wa.me/?text=" + encodeURIComponent("Retrouvez vos photos de l evenement " + liveEvent.name + " ici : " + liveUrl)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,209,102,0.15)", border: "none", borderRadius: T.radiusSm, padding: "6px 14px", color: "#25D166", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer", fontFamily: T.font }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L0 24l6.335-1.508C8.07 23.453 10.003 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.677-.502-5.218-1.378l-.374-.221-3.762.895.952-3.685-.243-.388A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Partager WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Visiteurs en temps reel</h3>
          <span style={{ fontSize: 11, color: T.textDim }}>Mis a jour {lastUpdatedStr()}</span>
        </div>
        {visitors.length === 0 ? (
          <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Aucun visiteur pour le moment</p>
        ) : (
          <div>
            {visitors.map((v, i) => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < visitors.length - 1 ? "1px solid " + T.border : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 13, fontWeight: 600 }}>
                  {"#" + v.visitor_number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{"Visiteur #" + v.visitor_number}</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>{timeAgo(v.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ background: "rgba(74,222,128,0.12)", color: T.green, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                    {v.matched_count + " trouvee" + (v.matched_count !== 1 ? "s" : "")}
                  </div>
                  {v.purchased_count > 0 && (
                    <div style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                      {v.purchased_count + " achetee" + (v.purchased_count !== 1 ? "s" : "")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventsTab({ token, events, setEvents, loading, onNavigate }) {
  const today = new Date().toISOString().split('T')[0];
  const [showForm, setShowForm] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [form, setForm] = useState({ name: "", date: today, location: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const createEvent = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => [data.event || data, ...prev]);
        setForm({ name: "", date: today, location: "", description: "" });
        setShowForm(false);
      }
    } catch {}
    setCreating(false);
  };

  const toggleLive = (e) => {
    const action = e.is_live ? "stop" : "start";
    fetch(API + "/live/" + e.id + "/" + action, { method: "POST", headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.event) setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, is_live: d.event.is_live } : x));
      });
  };

  const copyLink = (e) => {
    navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(() => {
      setCopiedId(e.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
    setMenuOpen(null);
  };

  const startRename = (e) => {
    setRenamingId(e.id);
    setRenameValue(e.name);
    setMenuOpen(null);
  };

  const submitRename = (e) => {
    const newName = renameValue.trim();
    if (!newName || newName === e.name) { setRenamingId(null); return; }
    fetch(API + "/events/" + e.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ name: newName }),
    }).then((r) => r.json()).then((d) => {
      if (d.event) setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, name: d.event.name } : x));
    });
    setRenamingId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    fetch(API + "/events/" + deleteTarget.id, { method: "DELETE", headers: { Authorization: "Bearer " + token } })
      .then((r) => { if (r.ok) setEvents((prev) => prev.filter((x) => x.id !== deleteTarget.id)); });
    setDeleteTarget(null);
  };

  const fmtRevenue = (v) => {
    if (!v) return "0 F";
    return new Intl.NumberFormat("fr-FR").format(v) + " F";
  };

  return (
    <div onClick={() => setMenuOpen(null)}>
      {/* Modal suppression */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setDeleteTarget(null)}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: T.card, borderRadius: T.radius, padding: "28px 24px", maxWidth: 340, width: "100%", border: "1px solid " + T.border }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Supprimer l'événement ?</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              <strong style={{ color: T.text }}>{deleteTarget.name}</strong> et toutes ses photos seront supprimés définitivement.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Annuler</Btn>
              <button onClick={confirmDelete} style={{ flex: 1, background: T.red, color: "#fff", border: "none", padding: "10px 0", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700 }}>Mes événements</h2>
        <Btn onClick={() => setShowForm(!showForm)}>{Icon.Plus(16)} Nouvel événement</Btn>
      </div>

      {showForm && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px", marginBottom: 20, animation: "slideDown 0.3s ease" }}>
          <Input label="Nom de l'événement" placeholder="Ex: Mariage Kouamé" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ colorScheme: "dark" }} />
            <Input label="Lieu" placeholder="Abidjan, Cocody" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Input label="Description (optionnel)" placeholder="Quelques détails..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn onClick={createEvent} disabled={!form.name.trim() || creating}>{creating ? "Création..." : "Créer"}</Btn>
          </div>
        </div>
      )}

      {viewingEvent && (
        <EventPhotosViewer eventId={viewingEvent.id} eventName={viewingEvent.name} token={token} onClose={() => setViewingEvent(null)} />
      )}

      {loading && <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 40 }}>Chargement...</p>}

      {!loading && events.length === 0 && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Calendar(32)}</div>
          <p style={{ color: T.textMuted, fontSize: 14 }}>Aucun événement pour le moment</p>
          <p style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>Créez votre premier événement pour commencer</p>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + (e.is_live ? "rgba(74,222,128,0.35)" : T.border), padding: "18px 20px", transition: "border-color 0.2s" }} onClick={(ev) => ev.stopPropagation()}>

              {/* Header : nom + badge live + menu ⋯ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {renamingId === e.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(ev) => setRenameValue(ev.target.value)}
                        onKeyDown={(ev) => { if (ev.key === "Enter") submitRename(e); if (ev.key === "Escape") setRenamingId(null); }}
                        style={{ flex: 1, background: T.cardAlt, border: "1px solid " + T.accent, borderRadius: T.radiusSm, padding: "5px 10px", color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font, outline: "none" }}
                      />
                      <button onClick={() => submitRename(e)} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>OK</button>
                      <button onClick={() => setRenamingId(null)} style={{ background: T.cardAlt, color: T.textMuted, border: "none", borderRadius: T.radiusSm, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: T.font }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{e.name}</span>
                      {e.is_live && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(74,222,128,0.15)", color: T.green }}>● EN DIRECT</span>}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {e.date && <span>{new Date(e.date).toLocaleDateString("fr-FR")}</span>}
                    {e.location && <span>{e.location}</span>}
                  </div>
                </div>

                {/* Menu ⋯ */}
                <div style={{ position: "relative", flexShrink: 0, marginLeft: 10 }} onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === e.id ? null : e.id)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid " + T.border, borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: T.textMuted, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>⋯</button>
                  {menuOpen === e.id && (
                    <div style={{ position: "absolute", right: 0, top: 38, background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, zIndex: 200, minWidth: 170, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                      {[
                        { label: copiedId === e.id ? "✓ Lien copié !" : "📋 Copier le lien", action: () => copyLink(e) },
                        { label: "↗ Voir la page", action: () => { window.open("https://fotokash.com/e/" + e.slug, "_blank"); setMenuOpen(null); } },
                        { label: "✏️ Renommer", action: () => startRename(e) },
                        { label: "🗑 Supprimer", action: () => { setDeleteTarget(e); setMenuOpen(null); }, red: true },
                      ].map((item, i) => (
                        <button key={i} onClick={item.action} style={{ display: "block", width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, cursor: "pointer", color: item.red ? T.red : T.text, fontFamily: T.font, borderTop: i > 0 ? "1px solid " + T.border : "none" }}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats : photos / vendues / revenus */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { n: e.photos_count || 0, l: "photos" },
                  { n: e.photos_sold || 0, l: "vendues" },
                  { n: fmtRevenue(e.total_revenue), l: "revenus" },
                ].map((s, i) => (
                  <div key={i} style={{ background: T.cardAlt, borderRadius: T.radiusSm, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Boutons d'action principaux */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setViewingEvent(e)} style={{ background: T.accentDim, border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>Voir photos</button>
                <button onClick={() => toggleLive(e)} style={{ background: e.is_live ? "rgba(74,222,128,0.12)" : "rgba(232,89,60,0.1)", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: e.is_live ? T.green : T.accent, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>
                  {e.is_live ? "⏹ Stop Live" : "▶ Activer Live"}
                </button>
                {e.is_live && (
                  <button onClick={() => onNavigate("live", { slug: e.slug })} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: T.textMuted, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>Voir live ↗</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deletedInfo, setDeletedInfo] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showSelfie, setShowSelfie] = useState(false);
const [selfieLoading, setSelfieLoading] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState(null);
  const [matchedIds, setMatchedIds] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startSelfie = async () => {
    setShowSelfie(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Impossible d'accéder à la caméra.");
      setShowSelfie(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(function(t) { t.stop(); });
    }
    setShowSelfie(false);
  };

  const takeSelfieAndSearch = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setSelfieLoading(true);
    var canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async function(blob) {
      try {
        var formData = new FormData();
        formData.append("selfie", blob, "selfie.jpg");
        console.log("Selfie search - event:", event, "event_id:", event ? event.id : "NONE");
	formData.append("event_id", event.id);
        var res = await fetch(API + "/photos/face-search", { method: "POST", body: formData });
        var data = await res.json();
        if (res.ok && data.matched_photos && data.matched_photos.length > 0) {
          setMatchedIds(data.matched_photos.map(function(p) { return p.id; }));
          setMatchedPhotos(data.count);
        } else {
          alert(data.error || "Aucune photo trouvée avec votre visage. Essayez avec un meilleur éclairage.");
        }
      } catch (err) {
        alert("Erreur lors de la recherche.");
      } finally {
        setSelfieLoading(false);
        stopCamera();
      }
    }, "image/jpeg", 0.85);
  };

useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(API + `/events/${slug || "demo"}/public`)
      .then((r) => {
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
  }, [slug]);

  const togglePhoto = (id) => {
    if (matchedIds === null || !matchedIds.includes(id)) return;
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

const [paymentLoading, setPaymentLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [photographerPlan, setPhotographerPlan] = useState('free');
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState("orange");
  const [pricing, setPricing] = useState({ price1: 200, price6: 500, price10: 1000 });

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      alert("Entrez un numéro de téléphone valide.");
      return;
    }
    setPaymentLoading(true);
    try {
      var res = await fetch(API + "/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          photo_ids: selectedPhotos,
          amount: getPrice(),
          phone: phoneNumber,
          provider: paymentProvider,
        }),
      });
      var data = await res.json();
      if (res.ok) {
        alert("Paiement initié ! Validez sur votre téléphone. Référence : " + (data.transaction_id || data.reference || "OK"));
        setShowPaymentModal(false);
        setSelectedPhotos([]);
      } else {
        alert(data.error || "Erreur lors du paiement.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    } finally {
      setPaymentLoading(false);
    }
  };
const handleFreeDownload = async () => {
    // Detecter iOS (Safari ne supporte pas a.download)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    try {
      const regRes = await fetch(API + "/photos/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_ids: selectedPhotos }),
      });
      const regData = await regRes.json();
      if (regRes.ok && regData.photos) {
        if (isIOS) {
          // iOS : ouvrir chaque photo dans un nouvel onglet
          // L'utilisateur fait appui long > "Ajouter aux photos"
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            window.open(p.original_url, "_blank");
            // Petit delai entre chaque ouverture pour eviter le blocage popup
            if (i < regData.photos.length - 1) {
              await new Promise(function(r) { setTimeout(r, 600); });
            }
          }
          alert("Photos ouvertes ! Appuyez longuement sur chaque image puis \"Ajouter aux photos\" pour les enregistrer dans votre galerie.");
        } else {
          // Desktop/Android : download classique via blob
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            try {
              var response = await fetch(p.original_url);
              var blob = await response.blob();
              var url = window.URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "fotokash-" + p.id + ".jpg";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Erreur telechargement:", err);
            }
          }
          alert("Telechargement termine !");
        }
      } else {
        alert(regData.error || "Erreur lors du telechargement.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur de connexion.");
    }
    setSelectedPhotos([]);
  };

  const getPrice = () => {
    const n = selectedPhotos.length;
    if (n === 0) return 0;
    if (n <= 1) return pricing.price1;
    if (n <= 6) return pricing.price6;
    return pricing.price10;
  };


  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );


  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

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
              ? "La galerie « " + deletedInfo.event_name + " » n'est plus disponible."
              : "Cette galerie n'est plus disponible. Elle a peut-être été supprimée par le photographe."}
          </p>
          {deletedInfo && deletedInfo.photographer_name && (
            <div style={{
              padding: "16px", background: T.cardAlt,
              borderRadius: T.radiusSm, border: "1px solid " + T.border,
              marginBottom: 24, textAlign: "left",
            }}>
              <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 8 }}>Photographe de l'événement</p>
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
              Pour retrouver vos photos, contactez directement le photographe de l'événement.
            </p>
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onNavigate("landing")} style={{
              background: T.accentDim, color: T.accent, border: "none",
              borderRadius: T.radiusSm, padding: "10px 24px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Header */}
      <header style={{
        padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: T.accent,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>{Icon.Camera(14)}</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, cursor: "pointer" }} onClick={() => onNavigate("landing")}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </span>
        </div>
        <Btn variant="ghost" onClick={startSelfie} style={{ padding: "8px 14px", fontSize: 12 }}>
          {Icon.Search(14)} Me retrouver par selfie
        </Btn>
      </header>
{showSelfie && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", maxWidth: 400, borderRadius: T.radius, marginBottom: 16 }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {matchedPhotos !== null && <p style={{ color: T.green, marginBottom: 12 }}>{matchedPhotos} photo(s) trouvée(s) !</p>}
          <div style={{ display: "flex", gap: 12 }}>
            <Btn onClick={takeSelfieAndSearch} disabled={selfieLoading} style={{ padding: "12px 28px" }}>
              {selfieLoading ? "Recherche..." : "Prendre le selfie"}
            </Btn>
            <Btn variant="ghost" onClick={stopCamera} style={{ padding: "12px 20px" }}>Annuler</Btn>
          </div>
          <p style={{ color: T.textDim, fontSize: 11, marginTop: 10 }}>Ton selfie est utilise uniquement pour retrouver tes photos et est supprime immediatement.</p>
        </div>
      )}
{showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Paiement Mobile Money</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>{selectedPhotos.length} photo(s) - {fcfa(getPrice())}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{id: "orange", label: "Orange Money"}, {id: "mtn", label: "MTN MoMo"}, {id: "wave", label: "Wave"}].map(function(p) {
                return (
                  <button key={p.id} onClick={function() { setPaymentProvider(p.id); }} style={{
                    flex: 1, padding: "10px 8px", borderRadius: T.radiusSm, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: paymentProvider === p.id ? T.accentDim : T.cardAlt,
                    border: paymentProvider === p.id ? "1px solid " + T.accent : "1px solid " + T.border,
                    color: paymentProvider === p.id ? T.accent : T.textMuted,
                  }}>{p.label}</button>
                );
              })}
            </div>
            <input type="tel" placeholder="Numéro de téléphone (ex: 0700000000)" value={phoneNumber} onChange={function(e) { setPhoneNumber(e.target.value); }} style={{
              width: "100%", padding: "12px 16px", borderRadius: T.radiusSm, border: "1px solid " + T.border,
              background: T.bg, color: T.text, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box",
            }} />
            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={submitPayment} disabled={paymentLoading} style={{ flex: 1, justifyContent: "center", padding: "12px 0" }}>
                {paymentLoading ? "Envoi..." : "Confirmer le paiement"}
              </Btn>
              <Btn variant="ghost" onClick={function() { setShowPaymentModal(false); }} style={{ padding: "12px 16px" }}>Annuler</Btn>
            </div>
          </div>
        </div>
      )}
{qrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setQrModal(null)}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: 28, maxWidth: 320, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>QR Code Photo</h3>
            <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 16 }}>Scannez ce code depuis un autre téléphone</p>
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, display: "inline-block", marginBottom: 16 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://fotokash.com/p/" + qrModal.qr_code_id)}`}
                alt="QR Code" style={{ width: 200, height: 200, display: "block" }} />
            </div>
            <p style={{ fontFamily: "monospace", fontSize: 14, color: T.accent, fontWeight: 700, marginBottom: 4 }}>{qrModal.qr_code_id}</p>
            <p style={{ color: T.textDim, fontSize: 11, marginBottom: 16 }}>fotokash.com/p/{qrModal.qr_code_id}</p>
            <button onClick={() => setQrModal(null)} style={{
              background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8,
              padding: "9px 24px", color: T.textMuted, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: T.font,
            }}>Fermer</button>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.textMuted }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            Chargement...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
                {event?.name || "Événement"}
              </h1>
              <p style={{ color: T.textMuted, fontSize: 13 }}>
                {event?.date && new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {event?.location && ` · ${event.location}`}
              </p>
              {event?.photographer_name && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, background: T.card, borderRadius: T.radiusSm, padding: "10px 14px", border: "1px solid " + T.border }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: T.accentDim, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{event.photographer_name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{event.photographer_name}</div>
                    {event.photographer_phone && (<>
                      <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        {Icon.Phone(12)} Contacter sur WhatsApp
                      </a>
                      <p style={{ color: T.textDim, fontSize: 11, marginTop: 8 }}>Si vous souhaitez que votre image soit retiree de cette galerie, contactez rapidement le photographe via WhatsApp.</p>
                    </>)}
                  </div>
                </div>
              )}
            </div>

            {photos.length === 0 ? (
              <div style={{
                background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
                padding: "48px 24px", textAlign: "center",
              }}>
                <div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Image(32)}</div>
                <p style={{ color: T.textMuted }}>Les photos seront bientôt disponibles</p>
              </div>
            ) : (
              <>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: T.textMuted }}>{photos.length} photo{photos.length > 1 ? "s" : ""} disponible{photos.length > 1 ? "s" : ""}</span>
                  <button onClick={() => {
                    if (matchedIds === null) return;
                    if (matchedIds !== null && selectedPhotos.length === matchedIds.length) {
                      setSelectedPhotos([]);
                    } else {
                      setSelectedPhotos([...matchedIds]);
                    }
                  }} style={{
                    background: selectedPhotos.length === photos.length ? T.accentDim : "rgba(255,255,255,0.06)",
                    border: selectedPhotos.length === photos.length ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
                    borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                    color: selectedPhotos.length === photos.length ? T.accent : T.textMuted,
                    cursor: matchedIds === null ? "default" : "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {matchedIds === null ? <><span style={{color:"#FFB826"}}>⚠</span> Prenez un selfie d'abord</> : selectedPhotos.length === matchedIds.length ? "✓ Tout désélectionner" : "☐ Sélectionner tout (" + matchedIds.length + ")"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
                  {[...photos].sort((a, b) => { if (matchedIds === null) return 0; const aMatch = matchedIds.includes(a.id) ? 0 : 1; const bMatch = matchedIds.includes(b.id) ? 0 : 1; return aMatch - bMatch; }).map((p) => (
                    <div key={p.id} onClick={() => togglePhoto(p.id)} style={{
                      position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                      cursor: matchedIds !== null && matchedIds.includes(p.id) ? "pointer" : "default", aspectRatio: "1",
                      opacity: matchedIds !== null && !matchedIds.includes(p.id) ? 0.4 : 1,
                      border: `2px solid ${selectedPhotos.includes(p.id) ? T.accent : "transparent"}`,
                      transition: "border-color 0.2s",
                    }}>
                      <img src={p.watermarked_url || p.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {selectedPhotos.includes(p.id) && (
                        <div style={{
                          position: "absolute", top: 6, right: 6, width: 24, height: 24,
                          borderRadius: "50%", background: T.accent,
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                        }}>{Icon.Check(14)}</div>
                      )}
			{p.qr_code_id && !mobileMoneyEnabled && matchedIds !== null && matchedIds.includes(p.id) && (
                        <div onClick={(ev) => {
                          ev.stopPropagation();
                          setQrModal(p);
                        }} style={{
                          position: "absolute", bottom: 6, right: 6, width: 28, height: 28,
                          borderRadius: 7, background: "rgba(0,0,0,0.6)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer", fontSize: 12,
                        }}>{Icon.QrCode(14)}</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment bar */}
                {selectedPhotos.length > 0 && (
                  <div style={{
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    background: T.card, borderTop: `1px solid ${T.border}`,
                    padding: "16px 24px", display: "flex", justifyContent: "space-between",
                    alignItems: "center", zIndex: 100, animation: "slideDown 0.3s ease",
                  }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</span>
                      {mobileMoneyEnabled && (
                        <span style={{ color: T.accent, fontWeight: 700, marginLeft: 12, fontFamily: T.fontDisplay, fontSize: 18 }}>{fcfa(getPrice())}</span>
                      )}
                    </div>
                    {mobileMoneyEnabled ? (
                      <Btn onClick={handlePayment} style={{ padding: "12px 28px" }}>
                        {Icon.Phone(16)} Payer par Mobile Money
                      </Btn>
                    ) : (
                      <Btn onClick={handleFreeDownload} style={{ padding: "12px 28px", background: T.green }}>
                        {Icon.ArrowRight(16)} Télécharger en HD
                      </Btn>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  APP ROUTER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function QrPhotoPage({ qrCode, onNavigate }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function() {
    fetch(API + "/photos/qr/" + qrCode)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.photo) setPhoto(d.photo);
        else setError("Photo introuvable.");
        setLoading(false);
      })
      .catch(function() { setError("Erreur de connexion."); setLoading(false); });
  }, []);

  var downloadPhoto = function() {
    if (!photo) return;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var photoUrl = photo.original_url || photo.watermarked_url;
    if (isIOS) {
      // iOS : ouvrir dans un nouvel onglet pour permettre "Ajouter aux photos"
      window.open(photoUrl, "_blank");
      alert("Appuyez longuement sur l\u0027image puis \"Ajouter aux photos\" pour l\u0027enregistrer dans votre galerie.");
    } else {
      // Desktop/Android : download via blob
      fetch(photoUrl)
        .then(function(r) { return r.blob(); })
        .then(function(blob) {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "fotokash-" + photo.qr_code_id + ".jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

  if (error || !photo) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textMuted, gap: 16 }}>
      <p>{error || "Photo introuvable."}</p>
      <Btn onClick={function() { onNavigate("landing"); }}>Retour</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Icon.Camera(14)}</div>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>
      </header>
      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{photo.event_name || "Photo FotoKash"}</h2>
        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Code: {photo.qr_code_id}</p>
        <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <img src={photo.watermarked_url || photo.thumbnail_url} alt="" style={{ width: "100%", display: "block" }} />
        </div>
        <Btn onClick={downloadPhoto} style={{ width: "100%", justifyContent: "center", padding: "14px 0", background: T.green }}>
          Telecharger en HD
        </Btn>
      </div>
    </div>
  );
}

// ── URL helpers ──────────────────────────────────────────────────────
const TITLES = {
  landing: "FotoKash - Plateforme photo événementielle",
  login: "Connexion - FotoKash",
  signup: "Inscription - FotoKash",
  dashboard: "Dashboard - FotoKash",
  "dashboard/stats": "Statistiques - FotoKash",
  "dashboard/events": "Événements - FotoKash",
  "dashboard/photos": "Photos - FotoKash",
  "dashboard/live": "Live - FotoKash",
  "dashboard/account": "Mon compte - FotoKash",
  legal: "Mentions légales - FotoKash",
  admin: "Admin - FotoKash",
  "admin/dashboard": "Dashboard Admin - FotoKash",
  "admin/photographers": "Photographes - FotoKash Admin",
  "admin/subscriptions": "Abonnements - FotoKash Admin",
  "admin/logs": "Logs - FotoKash Admin",
  "admin/settings": "Paramètres - FotoKash Admin",
};

function screenToUrl(s, props = {}) {
  if (s === "landing") return "/";
  if (s === "auth") return props.mode === "signup" ? "/signup" : "/login";
  if (s === "dashboard") {
    const t = props.tab;
    return t && t !== "stats" ? "/dashboard/" + t : "/dashboard";
  }
  if (s === "client" || s === "client-demo") return "/e/" + (props.slug || "");
  if (s === "live") return "/live/" + (props.slug || "");
  if (s === "legal") return "/legal";
  if (s === "admin") {
    const p = props.page;
    return p && p !== "dashboard" ? "/admin/" + p : "/admin";
  }
  if (s === "qr-photo") return "/p/" + (props.qrCode || "");
  return "/";
}

function urlToScreenProps(path) {
  if (path === "/" || path === "") return { screen: "landing", props: {} };
  if (path === "/login") return { screen: "auth", props: { mode: "login" } };
  if (path === "/signup") return { screen: "auth", props: { mode: "signup" } };
  if (path.startsWith("/dashboard")) {
    const tab = path.replace("/dashboard", "").replace("/", "") || "stats";
    return { screen: "dashboard", props: { tab } };
  }
  if (path.startsWith("/e/")) return { screen: "client", props: { slug: path.replace("/e/", "") } };
  if (path.startsWith("/live/")) return { screen: "live", props: { slug: path.replace("/live/", "") } };
  if (path.startsWith("/p/")) return { screen: "qr-photo", props: { qrCode: path.replace("/p/", "") } };
  if (path === "/legal") return { screen: "legal", props: {} };
  if (path === "/admin" || path.startsWith("/admin/")) {
    const page = path.replace("/admin", "").replace("/", "") || "dashboard";
    return { screen: "admin", props: { page } };
  }
  return { screen: "landing", props: {} };
}

function getPageTitle(s, props = {}) {
  if (s === "auth") return props.mode === "signup" ? TITLES.signup : TITLES.login;
  if (s === "dashboard" && props.tab) return TITLES["dashboard/" + props.tab] || TITLES.dashboard;
  if (s === "admin" && props.page) return TITLES["admin/" + props.page] || TITLES.admin;
  return TITLES[s] || "FotoKash";
}

export default function FotoKashApp() {
  // SEO: balise canonical dynamique
  const seoConfig = (() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (p.startsWith('/dashboard') || p.startsWith('/admin')) return { noindex: true };
    if (p.startsWith('/p/')) return { title: 'Telechargement Photo', noindex: true };
    if (p.startsWith('/live/')) return { title: 'Evenement en direct', noindex: true };
    if (p.startsWith('/e/')) return { title: 'Galerie Photos' };
    if (p === '/login') return { title: 'Connexion Photographe' };
    if (p === '/register') return { title: 'Inscription Photographe' };
    return {};
  })();

  const initState = urlToScreenProps(window.location.pathname);
  const [screen, setScreen] = useState(initState.screen);
  const [screenProps, setScreenProps] = useState(initState.props);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fotokash_token"));
  const [platform, setPlatform] = useState({ name: "FotoKash", email: "contact@fotokash.com" });

  useEffect(function() {
    fetch(API + "/photos/platform").then(function(r) { return r.json(); }).then(function(d) { setPlatform(d); }).catch(function() {});
  }, []);

  // Auto-login if token exists (skip public pages)
  useEffect(() => {
    const pub = ["/e/", "/p/", "/live/"];
    if (pub.some(p => window.location.pathname.startsWith(p))) return;
    if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(d) {
          var u = d.user || d.photographer || d;
          setUser(u);
          const dest = u.role === "admin" ? "admin" : "dashboard";
          const destProps = dest === "admin" ? { page: "dashboard" } : { tab: "stats" };
          setScreen(dest);
          setScreenProps(destProps);
          const url = screenToUrl(dest, destProps);
          window.history.replaceState({ screen: dest, props: destProps }, "", url);
          document.title = getPageTitle(dest, destProps);
        })
        .catch(function() { localStorage.removeItem("fotokash_token"); setToken(null); });
    }
  }, [token]);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const { screen: s, props: p } = urlToScreenProps(window.location.pathname);
      setScreen(s);
      setScreenProps(p);
      document.title = getPageTitle(s, p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (s, props = {}) => {
    const url = screenToUrl(s, props);
    const title = getPageTitle(s, props);
    // Don't push duplicate entries for tab changes within dashboard
    const isSamePath = window.location.pathname === url;
    if (!isSamePath) {
      window.history.pushState({ screen: s, props }, "", url);
    }
    document.title = title;
    setScreen(s);
    setScreenProps(props);
  };

  const handleAuth = (u, t) => {
    setUser(u); setToken(t);
    const dest = u.role === "admin" ? "admin" : "dashboard";
    const destProps = dest === "admin" ? { page: "dashboard" } : { tab: "stats" };
    navigate(dest, destProps);
  };

  const handleLogout = () => {
    localStorage.removeItem("fotokash_token");
    setUser(null); setToken(null);
    navigate("landing");
  };

  return (
    <>
      <SEOHead {...seoConfig} />
      <style>{globalCSS}</style>
      {screen === "landing" && <LandingPage onNavigate={navigate} platform={platform} />}
      {screen === "auth" && <AuthScreen mode={screenProps.mode} onNavigate={navigate} onAuth={handleAuth} />}
      {screen === "dashboard" && <Dashboard user={user} token={token} onNavigate={navigate} onLogout={handleLogout} initialTab={screenProps.tab} />}
      {(screen === "client" || screen === "client-demo") && <ClientPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "legal" && <LegalPage tab={screenProps.tab} onNavigate={navigate} />}
      {screen === "live" && <LiveEventPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "admin" && <AdminLayout user={user} token={token} onNavigate={navigate} onLogout={handleLogout} initialPage={screenProps.page} />}
      {screen === "qr-photo" && <QrPhotoPage qrCode={screenProps.qrCode} onNavigate={navigate} />}
    </>
  );
}











