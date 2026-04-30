import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "/api";

const T = {
  accent: "#E8593C",
  accentDim: "rgba(232,89,60,0.12)",
  bg: "#0B0B0F",
  card: "#141419",
  cardAlt: "#1A1A22",
  border: "rgba(255,255,255,0.06)",
  text: "#F0F0F5",
  textMuted: "#8888A0",
  textDim: "#555568",
  green: "#4ADE80",
  red: "#EF4444",
  radius: 14,
  radiusSm: 10,
  font: "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export default function LiveEventPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [visitorId, setVisitorId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [pricing, setPricing] = useState({ price1: 200, price6: 500, price10: 1000 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("orange");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetch(API + "/live/" + slug)
      .then((r) => r.json())
      .then((d) => { var evt = d.event || null; setEvent(evt); if (evt) setMobileMoneyEnabled(evt.mobile_money_enabled || false); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(API + "/photos/pricing").then(r => r.json()).then(d => setPricing(d)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (visitorId && event && event.is_live) {
      pollRef.current = setInterval(() => {
        setRefreshing(true);
        fetch(API + "/live/" + slug + "/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitor_id: visitorId }),
        })
          .then((r) => r.json())
          .then((d) => { if (d.matches) { setMatches(d.matches); setLastRefresh(new Date()); } })
          .catch(() => {})
          .finally(() => setRefreshing(false));
      }, 30000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visitorId, event, slug]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Impossible d'acceder a la camera.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
    setShowCamera(false);
  };

  const takeSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setSearching(true);
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    try {
      const res = await fetch(API + "/live/" + slug + "/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfie: base64 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(data.matches || []);
        setVisitorId(data.visitor_id);
        setLastRefresh(new Date());
        stopCamera();
      } else {
        alert(data.error || "Aucun visage detecte.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    } finally {
      setSearching(false);
    }
  };

  const togglePhoto = (id) => {
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const getPrice = () => {
    const n = selectedPhotos.length;
    if (n === 0) return 0;
    if (n <= 1) return pricing.price1;
    if (n <= 6) return pricing.price6;
    return pricing.price10;
  };

  const handleFreeDownload = async () => {
    for (const photoId of selectedPhotos) {
      const match = matches.find(m => m.id === photoId);
      if (match && match.original_url) {
        try {
          const response = await fetch(match.original_url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "fotokash-" + photoId + ".jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (err) { console.error("Erreur telechargement:", err); }
      }
    }
    alert("Telechargement termine !");
    setSelectedPhotos([]);
  };
  const submitPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) { alert("Numero invalide."); return; }
    setPaymentLoading(true);
    try {
      const res = await fetch(API + "/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, photo_ids: selectedPhotos, amount: getPrice(), phone: phoneNumber, provider: paymentProvider }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Paiement initie ! Validez sur votre telephone.");
        setShowPaymentModal(false);
        setSelectedPhotos([]);
      } else { alert(data.error || "Erreur paiement."); }
    } catch (err) { alert("Erreur de connexion."); }
    finally { setPaymentLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontFamily: T.font }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid " + T.border, borderTopColor: T.accent, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        Chargement...
      </div>
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontFamily: T.font }}>
      Evenement introuvable.
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <header style={{ padding: "16px 20px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>FK</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>
        </div>
        {event.is_live && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
            En direct
          </div>
        )}
      </header>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{event.name}</h1>
          <p style={{ color: T.textMuted, fontSize: 13 }}>
            {event.photographer_name && <span>Par {event.photographer_name}</span>}
            {event.date && <span> - {new Date(event.date).toLocaleDateString("fr-FR")}</span>}
          </p>
          <p style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>{event.photos_count || 0} photos disponibles</p>
        </div>

        {matches.length === 0 && !showCamera && !visitorId && (
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "32px 20px", textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Retrouvez vos photos</h2>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Prenez un selfie pour trouver toutes les photos ou vous apparaissez</p>
            <div style={{ width: 120, height: 120, borderRadius: "50%", border: "3px dashed " + T.accent, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M6 21v-1a6 6 0 0112 0v1"/></svg>
            </div>
            <button onClick={startCamera} style={{ background: T.accent, color: "#fff", border: "none", padding: "14px 32px", borderRadius: T.radiusSm, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: T.font }}>Prendre un selfie</button>
            {event.is_live && (
              <p style={{ color: T.textDim, fontSize: 11, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite", display: "inline-block" }}></span>
                Actualisation auto toutes les 30s
              </p>
            )}
          </div>
        )}
        {matches.length === 0 && !showCamera && visitorId && (
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "32px 20px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid " + T.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid " + T.border, borderTopColor: T.accent, animation: "spin 1s linear infinite" }}></div>
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>En attente de photos...</h2>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>Le photographe n a pas encore publie de photos correspondant a votre visage.</p>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Restez sur cette page, vos photos apparaitront automatiquement !</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite", display: "inline-block" }}></span>
              <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>Recherche active - actualisation toutes les 30s</span>
            </div>
            {refreshing && <p style={{ color: T.accent, fontSize: 11 }}>Recherche en cours...</p>}
            {lastRefresh && <p style={{ color: T.textDim, fontSize: 11, marginTop: 4 }}>Derniere verification : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>}
            <button onClick={startCamera} style={{ background: T.cardAlt, color: T.textMuted, border: "1px solid " + T.border, padding: "10px 20px", borderRadius: T.radiusSm, fontSize: 13, cursor: "pointer", fontFamily: T.font, marginTop: 16 }}>Reprendre un selfie</button>
          </div>
        )}

        {showCamera && (
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: 20, textAlign: "center", marginBottom: 20 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", maxWidth: 300, borderRadius: T.radiusSm, marginBottom: 16 }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={takeSelfie} disabled={searching} style={{ background: T.accent, color: "#fff", border: "none", padding: "12px 28px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font, opacity: searching ? 0.5 : 1 }}>
                {searching ? "Recherche..." : "Prendre le selfie"}
              </button>
              <button onClick={stopCamera} style={{ background: T.cardAlt, color: T.textMuted, border: "1px solid " + T.border, padding: "12px 20px", borderRadius: T.radiusSm, fontSize: 14, cursor: "pointer", fontFamily: T.font }}>Annuler</button>
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{matches.length} photo{matches.length > 1 ? "s" : ""} trouvee{matches.length > 1 ? "s" : ""}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {refreshing && <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid " + T.border, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />}
                {lastRefresh && <span style={{ fontSize: 11, color: T.textDim }}>MAJ {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {matches.map((m) => (
                <div key={m.id} onClick={() => togglePhoto(m.id)} style={{ position: "relative", borderRadius: T.radiusSm, overflow: "hidden", cursor: "pointer", aspectRatio: "1", border: "2px solid " + (selectedPhotos.includes(m.id) ? T.accent : "transparent") }}>
                  <img src={m.watermarked_url || m.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", top: 4, right: 4, background: T.green, color: "#000", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>{Math.round(m.similarity * 100)}%</div>
                  {selectedPhotos.includes(m.id) && (
                    <div style={{ position: "absolute", top: 4, left: 4, width: 22, height: 22, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 6px 4px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                    <span style={{ fontSize: 10, color: "#fff" }}>200 F</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={startCamera} style={{ width: "100%", padding: "10px", borderRadius: T.radiusSm, background: T.cardAlt, border: "1px solid " + T.border, color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: T.font, marginBottom: 20 }}>
              Reprendre un selfie
            </button>
            {selectedPhotos.length > 0 && (
              <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: "1px solid " + T.border, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</span>
                  {mobileMoneyEnabled && <span style={{ color: T.accent, fontWeight: 700, marginLeft: 10, fontFamily: T.fontDisplay, fontSize: 18 }}>{fcfa(getPrice())}</span>}
                </div>
                {mobileMoneyEnabled ? (
                  <button onClick={() => setShowPaymentModal(true)} style={{ background: T.accent, color: "#fff", border: "none", padding: "10px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Payer</button>
                ) : (
                  <button onClick={handleFreeDownload} style={{ background: T.green, color: "#000", border: "none", padding: "10px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Telecharger en HD</button>
                )}
              </div>
            )}
          </>
        )}

        {event.photographer_phone && (
          <div style={{ textAlign: "center", marginTop: 20, marginBottom: 80 }}>
            <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ color: T.textMuted, fontSize: 12, textDecoration: "underline" }}>
              Contacter le photographe via WhatsApp
            </a>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Paiement Mobile Money</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>{selectedPhotos.length} photo(s) - {fcfa(getPrice())}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{id: "orange", label: "Orange Money"}, {id: "mtn", label: "MTN MoMo"}, {id: "wave", label: "Wave"}].map((p) => (
                <button key={p.id} onClick={() => setPaymentProvider(p.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: T.radiusSm, fontSize: 12, fontWeight: 600, cursor: "pointer", background: paymentProvider === p.id ? T.accentDim : T.cardAlt, border: "1px solid " + (paymentProvider === p.id ? T.accent : T.border), color: paymentProvider === p.id ? T.accent : T.textMuted, fontFamily: T.font }}>{p.label}</button>
              ))}
            </div>
            <input type="tel" placeholder="Numero (ex: 0700000000)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: T.radiusSm, border: "1px solid " + T.border, background: T.bg, color: T.text, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", fontFamily: T.font }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={submitPayment} disabled={paymentLoading} style={{ flex: 1, background: T.accent, color: "#fff", border: "none", padding: "12px 0", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font, opacity: paymentLoading ? 0.5 : 1 }}>{paymentLoading ? "Envoi..." : "Confirmer"}</button>
              <button onClick={() => setShowPaymentModal(false)} style={{ padding: "12px 16px", borderRadius: T.radiusSm, background: "transparent", border: "1px solid " + T.border, color: T.textMuted, cursor: "pointer", fontFamily: T.font }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
