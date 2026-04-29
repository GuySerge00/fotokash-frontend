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
                        </div>
                        <span className="detail-event-photos">{e.photoCount} photos</span>
                      </div>
                    ))}
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
                  <button
                    className={`action-btn ${detail.photographer.status === 'active' ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleStatus(detail.photographer.id, detail.photographer.status)}
                  >
                    {detail.photographer.status === 'active' ? '⏸ Désactiver le compte' : '▶ Activer le compte'}
                  </button>
<button
                    className="action-btn deactivate"
                    onClick={async () => {
<button
                    className="action-btn activate"
                    onClick={async () => {
                      if (window.confirm('Reinitialiser le mot de passe de "' + detail.photographer.studioName + '" ?')) {
                        try {
                          const res = await fetch(API_URL + '/admin/photographers/' + detail.photographer.id + '/password', {
                            method: 'PATCH', headers
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert('Mot de passe reinitialise !\nNouveau mot de passe : ' + data.defaultPassword);
                          }
                        } catch (err) { console.error(err); }
                      }
                    }}
                  >
                    🔑 Reinitialiser le mot de passe
                  </button>                      
if (window.confirm(`ATTENTION : Supprimer définitivement "${detail.photographer.studioName}" et toutes ses données (photos, événements, transactions) ? Cette action est IRRÉVERSIBLE.`)) {
                        try {
                          const res = await fetch(`${API_URL}/admin/photographers/${detail.photographer.id}`, {
                            method: 'DELETE', headers
                          });
                          if (res.ok) {
                            setPhotographers(prev => prev.filter(p => p.id !== detail.photographer.id));
                            setSelected(null);
                            setDetail(null);
                          }
                        } catch (err) { console.error(err); }
                      }
                    }}
                  >
                    🗑 Supprimer définitivement
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
