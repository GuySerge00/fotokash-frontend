import { useState, useEffect } from "react";
import { T, API } from "../utils/tokens";
import { Icon } from "../utils/icons";
import { Btn } from "../components/Btn";


export default function QrPhotoPage({ qrCode, onNavigate }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function() {
    fetch(API + "/photos/qr/" + qrCode)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.photo) setPhoto(d.photo);
        else setError("Photo introuvable.");
        setLoading(false);
      })
      .catch(function() { setError("Erreur de connexion."); setLoading(false); });
  }, []);

  var downloadPhoto = function() {
    if (!photo) return;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var photoUrl = photo.original_url || photo.watermarked_url;
    if (isIOS) {
      // iOS : telecharger via blob + navigator.share
      try {
        var resp = fetch(photoUrl).then(function(r) { return r.blob(); });
        resp.then(function(blob) {
          var file = new File([blob], "fotokash-" + (photo.qr_code_id || "photo") + ".jpg", { type: "image/jpeg" });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: "FotoKash Photo" });
          } else {
            var blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
            alert("Appuyez longuement sur l'image puis \"Enregistrer l'image\" pour la sauvegarder.");
          }
        });
      } catch (err) {
        window.open(photoUrl, "_blank");
      }
    } else {
      // Desktop/Android : download via blob
      fetch(photoUrl)
        .then(function(r) { return r.blob(); })
        .then(function(blob) {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "fotokash-" + photo.qr_code_id + ".jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>Chargement...</div>
  );

  if (error || !photo) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textMuted, gap: 16 }}>
      <p>{error || "Photo introuvable."}</p>
      <Btn onClick={function() { onNavigate("landing"); }}>Retour</Btn>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Icon.Camera(14)}</div>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>Foto<span style={{ color: T.accent }}>Kash</span></span>
      </header>
      <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{photo.event_name || "Photo FotoKash"}</h2>
        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 20 }}>Code: {photo.qr_code_id}</p>
        <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <img src={photo.watermarked_url || photo.thumbnail_url} alt="" style={{ width: "100%", display: "block" }} />
        </div>
        <Btn onClick={downloadPhoto} style={{ width: "100%", justifyContent: "center", padding: "14px 0", background: T.green }}>
          Telecharger en HD
        </Btn>
      </div>
    </div>
  );
}

// ── URL helpers ──────────────────────────────────────────────────────

