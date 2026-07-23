import { useState, useEffect, useRef } from "react";
import { T, API } from "../utils/tokens";
import { Icon } from "../utils/icons";
import { Btn } from "../components/Btn";
import { fcfa } from "../utils/helpers";
import PaymentStatusModal from "../components/PaymentStatusModal";


export default function ClientPage({ slug, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deletedInfo, setDeletedInfo] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showSelfie, setShowSelfie] = useState(false);
const [selfieLoading, setSelfieLoading] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState(null);
  const [matchedIds, setMatchedIds] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const paymentPopupRef = useRef(null);
  const [paymentTx, setPaymentTx] = useState(null);
  const [unlockedPhotos, setUnlockedPhotos] = useState({});
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerPin, setOwnerPin] = useState("");
  const [ownerMode, setOwnerMode] = useState(false);
  const [ownerVerifying, setOwnerVerifying] = useState(false);
  const [ownerPhotos, setOwnerPhotos] = useState([]);

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
          setMatchedIds(data.matched_photos.map(function(p) { return p.id; }));
          setMatchedPhotos(data.count);
          setUnlockedPhotos(function(prev) {
            var next = Object.assign({}, prev);
            data.matched_photos.forEach(function(p) {
              if (p.purchased && p.transaction_id) next[p.id] = p.transaction_id;
            });
            return next;
          });
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
      // Si cette page s'affiche dans la popup de paiement (window.opener existe)
      // et que le paiement est un succes, on referme automatiquement la popup
      // apres un court delai pour laisser le temps d'afficher la confirmation.
      // Le client revient alors naturellement sur l'onglet principal, ou les
      // photos seront deja debloquees grace au polling qui y tourne aussi.
      if (window.opener && paymentResult === "success") {
        setTimeout(function() {
          window.close();
        }, 3000);
      }
    }
  }, []);
useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(API + `/events/${slug || "demo"}/public`)
      .then((r) => {
        if (r.status === 410) {
          // Événement supprimé — récupérer les infos du photographe
          return r.json().then((data) => {
            setDeletedInfo(data);
            setNotFound(true);
            setLoading(false);
            return null;
          });
        }
        if (!r.ok) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (!d.event) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        var evt = d.event;
        setEvent(evt);
        setPhotographerPlan(evt.photographer_plan || 'free');
        setMobileMoneyEnabled(evt.mobile_money_enabled || false);
        if (evt.id) {
          fetch(API + "/photos/event/" + evt.id + "/public")
            .then((r2) => r2.json())
            .then((d2) => { setPhotos(d2.photos || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
          fetch(API + "/photos/pricing?event_id=" + evt.id)
            .then(r => r.json()).then(d => setPricing(d)).catch(() => {});
        } else {
          setLoading(false);
        }
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const togglePhoto = (id) => {
    if (matchedIds === null || !matchedIds.includes(id)) return;
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

const [paymentLoading, setPaymentLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [photographerPlan, setPhotographerPlan] = useState('free');
  const [mobileMoneyEnabled, setMobileMoneyEnabled] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState("orange");
  const [pricing, setPricing] = useState({ price1: 200, price3: 500, price5: 1000 });

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      alert("Entrez un numéro de téléphone valide.");
      return;
    }
    // Ouverture de la popup AVANT le await, sinon les navigateurs la bloquent
    const popup = window.open('', 'fotokash_payment', 'width=480,height=720');
    paymentPopupRef.current = popup;

    setPaymentLoading(true);
    try {
      var res = await fetch(API + "/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          photo_ids: selectedPhotos,
          amount: getPrice(),
          phone_number: phoneNumber,
          payment_method: paymentProvider,
        }),
      });
      var data = await res.json();
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
        alert(data.error || "Erreur lors du paiement.");
      }
    } catch (err) {
      if (paymentPopupRef.current && !paymentPopupRef.current.closed) paymentPopupRef.current.close();
      alert("Erreur de connexion.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const closePaymentPopup = () => {
    if (paymentPopupRef.current && !paymentPopupRef.current.closed) {
      paymentPopupRef.current.close();
    }
  };

  const handlePaymentSuccess = (tx) => {
    if (event && event.id) {
      fetch(API + "/photos/event/" + event.id + "/public")
        .then((r) => r.json())
        .then((d) => setPhotos(d.photos || []))
        .catch(() => {});
    }
    if (tx && tx.photos_purchased) {
      setUnlockedPhotos(function(prev) {
        var next = Object.assign({}, prev);
        tx.photos_purchased.forEach(function(id) { next[id] = tx.id; });
        return next;
      });
    }
    setSelectedPhotos([]);
  };

  const handleDownloadPhoto = async (photoId) => {
    const txId = unlockedPhotos[photoId];
    if (!txId) return;
    try {
      const res = await fetch(API + "/photos/" + photoId + "/download?transaction_id=" + txId);
      const data = await res.json();
      if (!res.ok || !data.download_url) {
        alert(data.error || "Telechargement impossible.");
        return;
      }
      const blob = await fetch(data.download_url).then((r) => r.blob());
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
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
    } catch (err) {
      alert("Erreur de telechargement.");
    }
  };

  const handlePaymentClose = () => {
    closePaymentPopup();
    setPaymentTx(null);
  };
const handleFreeDownload = async () => {
    // Detecter iOS (Safari ne supporte pas a.download)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    try {
      const regRes = await fetch(API + "/photos/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_ids: selectedPhotos }),
      });
      const regData = await regRes.json();
      if (regRes.ok && regData.photos) {
        if (isIOS) {
          // iOS : telecharger via blob + navigator.share ou fallback blob URL
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            try {
              var response = await fetch(p.original_url);
              var blob = await response.blob();
              var file = new File([blob], "fotokash-" + p.id + ".jpg", { type: "image/jpeg" });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "FotoKash Photo" });
              } else {
                // Fallback : ouvrir le blob (pas l'URL Cloudinary) dans un nouvel onglet
                var blobUrl = window.URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
                alert("Appuyez longuement sur l'image puis \"Enregistrer l'image\" pour la sauvegarder.");
              }
            } catch (err) {
              console.error("Erreur telechargement iOS:", err);
              window.open(p.original_url, "_blank");
            }
            if (i < regData.photos.length - 1) {
              await new Promise(function(r) { setTimeout(r, 800); });
            }
          }
        } else {
          // Desktop/Android : download classique via blob
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
        }
      } else {
        alert(regData.error || "Erreur lors du telechargement.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur de connexion.");
    }
    setSelectedPhotos([]);
  };

  const verifyOwnerPin = async () => {
    if (!ownerPin || ownerPin.length !== 6) {
      alert("Entrez un code à 6 chiffres.");
      return;
    }
    setOwnerVerifying(true);
    try {
      const res = await fetch(API + "/events/" + slug + "/verify-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: ownerPin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOwnerMode(true);
        setOwnerPhotos(data.photos);
        setShowOwnerModal(false);
        // En mode owner, toutes les photos sont matchées
        setMatchedIds(data.photos.map(p => p.id));
        setMatchedPhotos(data.photos.length);
      } else {
        alert(data.error || "Code incorrect.");
      }
    } catch (err) {
      alert("Erreur de connexion.");
    } finally {
      setOwnerVerifying(false);
    }
  };

  const [ownerDownloading, setOwnerDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const handleOwnerDownloadAll = async () => {
    setOwnerDownloading(true);
    setZipProgress(0);
    try {
      const response = await fetch(API + "/events/" + slug + "/owner-download-zip?pin=" + ownerPin);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Erreur lors du téléchargement.");
        setOwnerDownloading(false);
        return;
      }
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) {
          setZipProgress(Math.round((received / total) * 100));
        } else {
          setZipProgress(Math.min(99, Math.round(received / 1024 / 1024)));
        }
      }
      const blob = new Blob(chunks, { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fotokash-" + slug + ".zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur téléchargement ZIP:", err);
      alert("Erreur de connexion.");
    } finally {
      setOwnerDownloading(false);
      setZipProgress(0);
    }
  };

  const getPrice = () => {
    const n = selectedPhotos.length;
    if (n === 0) return 0;
    if (n >= 5) return pricing.price5;
    if (n >= 3) return pricing.price3;
    return n * pricing.price1;
  };


  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );


  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

  // Écran galerie supprimée / introuvable
  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          maxWidth: 440, textAlign: "center", background: T.card,
          border: "1px solid " + T.border, borderRadius: T.radius,
          padding: "48px 32px",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(232,89,60,0.12)", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700,
            color: T.text, marginBottom: 12,
          }}>
            Galerie indisponible
          </h2>
          <p style={{
            color: T.textMuted, fontSize: 14, lineHeight: 1.7,
            marginBottom: 24,
          }}>
            {deletedInfo && deletedInfo.event_name
              ? "La galerie « " + deletedInfo.event_name + " » n'est plus disponible."
              : "Cette galerie n'est plus disponible. Elle a peut-être été supprimée par le photographe."}
          </p>
          {deletedInfo && deletedInfo.photographer_name && (
            <div style={{
              padding: "16px", background: T.cardAlt,
              borderRadius: T.radiusSm, border: "1px solid " + T.border,
              marginBottom: 24, textAlign: "left",
            }}>
              <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 8 }}>Photographe de l'événement</p>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{deletedInfo.photographer_name}</p>
              {deletedInfo.photographer_phone && (
                <p style={{ color: T.textMuted, fontSize: 13 }}>{deletedInfo.photographer_phone}</p>
              )}
            </div>
          )}
          {deletedInfo && deletedInfo.photographer_phone && (
            <a
              href={"https://wa.me/" + (deletedInfo.photographer_phone || "").replace(/[^0-9]/g, "")}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#25D366", color: "#fff", border: "none",
                borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14,
                fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                textDecoration: "none", marginBottom: 12,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.616l4.529-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.386 0-4.586-.826-6.32-2.21l-.44-.362-2.89.942.96-2.84-.378-.462A9.935 9.935 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Contacter sur WhatsApp
            </a>
          )}
          {(!deletedInfo || !deletedInfo.photographer_phone) && (
            <p style={{
              color: T.textMuted, fontSize: 13, lineHeight: 1.6,
              marginBottom: 24, padding: "16px", background: T.cardAlt,
              borderRadius: T.radiusSm, border: "1px solid " + T.border,
            }}>
              Pour retrouver vos photos, contactez directement le photographe de l'événement.
            </p>
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onNavigate("landing")} style={{
              background: T.accentDim, color: T.accent, border: "none",
              borderRadius: T.radiusSm, padding: "10px 24px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

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
        <Btn onClick={startSelfie} style={{ padding: "8px 14px", fontSize: 12, background: T.accent, color: "#fff", borderRadius: T.radiusSm, fontWeight: 700, animation: "pulse 2s infinite" }}>
          {Icon.Search(14)} Me retrouver par selfie
        </Btn>
      </header>
      {/* Lien owner discret */}
      {!ownerMode && (
        <div style={{ textAlign: "center", padding: "10px 0", background: "linear-gradient(135deg, rgba(232,89,60,0.04), rgba(255,184,38,0.04))", borderBottom: "1px solid " + T.border }}>
          <button onClick={() => setShowOwnerModal(true)} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "7px 18px", color: T.textMuted, fontSize: 12,
            cursor: "pointer", fontFamily: T.font, display: "inline-flex",
            alignItems: "center", gap: 7, transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(232,89,60,0.1)"; e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = T.textMuted; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Accès propriétaire
          </button>
        </div>
      )}
      {ownerMode && (
        <div style={{ padding: "12px 20px", background: "linear-gradient(135deg, rgba(76,175,80,0.08), rgba(76,175,80,0.04))", borderBottom: "1px solid rgba(76,175,80,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ color: T.green, fontSize: 13, fontWeight: 600 }}>Mode propriétaire</span>
            <span style={{ color: T.textMuted, fontSize: 12 }}>— Toutes les photos sont accessibles</span>
          </div>
          <button onClick={handleOwnerDownloadAll} disabled={ownerDownloading} style={{
            background: ownerDownloading ? "rgba(76,175,80,0.3)" : T.green, color: "#000", border: "none",
            borderRadius: 20, padding: "7px 18px", fontSize: 12, fontWeight: 700,
            cursor: ownerDownloading ? "wait" : "pointer", fontFamily: T.font,
            display: "inline-flex", alignItems: "center", gap: 6,
            opacity: ownerDownloading ? 0.7 : 1, transition: "all 0.2s",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {ownerDownloading ? (zipProgress > 0 ? "Téléchargement " + zipProgress + (zipProgress < 100 ? "%" : "% — presque fini !") : "Préparation du ZIP...") : "Télécharger tout en ZIP (" + (ownerPhotos.length || photos.length) + ")"}
          </button>
        </div>
      )}
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
          <p style={{ color: T.textDim, fontSize: 11, marginTop: 10 }}>Ton selfie est utilise uniquement pour retrouver tes photos et est supprime immediatement.</p>
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
{paymentTx && (
        <PaymentStatusModal
          transactionId={paymentTx.transactionId}
          amount={paymentTx.amount}
          onSuccess={handlePaymentSuccess}
          onError={() => {}}
          onCancel={handlePaymentClose}
        />
      )}
{showOwnerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: T.card, borderRadius: T.radius, padding: 28, maxWidth: 380, width: "100%" }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Accès Propriétaire</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>
              Entrez le code PIN à 6 chiffres fourni par votre photographe pour accéder à toutes les photos de l'événement.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={ownerPin}
              onChange={(e) => setOwnerPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: T.radiusSm,
                border: "1px solid " + T.border, background: T.bg, color: T.text,
                fontSize: 24, textAlign: "center", letterSpacing: 8,
                marginBottom: 16, outline: "none", boxSizing: "border-box",
                fontFamily: "monospace", fontWeight: 700,
              }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={verifyOwnerPin} disabled={ownerVerifying || ownerPin.length !== 6} style={{ flex: 1, justifyContent: "center", padding: "12px 0" }}>
                {ownerVerifying ? "Vérification..." : "Valider"}
              </Btn>
              <Btn variant="ghost" onClick={() => { setShowOwnerModal(false); setOwnerPin(""); }} style={{ padding: "12px 16px" }}>Annuler</Btn>
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
                    {event.photographer_phone && (<>
                      <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        {Icon.Phone(12)} Contacter sur WhatsApp
                      </a>
                      <p style={{ color: T.textDim, fontSize: 11, marginTop: 8 }}>Si vous souhaitez que votre image soit retiree de cette galerie, contactez rapidement le photographe via WhatsApp.</p>
                    </>)}
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
                    if (matchedIds === null) { startSelfie(); return; }
                    if (matchedIds !== null && selectedPhotos.length === matchedIds.length) {
                      setSelectedPhotos([]);
                    } else {
                      setSelectedPhotos([...matchedIds]);
                    }
                  }} style={{
                    background: selectedPhotos.length === photos.length ? T.accentDim : "rgba(255,255,255,0.06)",
                    border: selectedPhotos.length === photos.length ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
                    borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600,
                    color: selectedPhotos.length === photos.length ? T.accent : T.textMuted,
                    cursor: matchedIds === null ? "default" : "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {matchedIds === null ? <><span style={{color:"#FFB826"}}>⚠</span> Prenez un selfie d'abord</> : selectedPhotos.length === matchedIds.length ? "✓ Tout désélectionner" : "☐ Sélectionner tout (" + matchedIds.length + ")"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
                  {[...photos].sort((a, b) => { if (matchedIds === null) return 0; const aMatch = matchedIds.includes(a.id) ? 0 : 1; const bMatch = matchedIds.includes(b.id) ? 0 : 1; return aMatch - bMatch; }).map((p) => (
                    <div key={p.id} onClick={() => togglePhoto(p.id)} style={{
                      position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                      cursor: matchedIds !== null && matchedIds.includes(p.id) ? "pointer" : "default", aspectRatio: "1",
                      opacity: matchedIds !== null && !matchedIds.includes(p.id) ? 0.4 : 1,
                      border: `2px solid ${selectedPhotos.includes(p.id) ? T.accent : "transparent"}`,
                      transition: "border-color 0.2s",
                    }}>
                      {/* Div avec background-image au lieu de <img> : bloque le menu
                          natif "Telecharger l'image" d'Android Chrome au long-press,
                          qui ne cible que les vraies balises <img>. Combine avec
                          onContextMenu (clic droit desktop) et touch-callout none
                          (menu long-press iOS Safari). Protection defense-en-profondeur,
                          pas infaillible (devtools/inspection reseau restent possibles),
                          mais l'image affichee ici est deja watermarkee/basse resolution. */}
                      <div
                        aria-hidden="true"
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          width: "100%", height: "100%",
                          backgroundImage: `url(${p.watermarked_url || p.thumbnail_url})`,
                          backgroundSize: "cover", backgroundPosition: "center",
                          WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none",
                        }}
                      />
                      {selectedPhotos.includes(p.id) && (
                        <div style={{
                          position: "absolute", top: 6, right: 6, width: 24, height: 24,
                          borderRadius: "50%", background: T.accent,
                          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                        }}>{Icon.Check(14)}</div>
                      )}
			{p.qr_code_id && !mobileMoneyEnabled && matchedIds !== null && matchedIds.includes(p.id) && (
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
                      {unlockedPhotos[p.id] && (
                        <div onClick={(ev) => {
                          ev.stopPropagation();
                          handleDownloadPhoto(p.id);
                        }} style={{
                          position: "absolute", bottom: 6, left: 6, padding: "4px 10px",
                          borderRadius: 7, background: T.accent,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600,
                        }}>Telecharger</div>
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


