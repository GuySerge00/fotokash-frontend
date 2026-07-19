import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../utils/icons';
import './Logs.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const fcfa = (n) => Number(n).toFixed(2) + ' F';

const SettingsIcon = (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.11.35.31.66.6.9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const ArrowUpIcon = (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const MailIcon = (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>;

const actionLabels = {
  admin_login:               'Connexion admin',
  photographer_registered:   'Nouvelle inscription',
  panel_created:              'Système initialisé',
  settings_updated:          'Paramètres modifiés',
  photographer_activated:    'Compte activé',
  photographer_deactivated:  'Compte désactivé',
  photographer_deleted:      'Photographe supprimé',
  plan_changed:               'Plan modifié',
  photo_uploaded:             'Photos uploadées',
  payment_completed:          'Paiement reçu',
  event_created:               'Événement créé',
  password_reset:             'Mot de passe réinitialisé',
  update_info:                 'Infos modifiées',
  send_email:                  'Email envoyé',
  approve_withdrawal:          'Retrait approuvé',
  approve_withdrawal_manual:   'Retrait approuvé (manuel)',
  reject_withdrawal:           'Retrait rejeté',
};

const actionMeta = {
  admin_login:               { icon: Icon.Key, color: '#818CF8' },
  photographer_registered:   { icon: Icon.Plus, color: '#4ADE80' },
  panel_created:              { icon: Icon.Check, color: '#4ADE80' },
  settings_updated:          { icon: SettingsIcon, color: '#A78BFA' },
  photographer_activated:    { icon: Icon.Check, color: '#4ADE80' },
  photographer_deactivated:  { icon: Icon.X, color: '#FFB826' },
  photographer_deleted:      { icon: Icon.X, color: '#EF4444' },
  plan_changed:               { icon: Icon.CreditCard, color: '#FFB826' },
  photo_uploaded:             { icon: Icon.Image, color: '#818CF8' },
  payment_completed:          { icon: Icon.CreditCard, color: '#4ADE80' },
  event_created:               { icon: Icon.Calendar, color: '#818CF8' },
  password_reset:             { icon: Icon.Key, color: '#A78BFA' },
  update_info:                 { icon: Icon.Edit, color: '#818CF8' },
  send_email:                  { icon: MailIcon, color: '#818CF8' },
  approve_withdrawal:          { icon: ArrowUpIcon, color: '#38BDF8' },
  approve_withdrawal_manual:   { icon: ArrowUpIcon, color: '#38BDF8' },
  reject_withdrawal:           { icon: Icon.X, color: '#EF4444' },
};
const defaultMeta = { icon: Icon.AlertCircle, color: '#8888A0' };

const formatTime = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
const dayLabelFull = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
const dayLabelNoYear = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }).toUpperCase();
const dayLabelShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

function groupLogs(logs) {
  if (logs.length === 0) return [];
  const firstDay = dayKey(logs[0].created_at);
  const primary = [];
  const rest = [];
  logs.forEach((l) => {
    if (dayKey(l.created_at) === firstDay) primary.push(l);
    else rest.push(l);
  });
  const groups = [{ header: dayLabelFull(logs[0].created_at), items: primary }];
  if (rest.length > 0) {
    const newest = rest[0].created_at;
    const oldest = rest[rest.length - 1].created_at;
    groups.push({ header: dayLabelNoYear(newest) + ' · ' + dayLabelFull(oldest), items: rest });
  }
  return groups;
}

function buildTags(log) {
  const d = log.details || {};
  const tags = [];
  switch (log.action) {
    case 'approve_withdrawal':
    case 'approve_withdrawal_manual':
      if (log.entity_id) tags.push({ text: 'réf. ' + log.entity_id });
      if (d.phone) tags.push({ text: d.phone });
      if (d.amount != null) tags.push({ text: fcfa(d.amount), bg: 'rgba(255,184,38,0.15)', color: '#FFB826' });
      if (d.net_amount != null) tags.push({ text: 'net: ' + fcfa(d.net_amount), bg: 'rgba(74,222,128,0.15)', color: '#4ADE80' });
      if (d.note) tags.push({ text: d.note });
      break;
    case 'reject_withdrawal':
      if (log.entity_id) tags.push({ text: 'réf. ' + log.entity_id });
      if (d.phone) tags.push({ text: d.phone });
      if (d.amount != null) tags.push({ text: fcfa(d.amount), bg: 'rgba(255,184,38,0.15)', color: '#FFB826' });
      if (d.note) tags.push({ text: d.note });
      break;
    case 'photographer_registered':
      if (d.plan) tags.push({ text: 'plan: ' + d.plan });
      if (d.email) tags.push({ text: d.email });
      break;
    case 'photographer_deleted':
      tags.push({ text: 'compte définitivement retiré', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' });
      break;
    default:
      Object.entries(d).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') tags.push({ text: k + ': ' + String(v) });
      });
  }
  return tags;
}

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
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', minWidth: 220, flexShrink: 0 }}>
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
          overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxHeight: 320, overflowY: 'auto',
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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [periodCounts, setPeriodCounts] = useState({ all: 0, today: 0, '7d': 0, '30d': 0 });

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterAction) params.set('action', filterAction);
      if (period) params.set('period', period);
      if (search) params.set('search', search);
      const res = await fetch(`${API_URL}/admin/logs?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        if (data.actions) setActions(data.actions);
        if (data.periodCounts) setPeriodCounts(data.periodCounts);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, filterAction, period, search]);

  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    ...actions.map(a => ({ value: a, label: actionLabels[a] || a })),
  ];

  const periodTabs = [
    { key: '', label: 'Tout', count: periodCounts.all },
    { key: 'today', label: "Aujourd'hui", count: periodCounts.today },
    { key: '7d', label: '7 jours', count: periodCounts['7d'] },
    { key: '30d', label: '30 jours', count: periodCounts['30d'] },
  ];

  const groups = groupLogs(logs);

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
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {periodTabs.map(p => (
            <button
              key={p.key}
              onClick={() => { setPeriod(p.key); setPage(1); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: period === p.key ? '#E8593C' : 'rgba(255,255,255,0.06)', color: period === p.key ? '#fff' : '#8888A0', transition: 'all 0.15s' }}
            >
              {p.label}
              <span style={{ fontSize: 11, opacity: 0.85 }}>{p.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', display: 'flex' }}>{Icon.Search(15)}</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom, email, référence..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 16px 10px 40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f5', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <Dropdown
            value={filterAction}
            onChange={(v) => { setFilterAction(v); setPage(1); }}
            options={actionOptions}
          />
        </div>
      </div>

      {/* Logs list */}
      <div className="logs-list-card">
        {loading ? (
          <div className="logs-loading">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">Aucun log trouvé</div>
        ) : (
          <div className="logs-timeline">
            {groups.map((group, gi) => (
              <div key={gi} className="logs-group">
                <div className="logs-group-header">{group.header}</div>
                <div className="logs-list">
                  {group.items.map((log, i) => {
                    const meta = actionMeta[log.action] || defaultMeta;
                    const tags = buildTags(log);
                    const isLast = gi === groups.length - 1 && i === group.items.length - 1;
                    return (
                      <div key={log.id} className={"log-item" + (isLast ? " log-item-last" : "")}>
                        <div className="log-icon" style={{ background: meta.color + '20', color: meta.color }}>
                          {meta.icon(16)}
                        </div>
                        <div className="log-content">
                          <div className="log-action">{actionLabels[log.action] || log.action}</div>
                          <div className="log-meta">
                            <span className="log-actor">{log.actor_name || 'Système'}</span>
                            <span className="log-separator">·</span>
                            <span className="log-date">{dayLabelShort(log.created_at)} · {formatTime(log.created_at)}</span>
                          </div>
                          {tags.length > 0 && (
                            <div className="log-details">
                              {tags.map((t, ti) => (
                                <span key={ti} className="log-detail-tag" style={t.bg ? { background: t.bg, color: t.color, fontWeight: 700 } : undefined}>{t.text}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
