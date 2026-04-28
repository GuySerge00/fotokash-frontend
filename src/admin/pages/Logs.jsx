import { useState, useEffect } from 'react';
import './Logs.css';

const API_URL = '/api';

const actionLabels = {
  admin_login: '🔑 Connexion admin',
  panel_created: '🚀 Système initialisé',
  settings_updated: '⚙️ Paramètres modifiés',
  photographer_activated: '✅ Compte activé',
  photographer_deactivated: '⏸️ Compte désactivé',
  plan_changed: '📦 Plan modifié',
  photo_uploaded: '📷 Photos uploadées',
  payment_completed: '💰 Paiement reçu',
  event_created: '📅 Événement créé',
};

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const Logs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterAction) params.set('action', filterAction);
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

  useEffect(() => { fetchLogs(); }, [page, filterAction]);

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div>
          <h1 className="logs-title">Logs d'activité</h1>
          <p className="logs-subtitle">Historique des actions sur la plateforme</p>
        </div>
      </div>

      {/* Filter */}
      <div className="logs-filters">
        <select
          className="logs-filter-select"
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">Toutes les actions</option>
          {actions.map(a => (
            <option key={a} value={a}>{actionLabels[a] || a}</option>
          ))}
        </select>
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
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Précédent
            </button>
            <span className="page-info">Page {page} / {totalPages}</span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;