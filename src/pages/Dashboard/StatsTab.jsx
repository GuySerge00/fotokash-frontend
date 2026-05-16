import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import { fcfa } from "../../utils/helpers";


export default function StatsTab({ token, user, onNavigate }) {
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



