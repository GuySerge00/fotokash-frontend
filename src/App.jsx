import { useState, useRef, useEffect } from "react";

/* ============================================
   FOTOKASH — Application responsive
   ============================================ */

// Hook responsive
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return isMobile;
}

const EVENTS = [
  { id: 1, slug: "mariage-sarah-konan", name: "Mariage Sarah & Konan", date: "23 mars 2026", photos: 247, sold: 89, revenue: 34500, status: "live", cover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop" },
  { id: 2, slug: "bapteme-petit-david", name: "Baptême Petit David", date: "15 mars 2026", photos: 132, sold: 45, revenue: 18000, status: "live", cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop" },
  { id: 3, slug: "anniversaire-aya-30", name: "Anniversaire Aya 30 ans", date: "8 mars 2026", photos: 98, sold: 67, revenue: 22500, status: "ended", cover: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop" },
  { id: 4, slug: "corporate-jumia-ci", name: "Corporate Jumia CI", date: "1 mars 2026", photos: 310, sold: 124, revenue: 52000, status: "ended", cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop" },
];

const CLIENT_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop", matched: true, price: 200 },
  { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=500&fit=crop", matched: true, price: 200 },
  { id: 3, url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=500&fit=crop", matched: true, price: 200 },
  { id: 4, url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=500&fit=crop", matched: false, price: 200 },
  { id: 5, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=500&fit=crop", matched: false, price: 200 },
  { id: 6, url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=500&fit=crop", matched: true, price: 200 },
  { id: 7, url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=500&fit=crop", matched: false, price: 200 },
  { id: 8, url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=500&fit=crop", matched: true, price: 200 },
];

const DASHBOARD_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop", event: "Mariage Sarah & Konan", faces: 3, sold: true },
  { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200&h=200&fit=crop", event: "Mariage Sarah & Konan", faces: 2, sold: true },
  { id: 3, url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200&h=200&fit=crop", event: "Mariage Sarah & Konan", faces: 5, sold: false },
  { id: 4, url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&h=200&fit=crop", event: "Mariage Sarah & Konan", faces: 1, sold: true },
  { id: 5, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&h=200&fit=crop", event: "Baptême Petit David", faces: 2, sold: false },
  { id: 6, url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=200&h=200&fit=crop", event: "Baptême Petit David", faces: 4, sold: true },
  { id: 7, url: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=200&h=200&fit=crop", event: "Anniversaire Aya 30 ans", faces: 2, sold: false },
  { id: 8, url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&h=200&fit=crop", event: "Anniversaire Aya 30 ans", faces: 3, sold: true },
];

const REVENUE_DATA = [
  { month: "Oct", amount: 18000 },{ month: "Nov", amount: 32000 },{ month: "Dec", amount: 45000 },
  { month: "Jan", amount: 28000 },{ month: "Fév", amount: 52000 },{ month: "Mar", amount: 127000 },
];

const PACKS = [
  { count: 1, price: 200, label: "1 photo", savings: null },
  { count: 6, price: 500, label: "6 photos", savings: "58%", popular: true },
  { count: 11, price: 1000, label: "+10 photos", savings: "55%" },
];

const Icon = ({ type, size = 20 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    dashboard: <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    photos: <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
    events: <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    camera: <svg {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/></svg>,
    upload: <svg {...props}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    check: <svg {...props} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    cart: <svg {...props}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
    download: <svg {...props} strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    back: <svg {...props}><path d="M15 18l-6-6 6-6"/></svg>,
    qr: <svg {...props} strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="14" y1="22" x2="22" y2="22"/></svg>,
    logout: <svg {...props}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    eye: <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg {...props}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    user: <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    mail: <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
    lock: <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    phone: <svg {...props}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    face: <svg {...props} strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5"/></svg>,
    menu: <svg {...props}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[type] || null;
}

const WatermarkOverlay = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.08)", pointerEvents: "none" }}>
    <div style={{ transform: "rotate(-30deg)", color: "rgba(255,255,255,0.45)", fontSize: 22, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", textShadow: "0 1px 4px rgba(0,0,0,0.3)", userSelect: "none" }}>FotoKash</div>
  </div>
);

const MiniChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.amount));
  const h = 120, w = 100;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d.amount / max) * h}`).join(" ");
  return (
    <svg viewBox={`-4 -4 ${w + 8} ${h + 28}`} style={{ width: "100%", height: 160 }}>
      <polyline points={points} fill="none" stroke="#E8593C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => (
        <g key={i}><circle cx={(i / (data.length - 1)) * w} cy={h - (d.amount / max) * h} r="3" fill="#E8593C"/>
        <text x={(i / (data.length - 1)) * w} y={h + 18} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">{d.month}</text></g>
      ))}
    </svg>
  );
};

/* ============ LANDING PAGE ============ */
function LandingPage({ navigate }) {
  const m = useIsMobile();
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: m ? "16px 20px" : "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#E8593C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>F</div>
          <span style={{ fontWeight: 700, fontSize: m ? 17 : 20 }}>FotoKash</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!m && <button onClick={() => navigate("login")} style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", fontSize: 13, cursor: "pointer" }}>Connexion</button>}
          <button onClick={() => navigate("login")} style={{ padding: "10px 20px", background: "#E8593C", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{m ? "Connexion" : "S'inscrire"}</button>
        </div>
      </nav>
      <div style={{ textAlign: "center", padding: m ? "48px 20px 40px" : "80px 40px 60px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 3, color: "#E8593C", fontWeight: 600, marginBottom: 16 }}>Plateforme photo intelligente</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: m ? 30 : 52, fontWeight: 700, lineHeight: 1.1, margin: "0 0 16px" }}>Vos photos.<br/>Reconnues. Vendues.<br/>Instantanément.</h1>
        <p style={{ fontSize: m ? 15 : 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 28px" }}>Uploadez vos photos, laissez l'IA trouver les visages, et vendez par Mobile Money.</p>
        <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("login")} style={{ padding: "16px 28px", background: "#E8593C", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 24px rgba(232,89,60,0.35)" }}>Commencer gratuitement</button>
          <button onClick={() => navigate("event")} style={{ padding: "16px 28px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, color: "#fff", fontSize: 15, cursor: "pointer" }}>Voir une démo client</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, 1fr)", gap: 14, padding: m ? "0 20px 40px" : "20px 40px 60px", maxWidth: 900, margin: "0 auto" }}>
        {[
          { icon: "face", title: "Reconnaissance faciale", desc: "Vos clients se retrouvent en prenant un simple selfie." },
          { icon: "qr", title: "QR codes uniques", desc: "Scannez, payez, téléchargez — en 10 secondes." },
          { icon: "phone", title: "Paiement Mobile Money", desc: "Orange Money, MTN MoMo, Wave." },
        ].map((f, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: m ? "20px" : "28px 24px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(232,89,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#E8593C" }}><Icon type={f.icon} size={22}/></div>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: m ? "20px 20px 60px" : "40px 40px 80px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: m ? 22 : 28, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>Événements récents</h2>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
          {EVENTS.map(ev => (
            <div key={ev.id} onClick={() => navigate("event")} style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", aspectRatio: "3/4" }}>
              <img src={ev.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.8))" }}/>
              <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
                <div style={{ fontSize: m ? 12 : 14, fontWeight: 600 }}>{ev.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{ev.photos} photos</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: m ? "20px" : "24px 40px", display: "flex", flexDirection: m ? "column" : "row", justifyContent: "space-between", alignItems: m ? "flex-start" : "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>FotoKash 2026</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Tarifs", "À propos", "Contact", "CGU"].map(l => (
            <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ LOGIN PAGE ============ */
function LoginPage({ navigate }) {
  const m = useIsMobile();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => { setLoading(true); setTimeout(() => { setLoading(false); navigate("dashboard"); }, 1500); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: m ? "column" : "row" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: m ? "32px 24px" : "40px 60px", maxWidth: m ? "100%" : 500 }}>
        <div onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, background: "#E8593C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>FotoKash</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: m ? 26 : 32, fontWeight: 700, margin: "0 0 8px" }}>
          {mode === "login" ? "Bon retour" : "Créer un compte"}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
          {mode === "login" ? "Connectez-vous à votre espace photographe" : "Rejoignez FotoKash et commencez à vendre"}
        </p>
        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Nom du studio</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}><Icon type="user" size={18}/></div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Studio Lumière" style={{ width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}/>
            </div>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Email</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}><Icon type="mail" size={18}/></div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" style={{ width: "100%", padding: "14px 14px 14px 44px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}/>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Mot de passe</label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}><Icon type="lock" size={18}/></div>
            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" style={{ width: "100%", padding: "14px 44px 14px 44px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}/>
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0 }}><Icon type={showPassword ? "eyeOff" : "eye"} size={18}/></button>
          </div>
        </div>
        {mode === "login" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "#E8593C" }}/> Se souvenir de moi
            </label>
            <span style={{ fontSize: 13, color: "#E8593C", cursor: "pointer" }}>Mot de passe oublié ?</span>
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "rgba(232,89,60,0.6)" : "#E8593C", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 24px rgba(232,89,60,0.3)" }}>
          {loading ? "Connexion en cours..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "#E8593C", cursor: "pointer", fontWeight: 500 }}>{mode === "login" ? "S'inscrire" : "Se connecter"}</span>
        </div>
      </div>
      {!m && (
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }}/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(232,89,60,0.2), transparent)" }}/>
          <div style={{ position: "absolute", bottom: 50, left: 50, right: 50 }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1.3, marginBottom: 12 }}>Transformez chaque photo en revenu</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Rejoignez les photographes qui utilisent FotoKash.</p>
            <div style={{ display: "flex", gap: 28, marginTop: 24 }}>
              {[{ val: "2,400+", label: "Photographes" }, { val: "180K", label: "Photos vendues" }, { val: "12M", label: "FCFA générés" }].map((s, i) => (
                <div key={i}><div style={{ fontSize: 22, fontWeight: 700 }}>{s.val}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{s.label}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ CLIENT EVENT PAGE ============ */
function ClientEventPage({ navigate }) {
  const m = useIsMobile();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [view, setView] = useState("landing");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const event = EVENTS[0];
  const photos = filter === "me" ? CLIENT_PHOTOS.filter(p => p.matched) : CLIENT_PHOTOS;
  const totalPrice = () => { const c = selectedPhotos.length; if (c === 0) return 0; if (c >= 11) return 1000; if (c >= 6) return 500; return c * 200; };
  const toggleSelect = (id) => setSelectedPhotos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const startScan = () => { setScanning(true); setScanProgress(0); const iv = setInterval(() => { setScanProgress(prev => { if (prev >= 100) { clearInterval(iv); setTimeout(() => { setScanning(false); setView("gallery"); setFilter("me"); }, 400); return 100; } return prev + Math.random() * 15 + 5; }); }, 200); };
  const handlePayment = () => { if (!paymentMethod || phoneNumber.length < 8) return; setProcessing(true); setTimeout(() => { setProcessing(false); setPurchased(true); }, 2500); };

  if (scanning) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: 120, height: 120, borderRadius: "50%", border: "3px solid rgba(232,89,60,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 30 }}>
        <svg width="120" height="120" style={{ position: "absolute", top: -3, left: -3, transform: "rotate(-90deg)" }}><circle cx="60" cy="60" r="57" fill="none" stroke="#E8593C" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${Math.min(scanProgress, 100) * 3.58} 358`} style={{ transition: "stroke-dasharray 0.2s" }}/></svg>
        <Icon type="face" size={48}/>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>Analyse en cours...</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px" }}>Recherche dans {event.photos} photos</p>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#E8593C" }}>{Math.min(Math.round(scanProgress), 100)}%</div>
    </div>
  );

  if (purchased) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: "#4ADE80" }}><Icon type="check" size={36}/></div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Paiement confirmé !</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 28px" }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""} — {totalPrice().toLocaleString()} FCFA</p>
      <button style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #4ADE80, #22C55E)", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon type="download" size={18}/> Télécharger mes photos HD</button>
      <button onClick={() => { setPurchased(false); setShowPayment(false); setSelectedPhotos([]); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 16, cursor: "pointer", textDecoration: "underline" }}>Retour à la galerie</button>
    </div>
  );

  if (showPayment) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: 20 }}>
      <button onClick={() => setShowPayment(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}><Icon type="back" size={16}/> Retour</button>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Paiement</h2>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 24px" }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</p>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: "rgba(255,255,255,0.6)" }}><span>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""} (à 200 F)</span><span>{(selectedPhotos.length * 200).toLocaleString()} F</span></div>
        {totalPrice() < selectedPhotos.length * 200 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: "#4ADE80" }}><span>Réduction pack</span><span>-{(selectedPhotos.length * 200 - totalPrice()).toLocaleString()} F</span></div>}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700 }}><span>Total</span><span style={{ color: "#E8593C" }}>{totalPrice().toLocaleString()} FCFA</span></div>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>Moyen de paiement</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {[{ id: "orange", name: "Orange Money", color: "#FF6B00", icon: "OM" }, { id: "mtn", name: "MTN MoMo", color: "#FFCC00", tc: "#000", icon: "MM" }, { id: "wave", name: "Wave", color: "#1DC3E8", icon: "W" }].map(pm => (
          <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: paymentMethod === pm.id ? "rgba(232,89,60,0.1)" : "rgba(255,255,255,0.05)", border: paymentMethod === pm.id ? "1.5px solid #E8593C" : "1px solid rgba(255,255,255,0.08)", borderRadius: 12, cursor: "pointer", color: "#fff", width: "100%", textAlign: "left" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: pm.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: pm.tc || "#fff" }}>{pm.icon}</div>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{pm.name}</span>
            {paymentMethod === pm.id && <div style={{ marginLeft: "auto", color: "#E8593C" }}><Icon type="check" size={16}/></div>}
          </button>
        ))}
      </div>
      {paymentMethod && <>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>Numéro de téléphone</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "rgba(255,255,255,0.5)" }}>+225</div>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="07 XX XX XX XX" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#fff", outline: "none" }}/>
        </div>
      </>}
      <button onClick={handlePayment} disabled={!paymentMethod || phoneNumber.length < 8 || processing} style={{ width: "100%", padding: "16px", background: (!paymentMethod || phoneNumber.length < 8) ? "rgba(255,255,255,0.1)" : "#E8593C", border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", opacity: (!paymentMethod || phoneNumber.length < 8) ? 0.5 : 1 }}>
        {processing ? "Traitement..." : `Payer ${totalPrice().toLocaleString()} FCFA`}
      </button>
    </div>
  );

  if (view === "gallery") return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => { setView("landing"); setFilter("all"); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }}><Icon type="back" size={20}/></button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{event.name}</span>
        <div style={{ width: 20 }}/>
      </div>
      <div style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
        {[{ key: "all", label: `Toutes (${CLIENT_PHOTOS.length})` }, { key: "me", label: `Mes photos (${CLIENT_PHOTOS.filter(p => p.matched).length})` }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: filter === f.key ? "#E8593C" : "rgba(255,255,255,0.08)", color: filter === f.key ? "#fff" : "rgba(255,255,255,0.6)" }}>{f.label}</button>
        ))}
      </div>
      {filter === "me" && <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80" }}/><span style={{ fontSize: 12, color: "#4ADE80" }}>{CLIENT_PHOTOS.filter(p => p.matched).length} photos de vous</span></div>}
      <div style={{ padding: "0 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {photos.map(photo => {
          const selected = selectedPhotos.includes(photo.id);
          return (
            <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/5" }}>
              <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              <WatermarkOverlay/>
              {photo.matched && filter === "all" && <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(74,222,128,0.2)", backdropFilter: "blur(8px)", borderRadius: 6, padding: "2px 7px", fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>Vous</div>}
              <button onClick={() => toggleSelect(photo.id)} style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 7, background: selected ? "#E8593C" : "rgba(0,0,0,0.4)", border: selected ? "none" : "1.5px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                {selected && <Icon type="check" size={12}/>}
              </button>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 8px 6px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{photo.price} F</span>
              </div>
            </div>
          );
        })}
      </div>
      {selectedPhotos.length > 0 && (
        <div style={{ position: "sticky", bottom: 0, padding: "12px 16px", background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</div><div style={{ fontSize: 17, fontWeight: 700, color: "#E8593C" }}>{totalPrice().toLocaleString()} F</div></div>
          <button onClick={() => setShowPayment(true)} style={{ padding: "11px 24px", background: "#E8593C", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Icon type="cart" size={16}/> Acheter</button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <div style={{ position: "relative", height: m ? 340 : 400, overflow: "hidden" }}>
        <img src={event.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, #0a0a0a)" }}/>
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => navigate("landing")} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "7px 12px", color: "#fff", cursor: "pointer", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><Icon type="back" size={14}/> Accueil</button>
          <button style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "7px 12px", color: "#fff", cursor: "pointer", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><Icon type="qr" size={14}/> QR</button>
        </div>
        <div style={{ position: "absolute", bottom: 24, left: 20, right: 20 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: "#E8593C", fontWeight: 600, marginBottom: 6 }}>{event.date}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: m ? 24 : 30, fontWeight: 700, lineHeight: 1.15, margin: "0 0 6px" }}>{event.name}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Par Studio Lumière — {event.photos} photos</p>
        </div>
      </div>
      <div style={{ padding: "20px 16px" }}>
        <button onClick={startScan} style={{ width: "100%", padding: "15px 20px", background: "#E8593C", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 24px rgba(232,89,60,0.35)" }}><Icon type="camera" size={20}/> Trouver mes photos par selfie</button>
        <button onClick={() => setView("gallery")} style={{ width: "100%", padding: "13px 20px", marginTop: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Parcourir toute la galerie</button>
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, margin: "0 0 12px" }}>Tarifs</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {PACKS.map(pack => (
              <div key={pack.count} style={{ background: pack.popular ? "rgba(232,89,60,0.12)" : "rgba(255,255,255,0.05)", border: pack.popular ? "1px solid rgba(232,89,60,0.35)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 10px", position: "relative" }}>
                {pack.popular && <span style={{ position: "absolute", top: -7, right: 6, background: "#E8593C", color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 5 }}>Top</span>}
                <div style={{ fontSize: 18, fontWeight: 700 }}>{pack.price} <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>F</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{pack.label}</div>
                {pack.savings && <div style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600, marginTop: 3 }}>-{pack.savings}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ DASHBOARD ============ */
function DashboardPage({ navigate }) {
  const m = useIsMobile();
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadDrag, setUploadDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoFilter, setPhotoFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const fileRef = useRef();
  const totalSold = EVENTS.reduce((s, e) => s + e.sold, 0);
  const totalPhotos = EVENTS.reduce((s, e) => s + e.photos, 0);
  const simulateUpload = () => { setUploading(true); setUploadProgress(0); const iv = setInterval(() => { setUploadProgress(prev => { if (prev >= 100) { clearInterval(iv); setTimeout(() => setUploading(false), 600); return 100; } return prev + Math.random() * 8 + 3; }); }, 150); };
  const filteredPhotos = photoFilter === "all" ? DASHBOARD_PHOTOS : DASHBOARD_PHOTOS.filter(p => p.event === photoFilter);
  const navItems = [{ key: "dashboard", label: "Dashboard", icon: "dashboard" }, { key: "photos", label: "Photos", icon: "photos" }, { key: "events", label: "Événements", icon: "events" }];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: m ? "column" : "row" }}>
      {/* Mobile header */}
      {m && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: "#E8593C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>F</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>FotoKash</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}><Icon type={menuOpen ? "close" : "menu"} size={24}/></button>
        </div>
      )}
      {/* Mobile menu overlay */}
      {m && menuOpen && (
        <div style={{ background: "rgba(0,0,0,0.95)", padding: "20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setTab(item.key); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "none", cursor: "pointer", background: tab === item.key ? "rgba(232,89,60,0.12)" : "transparent", borderRadius: 10, color: tab === item.key ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: tab === item.key ? 600 : 400, width: "100%" }}>
              <Icon type={item.icon}/> {item.label}
            </button>
          ))}
          <button onClick={() => navigate("event")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 15, cursor: "pointer", width: "100%" }}><Icon type="eye" size={18}/> Voir côté client</button>
          <button onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 15, cursor: "pointer", width: "100%" }}><Icon type="logout" size={18}/> Déconnexion</button>
        </div>
      )}
      {/* Desktop sidebar */}
      {!m && (
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 20px", marginBottom: 36, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#E8593C", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>F</div>
            <div><div style={{ fontWeight: 700, fontSize: 16 }}>FotoKash</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Studio Lumière</div></div>
          </div>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", border: "none", cursor: "pointer", background: tab === item.key ? "rgba(232,89,60,0.12)" : "transparent", borderLeft: tab === item.key ? "3px solid #E8593C" : "3px solid transparent", color: tab === item.key ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: tab === item.key ? 600 : 400, width: "100%", textAlign: "left" }}>
              <Icon type={item.icon}/> {item.label}
            </button>
          ))}
          <div style={{ marginTop: 16, padding: "0 20px" }}><button onClick={() => navigate("event")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", width: "100%" }}><Icon type="eye" size={16}/> Voir côté client</button></div>
          <div style={{ marginTop: "auto", padding: "0 20px" }}><button onClick={() => navigate("landing")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", width: "100%" }}><Icon type="logout" size={16}/> Déconnexion</button></div>
        </div>
      )}
      {/* Main content */}
      <div style={{ flex: 1, padding: m ? "20px 16px" : "28px 32px", overflowY: "auto", maxHeight: "100vh" }}>
        {tab === "dashboard" && <>
          <h1 style={{ fontSize: m ? 20 : 26, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>Bonjour, Studio Lumière</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 20px" }}>Performances du mois</p>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Revenus", value: "127K F", accent: true, sub: "+144%" },
              { label: "Vendues", value: totalSold, sub: `sur ${totalPhotos}` },
              { label: "Conversion", value: `${Math.round((totalSold / totalPhotos) * 100)}%`, sub: "vues→achat" },
              { label: "Événements", value: EVENTS.filter(e => e.status === "live").length, sub: `${EVENTS.length} total` },
            ].map((s, i) => (
              <div key={i} style={{ background: s.accent ? "rgba(232,89,60,0.1)" : "rgba(255,255,255,0.04)", border: s.accent ? "1px solid rgba(232,89,60,0.25)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: m ? "14px" : "18px 20px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: m ? 20 : 26, fontWeight: 700, color: s.accent ? "#E8593C" : "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>Revenus (6 mois)</h3>
              <MiniChart data={REVENUE_DATA}/>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>Ventes récentes</h3>
              {[
                { name: "Moussa K.", photos: 5, amount: 1000, method: "Wave", time: "12 min" },
                { name: "Aminata D.", photos: 3, amount: 600, method: "Orange", time: "34 min" },
                { name: "Jean-Pierre", photos: 1, amount: 200, method: "MTN", time: "1h" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.photos}p — {s.method} — {s.time}</div></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4ADE80" }}>+{s.amount}F</div>
                </div>
              ))}
            </div>
          </div>
        </>}
        {tab === "photos" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h1 style={{ fontSize: m ? 20 : 24, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>Mes photos</h1>
            <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#E8593C", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}><Icon type="upload" size={16}/> Uploader</button>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={simulateUpload}/>
          </div>
          <div onDragOver={e => { e.preventDefault(); setUploadDrag(true); }} onDragLeave={() => setUploadDrag(false)} onDrop={e => { e.preventDefault(); setUploadDrag(false); simulateUpload(); }}
            style={{ border: `2px dashed ${uploadDrag ? "#E8593C" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: uploading ? "16px" : "28px", textAlign: "center", marginBottom: 16, background: uploadDrag ? "rgba(232,89,60,0.06)" : "rgba(255,255,255,0.02)", cursor: "pointer" }}
            onClick={() => !uploading && fileRef.current?.click()}>
            {uploading ? <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span>Upload...</span><span style={{ color: "#E8593C", fontWeight: 600 }}>{Math.min(Math.round(uploadProgress), 100)}%</span></div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(uploadProgress, 100)}%`, background: "#E8593C", borderRadius: 3, transition: "width 0.15s" }}/></div>
            </div> : <><div style={{ color: "rgba(255,255,255,0.3)" }}><Icon type="upload" size={22}/></div><div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>Glissez vos photos ici</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>JPG, PNG, RAW</div></>}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <button onClick={() => setPhotoFilter("all")} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, border: "none", cursor: "pointer", background: photoFilter === "all" ? "#E8593C" : "rgba(255,255,255,0.06)", color: photoFilter === "all" ? "#fff" : "rgba(255,255,255,0.5)" }}>Toutes ({DASHBOARD_PHOTOS.length})</button>
            {[...new Set(DASHBOARD_PHOTOS.map(p => p.event))].map(ev => (
              <button key={ev} onClick={() => setPhotoFilter(ev)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, border: "none", cursor: "pointer", background: photoFilter === ev ? "#E8593C" : "rgba(255,255,255,0.06)", color: photoFilter === ev ? "#fff" : "rgba(255,255,255,0.5)" }}>{ev.split(" ")[0]}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "repeat(3, 1fr)" : "repeat(auto-fill, minmax(130px, 1fr))", gap: 6 }}>
            {filteredPhotos.map(p => (
              <div key={p.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
                <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.6))" }}/>
                <div style={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 3 }}>
                  {p.sold && <span style={{ background: "rgba(74,222,128,0.2)", borderRadius: 4, padding: "1px 5px", fontSize: 9, color: "#4ADE80", fontWeight: 600 }}>Vendue</span>}
                  <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, padding: "1px 5px", fontSize: 9 }}>{p.faces}v.</span>
                </div>
              </div>
            ))}
          </div>
        </>}
        {tab === "events" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h1 style={{ fontSize: m ? 20 : 24, fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>Événements</h1>
            <button onClick={() => setShowNewEvent(!showNewEvent)} style={{ padding: "10px 18px", background: "#E8593C", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Nouveau</button>
          </div>
          {showNewEvent && (
            <div style={{ background: "rgba(232,89,60,0.06)", border: "1px solid rgba(232,89,60,0.2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: m ? "column" : "row", gap: 10, marginBottom: 12 }}>
                <input placeholder="Nom de l'événement" style={{ flex: 2, padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }}/>
                <input type="date" style={{ flex: 1, padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, outline: "none" }}/>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowNewEvent(false)} style={{ padding: "9px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}>Annuler</button>
                <button onClick={() => setShowNewEvent(false)} style={{ padding: "9px 16px", background: "#E8593C", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Créer</button>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 12 }}>
            {EVENTS.map(ev => (
              <div key={ev.id} onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)} style={{ background: "rgba(255,255,255,0.04)", border: selectedEvent === ev.id ? "1px solid rgba(232,89,60,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ position: "relative", height: m ? 110 : 130, overflow: "hidden" }}>
                  <img src={ev.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }}/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }}/>
                  <span style={{ position: "absolute", top: 8, right: 8, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: ev.status === "live" ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.15)", color: ev.status === "live" ? "#4ADE80" : "rgba(255,255,255,0.6)" }}>{ev.status === "live" ? "En cours" : "Terminé"}</span>
                  <div style={{ position: "absolute", bottom: 10, left: 12 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{ev.name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{ev.date}</div></div>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center" }}>
                    <div><div style={{ fontSize: 16, fontWeight: 700 }}>{ev.photos}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Photos</div></div>
                    <div><div style={{ fontSize: 16, fontWeight: 700 }}>{ev.sold}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Vendues</div></div>
                    <div><div style={{ fontSize: 16, fontWeight: 700, color: "#4ADE80" }}>{ev.revenue.toLocaleString()}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>FCFA</div></div>
                  </div>
                  {selectedEvent === ev.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ flex: 1, padding: "8px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer" }}>Copier lien</button>
                        <button style={{ flex: 1, padding: "8px 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 11, cursor: "pointer" }}>QR code</button>
                        <button onClick={e => { e.stopPropagation(); setTab("photos"); setPhotoFilter(ev.name); }} style={{ flex: 1, padding: "8px 0", background: "#E8593C", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Photos</button>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Lien : <span style={{ fontFamily: "monospace", color: "#E8593C" }}>fotokash.com/e/{ev.slug}</span></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

/* ============ APP ROUTER ============ */
export default function FotoKashApp() {
  const [page, setPage] = useState("landing");
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      {page === "landing" && <LandingPage navigate={setPage}/>}
      {page === "login" && <LoginPage navigate={setPage}/>}
      {page === "dashboard" && <DashboardPage navigate={setPage}/>}
      {page === "event" && <ClientEventPage navigate={setPage}/>}
    </div>
  );
}
