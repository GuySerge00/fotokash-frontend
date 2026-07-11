import { useState } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";
import { Btn } from "../../components/Btn";
import { Input } from "../../components/Input";
import EventPhotosViewer from "./EventPhotosViewer";


export default function EventsTab({ token, events, setEvents, loading, onNavigate }) {
  const today = new Date().toISOString().split('T')[0];
  const [showForm, setShowForm] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [form, setForm] = useState({ name: "", date: today, location: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPin, setCopiedPin] = useState(null);

  const createEvent = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => [data.event || data, ...prev]);
        setForm({ name: "", date: today, location: "", description: "" });
        setShowForm(false);
      }
    } catch {}
    setCreating(false);
  };

  const toggleLive = (e) => {
    const action = e.is_live ? "stop" : "start";
    fetch(API + "/live/" + e.id + "/" + action, { method: "POST", headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.event) setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, is_live: d.event.is_live } : x));
      });
  };

  const copyLink = (e) => {
    navigator.clipboard.writeText("https://fotokash.com/e/" + e.slug).then(() => {
      setCopiedId(e.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
    setMenuOpen(null);
  };

  const startRename = (e) => {
    setRenamingId(e.id);
    setRenameValue(e.name);
    setMenuOpen(null);
  };

  const submitRename = (e) => {
    const newName = renameValue.trim();
    if (!newName || newName === e.name) { setRenamingId(null); return; }
    fetch(API + "/events/" + e.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ name: newName }),
    }).then((r) => r.json()).then((d) => {
      if (d.event) setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, name: d.event.name } : x));
    });
    setRenamingId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    fetch(API + "/events/" + deleteTarget.id, { method: "DELETE", headers: { Authorization: "Bearer " + token } })
      .then((r) => { if (r.ok) setEvents((prev) => prev.filter((x) => x.id !== deleteTarget.id)); });
    setDeleteTarget(null);
  };

  const fmtRevenue = (v) => {
    if (!v) return "0 F";
    return new Intl.NumberFormat("fr-FR").format(v) + " F";
  };

  // Tag d'expiration
  const expirationTag = (e) => {
    if (e.days_remaining === null || e.days_remaining === undefined) return null;
    if (e.days_remaining <= 0) return { label: 'Expiré', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    if (e.days_remaining <= 3) return { label: e.days_remaining + 'j restant' + (e.days_remaining > 1 ? 's' : ''), bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    if (e.days_remaining <= 5) return { label: e.days_remaining + 'j restants', bg: 'rgba(234,179,8,0.15)', color: '#eab308' };
    return null;
  };

  return (
    <div onClick={() => setMenuOpen(null)}>
      {/* Modal suppression */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setDeleteTarget(null)}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: T.card, borderRadius: T.radius, padding: "28px 24px", maxWidth: 340, width: "100%", border: "1px solid " + T.border }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Supprimer l'événement ?</h3>
            <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              <strong style={{ color: T.text }}>{deleteTarget.name}</strong> et toutes ses photos seront supprimés définitivement.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Annuler</Btn>
              <button onClick={confirmDelete} style={{ flex: 1, background: T.red, color: "#fff", border: "none", padding: "10px 0", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700 }}>Mes événements</h2>
        <Btn data-tour="new-event" onClick={() => setShowForm(!showForm)}>{Icon.Plus(16)} Nouvel événement</Btn>
      </div>

      {showForm && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px", marginBottom: 20, animation: "slideDown 0.3s ease" }}>
          <Input label="Nom de l'événement" placeholder="Ex: Mariage Kouamé" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ colorScheme: "dark" }} />
            <Input label="Lieu" placeholder="Abidjan, Cocody" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Input label="Description (optionnel)" placeholder="Quelques détails..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn onClick={createEvent} disabled={!form.name.trim() || creating}>{creating ? "Création..." : "Créer"}</Btn>
          </div>
        </div>
      )}

      {viewingEvent && (
        <EventPhotosViewer eventId={viewingEvent.id} eventName={viewingEvent.name} token={token} onClose={() => setViewingEvent(null)} />
      )}

      {loading && <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 40 }}>Chargement...</p>}

      {!loading && events.length === 0 && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: T.textMuted, marginBottom: 12 }}>{Icon.Calendar(32)}</div>
          <p style={{ color: T.textMuted, fontSize: 14 }}>Aucun événement pour le moment</p>
          <p style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>Créez votre premier événement pour commencer</p>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + (e.is_live ? "rgba(74,222,128,0.35)" : T.border), padding: "18px 20px", transition: "border-color 0.2s" }} onClick={(ev) => ev.stopPropagation()}>

              {/* Header : nom + badge live + menu ⋯ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {renamingId === e.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(ev) => setRenameValue(ev.target.value)}
                        onKeyDown={(ev) => { if (ev.key === "Enter") submitRename(e); if (ev.key === "Escape") setRenamingId(null); }}
                        style={{ flex: 1, background: T.cardAlt, border: "1px solid " + T.accent, borderRadius: T.radiusSm, padding: "5px 10px", color: T.text, fontSize: 14, fontWeight: 600, fontFamily: T.font, outline: "none" }}
                      />
                      <button onClick={() => submitRename(e)} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>OK</button>
                      <button onClick={() => setRenamingId(null)} style={{ background: T.cardAlt, color: T.textMuted, border: "none", borderRadius: T.radiusSm, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: T.font }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{e.name}</span>
                      {e.is_live && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(74,222,128,0.15)", color: T.green }}>● EN DIRECT</span>}
                      {expirationTag(e) && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: expirationTag(e).bg, color: expirationTag(e).color }}>{expirationTag(e).label}</span>}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: T.textMuted, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {e.date && <span>{new Date(e.date).toLocaleDateString("fr-FR")}</span>}
                    {e.location && <span>{e.location}</span>}
                  </div>
                </div>

                {/* Menu ⋯ */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 10 }} onClick={(ev) => ev.stopPropagation()}>
                  <button onClick={() => copyLink(e)} title="Copier le lien" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid " + T.border, borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: copiedId === e.id ? T.accent : T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>{copiedId === e.id ? Icon.Check(15) : Icon.Link(15)}</button>
                  <div style={{ position: "relative" }}>
                  <button data-tour="owner-pin-menu" onClick={() => setMenuOpen(menuOpen === e.id ? null : e.id)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid " + T.border, borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: T.textMuted, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>⋯</button>
                  {menuOpen === e.id && (
                    <div style={{ position: "absolute", right: 0, top: 38, background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, zIndex: 200, minWidth: 170, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                      {[
                        { icon: copiedId === e.id ? Icon.Check(14) : Icon.Link(14), label: copiedId === e.id ? "Lien copié !" : "Copier le lien", action: () => copyLink(e) },
                        { icon: copiedPin === e.id ? Icon.Check(14) : Icon.Key(14), label: copiedPin === e.id ? "Code copié !" : "Code propriétaire" + (e.owner_pin ? " : " + e.owner_pin : ""), action: () => { if (e.owner_pin) { navigator.clipboard.writeText(e.owner_pin).then(() => { setCopiedPin(e.id); setTimeout(() => setCopiedPin(null), 2000); }); } setMenuOpen(null); } },
                        { icon: Icon.ExternalLink(14), label: "Voir la page", action: () => { window.open("https://fotokash.com/e/" + e.slug, "_blank"); setMenuOpen(null); } },
                        { icon: Icon.Edit(14), label: "Renommer", action: () => startRename(e) },
                        { icon: Icon.Trash(14), label: "Supprimer", action: () => { setDeleteTarget(e); setMenuOpen(null); }, red: true },
                      ].map((item, i) => (
                        <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, cursor: "pointer", color: item.red ? T.red : T.text, fontFamily: T.font, borderTop: i > 0 ? "1px solid " + T.border : "none" }}>
                          {item.icon}{item.label}
                        </button>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* Stats : photos / vendues / revenus */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { n: e.photos_count || 0, l: "photos" },
                  { n: e.photos_sold || 0, l: "vendues" },
                  { n: fmtRevenue(e.total_revenue), l: "revenus" },
                ].map((s, i) => (
                  <div key={i} style={{ background: T.cardAlt, borderRadius: T.radiusSm, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Boutons d'action principaux */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setViewingEvent(e)} style={{ background: T.accentDim, border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: T.accent, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>Voir photos</button>
                <button onClick={() => toggleLive(e)} style={{ background: e.is_live ? "rgba(74,222,128,0.12)" : "rgba(232,89,60,0.1)", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: e.is_live ? T.green : T.accent, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>
                  {e.is_live ? "⏹ Stop Live" : "▶ Activer Live"}
                </button>
                {e.is_live && (
                  <button onClick={() => onNavigate("live", { slug: e.slug })} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: T.textMuted, fontSize: 12, fontWeight: 600, fontFamily: T.font }}>Voir live ↗</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


