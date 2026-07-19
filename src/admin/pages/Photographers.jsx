import { useState, useEffect, useCallback } from 'react';
import './Photographers.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatFCFA = (amount) => new Intl.NumberFormat('fr-FR').format(Math.round(amount));
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/* ─── Icons ───────────────────────────────────────────────── */
const IconArrowLeft = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IconImage = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconCalendar = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconCreditCard = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IconSales = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const IconPlus = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconAlert = (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

/* ─── Modals ──────────────────────────────────────────────── */
const PasswordModal = ({ password, onClose }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
    <div style={{ background:'#1a1a24',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28,width:360,maxWidth:'90vw' }}>
      <h3 style={{ margin:'0 0 8px',color:'#F0F0F5',fontSize:16,fontWeight:700 }}>Nouveau mot de passe</h3>
      <p style={{ margin:'0 0 16px',color:'#8888A0',fontSize:13 }}>Transmettez-le au photographe en lieu sûr.</p>
      <div style={{ background:'#0B0B0F',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:10,marginBottom:18 }}>
        <span style={{ flex:1,fontFamily:'monospace',fontSize:15,color:'#E8593C',letterSpacing:1,wordBreak:'break-all' }}>{password}</span>
        <button onClick={() => { navigator.clipboard.writeText(password); }} style={{ background:'rgba(232,89,60,0.15)',border:'none',borderRadius:6,padding:'6px 12px',color:'#E8593C',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
          Copier
        </button>
      </div>
      <button onClick={onClose} style={{ width:'100%',background:'#E8593C',color:'#fff',border:'none',borderRadius:8,padding:'11px 0',fontSize:14,fontWeight:700,cursor:'pointer' }}>
        Fermer
      </button>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, confirmLabel='Confirmer', danger=false, onConfirm, onCancel, requireTyped=null }) => {
  const [typed, setTyped] = useState('');
  const ok = requireTyped ? typed === requireTyped : true;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#1a1a24',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28,width:380,maxWidth:'90vw' }}>
        <h3 style={{ margin:'0 0 8px',color:'#F0F0F5',fontSize:16,fontWeight:700 }}>{title}</h3>
        <p style={{ margin:'0 0 16px',color:'#8888A0',fontSize:13 }}>{message}</p>
        {requireTyped && (
          <div style={{ marginBottom:16 }}>
            <p style={{ margin:'0 0 6px',color:'#8888A0',fontSize:12 }}>Tapez <strong style={{color:'#EF4444'}}>{requireTyped}</strong> pour confirmer :</p>
            <input value={typed} onChange={e=>setTyped(e.target.value)}
              placeholder={requireTyped}
              style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'#0B0B0F',color:'#F0F0F5',fontSize:13,boxSizing:'border-box' }} />
          </div>
        )}
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,background:'rgba(255,255,255,0.06)',border:'none',borderRadius:8,padding:'11px 0',color:'#8888A0',fontSize:14,fontWeight:600,cursor:'pointer' }}>
            Annuler
          </button>
          <button disabled={!ok} onClick={onConfirm} style={{ flex:1,background:danger?'#EF4444':'#E8593C',color:'#fff',border:'none',borderRadius:8,padding:'11px 0',fontSize:14,fontWeight:700,cursor:ok?'pointer':'not-allowed',opacity:ok?1:0.4 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreatePhotographerModal = ({ onCreate, onCancel, creating }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('free');
  const planColors = { free: '#8888A0', pro: '#E8593C', business: '#FFB826' };
  const canSubmit = name.trim() && email.trim() && !creating;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#1a1a24',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28,width:400,maxWidth:'90vw' }}>
        <h3 style={{ margin:'0 0 18px',color:'#F0F0F5',fontSize:16,fontWeight:700 }}>Nouveau photographe</h3>
        <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Nom du studio *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Studio Lumière CI" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#0B0B0F', color:'#F0F0F5', fontSize:13, marginBottom:12, boxSizing:'border-box' }} />
        <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Email *</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="studio@email.com" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#0B0B0F', color:'#F0F0F5', fontSize:13, marginBottom:12, boxSizing:'border-box' }} />
        <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Téléphone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+225 07 00 00 00 00" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#0B0B0F', color:'#F0F0F5', fontSize:13, marginBottom:12, boxSizing:'border-box' }} />
        <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:6 }}>Plan</label>
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {['free','pro','business'].map(p => (
            <button key={p} type="button" onClick={() => setPlan(p)} style={{
              flex:1, padding:'9px 0', borderRadius:8,
              border: '1px solid ' + (plan === p ? (planColors[p] || '#6b6b80') : 'rgba(255,255,255,0.08)'),
              background: plan === p ? 'rgba(232,89,60,0.08)' : 'rgba(255,255,255,0.03)',
              color: plan === p ? (planColors[p] || '#f0f0f5') : '#8b8b9e',
              fontSize:12, fontWeight:700, cursor:'pointer'
            }}>{p.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,background:'rgba(255,255,255,0.06)',border:'none',borderRadius:8,padding:'11px 0',color:'#8888A0',fontSize:14,fontWeight:600,cursor:'pointer' }}>
            Annuler
          </button>
          <button disabled={!canSubmit} onClick={() => onCreate({ studio_name: name.trim(), email: email.trim(), phone: phone.trim(), plan })} style={{ flex:1,background:'#E8593C',color:'#fff',border:'none',borderRadius:8,padding:'11px 0',fontSize:14,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',opacity:canSubmit?1:0.4 }}>
            {creating ? 'Création...' : 'Créer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Photographers = ({ token, showToast }) => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue_desc');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [adminGallery, setAdminGallery] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals
  const [passwordModal, setPasswordModal] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [planConfirm, setPlanConfirm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const toast = useCallback((msg, type='success') => {
    if (showToast) showToast(msg, type);
  }, [showToast]);

  const fetchPhotographers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
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
        toast(newStatus === 'active' ? 'Compte activé' : 'Compte désactivé');
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
      toast('Erreur de connexion', 'error');
    }
  };

  const viewDetail = async (id) => {
    setSelected(id);
    setDetail(null);
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

  const backToList = () => {
    setSelected(null);
    setDetail(null);
    setShowEditForm(false);
    setShowEmailForm(false);
    setAdminGallery(null);
    setGalleryPhotos([]);
  };

  const doResetPassword = async () => {
    setResetConfirm(false);
    try {
      const res = await fetch(`${API_URL}/admin/photographers/${detail.photographer.id}/password`, { method: 'PATCH', headers });
      const data = await res.json();
      if (res.ok) {
        setPasswordModal(data.defaultPassword);
      } else {
        toast(data.error || 'Erreur lors de la réinitialisation', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Erreur de connexion', 'error');
    }
  };

  const doDeletePhotographer = async () => {
    setDeleteConfirm(false);
    try {
      const res = await fetch(`${API_URL}/admin/photographers/${detail.photographer.id}`, { method: 'DELETE', headers });
      if (res.ok) {
        toast('Compte supprimé définitivement');
        setPhotographers(prev => prev.filter(x => x.id !== detail.photographer.id));
        backToList();
      } else {
        toast('Erreur lors de la suppression', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Erreur de connexion', 'error');
    }
  };

  const doChangePlan = async (plan) => {
    setPlanConfirm(null);
    try {
      const res = await fetch(`${API_URL}/admin/photographers/${detail.photographer.id}/plan`, {
        method: 'PATCH', headers, body: JSON.stringify({ plan })
      });
      if (res.ok) {
        setDetail(prev => ({ ...prev, photographer: { ...prev.photographer, plan } }));
        setPhotographers(prev => prev.map(p => p.id === detail.photographer.id ? { ...p, plan } : p));
        toast(`Plan changé vers ${plan.toUpperCase()}`);
      } else {
        toast('Erreur lors du changement de plan', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Erreur de connexion', 'error');
    }
  };

  const doCreatePhotographer = async (form) => {
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/admin/photographers`, { method: 'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        toast('Photographe créé avec succès');
        await fetchPhotographers();
        setPasswordModal(data.defaultPassword);
        viewDetail(data.photographer.id);
      } else {
        toast(data.error || 'Erreur lors de la création', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Erreur de connexion', 'error');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => { fetchPhotographers(); }, []);
  useEffect(() => {
    const timeout = setTimeout(() => fetchPhotographers(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const planColors = { free: '#8888A0', pro: '#E8593C', business: '#FFB826' };
  const planBadgeStyle = (plan) => ({
    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
    background: plan === 'pro' ? 'rgba(232,89,60,0.15)' : plan === 'business' ? 'rgba(255,184,38,0.15)' : 'rgba(255,255,255,0.08)',
    color: planColors[plan] || '#8888A0', textTransform: 'uppercase', letterSpacing: 0.5,
  });
  const isDormant = (p) => (p.totalPhotos || 0) === 0 && (p.totalEvents || 0) === 0 && (p.totalRevenue || 0) === 0;

  const counts = {
    all: photographers.length,
    active: photographers.filter(p => p.status === 'active').length,
    inactive: photographers.filter(p => p.status === 'inactive').length,
  };
  const filtered = statusFilter === 'all' ? photographers : photographers.filter(p => p.status === statusFilter);
  const sortFns = {
    revenue_desc: (a,b) => (b.totalRevenue||0) - (a.totalRevenue||0),
    revenue_asc: (a,b) => (a.totalRevenue||0) - (b.totalRevenue||0),
    recent: (a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0),
    name: (a,b) => (a.studioName||'').localeCompare(b.studioName||''),
  };
  const displayed = [...filtered].sort(sortFns[sortBy] || sortFns.revenue_desc);

  const outlineBtn = { background:'transparent', border:'1px solid rgba(255,255,255,0.14)', borderRadius:8, padding:'8px 14px', color:'#c8c8d8', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' };

  return (
    <div className="photographers-page">
      {/* Modals */}
      {passwordModal && <PasswordModal password={passwordModal} onClose={() => setPasswordModal(null)} />}
      {resetConfirm && (
        <ConfirmModal
          title="Réinitialiser le mot de passe"
          message={`Réinitialiser le mot de passe de ${detail?.photographer?.studioName} ? Un nouveau mot de passe temporaire sera généré.`}
          confirmLabel="Réinitialiser"
          danger={false}
          onConfirm={doResetPassword}
          onCancel={() => setResetConfirm(false)}
        />
      )}
      {deleteConfirm && (
        <ConfirmModal
          title="Supprimer définitivement"
          message={`Cette action est irréversible. Toutes les données de ${detail?.photographer?.studioName} seront supprimées.`}
          confirmLabel="Supprimer"
          danger={true}
          requireTyped="SUPPRIMER"
          onConfirm={doDeletePhotographer}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}
      {planConfirm && (
        <ConfirmModal
          title="Changer le plan"
          message={`Changer le plan de ${detail?.photographer?.studioName} vers ${planConfirm.plan.toUpperCase()} ?`}
          confirmLabel="Confirmer"
          danger={false}
          onConfirm={() => doChangePlan(planConfirm.plan)}
          onCancel={() => setPlanConfirm(null)}
        />
      )}
      {showCreateModal && (
        <CreatePhotographerModal
          onCreate={doCreatePhotographer}
          onCancel={() => setShowCreateModal(false)}
          creating={creating}
        />
      )}

      {!selected ? (
        <>
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
                  {s === 'all' ? 'Tous' : s === 'active' ? 'Actifs' : 'Inactifs'} ({counts[s]})
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#f0f0f5', fontSize:13, outline:'none', cursor:'pointer', fontFamily:'DM Sans, system-ui, sans-serif' }}>
              <option value="revenue_desc">Revenus décroissants</option>
              <option value="revenue_asc">Revenus croissants</option>
              <option value="recent">Plus récents</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="photo-loading">Chargement...</div>
          ) : displayed.length === 0 ? (
            <div className="photo-empty">Aucun photographe trouvé</div>
          ) : (
            <div className="photo-list">
              {displayed.map(p => (
                <div
                  key={p.id}
                  className={`photo-card ${isDormant(p) ? 'dormant' : ''}`}
                  onClick={() => viewDetail(p.id)}
                >
                  <div className="photo-card-top">
                    <div className="photo-avatar">{p.studioName.charAt(0).toUpperCase()}</div>
                    <div className="photo-card-info">
                      <span className="photo-card-name">{p.studioName}</span>
                      <span className="photo-card-email">{p.email}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                    <span className={`photo-status-badge ${p.status}`}>{p.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    <span style={planBadgeStyle(p.plan)}>{p.plan.toUpperCase()}</span>
                  </div>
                  <div className="photo-card-stats" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
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
                  </div>
                  <div className="photo-card-bottom">
                    <span></span>
                    <span style={{ color:'#E8593C', fontSize:12, fontWeight:600 }}>Voir détail →</span>
                  </div>
                </div>
              ))}
              <div
                className="photo-card add-card"
                onClick={() => setShowCreateModal(true)}
                style={{ border:'1.5px dashed rgba(255,255,255,0.14)', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, minHeight:170 }}
              >
                <span style={{ width:36, height:36, borderRadius:'50%', background:'rgba(232,89,60,0.12)', color:'#E8593C', display:'flex', alignItems:'center', justifyContent:'center' }}>{IconPlus(18)}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'#f0f0f5' }}>Ajouter un photographe</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ===== DETAIL VIEW (plein écran) ===== */
        <div className="photo-detail-page">
          <button onClick={backToList} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#8888A0', fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:20, padding:0 }}>
            {IconArrowLeft(15)} Retour à la liste
          </button>

          {detailLoading || !detail ? (
            <div className="photo-loading">Chargement...</div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div className="detail-avatar" style={{ margin:0 }}>{detail.photographer.studioName.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <h2 className="detail-name" style={{ margin:0 }}>{detail.photographer.studioName}</h2>
                      <span className={`photo-status-badge ${detail.photographer.status}`}>{detail.photographer.status === 'active' ? 'Actif' : 'Inactif'}</span>
                    </div>
                    <p className="detail-email" style={{ margin:'2px 0 0' }}>{detail.photographer.email}{detail.photographer.phone ? ' · ' + detail.photographer.phone : ''}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button style={outlineBtn} onClick={() => { setShowEditForm(!showEditForm); if (!showEditForm) { setEditName(detail.photographer.studioName || ''); setEditEmail(detail.photographer.email || ''); setEditPhone(detail.photographer.phone || ''); } setShowEmailForm(false); }}>
                    {showEditForm ? 'Annuler' : 'Modifier infos'}
                  </button>
                  <button style={outlineBtn} onClick={() => { setShowEmailForm(!showEmailForm); setShowEditForm(false); }}>
                    {showEmailForm ? 'Annuler' : 'Envoyer un email'}
                  </button>
                  {detail.photographer.phone && (() => {
                    let phone = detail.photographer.phone.replace(/[^0-9]/g, '');
                    if (phone.startsWith('0') && phone.length <= 10) phone = '225' + phone.slice(1);
                    return (
                      <a href={'https://wa.me/' + phone} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#25D166', border:'none', borderRadius:8, padding:'8px 14px', color:'#0B0B0F', fontSize:12, fontWeight:700, textDecoration:'none' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                    );
                  })()}
                </div>
              </div>

              {showEditForm && (
                <div style={{ marginBottom:20, padding:16, background:'#0B0B0F', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Nom / Studio</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#141419', color:'#F0F0F5', fontSize:13, marginBottom:10, boxSizing:'border-box' }} />
                  <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Email</label>
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#141419', color:'#F0F0F5', fontSize:13, marginBottom:10, boxSizing:'border-box' }} />
                  <label style={{ fontSize:11, color:'#8888A0', display:'block', marginBottom:4 }}>Téléphone</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#141419', color:'#F0F0F5', fontSize:13, marginBottom:10, boxSizing:'border-box' }} />
                  <button disabled={editSaving} onClick={() => {
                    setEditSaving(true);
                    fetch(`${API_URL}/admin/photographers/${detail.photographer.id}/info`, {
                      method: 'PATCH',
                      headers,
                      body: JSON.stringify({ studio_name: editName, email: editEmail, phone: editPhone })
                    }).then(r => r.json()).then(d => {
                      if (d.photographer) {
                        toast('Informations mises à jour');
                        setDetail(prev => ({ ...prev, photographer: { ...prev.photographer, studioName: d.photographer.studio_name, email: d.photographer.email, phone: d.photographer.phone } }));
                        setShowEditForm(false);
                        fetchPhotographers();
                      } else {
                        toast(d.error || 'Erreur', 'error');
                      }
                    }).catch(() => toast('Erreur de connexion', 'error')).finally(() => setEditSaving(false));
                  }} style={{ background:'#818CF8', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', opacity:editSaving?0.5:1 }}>
                    {editSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              )}

              {showEmailForm && (
                <div style={{ marginBottom:20, padding:16, background:'#0B0B0F', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
                  <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Sujet" style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#141419', color:'#F0F0F5', fontSize:13, marginBottom:8, boxSizing:'border-box' }} />
                  <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Message..." rows={4} style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'#141419', color:'#F0F0F5', fontSize:13, marginBottom:8, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} />
                  <button disabled={emailSending || !emailSubject.trim() || !emailMessage.trim()} onClick={() => {
                    setEmailSending(true);
                    fetch(`${API_URL}/admin/send-email`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ photographer_id: detail.photographer.id, subject: emailSubject, message: emailMessage })
                    }).then(r => r.json()).then(d => {
                      if (d.message) {
                        toast('Email envoyé avec succès');
                        setShowEmailForm(false);
                        setEmailSubject('');
                        setEmailMessage('');
                      } else {
                        toast(d.error || 'Erreur envoi', 'error');
                      }
                    }).catch(() => toast('Erreur de connexion', 'error')).finally(() => setEmailSending(false));
                  }} style={{ background:'#E8593C', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', opacity:emailSending?0.5:1 }}>
                    {emailSending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              )}

              {/* Stats en une ligne */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:20 }}>
                {[
                  { icon: IconImage(18), label: 'Photos', value: detail.photographer.totalPhotos, color: '#E8593C' },
                  { icon: IconCalendar(18), label: 'Événements', value: detail.photographer.totalEvents, color: '#818CF8' },
                  { icon: IconCreditCard(18), label: 'Revenus F CFA', value: formatFCFA(detail.photographer.totalRevenue), color: '#4ADE80' },
                  { icon: IconSales(18), label: 'Ventes', value: detail.photographer.totalSales, color: '#FFB826' },
                ].map((s, i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'16px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <span style={{ fontSize:11, color:'#8888A0' }}>{s.label}</span>
                      <span style={{ color:s.color, opacity:0.85 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontSize:20, fontWeight:700, color:'#f0f0f5' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Plan / Limite / Inscrit en mini-cartes */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginBottom:24 }}>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Plan</div>
                  <div style={{ fontSize:16, fontWeight:700, color: planColors[detail.photographer.plan] || '#f0f0f5' }}>{detail.photographer.plan.toUpperCase()}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Limite photos</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f5' }}>{detail.photographer.photoLimit}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Inscrit le</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f5' }}>{formatDate(detail.photographer.createdAt)}</div>
                </div>
              </div>

              {/* Events list */}
              {detail.events && detail.events.length > 0 && (
                <div className="detail-events">
                  <h3 className="detail-section-title">Événements récents</h3>
                  {detail.events.map(e => (
                    <div key={e.id} className="detail-event-item">
                      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                        <span style={{ width:34, height:34, borderRadius:8, background:'#0B0B0F', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', color:'#555568', flexShrink:0 }}>{IconImage(15)}</span>
                        <div style={{ minWidth:0 }}>
                          <span className="detail-event-name" style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</span>
                          <span className="detail-event-date">{e.date ? formatDate(e.date) : '—'} · {e.photoCount} photos</span>
                        </div>
                      </div>
                      <button onClick={() => {
                        fetch(`${API_URL}/admin/events/${e.id}/photos`, { headers: { Authorization: `Bearer ${token}` } })
                          .then(r => r.json())
                          .then(d => { setAdminGallery(d.event); setGalleryPhotos(d.photos || []); })
                          .catch(() => {});
                      }} style={{ background:'#E8593C22', border:'none', borderRadius:6, padding:'2px 8px', cursor:'pointer', color:'#E8593C', fontSize:10, fontWeight:600, marginLeft:6, flexShrink:0 }}>Voir photos</button>
                      {e.daysRemaining !== null && e.daysRemaining <= 5 && (
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, marginLeft:8, flexShrink:0, background: e.daysRemaining <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(255,184,38,0.15)', color: e.daysRemaining <= 3 ? '#EF4444' : '#FFB826' }}>
                          {e.daysRemaining <= 0 ? 'Expire' : e.daysRemaining <= 3 ? `Suppression dans ${e.daysRemaining}j` : `Expire dans ${e.daysRemaining}j`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Galerie admin */}
              {adminGallery && (
                <div style={{ marginTop:20, marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <h3 className="detail-section-title" style={{ margin:0 }}>Photos — {adminGallery.name}</h3>
                    <button onClick={() => { setAdminGallery(null); setGalleryPhotos([]); }} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:12 }}>Fermer</button>
                  </div>
                  {galleryPhotos.length === 0 ? (
                    <p style={{ color:'#888', fontSize:13 }}>Aucune photo</p>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:8 }}>
                      {galleryPhotos.map(p => (
                        <div key={p.id} style={{ position:'relative', borderRadius:8, overflow:'hidden', aspectRatio:'1', background:'#1a1a22' }}>
                          <img src={p.thumbnail_url || p.watermarked_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          <a href={p.original_url} download={`fotokash-${p.id}.jpg`} target="_blank" rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            style={{ position:'absolute', bottom:4, right:4, background:'rgba(0,0,0,0.7)', borderRadius:6, padding:'3px 8px', color:'#fff', fontSize:10, textDecoration:'none', fontWeight:600 }}>
                            HD
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Changer le plan */}
              <div className="detail-plan-change" style={{ marginTop:24 }}>
                <h3 className="detail-section-title">Changer le plan</h3>
                <div className="plan-buttons">
                  {['free', 'pro', 'business'].map(plan => (
                    <button
                      key={plan}
                      className={`plan-change-btn ${detail.photographer.plan === plan ? 'current' : ''}`}
                      onClick={() => {
                        if (detail.photographer.plan === plan) return;
                        setPlanConfirm({ plan });
                      }}
                      style={{ borderColor: detail.photographer.plan === plan ? (planColors[plan] || '#6b6b80') : undefined }}
                    >
                      {plan.toUpperCase()}
                      {detail.photographer.plan === plan && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone de danger */}
              <div style={{ marginTop:24, border:'1px solid rgba(239,68,68,0.35)', borderRadius:12, padding:16, background:'rgba(239,68,68,0.03)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <span style={{ color:'#EF4444' }}>{IconAlert(14)}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:'#EF4444', textTransform:'uppercase', letterSpacing:0.5 }}>Zone de danger</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button className="action-btn neutral" onClick={() => setResetConfirm(true)}>
                    Réinitialiser le mot de passe
                  </button>
                  <button className={`action-btn ${detail.photographer.status === 'active' ? 'warn' : 'activate'}`} onClick={() => toggleStatus(detail.photographer.id, detail.photographer.status)}>
                    {detail.photographer.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
                  </button>
                  <button className="action-btn danger-solid" onClick={() => setDeleteConfirm(true)}>
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Photographers;
