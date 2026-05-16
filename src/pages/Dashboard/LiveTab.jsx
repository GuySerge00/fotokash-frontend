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


