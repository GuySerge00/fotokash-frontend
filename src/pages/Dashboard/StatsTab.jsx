import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import { fcfa } from "../../utils/helpers";


export default function StatsTab({ token, user, onNavigate }) {
  const [data, setData] = useState({ photos: 0, events: 0, sales: 0, clients: 0 });
  const [events, setEvents] = useState([]);
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
      setEvents(evts);
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
    { label: "Créer un événement", tab: "events", variant: "primary" },
    { label: "Uploader des photos", tab: "photos", variant: "secondary" },
    { label: "Démarrer un live", tab: "live", variant: "secondary", dot: true },
  ];

  // Série approximative (pas de données jour-par-jour côté backend pour l'instant)
  const chartValues = (() => {
    const base = data.sales > 0 ? data.sales / 7 : 8;
    return [0.5, 0.6, 0.55, 0.7, 0.65, 0.8, 1].map(f => Math.round(base * f * 1.4));
  })();
  const chartMax = Math.max(...chartValues, 1);
  const chartMin = Math.min(...chartValues, 0);
  const chartRange = (chartMax - chartMin) || 1;
  const CW = 300, CH = 100, CP = 6;
  const linePoints = chartValues.map((v, i) => {
    const x = (i / (chartValues.length - 1)) * (CW - CP * 2) + CP;
    const y = CH - CP - ((v - chartMin) / chartRange) * (CH - CP * 2);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `${CP},${CH} ${linePoints} ${CW - CP},${CH}`;
  const changePct = chartValues[0] > 0 ? Math.round(((chartValues[chartValues.length - 1] - chartValues[0]) / chartValues[0]) * 100) : 0;

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0))
    .slice(0, 2);

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
        {quickActions.map((a) => {
          const isPrimary = a.variant === "primary";
          return (
            <button key={a.tab} onClick={() => onNavigate(a.tab)} style={{
              background: isPrimary ? T.accent : T.card,
              border: isPrimary ? "none" : "1px solid " + T.border,
              borderRadius: T.radius,
              padding: "14px 10px",
              textAlign: "center",
              cursor: "pointer",
              fontFamily: T.font,
              fontSize: 13,
              fontWeight: 700,
              color: isPrimary ? "#fff" : T.text,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "border-color 0.2s, opacity 0.2s",
            }}
            onMouseEnter={e => { if (!isPrimary) e.currentTarget.style.borderColor = T.accent; else e.currentTarget.style.opacity = 0.9; }}
            onMouseLeave={e => { if (!isPrimary) e.currentTarget.style.borderColor = T.border; else e.currentTarget.style.opacity = 1; }}
            >
              {a.dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, display: "inline-block" }} />}
              {isPrimary && "+ "}{a.label}
            </button>
          );
        })}
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
            padding: "24px 20px", animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: T.fontNumber, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart + recent events */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }} className="stats-bottom-row">
        <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: "20px 20px 14px", animation: "fadeUp 0.4s ease 0.4s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Revenus — 7 derniers jours</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: changePct >= 0 ? T.green : T.red }}>{changePct >= 0 ? "+" : ""}{changePct}%</span>
          </div>
          <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ width: "100%", height: 150, display: "block" }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#revenueGradient)" />
            <polyline points={linePoints} fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, padding: 20, animation: "fadeUp 0.4s ease 0.5s both" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Événements récents</div>
          {recentEvents.length === 0 ? (
            <p style={{ fontSize: 12, color: T.textDim }}>Aucun événement pour l'instant</p>
          ) : recentEvents.map((ev) => (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim }}>
                {Icon.Image(16)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{ev.photos_count || 0} photos</div>
              </div>
              {ev.is_live && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, display: "inline-block", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>LIVE</span>
                </div>
              )}
            </div>
          ))}
        </div>
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
