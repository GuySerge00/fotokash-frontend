import { useState, useEffect, useRef } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import { Btn } from "../../components/Btn";
import { fcfa } from "../../utils/helpers";

export default function LiveTab({ token, events, onNavigate, setEvents }) {
  const [liveEvent, setLiveEvent] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [uploadingLive, setUploadingLive] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('fotokash_live_sound') === 'true');
  const [activityHistory, setActivityHistory] = useState([0,0,0,0,0,0,0]);
  const [prevVisitorCount, setPrevVisitorCount] = useState(0);
  const liveUploadRef = useRef(null);
  const pollRef = useRef(null);

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
        .then(d => {
          setDashData(d);
          setLastUpdated(new Date());
          const vc = d?.stats?.visitors_count || 0;
          const newVisitors = vc - prevVisitorCount;
          setPrevVisitorCount(vc);
          setActivityHistory(prev => [...prev.slice(1), prevVisitorCount > 0 ? newVisitors : 0]);
        })
        .catch(() => {});
    };
    fetchDash();
    pollRef.current = setInterval(fetchDash, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [liveEvent, token]);

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
    if (diff < 5) return "a l'instant";
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
      <p style={{ color: T.textMuted, fontSize: 14 }}>Activez le mode live sur un evenement depuis l'onglet Evenements</p>
    </div>
  );

  const stats = dashData?.stats || { photos_count: 0, visitors_count: 0, matches_count: 0, purchases_count: 0, revenue: 0 };
  const visitors = dashData?.visitors || [];
  const liveUrl = "https://fotokash.com/live/" + liveEvent.slug;
  const qrUrlSmall = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(liveUrl);
  const qrUrlLarge = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" + encodeURIComponent(liveUrl);
  const maxActivity = Math.max(...activityHistory, 1);
  const matchRatio = stats.visitors_count > 0 ? (stats.matches_count / stats.visitors_count).toFixed(1) : "0";

  const kpiItems = [
    { label: "Photos", value: stats.photos_count, sub: null, icon: Icon.Image(16), color: T.accent, bg: T.accent + "18" },
    { label: "Visiteurs", value: stats.visitors_count, sub: null, icon: Icon.Users(16), color: T.gold, bg: T.gold + "18" },
    { label: "Matches", value: stats.matches_count, sub: matchRatio + " par visiteur", icon: Icon.Search(16), color: T.green, bg: T.green + "18" },
    { label: "Achats", value: stats.purchases_count, sub: stats.revenue > 0 ? fcfa(stats.revenue) : null, icon: Icon.CreditCard(16), color: "#818CF8", bg: "rgba(129,140,248,0.1)" },
  ];

  return (
    <div>
      {showStopConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: "28px 28px 24px", maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ color: T.red, marginBottom: 12 }}>{Icon.AlertCircle(32)}</div>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Arreter le live ?</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Les invites ne pourront plus acceder a la page. Cette action est irreversible.</p>
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
          <p style={{ color: T.textMuted, fontSize: 12, marginTop: 8 }}>Tapez n'importe ou pour fermer</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700 }}>{liveEvent.name}</h2>
            <span style={{ background: T.accent, color: "#fff", fontSize: 11, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.font }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite", display: "inline-block" }}></span> En direct
            </span>
          </div>
          <p style={{ color: T.textMuted, fontSize: 12 }}>Mis a jour {lastUpdatedStr()}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accentDim, border: "1px solid rgba(232,89,60,0.3)", borderRadius: T.radiusSm, padding: "7px 14px", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>
            <input ref={liveUploadRef} type="file" accept="image/*" multiple onChange={handleLiveUpload} style={{ display: "none" }} />
            {Icon.Upload(14)} {uploadingLive ? (uploadDone + " envoyee" + (uploadDone > 1 ? "s" : "") + "...") : "Ajouter photos"}
          </label>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: soundEnabled ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
            border: "1px solid " + (soundEnabled ? "rgba(74,222,128,0.3)" : T.border),
            borderRadius: T.radiusSm, padding: "7px 14px", color: soundEnabled ? T.green : T.textMuted,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
          }}>{Icon.Phone(14)} {soundEnabled ? "Sons actifs" : "Sons off"}</button>
          <button onClick={() => setShowStopConfirm(true)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: T.radiusSm, padding: "7px 14px", color: T.red,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
          }}>{Icon.X(12)} Arreter</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {kpiItems.map((s, i) => (
          <div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, color: s.color, transition: "all 0.3s ease" }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 11, color: T.green, fontWeight: 600, marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Activite (temps reel)</span>
            <span style={{ fontSize: 11, color: T.textDim }}>Polling 5s</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {activityHistory.map((val, i) => {
              const pct = maxActivity > 0 ? Math.max((val / maxActivity) * 100, 4) : 4;
              const opacity = 0.15 + (i / activityHistory.length) * 0.85;
              return (<div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", height: pct + "%", background: T.accent, opacity: opacity, transition: "height 0.5s ease" }} />);
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: T.textDim }}>-30s</span>
            <span style={{ fontSize: 10, color: T.textDim }}>maintenant</span>
          </div>
        </div>

        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>QR code</span>
            <button onClick={() => { const link = document.createElement("a"); link.href = qrUrlSmall; link.download = "FotoKash-QR-" + liveEvent.slug + ".png"; link.click(); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, borderRadius: 6, padding: "4px 10px", color: T.textMuted, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: T.font }}>{Icon.ArrowRight(12)} Telecharger</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 8, padding: 8, flexShrink: 0, cursor: "pointer" }} onClick={() => setShowQrModal(true)}>
              <img src={qrUrlSmall} alt="QR Code" style={{ width: 72, height: 72, display: "block" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, color: T.accent, fontWeight: 600, marginBottom: 8, wordBreak: "break-all" }}>{liveUrl}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { navigator.clipboard.writeText(liveUrl); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, borderRadius: 6, padding: "4px 10px", color: T.textMuted, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: T.font }}>{Icon.Check(10)} Copier</button>
                <a href={"https://wa.me/?text=" + encodeURIComponent("Retrouvez vos photos : " + liveUrl)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(37,209,102,0.12)", border: "none", borderRadius: 6, padding: "4px 10px", color: "#25D366", fontSize: 11, fontWeight: 500, textDecoration: "none", cursor: "pointer", fontFamily: T.font }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L0 24l6.335-1.508C8.07 23.453 10.003 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.677-.502-5.218-1.378l-.374-.221-3.762.895.952-3.685-.243-.388A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  WhatsApp
                </a>
                <button onClick={() => setShowQrModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, borderRadius: 6, padding: "4px 10px", color: T.textMuted, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: T.font }}>{Icon.Search(10)} Plein ecran</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Visiteurs en temps reel</span>
          <span style={{ fontSize: 11, color: T.textDim }}>{visitors.length} au total</span>
        </div>
        {visitors.length === 0 ? (
          <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Aucun visiteur pour le moment</p>
        ) : (
          <div>
            {visitors.map((v, i) => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < visitors.length - 1 ? "1px solid " + T.border : "none", animation: i === 0 ? "slideDown 0.3s ease" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 12, fontWeight: 600 }}>{"#" + v.visitor_number}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{"Visiteur #" + v.visitor_number}</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>{timeAgo(v.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ background: "rgba(74,222,128,0.12)", color: T.green, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{v.matched_count + " trouvee" + (v.matched_count !== 1 ? "s" : "")}</div>
                  {v.purchased_count > 0 && (
                    <div style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>{v.purchased_count + " achetee" + (v.purchased_count !== 1 ? "s" : "")}</div>
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
