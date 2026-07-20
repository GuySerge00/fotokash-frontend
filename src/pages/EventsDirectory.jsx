import { useState, useEffect } from "react";
import { T, API } from "../utils/tokens";
import { Icon } from "../utils/icons";

const styles = `
.evd-cover-wrap { overflow: hidden; }
.evd-cover-img {
  transition: transform 500ms ease;
  width: 100%; height: 100%;
  background-size: cover; background-position: center;
}
.evd-featured:hover .evd-cover-img { transform: scale(1.05); }
.evd-card { transition: border-color 200ms ease, background 200ms ease; }
.evd-card:hover { border-color: ${'#3a3a44'}; background: #16161a; }
.evd-cta { transition: opacity 150ms ease; }
.evd-cta:hover { opacity: 0.92; }
.evd-chip { transition: all 150ms ease; }
`;

export default function EventsDirectory({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(API + "/events/public?search=" + encodeURIComponent(search), { signal: ctrl.signal })
        .then(r => r.json())
        .then(d => { setEvents(d.events || []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [search]);

  const openEvent = (ev) => onNavigate(ev.is_live ? "live" : "client", { slug: ev.slug });
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "";

  const daysSince = (d) => d ? (Date.now() - new Date(d).getTime()) / 86400000 : Infinity;
  const isNew = (ev) => daysSince(ev.created_at) <= 7;
  const isThisWeek = (ev) => daysSince(ev.date) <= 7 || daysSince(ev.live_started_at) <= 7 || daysSince(ev.created_at) <= 7;

  const filtered = events.filter(ev => {
    if (filter === "live") return ev.is_live;
    if (filter === "week") return isThisWeek(ev);
    return true;
  });

  const [featured, ...rest] = filtered;

  const chip = (id, label, active) => (
    <span onClick={() => setFilter(id)} className="evd-chip"
      style={{ fontSize: 13, cursor: "pointer", padding: "7px 16px", borderRadius: 20,
        fontWeight: active ? 600 : 400,
        border: active ? "none" : `0.5px solid ${T.border}`,
        background: active ? T.accent : "transparent",
        color: active ? "#fff" : T.textMuted }}>
      {label}
    </span>
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: "flex", alignItems: "center",
           padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
           position: "sticky", top: 0, zIndex: 50,
           background: T.bg || "#0f0f12", backdropFilter: "blur(8px)" }}>
        <div onClick={() => onNavigate("landing")}
             style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent,
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {Icon.Camera(20)}
          </div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 60px" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Retrouvez vos photos
          </h1>
          <p style={{ color: T.textMuted, fontSize: 15, margin: 0 }}>
            Cherchez votre événement ci-dessous — votre visage nous dira le reste.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                      background: "#fff", borderRadius: 14, padding: "14px 18px" }}>
          <span style={{ color: "#999", display: "flex" }}>{Icon.Search(19)}</span>
          <input
            type="text"
            placeholder="Rechercher un événement, un lieu…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                     fontSize: 15, color: "#111" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
          {chip("all", "Tout", filter === "all")}
          {chip("live", "En direct", filter === "live")}
          {chip("week", "Cette semaine", filter === "week")}
        </div>

        {loading && <p style={{ color: T.textMuted, textAlign: "center" }}>Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <p style={{ color: T.textMuted, textAlign: "center", padding: "40px 0" }}>
            Aucun événement pour ce filtre.
          </p>
        )}

        {!loading && featured && (
          <>
            <div onClick={() => openEvent(featured)} className="evd-featured"
                 style={{ cursor: "pointer", borderRadius: 18, overflow: "hidden",
                          border: `1px solid ${T.border}`, marginBottom: 14 }}>
              <div className="evd-cover-wrap" style={{ height: 280, position: "relative" }}>
                <div className="evd-cover-img" style={{
                  background: featured.cover_url
                    ? `#222 url(${featured.cover_url}) center/cover` : "#2a2a30" }} />
                {featured.is_live && (
                  <span style={{ position: "absolute", top: 16, left: 16, background: T.accent,
                                 color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 14px",
                                 borderRadius: 20, letterSpacing: "0.05em", zIndex: 2 }}>
                    EN DIRECT
                  </span>
                )}
                <span style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)",
                               color: "#fff", fontSize: 12, padding: "6px 14px", borderRadius: 20,
                               display: "inline-flex", alignItems: "center", gap: 6, zIndex: 2 }}>
                  {Icon.Camera(13)} {featured.photos_count || 0} photos
                </span>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 130,
                              background: "linear-gradient(transparent, rgba(0,0,0,0.9))", zIndex: 1 }} />
                <div style={{ position: "absolute", bottom: 20, left: 22, right: 22, zIndex: 2 }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px",
                              letterSpacing: "-0.01em" }}>{featured.name}</p>
                  <p style={{ fontSize: 14, color: "#e0e0e6", margin: 0 }}>
                    {fmtDate(featured.date)}{featured.location ? " · " + featured.location : ""}
                  </p>
                </div>
              </div>
            </div>

            <div onClick={() => openEvent(featured)} className="evd-cta"
                 style={{ background: T.accent, color: "#fff", padding: "18px 22px",
                          borderRadius: 14, cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "space-between",
                          marginBottom: 40, fontWeight: 600 }}>
              <span style={{ fontSize: 14 }}>Cherchez votre visage dans « {featured.name} »</span>
              <span style={{ fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                Voir les photos {Icon.ArrowRight(16)}
              </span>
            </div>
          </>
        )}

        {!loading && rest.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase",
                        letterSpacing: "0.08em", margin: "0 0 14px" }}>Autres événements</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rest.map(ev => (
                <div key={ev.id} onClick={() => openEvent(ev)} className="evd-card"
                     style={{ display: "flex", alignItems: "center", gap: 14, padding: 14,
                              border: `0.5px solid ${T.border}`, borderRadius: 14, cursor: "pointer" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                                background: ev.cover_url
                                  ? `#222 url(${ev.cover_url}) center/cover` : "#2a2a30" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 3px",
                                display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ev.name}
                      {isNew(ev) && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.accent,
                                       background: T.accent + "22", padding: "2px 8px",
                                       borderRadius: 10, letterSpacing: "0.05em" }}>NOUVEAU</span>
                      )}
                    </p>
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0,
                                display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span>{fmtDate(ev.date)}</span>
                      <span style={{ color: "#44444a" }}>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {Icon.Camera(12)} {ev.photos_count || 0} photos
                      </span>
                    </p>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%",
                                background: T.accent + "22", display: "flex",
                                alignItems: "center", justifyContent: "center", color: T.accent }}>
                    {Icon.ArrowRight(15)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
