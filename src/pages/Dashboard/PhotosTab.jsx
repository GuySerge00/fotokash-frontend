import { useState, useEffect, useRef, useCallback } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import { Btn } from "../../components/Btn";
import { formatSize } from "../../utils/helpers";
import { PhotoEditorModal, BatchToolbar, FILTERS } from "../../components/PhotoEditor";


export default function PhotosTab({ token, events, setEvents }) {
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const MAX_FILES = 50;

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [oversizedWarning, setOversizedWarning] = useState([]);
  const [limitWarning, setLimitWarning] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null); // { count, eventName }
  const fileInputRef = useRef(null);

  // Retouche photo
  const [editingTools, setEditingTools] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFiles, setEditedFiles] = useState({});

  useEffect(() => {
    const fetchEditConfig = async () => {
      try {
        const res = await fetch(API + "/photos/editing-config", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); if (data.enabled) setEditingTools(data.tools); }
      } catch (err) { console.log("Editing config unavailable"); }
    };
    fetchEditConfig();
  }, [token]);

  // Pré-sélection auto si 1 seul event ou 1 seul live
  useEffect(() => {
    if (events.length === 1) {
      setSelectedEvent(String(events[0].id));
    } else {
      const liveEvents = events.filter((e) => e.is_live);
      if (liveEvents.length === 1) setSelectedEvent(String(liveEvents[0].id));
    }
  }, [events]);

  // Fix cleanup : dépendance sur files pour révoquer les URLs
  useEffect(() => {
    return () => { files.forEach((f) => URL.revokeObjectURL(f.preview)); };
  }, [files]);

  const [duplicateWarning, setDuplicateWarning] = useState([]);

  // ── Compression côté client (réduit taille avant envoi serveur) ──
  const compressImage = (file, maxWidth = 3000, quality = 0.85) => {
    return new Promise((resolve) => {
      // Si le fichier est petit (< 2Mo), pas besoin de compresser
      if (file.size < 2 * 1024 * 1024) {
        resolve(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Si l'image est déjà petite, garder telle quelle
        if (img.width <= maxWidth && img.height <= maxWidth && file.size < 5 * 1024 * 1024) {
          resolve(file);
          return;
        }
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxWidth) {
          if (w > h) { h = Math.round(h * maxWidth / w); w = maxWidth; }
          else { w = Math.round(w * maxWidth / h); h = maxWidth; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: file.lastModified,
              });
              console.log("Compressed: " + file.name + " " + (file.size / 1024 / 1024).toFixed(1) + "Mo -> " + (compressed.size / 1024 / 1024).toFixed(1) + "Mo");
              resolve(compressed);
            } else {
              resolve(file); // Original plus petit, garder tel quel
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // En cas d'erreur, envoyer l'original
      };
      img.src = url;
    });
  };

  const processFiles = useCallback((newFiles) => {
    const imgs = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const oversized = imgs.filter((f) => f.size > MAX_FILE_SIZE);
    const valid = imgs.filter((f) => f.size <= MAX_FILE_SIZE);

    // Avertissement fichiers trop lourds (UI, pas alert)
    if (oversized.length > 0) {
      setOversizedWarning(oversized.map((f) => f.name));
      setTimeout(() => setOversizedWarning([]), 6000);
    }

    // Limite 50 photos + doublons
    setFiles((prev) => {
      // Détection doublons : même nom + même taille + même lastModified
      const existingKeys = new Set(prev.map((x) => x.name + "_" + x.size + "_" + x.file.lastModified));
      const dupes = valid.filter((f) => existingKeys.has(f.name + "_" + f.size + "_" + f.lastModified));
      const unique = valid.filter((f) => !existingKeys.has(f.name + "_" + f.size + "_" + f.lastModified));

      if (dupes.length > 0) {
        setDuplicateWarning(dupes.map((f) => f.name));
        setTimeout(() => setDuplicateWarning([]), 5000);
      }

      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) { setLimitWarning(true); setTimeout(() => setLimitWarning(false), 4000); return prev; }
      const allowed = unique.slice(0, remaining);
      if (allowed.length < unique.length) { setLimitWarning(true); setTimeout(() => setLimitWarning(false), 4000); }
      const withPreviews = allowed.map((file) => ({
        id: crypto.randomUUID(), file, name: file.name, size: file.size,
        preview: URL.createObjectURL(file), status: "pending", progress: 0,
      }));
      return [...prev, ...withPreviews];
    });
  }, []);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }, [processFiles]);
  const removeFile = (id) => {
    setFiles((prev) => { const f = prev.find((x) => x.id === id); if (f) URL.revokeObjectURL(f.preview); return prev.filter((x) => x.id !== id); });
  };

  const uploadBatch = async (pending) => {
    const eventId = selectedEvent;
    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    for (let i = 0; i < pending.length; i += 5) {
      const batch = pending.slice(i, i + 5);
      const formData = new FormData();
      formData.append("event_id", eventId);
      // Compression côté client avant envoi
      const compressedFiles = await Promise.all(batch.map((f) => compressImage(editedFiles[f.id] || f.file)));
      compressedFiles.forEach((f) => formData.append("photos", f));

      batch.forEach((f) => {
        setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "uploading", progress: 30 } : x));
      });

      try {
        const res = await fetch(API + "/photos/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          batch.forEach((f) => {
            setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "done", progress: 100 } : x));
          });
          doneCount += batch.length;
        } else {
          throw new Error("Upload failed");
        }
      } catch {
        batch.forEach((f) => {
          setFiles((prev) => prev.map((x) => x.id === f.id ? { ...x, status: "error", progress: 0 } : x));
        });
      }
      setUploadProgress({ done: doneCount, total: pending.length });
    }
    return doneCount;
  };

  const handleUpload = async () => {
    if (!selectedEvent || files.length === 0) return;
    setUploading(true);
    setUploadSummary(null);
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    const doneCount = await uploadBatch(pending);
    setUploading(false);
    // Résumé final
    if (doneCount > 0) {
      const ev = events.find((e) => String(e.id) === String(selectedEvent));
      setUploadSummary({ count: doneCount, eventName: ev ? ev.name : "l'événement" });
      // Mettre a jour le compteur photos_count en temps reel
      setEvents((prev) => prev.map((e) => String(e.id) === String(selectedEvent) ? { ...e, photos_count: (parseInt(e.photos_count) || 0) + doneCount } : e));
    }
  };

  const retryFile = async (fileItem) => {
    if (!selectedEvent) return;
    setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "uploading", progress: 30 } : x));
    const formData = new FormData();
    formData.append("event_id", selectedEvent);
    const compressedRetry = await compressImage(editedFiles[fileItem.id] || fileItem.file);
    formData.append("photos", compressedRetry);
    try {
      const res = await fetch(API + "/photos/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.ok) {
        setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "done", progress: 100 } : x));
      } else { throw new Error(); }
    } catch {
      setFiles((prev) => prev.map((x) => x.id === fileItem.id ? { ...x, status: "error", progress: 0 } : x));
    }
  };

  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const doneCount = files.filter((f) => f.status === "done").length;
  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length;
  const uploadPct = uploadProgress.total > 0 ? Math.round((uploadProgress.done / uploadProgress.total) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            {Icon.Upload(22)} Uploader des photos
          </h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Ajoutez vos photos à un événement pour les vendre</p>
        </div>
        {files.length > 0 && (
          <div style={{ fontSize: 12, color: T.textMuted }}>
            <strong style={{ color: T.text }}>{files.length}</strong> / {MAX_FILES} · {formatSize(totalSize)}
            {doneCount > 0 && <span style={{ color: T.green }}> · {doneCount} envoyée{doneCount > 1 ? "s" : ""}</span>}
          </div>
        )}
      </div>

      {/* Avertissement doublons */}
      {duplicateWarning.length > 0 && (
        <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "#a78bfa", fontSize: 14, flexShrink: 0 }}>⊘</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 2 }}>{duplicateWarning.length} doublon{duplicateWarning.length > 1 ? "s" : ""} ignoré{duplicateWarning.length > 1 ? "s" : ""}</p>
            <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{duplicateWarning.slice(0, 3).join(", ")}{duplicateWarning.length > 3 ? ` +${duplicateWarning.length - 3} autres` : ""}</p>
          </div>
          <button onClick={() => setDuplicateWarning([])} style={{ marginLeft: "auto", background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Avertissement fichiers trop lourds */}
      {oversizedWarning.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: T.gold, fontSize: 14, flexShrink: 0 }}>⚠</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.gold, marginBottom: 2 }}>{oversizedWarning.length} fichier{oversizedWarning.length > 1 ? "s" : ""} ignoré{oversizedWarning.length > 1 ? "s" : ""} (max 25 Mo)</p>
            <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{oversizedWarning.slice(0, 3).join(", ")}{oversizedWarning.length > 3 ? ` +${oversizedWarning.length - 3} autres` : ""}</p>
          </div>
          <button onClick={() => setOversizedWarning([])} style={{ marginLeft: "auto", background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Avertissement limite 50 */}
      {limitWarning && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: T.red }}>⚠ Maximum {MAX_FILES} photos par envoi atteint. Supprimez des photos ou envoyez d'abord la sélection actuelle.</p>
        </div>
      )}

      {/* Event selector */}
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "18px 22px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          {Icon.Calendar(16)} Événement
        </div>
        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} style={{
          width: "100%", background: T.bg, border: "1px solid " + (selectedEvent ? T.accent : T.border),
          borderRadius: T.radiusSm, padding: "12px 16px", color: selectedEvent ? T.text : T.textMuted,
          fontSize: 14, outline: "none", cursor: "pointer", colorScheme: "dark",
        }}>
          <option value="">-- Sélectionner un événement --</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}{e.is_live ? " 🔴" : ""}</option>)}
        </select>
        {events.length === 0 && (
          <p style={{ fontSize: 12, color: T.gold, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {Icon.AlertCircle(14)} Créez d'abord un événement dans l'onglet "Événements"
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: dragOver ? T.accentDim : T.card,
          borderRadius: T.radius, border: "2px dashed " + (dragOver ? T.accent : "rgba(255,255,255,0.1)"),
          padding: "44px 24px", textAlign: "center", cursor: "pointer",
          transition: "all 0.3s", marginBottom: 18,
        }}
      >
        <div style={{ color: dragOver ? T.accent : T.textMuted, marginBottom: 14 }}>{Icon.Upload(32)}</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: dragOver ? T.text : T.textMuted, marginBottom: 4 }}>
          {dragOver ? "Déposez vos photos ici" : "Glissez-déposez vos photos"}
        </p>
        <p style={{ fontSize: 12, color: T.textMuted }}>
          ou <span style={{ color: T.accent, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>parcourir</span> · JPG, PNG, WebP · Max 25 Mo/photo · {MAX_FILES} max
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => { processFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      </div>

      {/* Photo grid */}
      {files.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Aperçu ({files.length})</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setFiles((p) => p.filter((f) => f.status !== "done"))} style={{ padding: "5px 12px", fontSize: 11 }}>Retirer envoyées</Btn>
              <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setUploadSummary(null); }} style={{
                background: "rgba(239,68,68,0.1)", color: T.red, border: "none", borderRadius: 8,
                padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>Tout supprimer</button>
            </div>
          </div>

          {editingTools && (
            <BatchToolbar
              tools={editingTools}
              files={files}
              onBatchApply={async ({ filter, enhance }) => {
                const pending = files.filter(f => f.status === "pending");
                for (const fi of pending) {
                  const img = new Image();
                  const url = editedFiles[fi.id] ? URL.createObjectURL(editedFiles[fi.id]) : fi.preview;
                  await new Promise(resolve => {
                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      canvas.width = img.width; canvas.height = img.height;
                      const ctx = canvas.getContext("2d");
                      let css = "";
                      if (enhance) css += "brightness(108%) contrast(112%) saturate(115%) ";
                      if (filter !== "none") { const p = FILTERS.find(x => x.id === filter); if (p) css += p.css; }
                      ctx.filter = css || "none";
                      ctx.drawImage(img, 0, 0);
                      canvas.toBlob(blob => {
                        if (blob) {
                          const ed = new File([blob], fi.file.name.replace(/\.[^.]+$/, "_batch.jpg"), { type: "image/jpeg", lastModified: Date.now() });
                          setEditedFiles(prev => ({ ...prev, [fi.id]: ed }));
                          setFiles(prev => prev.map(x => x.id === fi.id ? { ...x, preview: URL.createObjectURL(ed) } : x));
                        }
                        resolve();
                      }, "image/jpeg", 0.92);
                    };
                    img.onerror = () => resolve();
                    img.src = url;
                  });
                }
              }}
            />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {files.map((f) => {
              const ext = f.name.split(".").pop().toUpperCase().slice(0, 4);
              return (
                <div key={f.id} style={{
                  position: "relative", borderRadius: T.radiusSm, overflow: "hidden",
                  background: T.cardAlt, aspectRatio: "1",
                  border: "1px solid " + (f.status === "error" ? "rgba(239,68,68,0.4)" : f.status === "done" ? "rgba(74,222,128,0.3)" : T.border),
                }}>
                  <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {/* Watermark */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)", pointerEvents: "none" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 2, transform: "rotate(-25deg)", textTransform: "uppercase" }}>FOTOKASH</span>
                  </div>
                  {/* Format badge */}
                  <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 5px", fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>{ext}</div>
                  {/* Uploading spinner */}
                  {f.status === "uploading" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: T.accent, animation: "spin 0.7s linear infinite" }} />
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Envoi...</span>
                    </div>
                  )}
                  {/* Done check */}
                  {f.status === "done" && (
                    <div style={{ position: "absolute", top: 6, right: 6, background: T.green, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                      {Icon.Check(12)}
                    </div>
                  )}
                  {/* Error + retry */}
                  {f.status === "error" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <span style={{ background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "3px 7px", color: T.red, fontSize: 10, fontWeight: 600 }}>Erreur</span>
                      <button onClick={() => retryFile(f)} style={{ background: T.accent, border: "none", borderRadius: 5, padding: "4px 10px", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Réessayer</button>
                    </div>
                  )}
                  {/* Edit btn */}
                  {f.status === "pending" && editingTools && (
                    <button onClick={(e) => { e.stopPropagation(); setEditingFile(f); }} title="Retoucher" style={{
                      position: "absolute", top: 4, left: 40, background: "rgba(232,89,60,0.85)", border: "none", borderRadius: "50%",
                      width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", fontSize: 10, zIndex: 2,
                    }}>✎</button>
                  )}
                  {editedFiles[f.id] && f.status === "pending" && (
                    <div style={{ position: "absolute", bottom: 28, right: 4, background: "rgba(74,222,128,0.9)",
                      borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 700, color: "#000" }}>Retouché</div>
                  )}
                  {/* Remove btn */}
                  {f.status !== "uploading" && (
                    <button onClick={() => removeFile(f.id)} style={{
                      position: "absolute", top: f.status === "error" ? 4 : 4, right: 4, background: "rgba(0,0,0,0.6)",
                      border: "none", borderRadius: "50%", width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", cursor: "pointer", opacity: 0.7,
                    }}>{Icon.X(10)}</button>
                  )}
                  {/* File info */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "16px 6px 6px" }}>
                    <p style={{ fontSize: 9, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{formatSize(f.size)}</p>
                  </div>
                </div>
              );
            })}
            {/* Add more tile */}
            <div onClick={() => fileInputRef.current?.click()} style={{
              borderRadius: T.radiusSm, border: "2px dashed rgba(255,255,255,0.1)",
              aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, cursor: "pointer", color: T.textMuted, fontSize: 11,
            }}>
              {Icon.Plus(18)}
              <span>Ajouter</span>
            </div>
          </div>

          {/* Résumé upload réussi */}
          {uploadSummary && !uploading && (
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: T.green, fontSize: 18 }}>✓</span>
              <p style={{ fontSize: 13, color: T.green }}>
                <strong>{uploadSummary.count}</strong> photo{uploadSummary.count > 1 ? "s" : ""} ajoutée{uploadSummary.count > 1 ? "s" : ""} à <strong>{uploadSummary.eventName}</strong>
              </p>
            </div>
          )}

          {/* Upload bar */}
          <div style={{
            background: T.card, borderRadius: T.radius, border: "1px solid " + T.border,
            padding: "18px 22px",
          }}>
            {/* Barre de progression globale */}
            {uploading && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
                  <span>Envoi en cours...</span>
                  <span style={{ color: T.accent, fontWeight: 600 }}>{uploadProgress.done} / {uploadProgress.total}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: uploadPct + "%", background: T.accent, borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                {!selectedEvent && <p style={{ fontSize: 12, color: T.accent, display: "flex", alignItems: "center", gap: 6 }}>{Icon.AlertCircle(14)} Sélectionnez un événement</p>}
                {selectedEvent && pendingCount > 0 && <p style={{ fontSize: 13, color: T.textMuted }}><strong style={{ color: T.text }}>{pendingCount}</strong> prête{pendingCount > 1 ? "s" : ""} · {formatSize(files.filter((f) => f.status === "pending").reduce((a, f) => a + f.size, 0))}</p>}
                {selectedEvent && pendingCount === 0 && doneCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 6 }}>{Icon.Check(14)} Toutes envoyées !</p>
                    <button onClick={() => { files.forEach((f) => URL.revokeObjectURL(f.preview)); setFiles([]); setSelectedEvent(""); setUploadSummary(null); }} style={{ background: T.accentDim, border: "none", borderRadius: 8, padding: "5px 14px", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Terminer & vider</button>
                  </div>
                )}
              </div>
              <Btn onClick={handleUpload} disabled={!selectedEvent || pendingCount === 0 || uploading}>
                {uploading ? <span>Envoi en cours...</span> : <span>{Icon.Upload(16)} Envoyer ({pendingCount})</span>}
              </Btn>
            </div>
          </div>
        </>
      )}
      {editingFile && editingTools && (
        <PhotoEditorModal
          file={editingFile}
          tools={editingTools}
          onSave={(editedFile) => {
            setEditedFiles(prev => ({ ...prev, [editingFile.id]: editedFile }));
            setFiles(prev => prev.map(f => f.id === editingFile.id ? { ...f, preview: URL.createObjectURL(editedFile) } : f));
            setEditingFile(null);
          }}
          onCancel={() => setEditingFile(null)}
        />
      )}
    </div>
  );
}



