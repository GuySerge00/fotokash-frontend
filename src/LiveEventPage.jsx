import { useState, useRef, useEffect, useCallback } from "react";
import PaymentStatusModal from "./components/PaymentStatusModal";

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
  gold: "#F59E0B",
  radius: 14,
  radiusSm: 10,
  font: "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
    osc1.type = "sine"; osc2.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc1.start(ctx.currentTime); osc2.start(ctx.currentTime + 0.12);
    osc1.stop(ctx.currentTime + 0.45); osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

function vibrateDevice() {
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
}

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
  const [pricing, setPricing] = useState({ price1: 200, price3: 500, price5: 1000 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("orange");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(false);
  const [newPhotosNotif, setNewPhotosNotif] = useState(null);
  const [newPhotoIds, setNewPhotoIds] = useState(new Set());
  // Nouvelles features
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // photo en plein écran
  const [paymentSuccess, setPaymentSuccess] = useState(false); // écran succès
  const [unlockedPhotos, setUnlockedPhotos] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [showPricingInfo, setShowPricingInfo] = useState(false); // tarifs dégressifs
  const notifTimerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pollRef = useRef(null);
  const paymentPopupRef = useRef(null);
  const [paymentTx, setPaymentTx] = useState(null);
  const matchesRef = useRef([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const txParam = urlParams.get("tx");
    const paymentResult = urlParams.get("payment");
    if (txParam) {
      fetch(API + "/payments/" + txParam + "/status")
        .then((r) => r.json())
        .then((d) => {
          if (d.transaction) {
            setPaymentTx({ transactionId: d.transaction.id, amount: d.transaction.amount });
          }
        })
        .catch(() => {});
      window.history.replaceState({}, "", window.location.pathname);
      if (window.opener && paymentResult === "success") {
        setTimeout(function() {
          window.close();
        }, 3000);
      }
    }
  }, []);

  useEffect(() => {
    fetch(API + "/live/" + slug)
      .then((r) => r.json())
      .then((d) => {
        var evt = d.event || null;
        setEvent(evt);
        if (evt) setMobileMoneyEnabled(evt.mobile_money_enabled || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch(API + "/photos/pricing").then(r => r.json()).then(d => setPricing(d)).catch(() => {});
  }, [slug]);

  useEffect(() => { matchesRef.current = matches; }, [matches]);

  const doRefresh = useCallback(() => {
    if (!visitorId) return;
    setRefreshing(true);
    fetch(API + "/live/" + slug + "/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: visitorId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.matches) {
          const prev = matchesRef.current;
          const prevIds = new Set(prev.map(m => m.id));
          const incoming = d.matches;
          const freshOnes = incoming.filter(m => !prevIds.has(m.id));
          if (freshOnes.length > 0) {
            playNotificationSound();
            vibrateDevice();
            const freshIds = new Set(freshOnes.map(m => m.id));
            setNewPhotoIds(freshIds);
            setNewPhotosNotif({ count: freshOnes.length });
            if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
            notifTimerRef.current = setTimeout(() => {
              setNewPhotosNotif(null);
              setNewPhotoIds(new Set());
            }, 4000);
          }
          setMatches(incoming);
          setLastRefresh(new Date());
          setUnlockedPhotos(function(prev) {
            var next = Object.assign({}, prev);
            incoming.forEach(function(m) {
              if (m.purchased && m.transaction_id) next[m.id] = m.transaction_id;
            });
            return next;
          });
        }
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [visitorId, slug]);

  useEffect(() => {
    if (visitorId && event && event.is_live) {
      pollRef.current = setInterval(doRefresh, 10000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [visitorId, event, slug, doRefresh]);

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
        setUnlockedPhotos(function(prev) {
          var next = Object.assign({}, prev);
          (data.matches || []).forEach(function(m) {
            if (m.purchased && m.transaction_id) next[m.id] = m.transaction_id;
          });
          return next;
        });
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

  const selectAll = () => {
    if (selectedPhotos.length === matches.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(matches.map(m => m.id));
    }
  };

  const getPrice = () => {
    const n = selectedPhotos.length;
    if (n === 0) return 0;
    if (n >= 5) return pricing.price5;
    if (n >= 3) return pricing.price3;
    return n * pricing.price1;
  };

  // Libellé du pack actif
  const getPackLabel = () => {
    const n = selectedPhotos.length;
    if (n === 0) return null;
    if (n === 1) return null;
    if (n <= 4) return `Pack jusqu'à 4 photos`;
    return `Pack 5+ photos`;
  };

  // Prix effectif par photo
  const getPricePerPhoto = () => {
    const n = selectedPhotos.length;
    if (n === 0) return pricing.price1;
    return Math.round(getPrice() / n);
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
    // Ouverture de la popup AVANT le await, sinon les navigateurs la bloquent
    const popup = window.open('', 'fotokash_payment', 'width=480,height=720');
    paymentPopupRef.current = popup;

    setPaymentLoading(true);
    try {
      const res = await fetch(API + "/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: event.id, photo_ids: selectedPhotos, amount: getPrice(), phone_number: phoneNumber, payment_method: paymentProvider, context: "live" }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.payment_url) {
          if (popup && !popup.closed) {
            popup.location.href = data.payment_url;
          } else {
            window.open(data.payment_url, '_blank');
          }
        } else if (popup && !popup.closed) {
          popup.close();
        }
        setShowPaymentModal(false);
        setPaymentTx({ transactionId: data.transaction_id, amount: data.amount });
      } else {
        if (popup && !popup.closed) popup.close();
        alert(data.error || "Erreur paiement.");
      }
    } catch (err) {
      if (paymentPopupRef.current && !paymentPopupRef.current.closed) paymentPopupRef.current.close();
      alert("Erreur de connexion.");
    }
    finally { setPaymentLoading(false); }
  };

  const closePaymentPopup = () => {
    if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
      paymentPopupRef.current.close();
    }
  };

  const handlePaymentSuccess = (tx) => {
    closePaymentPopup();
    setPaymentTx(null);
    setSelectedPhotos([]);
    if (tx && tx.photos_purchased) {
      setUnlockedPhotos(function(prev) {
        var next = Object.assign({}, prev);
        tx.photos_purchased.forEach(function(id) { next[id] = tx.id; });
        return next;
      });
    }
    setPaymentSuccess(true); // ecran succes plein ecran existant
  };

  const handleDownloadAllPurchased = async () => {
    const purchasedIds = Object.keys(unlockedPhotos);
    if (purchasedIds.length === 0) return;
    setDownloadingAll(true);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    try {
      for (const photoId of purchasedIds) {
        try {
          const res = await fetch(API + "/photos/" + photoId + "/download?transaction_id=" + unlockedPhotos[photoId]);
          const data = await res.json();
          if (!res.ok || !data.download_url) continue;
          const blob = await fetch(data.download_url).then((r) => r.blob());
          if (isIOS && navigator.share) {
            const file = new File([blob], "fotokash-" + photoId + ".jpg", { type: blob.type });
            await navigator.share({ files: [file] });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "fotokash-" + photoId + ".jpg";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }
        } catch (err) { console.error("Erreur telechargement photo " + photoId + ":", err); }
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const handlePaymentClose = () => {
    closePaymentPopup();
    setPaymentTx(null);
  };

  const shareLink = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event?.name || "FotoKash", text: "Retrouve tes photos de l'evenement !", url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien copie !");
    }
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

  // ═══ ÉCRAN SUCCÈS PAIEMENT ═══
  if (paymentSuccess) return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } } @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }`}</style>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "3px solid " + T.green, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.5s ease" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Paiement initie !</h2>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 8 }}>Validez la demande de paiement sur votre telephone.</p>
        <p style={{ color: T.textDim, fontSize: 13, marginBottom: 28 }}>Une fois confirme, vos photos HD seront disponibles au telechargement.</p>
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Evenement</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{event.name}</p>
        </div>
        <button onClick={handleDownloadAllPurchased} disabled={downloadingAll} style={{ background: T.accent, color: "#fff", border: "none", padding: "14px 32px", borderRadius: T.radiusSm, fontSize: 15, fontWeight: 600, cursor: downloadingAll ? "default" : "pointer", width: "100%", fontFamily: T.font, opacity: downloadingAll ? 0.7 : 1, marginBottom: 12 }}>
          {downloadingAll ? "Telechargement..." : "Telecharger mes photos"}
        </button>
        <button onClick={() => setPaymentSuccess(false)} style={{ background: "transparent", color: T.textMuted, border: "1px solid " + T.border, padding: "14px 32px", borderRadius: T.radiusSm, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: T.font }}>
          Retour a l'evenement
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideDown { from { transform:translateY(-100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes fadeUp { from { transform:translateY(16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes photoNewPulse {
          0% { box-shadow: 0 0 0 0 rgba(232,89,60,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(232,89,60,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,89,60,0); }
        }
        @keyframes pingRing {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid " + T.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>FK</div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Bouton partage */}
          <button onClick={shareLink} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid " + T.border, borderRadius: 20, padding: "5px 12px", color: T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partager
          </button>
          {event.is_live && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
              En direct
            </div>
          )}
        </div>
      </header>

      {/* Notification nouvelles photos */}
      {newPhotosNotif && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 300, background: T.green, color: "#000", padding: "14px 20px", textAlign: "center", fontWeight: 700, fontSize: 15, fontFamily: T.font, animation: "slideDown 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="16" height="13" rx="2.5" stroke="#000" strokeWidth="2"/><circle cx="10" cy="12.5" r="3" stroke="#000" strokeWidth="2"/><path d="M6 6V5a2 2 0 012-2h4a2 2 0 012 2v1" stroke="#000" strokeWidth="2"/><path d="M19 4l1.5 3.5L24 9l-3.5 1.5L19 14l-1.5-3.5L14 9l3.5-1.5Z" fill="#000" stroke="#000" strokeWidth="0.5"/></svg>
          {newPhotosNotif.count === 1 ? "1 nouvelle photo trouvee !" : `${newPhotosNotif.count} nouvelles photos trouvees !`}
        </div>
      )}

      {/* LIGHTBOX — uniquement pour les photos matchées après selfie */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "95vw", maxHeight: "80vh" }}>
            <img
              src={lightboxPhoto.watermarked_url || lightboxPhoto.thumbnail_url}
              alt=""
              style={{ maxWidth: "95vw", maxHeight: "75vh", objectFit: "contain", borderRadius: 10, display: "block" }}
            />
            {/* Badge NOUVEAU */}
            {newPhotoIds.has(lightboxPhoto.id) && (
              <div style={{ position: "absolute", top: 10, left: 10, background: T.green, color: "#000", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>NOUVEAU</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); togglePhoto(lightboxPhoto.id); setLightboxPhoto(null); }}
              style={{ background: selectedPhotos.includes(lightboxPhoto.id) ? "rgba(239,68,68,0.15)" : T.accent, color: selectedPhotos.includes(lightboxPhoto.id) ? T.red : "#fff", border: "none", padding: "12px 28px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}
            >
              {selectedPhotos.includes(lightboxPhoto.id) ? "Retirer la selection" : "Selectionner cette photo"}
            </button>
            <button onClick={() => setLightboxPhoto(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", padding: "12px 20px", borderRadius: T.radiusSm, fontSize: 14, color: T.textMuted, cursor: "pointer", fontFamily: T.font }}>Fermer</button>
          </div>
          <p style={{ color: T.textDim, fontSize: 11, marginTop: 10 }}>Photo protegee par filigrane — HD disponible apres achat</p>
        </div>
      )}

      {/* MODAL TARIFS DÉGRESSIFS */}
      {showPricingInfo && (
        <div onClick={() => setShowPricingInfo(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: T.radius, padding: "24px 20px", maxWidth: 340, width: "100%" }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Tarifs</h3>
            <p style={{ color: T.textMuted, fontSize: 12, textAlign: "center", marginBottom: 20 }}>Plus tu selectionnes, moins c'est cher !</p>
            {[
              { label: "1 photo", price: pricing.price1, detail: fcfa(pricing.price1) + " / photo", highlight: false },
              { label: "3 a 4 photos", price: pricing.price3, detail: "soit " + fcfa(Math.round(pricing.price3 / 3)) + " / photo", highlight: true },
              { label: "5 photos et plus", price: pricing.price5, detail: "soit " + fcfa(Math.round(pricing.price5 / 5)) + " / photo", highlight: false },
            ].map((tier, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: T.radiusSm, marginBottom: 8, background: tier.highlight ? T.accentDim : "rgba(255,255,255,0.04)", border: "1px solid " + (tier.highlight ? T.accent : T.border) }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tier.highlight ? T.accent : T.text }}>{tier.label}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{tier.detail}</div>
                </div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: tier.highlight ? T.accent : T.text }}>{fcfa(tier.price)}</div>
              </div>
            ))}
            <button onClick={() => setShowPricingInfo(false)} style={{ width: "100%", marginTop: 8, background: T.accent, color: "#fff", border: "none", padding: "12px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Compris !</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px" }}>

        {/* INFO ÉVÉNEMENT */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{event.name}</h1>
          <p style={{ color: T.textMuted, fontSize: 13 }}>
            {event.photographer_name && <span>Par {event.photographer_name}</span>}
            {event.date && <span> · {new Date(event.date).toLocaleDateString("fr-FR")}</span>}
          </p>
          <p style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>{event.photos_count || 0} photos disponibles</p>
        </div>

        {/* ONBOARDING — 3 étapes (affiché uniquement si pas encore de selfie) */}
        {!visitorId && !showCamera && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { step: "1", short: "Selfie", label: "Prends un selfie" },
              { step: "2", short: "Recherche", label: "On trouve tes photos" },
              { step: "3", short: "Téléchargement", label: "Telecharge en HD" },
            ].map((s, i) => (
              <div key={s.step} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "14px 8px", textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: i === 0 ? T.accent : "transparent",
                  border: i === 0 ? "none" : "1.5px solid " + T.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto",
                  fontSize: 17, fontWeight: 700,
                  color: i === 0 ? "#fff" : T.accent,
                  lineHeight: 1,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.accent, margin: "8px 0 3px" }}>{s.short}</div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ÉTAT : pas encore de selfie */}
        {matches.length === 0 && !showCamera && !visitorId && (
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "32px 20px", textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Retrouvez vos photos</h2>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24 }}>Prenez un selfie pour trouver toutes les photos ou vous apparaissez</p>
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 36px" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + T.accent, animation: "pingRing 1.8s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "2px solid " + T.accent, animation: "pingRing 1.8s ease-out infinite 0.6s" }} />
              <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", border: "3px dashed " + T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
            <button onClick={startCamera} style={{ background: T.accent, color: "#fff", border: "none", padding: "14px 32px", borderRadius: T.radiusSm, fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: T.font }}>
              Prendre un selfie
            </button>
            <p style={{ color: T.textDim, fontSize: 11, marginTop: 10 }}>Ton selfie est utilise uniquement pour retrouver tes photos et est supprime immediatement.</p>
            {event.is_live && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite", display: "inline-block" }}></span>
                <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>Recherche active — actualisation toutes les 10s</span>
              </div>
            )}
          </div>
        )}

        {/* ÉTAT : selfie fait, en attente de photos */}
        {matches.length === 0 && !showCamera && visitorId && (
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "32px 20px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: "3px solid " + T.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid " + T.border, borderTopColor: T.accent, animation: "spin 1s linear infinite" }}></div>
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>En attente de photos...</h2>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>Le photographe n a pas encore publie de photos vous concernant.</p>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Restez sur cette page, vos photos apparaitront automatiquement !</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "pulse 1.5s infinite", display: "inline-block" }}></span>
              <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>Recherche active — actualisation toutes les 10s</span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={doRefresh} disabled={refreshing} style={{ background: T.accentDim, color: T.accent, border: "1px solid " + T.accent, padding: "8px 18px", borderRadius: T.radiusSm, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, opacity: refreshing ? 0.5 : 1 }}>
                {refreshing ? "Recherche..." : "↻ Actualiser maintenant"}
              </button>
              <button onClick={startCamera} style={{ background: T.cardAlt, color: T.textMuted, border: "1px solid " + T.border, padding: "8px 18px", borderRadius: T.radiusSm, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>Reprendre un selfie</button>
            </div>
            {lastRefresh && <p style={{ color: T.textDim, fontSize: 11, marginTop: 12 }}>Derniere verification : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>}
          </div>
        )}

        {/* CAMÉRA */}
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

        {/* RÉSULTATS PHOTOS */}
        {matches.length > 0 && (
          <>
            {/* Bandeau tarifs dégressifs */}
            {mobileMoneyEnabled && (
              <div onClick={() => setShowPricingInfo(true)} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.gold }}>Tarifs degressifs </span>
                    <span style={{ fontSize: 12, color: T.textMuted }}>— plus tu selectionnes, moins c'est cher</span>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: T.gold, fontWeight: 700 }}>Voir →</span>
              </div>
            )}

            {/* En-tête résultats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {matches.length} photo{matches.length > 1 ? "s" : ""} trouvee{matches.length > 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={doRefresh} disabled={refreshing} style={{ background: "transparent", border: "none", cursor: refreshing ? "default" : "pointer", color: T.textMuted, fontSize: 12, fontFamily: T.font, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                  {refreshing
                    ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid " + T.border, borderTopColor: T.accent, animation: "spin 0.8s linear infinite" }} />
                    : <span style={{ fontSize: 14 }}>↻</span>
                  }
                  {lastRefresh && <span>{lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>}
                </button>
                <button onClick={selectAll} style={{ background: selectedPhotos.length === matches.length ? T.accentDim : "rgba(255,255,255,0.06)", border: "1px solid " + (selectedPhotos.length === matches.length ? T.accent : T.border), borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: selectedPhotos.length === matches.length ? T.accent : T.textMuted, cursor: "pointer", fontFamily: T.font }}>
                  {selectedPhotos.length === matches.length ? "✓ Tout deselectionner" : "Tout selectionner"}
                </button>
              </div>
            </div>

            {/* Grille photos — clic = sélection, loupe = lightbox */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {matches.map((m) => {
                const isNew = newPhotoIds.has(m.id);
                const isSelected = selectedPhotos.includes(m.id);
                const isPurchased = !!unlockedPhotos[m.id];
                return (
                  <div
                    key={m.id}
                    onClick={() => togglePhoto(m.id)}
                    style={{
                      position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                      cursor: "pointer", aspectRatio: "1",
                      border: "2px solid " + (isPurchased ? T.green : isSelected ? T.accent : isNew ? T.green : "transparent"),
                      animation: isNew ? "photoNewPulse 0.8s ease 3" : "none",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Div avec background-image au lieu de <img> : voir ClientPage.jsx
                        pour le detail (bloque le menu natif "Telecharger l'image"). */}
                    <div
                      aria-hidden="true"
                      onContextMenu={(e) => e.preventDefault()}
                      style={{
                        width: "100%", height: "100%",
                        backgroundImage: `url(${m.watermarked_url || m.thumbnail_url})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none",
                      }}
                    />
                    {isPurchased && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: T.green, color: "#000", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ACHETE
                      </div>
                    )}
                    {isNew && !isPurchased && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: T.green, color: "#000", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6 }}>NOUVEAU</div>
                    )}
                    {isSelected && (
                      <div style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    {/* Icône loupe en bas à droite — ouvre le lightbox */}
                    <div
                      onClick={(e) => { e.stopPropagation(); setLightboxPhoto(m); }}
                      style={{ position: "absolute", bottom: 4, right: 4, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(unlockedPhotos).length > 0 && (
              <button onClick={handleDownloadAllPurchased} disabled={downloadingAll} style={{ width: "100%", padding: "13px", borderRadius: T.radiusSm, background: T.accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: downloadingAll ? "default" : "pointer", fontFamily: T.font, marginBottom: 10, opacity: downloadingAll ? 0.7 : 1 }}>
                {downloadingAll ? "Telechargement..." : `Telecharger mes photos achetees (${Object.keys(unlockedPhotos).length})`}
              </button>
            )}
            <button onClick={startCamera} style={{ width: "100%", padding: "10px", borderRadius: T.radiusSm, background: T.cardAlt, border: "1px solid " + T.border, color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: T.font, marginBottom: 20 }}>
              Reprendre un selfie
            </button>

            {/* BARRE FIXE BAS — sélection + prix détaillé */}
            {selectedPhotos.length > 0 && (
              <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: "1px solid " + T.border, padding: "12px 20px", zIndex: 100 }}>
                <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 13, color: T.textMuted }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</span>
                      {mobileMoneyEnabled && (
                        <>
                          <span style={{ color: T.accent, fontWeight: 700, fontFamily: T.fontDisplay, fontSize: 20 }}>{fcfa(getPrice())}</span>
                          {getPackLabel() && (
                            <span style={{ fontSize: 10, color: T.gold, fontWeight: 600, background: "rgba(245,158,11,0.1)", padding: "2px 7px", borderRadius: 10 }}>{getPackLabel()}</span>
                          )}
                        </>
                      )}
                    </div>
                    {mobileMoneyEnabled && selectedPhotos.length > 1 && (
                      <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                        soit {fcfa(getPricePerPhoto())} / photo
                        <span onClick={() => setShowPricingInfo(true)} style={{ color: T.accent, marginLeft: 6, cursor: "pointer", textDecoration: "underline" }}>Voir tarifs</span>
                      </div>
                    )}
                  </div>
                  {mobileMoneyEnabled ? (
                    <button onClick={() => setShowPaymentModal(true)} style={{ background: T.accent, color: "#fff", border: "none", padding: "11px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font, flexShrink: 0 }}>Payer</button>
                  ) : (
                    <button onClick={handleFreeDownload} style={{ background: T.green, color: "#000", border: "none", padding: "11px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font, flexShrink: 0 }}>Telecharger HD</button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Contact photographe */}
        {event.photographer_phone && (
          <div style={{ textAlign: "center", marginTop: 20, marginBottom: 80 }}>
            <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontSize: 12, fontWeight: 600, textDecoration: "underline" }}>
              Contacter le photographe via WhatsApp
            </a>
            <p style={{ color: T.textDim, fontSize: 11, marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>Si vous souhaitez que votre image soit retiree de cette galerie, contactez rapidement le photographe.</p>
          </div>
        )}
      </div>

      {/* MODAL PAIEMENT */}
      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Paiement Mobile Money</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 4 }}>{selectedPhotos.length} photo{selectedPhotos.length > 1 ? "s" : ""}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: T.accent }}>{fcfa(getPrice())}</span>
              {getPackLabel() && <span style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>{getPackLabel()}</span>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{id: "orange", label: "Orange Money"}, {id: "mtn", label: "MTN MoMo"}, {id: "wave", label: "Wave"}].map((p) => (
                <button key={p.id} onClick={() => setPaymentProvider(p.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: T.radiusSm, fontSize: 12, fontWeight: 600, cursor: "pointer", background: paymentProvider === p.id ? T.accentDim : T.cardAlt, border: "1px solid " + (paymentProvider === p.id ? T.accent : T.border), color: paymentProvider === p.id ? T.accent : T.textMuted, fontFamily: T.font }}>{p.label}</button>
              ))}
            </div>
            <input type="tel" placeholder="Numero (ex: 0700000000)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: T.radiusSm, border: "1px solid " + T.border, background: T.bg, color: T.text, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", fontFamily: T.font }} />
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={submitPayment} disabled={paymentLoading} style={{ flex: 1, background: T.accent, color: "#fff", border: "none", padding: "12px 0", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font, opacity: paymentLoading ? 0.5 : 1 }}>
                {paymentLoading ? "Envoi..." : "Confirmer"}
              </button>
              <button onClick={() => setShowPaymentModal(false)} style={{ padding: "12px 16px", borderRadius: T.radiusSm, background: "transparent", border: "1px solid " + T.border, color: T.textMuted, cursor: "pointer", fontFamily: T.font }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {paymentTx && (
        <PaymentStatusModal
          transactionId={paymentTx.transactionId}
          amount={paymentTx.amount}
          onSuccess={handlePaymentSuccess}
          onError={() => {}}
          onCancel={handlePaymentClose}
        />
      )}
    </div>
  );
}
