import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import StatsTab from "./StatsTab";
import PhotosTab from "./PhotosTab";
import LiveTab from "./LiveTab";
import EventsTab from "./EventsTab";
import AccountTab from "./AccountTab";
import SubscriptionTab from "./SubscriptionTab";
import EarningsTab from "./EarningsTab";
import OnboardingTour from "../../components/OnboardingTour";


export default function Dashboard({ user: initialUser, token, onNavigate, onLogout, initialTab }) {
  const [user, setUser] = useState(initialUser);
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    if (user && !user.has_seen_onboarding) setShowTour(true);
  }, [user]);
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
    { id: "earnings", label: "Revenus",    icon: Icon.Coins(16) },
    { id: "subscription", label: "Abonnement", icon: Icon.CreditCard(16) },
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
      <header className="header-main" style={{
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

        <div className="desktop-header-extras" style={{ display: "flex", alignItems: "center", gap: 16 }}>
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

        <button className="mobile-logout-btn" onClick={onLogout} style={{
          background: "none", border: "none", color: T.textMuted,
          cursor: "pointer", display: "none", alignItems: "center",
          fontSize: 12, padding: 6,
        }}>
          {Icon.LogOut(18)}
        </button>
      </header>

      {/* Tab bar */}
      <div className="desktop-tab-bar" style={{
        display: "flex", gap: 4, padding: "12px 28px",
        borderBottom: `1px solid ${T.border}`, background: T.card,
        overflowX: "auto",
      }}>
        {tabs.map((t) => (
          <button key={t.id} data-tour={t.id === "earnings" ? "earnings-tab" : undefined} onClick={() => { setTab(t.id); onNavigate("dashboard", { tab: t.id }); }} style={{
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
      <div className="dashboard-content" style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "stats"   && <StatsTab token={token} user={user} onNavigate={(t) => { setTab(t); onNavigate("dashboard", { tab: t }); }} />}
        {tab === "photos"  && <PhotosTab token={token} events={events} setEvents={setEvents} />}
        {tab === "live"    && <LiveTab token={token} events={events} onNavigate={onNavigate} setEvents={setEvents} />}
        {tab === "events"  && <EventsTab token={token} events={events} setEvents={setEvents} loading={loadingEvents} onNavigate={onNavigate} />}
        {tab === "earnings" && <EarningsTab token={token} />}
        {tab === "subscription" && <SubscriptionTab token={token} user={user} onUserUpdate={setUser} />}
        {tab === "account" && <AccountTab token={token} user={user} onUserUpdate={setUser} />}
      </div>
      {/* BOTTOM NAV MOBILE */}
      <div className="mobile-bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: T.card, borderTop: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 20px", zIndex: 100,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); onNavigate("dashboard", { tab: t.id }); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 12px", position: "relative", fontFamily: T.font,
            }}>
              <div style={{ color: isActive ? T.accent : T.textMuted, transition: "color 0.2s" }}>{t.icon}</div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? T.accent : T.textMuted, transition: "color 0.2s" }}>{t.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent, marginTop: -1 }} />}
              {t.badge > 0 && <div style={{ position: "absolute", top: 0, right: 6, width: 14, height: 14, borderRadius: "50%", background: T.red, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</div>}
            </button>
          );
        })}
      </div>
      <OnboardingTour isOpen={showTour} onComplete={() => setShowTour(false)} onNeedTab={setTab} />
    </div>
  );
}



