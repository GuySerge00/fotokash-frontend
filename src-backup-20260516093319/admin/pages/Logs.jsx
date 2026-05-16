import { useState, useEffect, useRef } from 'react';
import './Logs.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const actionLabels = {
  admin_login:              '🔑 Connexion admin',
  photographer_registered:  '🆕 Nouvelle inscription',
  panel_created:            '🚀 Système initialisé',
  settings_updated:         '⚙️ Paramètres modifiés',
  photographer_activated:   '✅ Compte activé',
  photographer_deactivated: '⏸️ Compte désactivé',
  plan_changed:             '📦 Plan modifié',
  photo_uploaded:           '📷 Photos uploadées',
  payment_completed:        '💰 Paiement reçu',
  event_created:            '📅 Événement créé',
  password_reset:           '🔒 Mot de passe réinitialisé',
  update_info:              '✏️ Infos modifiées',
  send_email:               '📨 Email envoyé',
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/* ─── Custom Dropdown ─────────────────────────────────────── */
const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', minWidth: 220 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f5',
          fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 10, fontFamily: 'inherit',
        }}
      >
        <span>{selected.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
          overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px', background: o.value === value ? 'rgba(232,89,60,0.12)' : 'transparent',
                border: 'none', color: o.value === value ? '#E8593C' : '#d0d0e0', fontSize: 13,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Logs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterAction) params.set('action', filterAction);
      if (period) params.set('period', period);
      const res = await fetch(`${API_URL}/admin/logs?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        if (data.actions) setActions(data.actions);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filterAction, period]);

  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    ...actions.map(a => ({ value: a, label: actionLabels[a] || a })),
  ];

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div>
          <h1 className="logs-title">Logs d'activité</h1>
          <p className="logs-subtitle">Historique des actions sur la plateforme</p>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        {/* Période */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[{ key: '', label: 'Tout' }, { key: 'today', label: "Aujourd'hui" }, { key: '7d', label: '7 jours' }, { key: '30d', label: '30 jours' }].map(p => (
            <button
              key={p.key}
              onClick={() => { setPeriod(p.key); setPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: period === p.key ? '#E8593C' : 'rgba(255,255,255,0.06)', color: period === p.key ? '#fff' : '#8888A0', transition: 'all 0.15s' }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Type d'action — dropdown custom */}
        <Dropdown
          value={filterAction}
          onChange={(v) => { setFilterAction(v); setPage(1); }}
          options={actionOptions}
        />
      </div>

      {/* Logs list */}
      <div className="logs-list-card">
        {loading ? (
          <div className="logs-loading">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">Aucun log trouvé</div>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-icon">
                  {(actionLabels[log.action] || log.action).charAt(0)}
                </div>
                <div className="log-content">
                  <div className="log-action">
                    {actionLabels[log.action] || log.action}
                  </div>
                  <div className="log-meta">
                    <span className="log-actor">{log.actor_name || 'Système'}</span>
                    <span className="log-separator">·</span>
                    <span className="log-date">{formatDate(log.created_at)}</span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="log-details">
                      {Object.entries(log.details).map(([k, v]) => (
                        <span key={k} className="log-detail-tag">{k}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="logs-pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ← Précédent
            </button>
            <span className="page-info">Page {page} / {totalPages}</span>
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
