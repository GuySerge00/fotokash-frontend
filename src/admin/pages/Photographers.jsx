import { useState, useEffect } from 'react';
import './Photographers.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatFCFA = (amount) => new Intl.NumberFormat('fr-FR').format(Math.round(amount));
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const Photographers = ({ token }) => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [adminGallery, setAdminGallery] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPhotographers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${API_URL}/admin/photographers?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPhotographers(data.photographers || []);
      }
    } catch (err) {
      console.error('Erreur chargement photographes:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_URL}/admin/photographers/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPhotographers(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        if (detail && detail.photographer.id === id) {
          setDetail(prev => ({ ...prev, photographer: { ...prev.photographer, status: newStatus } }));
        }
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
    }
  };

  const viewDetail = async (id) => {
    setSelected(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/photographers/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch (err) {
      console.error('Erreur détails:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, [statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchPhotographers(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const planColors = { free: '#6b6b80', pro: '#E8593C', business: '#FFB826' };

  return (
    <div className="photographers-page">
      {/* Header */}
      <div className="photo-header">
        <div>
          <h1 className="photo-title">Photographes</h1>
          <p className="photo-subtitle">{photographers.length} compte{photographers.length > 1 ? 's' : ''} enregistré{photographers.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="photo-filters">
        <div className="photo-search-box">
          <span className="photo-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="photo-search-input"
          />
        </div>
        <div className="photo-status-filter">
          {['all', 'active', 'inactive'].map(s => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'}
            </button>
          ))}
        </div>
      </div>

      <div className="photo-layout">
        {/* Liste */}
        <div className="photo-list-container">
          {loading ? (
            <div className="photo-loading">Chargement...</div>
          ) : photographers.length === 0 ? (
            <div className="photo-empty">Aucun photographe trouvé</div>
          ) : (
            <div className="photo-list">
              {photographers.map(p => (
                <div
                  key={p.id}
                  className={`photo-card ${selected === p.id ? 'selected' : ''}`}
                  onClick={() => viewDetail(p.id)}
                >
                  <div className="photo-card-top">
                    <div className="photo-avatar">{p.studioName.charAt(0).toUpperCase()}</div>
                    <div className="photo-card-info">
                      <span className="photo-card-name">{p.studioName}</span>
                      <span className="photo-card-email">{p.email}</span>
                    </div>
                    <span className={`photo-status-badge ${p.status}`}>
                      {p.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="photo-card-stats">
                    <div className="photo-stat">
                      <span className="photo-stat-value">{p.totalPhotos}</span>
                      <span className="photo-stat-label">Photos</span>
                    </div>
                    <div className="photo-stat">
                      <span className="photo-stat-value">{p.totalEvents}</span>
                      <span className="photo-stat-label">Events</span>
                    </div>
                    <div className="photo-stat">
                      <span className="photo-stat-value">{formatFCFA(p.totalRevenue)}</span>
                      <span className="photo-stat-label">Revenus</span>
                    </div>
                    <div className="photo-stat">
                      <span className="photo-stat-value" style={{ color: planColors[p.plan] || '#6b6b80' }}>{p.plan.toUpperCase()}</span>
                      <span className="photo-stat-label">Plan</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="photo-detail-panel">
            {detailLoading ? (
              <div className="photo-loading">Chargement...</div>
            ) : detail ? (
              <>
                <div className="detail-header">
                  <div className="detail-avatar">{detail.photographer.studioName.charAt(0).toUpperCase()}</div>
                  <h2 className="detail-name">{detail.photographer.studioName}</h2>
                  <p className="detail-email">{detail.photographer.email}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { setShowEditForm(!showEditForm); if (!showEditForm) { setEditName(detail.photographer.studioName || ""); setEditEmail(detail.photographer.email || ""); setEditPhone(detail.photographer.phone || ""); } setShowEmailForm(false); }} style={{ background: "rgba(129,140,248,0.12)", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#818CF8", fontSize: 12, fontWeight: 600 }}>
                    {showEditForm ? "Annuler" : "Modifier infos"}
                  </button>
                  <button onClick={() => { setShowEmailForm(!showEmailForm); setShowEditForm(false); }} style={{ background: "#E8593C22", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", color: "#E8593C", fontSize: 12, fontWeight: 600 }}>
                    {showEmailForm ? "Annuler" : "Envoyer un email"}
                  </button>
                  </div>
                  {showEditForm && (
                    <div style={{ marginTop: 12, padding: 16, background: "#0B0B0F", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <label style={{ fontSize: 11, color: "#8888A0", display: "block", marginBottom: 4 }}>Nom / Studio</label>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#141419", color: "#F0F0F5", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
                      <label style={{ fontSize: 11, color: "#8888A0", display: "block", marginBottom: 4 }}>Email</label>
                      <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#141419", color: "#F0F0F5", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
                      <label style={{ fontSize: 11, color: "#8888A0", display: "block", marginBottom: 4 }}>Telephone</label>
                      <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#141419", color: "#F0F0F5", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
                      <button disabled={editSaving} onClick={() => {
                        setEditSaving(true);
                        fetch(API_URL + "/admin/photographers/" + detail.photographer.id + "/info", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                          body: JSON.stringify({ studio_name: editName, email: editEmail, phone: editPhone })
                        }).then(r => r.json()).then(d => {
                          if (d.photographer) {
                            alert("Informations mises a jour !");
                            setDetail(prev => ({ ...prev, photographer: { ...prev.photographer, studioName: d.photographer.studio_name, email: d.photographer.email, phone: d.photographer.phone } }));
                            setShowEditForm(false);
                            fetchPhotographers();
                          } else { alert(d.error || "Erreur"); }
                        }).catch(() => alert("Erreur connexion")).finally(() => setEditSaving(false));
                      }} style={{ background: "#818CF8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: editSaving ? 0.5 : 1 }}>
                        {editSaving ? "Sauvegarde..." : "Sauvegarder"}
                      </button>
                    </div>
                  )}
                  {showEmailForm && (
                    <div style={{ marginTop: 12, padding: 16, background: "#0B0B0F", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Sujet" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#141419", color: "#F0F0F5", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                      <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Message..." rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#141419", color: "#F0F0F5", fontSize: 13, marginBottom: 8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                      <button disabled={emailSending || !emailSubject.trim() || !emailMessage.trim()} onClick={() => {
                        setEmailSending(true);
                        fetch(API_URL + "/admin/send-email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                          body: JSON.stringify({ photographer_id: detail.photographer.id, subject: emailSubject, message: emailMessage })
                        }).then(r => r.json()).then(d => {
                          if (d.message) { alert("Email envoye !"); setShowEmailForm(false); setEmailSubject(""); setEmailMessage(""); }
                          else { alert(d.error || "Erreur envoi"); }
                        }).catch(() => alert("Erreur connexion")).finally(() => setEmailSending(false));
                      }} style={{ background: "#E8593C", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: emailSending ? 0.5 : 1 }}>
                        {emailSending ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>
                  )}
                  {detail.photographer.phone && <p className="detail-phone">{detail.photographer.phone}</p>}
                  <span className={`photo-status-badge large ${detail.photographer.status}`}>
                    {detail.photographer.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="detail-stats-grid">
                  <div className="detail-stat-card">
                    <span className="detail-stat-value">{detail.photographer.totalPhotos}</span>
                    <span className="detail-stat-label">Photos</span>
                  </div>
                  <div className="detail-stat-card">
                    <span className="detail-stat-value">{detail.photographer.totalEvents}</span>
                    <span className="detail-stat-label">Événements</span>
                  </div>
                  <div className="detail-stat-card">
                    <span className="detail-stat-value">{formatFCFA(detail.photographer.totalRevenue)}</span>
                    <span className="detail-stat-label">Revenus F CFA</span>
                  </div>
                  <div className="detail-stat-card">
                    <span className="detail-stat-value">{detail.photographer.totalSales}</span>
                    <span className="detail-stat-label">Ventes</span>
                  </div>
                </div>

                <div className="detail-info">
                  <div className="detail-info-row">
                    <span>Plan</span>
                    <span style={{ color: planColors[detail.photographer.plan] || '#6b6b80', fontWeight: 600 }}>
                      {detail.photographer.plan.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-info-row">
                    <span>Limite photos</span>
                    <span>{detail.photographer.photoLimit}</span>
                  </div>
                  <div className="detail-info-row">
                    <span>Inscrit le</span>
                    <span>{formatDate(detail.photographer.createdAt)}</span>
                  </div>
                </div>

                {/* Events list */}
                {detail.events && detail.events.length > 0 && (
                  <div className="detail-events">
                    <h3 className="detail-section-title">Événements récents</h3>
                    {detail.events.map(e => (
                      <div key={e.id} className="detail-event-item">
                        <div>
                          <span className="detail-event-name">{e.name}</span>
                          <span className="detail-event-date">{e.date ? formatDate(e.date) : '—'}</span>
                          <span className="detail-event-date" style={{fontSize: 11, color: "#888"}}>Créé le {e.createdAt ? formatDate(e.createdAt) : '—'}</span>
                        </div>
                        <span className="detail-event-photos">{e.photoCount} photos</span>
                        <button onClick={() => {
                          fetch(API_URL + "/admin/events/" + e.id + "/photos", { headers: { Authorization: "Bearer " + token } })
                            .then(r => r.json())
                            .then(d => { setAdminGallery(d.event); setGalleryPhotos(d.photos || []); })
                            .catch(() => {});
                        }} style={{ background: "#E8593C22", border: "none", borderRadius: 6, padding: "2px 8px", cursor: "pointer", color: "#E8593C", fontSize: 10, fontWeight: 600, marginLeft: 6 }}>Voir photos</button>
                        {e.daysRemaining !== null && e.daysRemaining <= 5 && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginLeft: 8, background: e.daysRemaining <= 3 ? "rgba(239,68,68,0.15)" : "rgba(255,184,38,0.15)", color: e.daysRemaining <= 3 ? "#EF4444" : "#FFB826" }}>
                            {e.daysRemaining <= 0 ? "Expire" : e.daysRemaining <= 3 ? "Suppression dans " + e.daysRemaining + "j" : "Expire dans " + e.daysRemaining + "j"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Galerie admin */}
                {adminGallery && (
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 className="detail-section-title" style={{ margin: 0 }}>Photos - {adminGallery.name}</h3>
                      <button onClick={() => { setAdminGallery(null); setGalleryPhotos([]); }} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 12 }}>Fermer</button>
                    </div>
                    {galleryPhotos.length === 0 ? (
                      <p style={{ color: "#888", fontSize: 13 }}>Aucune photo</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                        {galleryPhotos.map(p => (
                          <div key={p.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1", background: "#1a1a22" }}>
                            <img src={p.thumbnail_url || p.watermarked_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <a href={p.original_url} download={"fotokash-" + p.id + ".jpg"} target="_blank" rel="noopener noreferrer"
                              onClick={(ev) => ev.stopPropagation()}
                              style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "3px 8px", color: "#fff", fontSize: 10, textDecoration: "none", fontWeight: 600 }}>
                              HD
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Changer le plan */}
                <div className="detail-plan-change">
                  <h3 className="detail-section-title">Changer le plan</h3>
                  <div className="plan-buttons">
                    {['free', 'pro', 'business'].map(plan => (
                      <button
                        key={plan}
                        className={`plan-change-btn ${detail.photographer.plan === plan ? 'current' : ''}`}
                        onClick={async () => {
                          if (detail.photographer.plan === plan) return;
                          try {
                            const res = await fetch(`${API_URL}/admin/photographers/${detail.photographer.id}/plan`, {
                              method: 'PATCH', headers, body: JSON.stringify({ plan })
                            });
                            if (res.ok) {
                              setDetail(prev => ({ ...prev, photographer: { ...prev.photographer, plan } }));
                              setPhotographers(prev => prev.map(p => p.id === detail.photographer.id ? { ...p, plan } : p));
                            }
                          } catch (err) { console.error(err); }
                        }}
                        style={{ borderColor: detail.photographer.plan === plan ? (planColors[plan] || '#6b6b80') : undefined }}
                      >
                        {plan.toUpperCase()}
                        {detail.photographer.plan === plan && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="detail-actions">
                  <button className="action-btn activate" onClick={async () => { if (window.confirm("Reinitialiser le mot de passe ?")) { try { const res = await fetch(API_URL + "/admin/photographers/" + detail.photographer.id + "/password", { method: "PATCH", headers }); const data = await res.json(); if (res.ok) alert("Nouveau mot de passe : " + data.defaultPassword); } catch(e){console.error(e)} } }}>
                    Reinitialiser le mot de passe
                  </button>
                  <button className={"action-btn " + (detail.photographer.status === "active" ? "deactivate" : "activate")} onClick={() => toggleStatus(detail.photographer.id, detail.photographer.status)}>
                    {detail.photographer.status === "active" ? "Desactiver le compte" : "Activer le compte"}
                  </button>
                  <button className="action-btn deactivate" onClick={async () => { if (window.confirm("Supprimer definitivement ce compte ?")) { try { const res = await fetch(API_URL + "/admin/photographers/" + detail.photographer.id, { method: "DELETE", headers }); if (res.ok) { setPhotographers(function(prev){return prev.filter(function(x){return x.id !== detail.photographer.id})}); setSelected(null); setDetail(null); } } catch(e){console.error(e)} } }}>
                    Supprimer definitivement
                  </button>
                  <button className="action-btn close" onClick={() => { setSelected(null); setDetail(null); }}>
                    Fermer
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Photographers;
