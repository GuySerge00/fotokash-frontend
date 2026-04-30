import AdminLayout from "./admin/AdminLayout";
import LiveEventPage from "./LiveEventPage";
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
        <span>{"© 2026 " + (platform ? platform.name : "FotoKash") + " · Abidjan, Côte d'Ivoire"}</span>
        <span>{platform ? platform.email : "contact@fotokash.com"}</span>
      </footer>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCREEN 2 â€” AUTH (Login / Signup)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function AuthScreen({ mode: initialMode, onNavigate, onAuth }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
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

      // Si le compte est en attente d'activation
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

      <div style={{
        position: "relative", width: "100%", maxWidth: 400,
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36, cursor: "pointer" }} onClick={() => onNavigate("landing")}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: T.accent,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#fff", marginBottom: 12,
          }}>{Icon.Camera(24)}</div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700 }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
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
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
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

          {mode === "signup" && (
            <>
              <Input label="Nom complet" placeholder="Ex: Kouamé Jean" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Téléphone" placeholder="+225 07 XX XX XX XX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </>
          )}
          <Input label="Email" type="email" placeholder="vous@email.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", color: T.red, padding: "10px 14px",
              borderRadius: 8, fontSize: 13, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {Icon.AlertCircle(14)} {error}
            </div>
          )}

          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "13px 0" }}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCREEN 3 â€” PHOTOGRAPHER DASHBOARD
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function AccountTab({ token }) {
  var currentPwd = "";
  var newPwd = "";
  var confirmPwd = "";
  var msgEl = null;
  
  function handleChange() {
    currentPwd = document.getElementById("fk-current-pwd").value;
    newPwd = document.getElementById("fk-new-pwd").value;
    confirmPwd = document.getElementById("fk-confirm-pwd").value;
    msgEl = document.getElementById("fk-pwd-msg");
    
    if (!currentPwd || !newPwd || !confirmPwd) {
      msgEl.textContent = "Remplissez tous les champs.";
      msgEl.style.color = T.red;
      return;
    }
    if (newPwd.length < 6) {
      msgEl.textContent = "Le nouveau mot de passe doit faire au moins 6 caracteres.";
      msgEl.style.color = T.red;
      return;
    }
    if (newPwd !== confirmPwd) {
      msgEl.textContent = "Les mots de passe ne correspondent pas.";
      msgEl.style.color = T.red;
      return;
    }
    
    msgEl.textContent = "Modification en cours...";
    msgEl.style.color = T.textMuted;
    
    fetch(API + "/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
    })
    .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d }; }); })
    .then(function(res) {
      if (res.ok) {
        msgEl.textContent = "Mot de passe modifie avec succes !";
        msgEl.style.color = T.green;
        document.getElementById("fk-current-pwd").value = "";
        document.getElementById("fk-new-pwd").value = "";
        document.getElementById("fk-confirm-pwd").value = "";
      } else {
        msgEl.textContent = res.data.error || "Erreur";
        msgEl.style.color = T.red;
      }
    })
    .catch(function() {
      msgEl.textContent = "Erreur de connexion.";
      msgEl.style.color = T.red;
    });
  }

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>Mon compte</h2>
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "28px 24px", maxWidth: 450 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Changer le mot de passe</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Mot de passe actuel</label>
          <input id="fk-current-pwd" type="password" placeholder="Votre mot de passe actuel" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nouveau mot de passe</label>
          <input id="fk-new-pwd" type="password" placeholder="Minimum 6 caracteres" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
          <input id="fk-confirm-pwd" type="password" placeholder="Retapez le nouveau mot de passe" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <p id="fk-pwd-msg" style={{ fontSize: 13, marginBottom: 16, minHeight: 20 }}></p>
        <button onClick={handleChange} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Modifier le mot de passe</button>
      </div>
    </div>
  );
}

function Dashboard({ user: initialUser, token, onNavigate, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState("stats");

// Recharger le profil à chaque visite pour synchro admin
  useEffect(() => {
    fetch(API + "/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        var u = d.user || d;
        setUser(u);
        // Si le compte a été désactivé, déconnecter
        if (u.status === 'inactive') {
          alert('Votre compte a été désactivé. Contactez l\'administrateur.');
          onLogout();
        }
      })
      .catch(() => {});
  }, [token]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch events
  useEffect(() => {
    if (tab === "events" || tab === "photos" || tab === "live") {
      setLoadingEvents(true);
      fetch(API + "/events", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setEvents(d.events || []))
        .catch(() => {})
        .finally(() => setLoadingEvents(false));
    }
  }, [tab, token]);

  const tabs = [
    { id: "stats", label: "Statistiques", icon: Icon.BarChart(16) },
    { id: "photos", label: "Photos", icon: Icon.Image(16) },
    { id: "events", label: "Événements", icon: Icon.Calendar(16) },
    { id: "live", label: "Live", icon: Icon.Phone(16) },
      { id: "account", label: "Mon compte", icon: Icon.Users(16) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
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
          <span style={{ fontSize: 13, color: T.textMuted }}>
            {user?.studio_name || user?.name || "Photographe"}
          </span>
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
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: T.radiusSm, border: "none",
            background: tab === t.id ? T.accentDim : "transparent",
            color: tab === t.id ? T.accent : T.textMuted,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: T.font, transition: "all 0.2s",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "stats" && <StatsTab token={token} />}
        {tab === "photos" && <PhotosTab token={token} events={events} />}
	{tab === "live" && <LiveTab token={token} events={events} onNavigate={onNavigate} setEvents={setEvents} />}
        {tab === "events" && <EventsTab token={token} events={events} setEvents={setEvents} loading={loadingEvents} onNavigate={onNavigate} />}
        {tab === "account" && <AccountTab token={token} />}      </div>
    </div>
  );
}

// â”€â”€â”€ Stats Tab â”€â”€â”€
function StatsTab({ token }) {
  const [data, setData] = useState({ photos: 0, events: 0, sales: 0, clients: 0 });
  useEffect(() => {
    fetch(API + "/events", { headers: { Authorization: "Bearer " + token } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var evts = d.events || d || [];
        var totalPhotos = evts.reduce(function(sum, e) { return sum + (parseInt(e.photos_count) || 0); }, 0);
        setData({ photos: totalPhotos, events: evts.length, sales: 0, clients: 0 });
      })
      .catch(function() {});
  }, [token]);
  const stats = [
    { label: "Photos téléchargées", value: String(data.photos), icon: Icon.Image(20), color: T.accent },
    { label: "Événements", value: String(data.events), icon: Icon.Calendar(20), color: T.gold },
    { label: "Revenus", value: fcfa(data.sales), icon: Icon.CreditCard(20), color: T.green },
    { label: "Clients", value: String(data.clients), icon: Icon.Users(20), color: "#818CF8" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>
        Tableau de bord
      </h2>
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

      <div style={{
        marginTop: 28, background: T.card, borderRadius: T.radius,
        border: `1px solid ${T.border}`, padding: "32px 24px", textAlign: "center",
      }}>
        <div style={{ color: T.textMuted, marginBottom: 8 }}>{Icon.Camera(32)}</div>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 4 }}>Commencez par créer un événement</p>
        <p style={{ color: T.textDim, fontSize: 12 }}>Allez dans l'onglet "Événements" pour démarrer</p>
      </div>
    </div>
  );
}

// â”€â”€â”€ Photos Tab (avec upload intégré) â”€â”€â”€
function PhotosTab({ token, events }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = useCallback((newFiles) => {
    const imgs = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const withPreviews = imgs.map((file) => ({
      id: crypto.randomUUID(), file, name: file.name, size: file.size,
      preview: URL.createObjectURL(file), status: "pending", progress: 0,
    }));
    setFiles((prev) => [...prev, ...withPreviews]);
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }, [processFiles]);
  const removeFile = (id) => { setFiles((prev) => { const f = prev.find((x) => x.id === id); if (f) URL.revokeObjectURL(f.preview); return prev.filter((x) => x.id !== id); }); };

  const handleUpload = async () => {
    if (!selectedEvent || files.length === 0) return;
    setUploading(true);
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");

    // Envoyer par lots de 5
    for (let i = 0; i < pending.length; i += 5) {
      const batch = pending.slice(i, i + 5);
      const formData = new FormData();
      formData.append("event_id", selectedEvent);
      batch.forEach((f) => formData.append("photos", f.file));

      // Set uploading status
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
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        batch.forEach((f) => {
          setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "error", progress: 0 } : x));
        });
      }
    }
    setUploading(false);
  };

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const doneCount = files.filter((f) => f.status === "done").length;
  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;

  useEffect(() => { return () => files.forEach((f) => URL.revokeObjectURL(f.preview)); }, []);

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
            <strong style={{ color: T.text }}>{files.length}</strong> photo{files.length > 1 ? "s" : ""} · {formatSize(totalSize)}
            {doneCount > 0 && <span style={{ color: T.green }}> · {doneCount} envoyée{doneCount > 1 ? "s" : ""}</span>}
          </div>
        )}
      </div>

      {/* Event selector */}
      <div style={{
        background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
        padding: "18px 22px", marginBottom: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {Icon.Calendar(16)} Événement
        </div>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} style={{
          width: "100%", background: T.bg, border: `1px solid ${selectedEvent ? T.accent : T.border}`,
          borderRadius: T.radiusSm, padding: "12px 16px", color: selectedEvent ? T.text : T.textMuted,
          fontSize: 14, outline: "none", cursor: "pointer", colorScheme: "dark",
        }}>
          <option value="">-- Sélectionner un événement --</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
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
          borderRadius: T.radius, border: `2px dashed ${dragOver ? T.accent : "rgba(255,255,255,0.1)"}`,
          padding: "44px 24px", textAlign: "center", cursor: "pointer",
          transition: "all 0.3s", marginBottom: 18,
        }}
      >
        <div style={{ color: dragOver ? T.accent : T.textMuted, marginBottom: 14 }}>{Icon.Upload(32)}</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: dragOver ? T.text : T.textMuted, marginBottom: 4 }}>
          {dragOver ? "Déposez vos photos ici" : "Glissez-déposez vos photos"}
        </p>
        <p style={{ fontSize: 12, color: T.textMuted }}>
          ou <span style={{ color: T.accent, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>parcourir</span> · JPG, PNG, WebP · Max 25 Mo/photo · 50 max
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
              <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); }} style={{
                background: "rgba(239,68,68,0.1)", color: T.red, border: "none", borderRadius: 8,
                padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>Tout supprimer</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {files.map((f) => (
              <div key={f.id} style={{
                position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                background: T.cardAlt, aspectRatio: "1",
                border: `1px solid ${f.status === "error" ? "rgba(239,68,68,0.4)" : f.status === "done" ? "rgba(74,222,128,0.3)" : T.border}`,
              }}>
                <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {/* Watermark */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)", pointerEvents: "none" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 2, transform: "rotate(-25deg)", textTransform: "uppercase" }}>FOTOKASH</span>
                </div>
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
                {/* Error badge */}
                {f.status === "error" && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "4px 8px", color: T.red, fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {Icon.AlertCircle(10)} Erreur
                    </span>
                  </div>
                )}
                {/* Remove btn */}
                {f.status !== "uploading" && (
                  <button onClick={() => removeFile(f.id)} style={{
                    position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)",
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
            ))}
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

          {/* Upload bar */}
          <div style={{
            background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
            padding: "18px 22px", display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              {!selectedEvent && <p style={{ fontSize: 12, color: T.accent, display: "flex", alignItems: "center", gap: 6 }}>{Icon.AlertCircle(14)} Sélectionnez un événement</p>}
              {selectedEvent && pendingCount > 0 && <p style={{ fontSize: 13, color: T.textMuted }}><strong style={{ color: T.text }}>{pendingCount}</strong> prête{pendingCount > 1 ? "s" : ""} · {formatSize(files.filter((f) => f.status === "pending").reduce((a, f) => a + f.size, 0))}</p>}
              {selectedEvent && pendingCount === 0 && doneCount > 0 && <p style={{ fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 6 }}>{Icon.Check(14)} Toutes envoyées !</p>}
            </div>
            <Btn onClick={handleUpload} disabled={!selectedEvent || pendingCount === 0 || uploading}>
              {uploading ? <span>Envoi...</span> : <span>{Icon.Upload(16)} Envoyer ({pendingCount})</span>}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}

// â”€â”€â”€ Events Tab â”€â”€â”€

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
  const pollRef = useRef(null);
  useEffect(() => { if (events.length === 0) return; const live = events.find(e => e.is_live); setLiveEvent(live || null); setLoading(false); }, [events]);
  useEffect(() => {
    if (!liveEvent) return;
    const fetchDash = () => { fetch(API + "/live/" + liveEvent.id + "/dashboard", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()).then(d => setDashData(d)).catch(() => {}); };
    fetchDash();
    pollRef.current = setInterval(fetchDash, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [liveEvent, token]);
  const stopLive = () => { if (!liveEvent) return; fetch(API + "/live/" + liveEvent.id + "/stop", { method: "POST", headers: { Authorization: "Bearer " + token } }).then(r => r.json()).then(d => { if (d.event) setEvents(prev => prev.map(x => x.id === liveEvent.id ? { ...x, is_live: false } : x)); }); };
  const timeAgo = (date) => { const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000); if (diff < 60) return "Il y a " + diff + "s"; if (diff < 3600) return "Il y a " + Math.floor(diff / 60) + " min"; return "Il y a " + Math.floor(diff / 3600) + "h"; };
  if (loading) return <p style={{ color: T.textMuted, textAlign: "center", padding: 40 }}>Chargement...</p>;
  if (!liveEvent) return (<div style={{ textAlign: "center", padding: "60px 24px" }}><div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Phone(32)}</div><h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Aucun evenement en direct</h2><p style={{ color: T.textMuted, fontSize: 14 }}>Activez le mode live sur un evenement depuis l onglet Evenements</p></div>);
  const stats = dashData?.stats || { photos_count: 0, visitors_count: 0, matches_count: 0, purchases_count: 0 };
  const visitors = dashData?.visitors || [];
  const liveUrl = "https://fotokash.com/live/" + liveEvent.slug;
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200\u0026data=" + encodeURIComponent(liveUrl);
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
      <div><h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>{liveEvent.name}<span style={{ background: T.accent, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.font }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite", display: "inline-block" }}></span> En direct</span></h2><p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Dashboard temps reel</p></div>
      <Btn variant="ghost" onClick={stopLive} style={{ color: T.red, borderColor: "rgba(239,68,68,0.3)" }}>Arreter le live</Btn>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
      {[{ label: "Photos", value: stats.photos_count, icon: Icon.Image(18), color: T.accent },{ label: "Visiteurs", value: stats.visitors_count, icon: Icon.Users(18), color: T.gold },{ label: "Matches", value: stats.matches_count, icon: Icon.Search(18), color: T.green },{ label: "Achats", value: stats.purchases_count, icon: Icon.CreditCard(18), color: "#818CF8" }].map((s, i) => (<div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px 16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}><span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{s.label}</span><span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span></div><div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div></div>))}
    </div>
    <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: 10, flexShrink: 0 }}><img src={qrUrl} alt="QR Code" style={{ width: 100, height: 100, display: "block" }} /></div>
      <div style={{ flex: 1, minWidth: 200 }}><p style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>Les invites scannent ce QR code pour retrouver leurs photos</p><p style={{ fontSize: 14, color: T.accent, fontWeight: 600, marginBottom: 10, wordBreak: "break-all" }}>{liveUrl}</p><div style={{ display: "flex", gap: 8 }}><Btn variant="dark" onClick={() => { navigator.clipboard.writeText(liveUrl); alert("Lien copie !"); }} style={{ padding: "6px 14px", fontSize: 12 }}>Copier le lien</Btn><Btn variant="dark" onClick={() => onNavigate("live", { slug: liveEvent.slug })} style={{ padding: "6px 14px", fontSize: 12 }}>Voir la page</Btn></div></div>
    </div>
    <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 15, fontWeight: 600 }}>Visiteurs en temps reel</h3><span style={{ fontSize: 11, color: T.textDim }}>Actualisation auto 10s</span></div>
      {visitors.length === 0 ? (<p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Aucun visiteur pour le moment</p>) : (<div>{visitors.map((v, i) => (<div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < visitors.length - 1 ? "1px solid " + T.border : "none" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 13, fontWeight: 600 }}>{"#" + v.visitor_number}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{"Visiteur #" + v.visitor_number}</div><div style={{ fontSize: 11, color: T.textDim }}>{timeAgo(v.created_at)}</div></div><div style={{ background: "rgba(74,222,128,0.12)", color: T.green, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{v.matched_count + " photo" + (v.matched_count !== 1 ? "s" : "")}</div></div>))}</div>)}
    </div>
  </div>);
}
function EventsTab({ token, events, setEvents, loading, onNavigate }) {
  const [showForm, setShowForm] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [form, setForm] = useState({ name: "", date: "", location: "", description: "" });
  const [creating, setCreating] = useState(false);

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
        setForm({ name: "", date: "", location: "", description: "" });
        setShowForm(false);
      }
    } catch {}
    setCreating(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700 }}>Mes événements</h2>
        <Btn onClick={() => setShowForm(!showForm)}>{Icon.Plus(16)} Nouvel événement</Btn>
      </div>

      {showForm && (
        <div style={{
          background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
          padding: "24px", marginBottom: 20, animation: "slideDown 0.3s ease",
        }}>
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
        <EventPhotosViewer
          eventId={viewingEvent.id}
          eventName={viewingEvent.name}
          token={token}
          onClose={function() { setViewingEvent(null); }}
        />
      )}


      {loading && <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 40 }}>Chargement...</p>}

      {!loading && events.length === 0 && (
        <div style={{
          background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
          padding: "48px 24px", textAlign: "center",
        }}>
          <div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Calendar(32)}</div>
          <p style={{ color: T.textMuted, fontSize: 14 }}>Aucun événement pour le moment</p>
          <p style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>Créez votre premier événement pour commencer</p>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} style={{
              background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
              padding: "20px 22px", display: "flex", justifyContent: "space-between",
              alignItems: "center", transition: "border-color 0.2s",
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {e.date && <span>{new Date(e.date).toLocaleDateString("fr-FR")}</span>}
                  {e.location && <span>{e.location}</span>}
                  <span style={{ color: T.accent, cursor: "pointer", textDecoration: "underline" }} onClick={function(ev) { ev.stopPropagation(); navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(function() { alert("Lien copie : https://fotokash.com/e/" + e.slug); }); }}>Copier le lien</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: T.textDim }}>{e.photos_count || 0} photo{(e.photos_count || 0) !== 1 ? "s" : ""}</span>
                <button onClick={function(ev) { ev.stopPropagation(); var action = e.is_live ? "stop" : "start"; fetch(API + "/live/" + e.id + "/" + action, { method: "POST", headers: { Authorization: "Bearer " + token } }).then(function(r) { return r.json(); }).then(function(d) { if (d.event) setEvents(function(prev) { return prev.map(function(x) { return x.id === e.id ? Object.assign({}, x, { is_live: d.event.is_live }) : x; }); }); }); }} style={{ background: e.is_live ? "rgba(74,222,128,0.15)" : "rgba(232,89,60,0.1)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: e.is_live ? T.green : T.accent, fontSize: 11, fontWeight: 600, fontFamily: T.font, display: "flex", alignItems: "center", gap: 4 }}>{e.is_live ? "\u25CF En direct" : "\u25B6 Activer Live"}</button>
                {e.is_live && (<button onClick={function(ev) { ev.stopPropagation(); onNavigate("live", { slug: e.slug }); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: T.textMuted, fontSize: 11, fontWeight: 600, fontFamily: T.font }}>Voir live</button>)}
                <button onClick={function(ev) { ev.stopPropagation(); setViewingEvent(e); }} style={{ background: T.accentDim, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.accent, fontSize: 11, fontWeight: 600 }}>Voir photos</button>
                <button onClick={function(ev) { ev.stopPropagation(); if (window.confirm("Supprimer cet evenement et toutes ses photos ?")) { fetch(API + "/events/" + e.id, { method: "DELETE", headers: { Authorization: "Bearer " + token } }).then(function(r) { if (r.ok) setEvents(function(prev) { return prev.filter(function(x) { return x.id !== e.id; }); }); }); } }} style={{ background: "rgba(239,68,68,0.08)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.red, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600 }}>
                  {Icon.Trash(12)} Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SCREEN 4 â€” CLIENT EVENT PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ClientPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showSelfie, setShowSelfie] = useState(false);
const [selfieLoading, setSelfieLoading] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState(null);
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
          setPhotos(data.matched_photos);
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
    fetch(API + `/events/${slug || "demo"}/public`)
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
  }, [slug]);

  const togglePhoto = (id) => {
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
    try {
      const regRes = await fetch(API + "/photos/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_ids: selectedPhotos }),
      });
      const regData = await regRes.json();
      if (regRes.ok && regData.photos) {
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
                    {event.photographer_phone && (
                      <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        {Icon.Phone(12)} Contacter sur WhatsApp
                      </a>
                    )}
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
                    if (selectedPhotos.length === photos.length) {
                      setSelectedPhotos([]);
                    } else {
                      setSelectedPhotos(photos.map(p => p.id));
                    }
                  }} style={{
                    background: selectedPhotos.length === photos.length ? T.accentDim : "rgba(255,255,255,0.06)",
                    border: selectedPhotos.length === photos.length ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
                    borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                    color: selectedPhotos.length === photos.length ? T.accent : T.textMuted,
                    cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {selectedPhotos.length === photos.length ? "✓ Tout désélectionner" : "☐ Sélectionner tout"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
                  {photos.map((p) => (
                    <div key={p.id} onClick={() => togglePhoto(p.id)} style={{
                      position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                      cursor: "pointer", aspectRatio: "1",
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
			{p.qr_code_id && !mobileMoneyEnabled && (
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
    fetch(photo.original_url || photo.watermarked_url)
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

export default function FotoKashApp() {
  const [screen, setScreen] = useState(() => { var p = window.location.pathname; if (p.startsWith("/e/")) return "client";
    if (p.startsWith("/p/")) return "qr-photo"; return "landing"; });
  const [screenProps, setScreenProps] = useState(() => { var p = window.location.pathname; if (p.startsWith("/e/")) return { slug: p.replace("/e/", "") };
    if (p.startsWith("/p/")) return { qrCode: p.replace("/p/", "") }; return {}; });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fotokash_token"));
  const [platform, setPlatform] = useState({ name: "FotoKash", email: "contact@fotokash.com" });
  useEffect(function() { fetch(API + "/photos/platform").then(function(r) { return r.json(); }).then(function(d) { setPlatform(d); }).catch(function() {}); }, []);

  // Detecter les URLs publiques /live/
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/live/")) {
      const slug = path.replace("/live/", "");
      if (slug) { setScreen("live"); setScreenProps({ slug }); }
    }
  }, []);
  // Auto-login if token exists
  useEffect(() => {
    var currentPath = window.location.pathname;
    if (currentPath.startsWith("/e/")) return;
    if (currentPath.startsWith("/p/")) return;
    if (currentPath.startsWith("/live/")) return;
    if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(d) { var u = d.user || d.photographer || d; setUser(u); setScreen(u.role === "admin" ? "admin" : "dashboard"); })
        .catch(function() { localStorage.removeItem("fotokash_token"); setToken(null); });
    }
  }, [token]);

  const navigate = (s, props = {}) => { setScreen(s); setScreenProps(props); };
  const handleAuth = (u, t) => { setUser(u); setToken(t); setScreen(u.role === "admin" ? "admin" : "dashboard"); };
  const handleLogout = () => {
    localStorage.removeItem("fotokash_token");
    setUser(null); setToken(null); setScreen("landing");
  };

  return (
    <>
      <style>{globalCSS}</style>
      {screen === "landing" && <LandingPage onNavigate={navigate} platform={platform} />}
      {screen === "auth" && <AuthScreen mode={screenProps.mode} onNavigate={navigate} onAuth={handleAuth} />}
      {screen === "dashboard" && <Dashboard user={user} token={token} onNavigate={navigate} onLogout={handleLogout} />}
      {(screen === "client" || screen === "client-demo") && <ClientPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "live" && <LiveEventPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "admin" && <AdminLayout user={user} token={token} onNavigate={navigate} onLogout={handleLogout} />}
      {screen === "qr-photo" && <QrPhotoPage qrCode={screenProps.qrCode} onNavigate={navigate} />}
    </>
  );
}











