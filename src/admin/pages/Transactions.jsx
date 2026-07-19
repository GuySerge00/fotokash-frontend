import { useState, useEffect } from 'react';
import { Icon } from '../../utils/icons';
import './Withdrawals.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const fcfa = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fdate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const operatorMeta = {
  wave:   { label: 'Wave', bg: 'rgba(56,189,248,0.15)', color: '#38BDF8' },
  orange: { label: 'Orange', bg: 'rgba(249,115,22,0.15)', color: '#F97316' },
  mtn:    { label: 'MTN', bg: 'rgba(250,204,21,0.15)', color: '#FACC15' },
  moov:   { label: 'Moov', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
};

const statusColors = { pending: '#FFB826', completed: '#4ADE80', failed: '#EF4444' };
const statusLabels = { pending: 'En attente', completed: 'Complétée', failed: 'Échouée' };

const Transactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, completed: 0, pending: 0, failed: 0 });
  const [totalVolume, setTotalVolume] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const headers = { 'Authorization': 'Bearer ' + token };
  const limit = 30;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('limit', String(limit));
      const res = await fetch(API_URL + '/admin/transactions?' + params.toString(), { headers });
      if (res.ok) {
        const d = await res.json();
        setTransactions(d.transactions || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
        if (d.counts) setCounts(d.counts);
        if (d.totalVolume != null) setTotalVolume(d.totalVolume);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, [status, page]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchTransactions(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(API_URL + '/admin/transactions/export/csv?' + params.toString(), { headers });
      if (!res.ok) throw new Error('export échoué');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fotokash-transactions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  const kpis = [
    { label: 'Total transactions', value: String(total), color: '#F0F0F5' },
    { label: 'Complétées', value: String(counts.completed), color: '#4ADE80' },
    { label: 'En attente', value: String(counts.pending), color: '#FFB826' },
    { label: 'Volume total', value: fcfa(totalVolume) + ' F', color: '#E8593C' },
  ];

  const filters = [
    { id: '', label: 'Tous', count: counts.all },
    { id: 'completed', label: 'Complétées', count: counts.completed },
    { id: 'pending', label: 'En attente', count: counts.pending },
    { id: 'failed', label: 'Échouées', count: counts.failed },
  ];

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="withdrawals-page">
      <div className="wd-header">
        <div>
          <h1 className="wd-title">Transactions</h1>
          <p className="wd-subtitle">{total} transaction{total !== 1 ? 's' : ''} au total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExport} disabled={exporting} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8888A0', fontSize: 13, cursor: exporting ? 'default' : 'pointer', fontWeight: 600 }}>{exporting ? 'Export...' : 'Export CSV'}</button>
          <button onClick={fetchTransactions} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8888A0', fontSize: 13, cursor: 'pointer' }}>↻ Actualiser</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#8888A0', fontWeight: 500, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', display: 'flex' }}>{Icon.Search(15)}</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher (référence, événement, photographe)..."
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 14px 9px 40px', color: '#F0F0F5', fontSize: 13, outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => { setStatus(f.id); setPage(1); }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: status === f.id ? '#E8593C' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (status === f.id ? '#E8593C' : 'rgba(255,255,255,0.08)'),
              borderRadius: 8, padding: '7px 16px',
              color: status === f.id ? '#fff' : '#8888A0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              {f.label}
              <span style={{ fontSize: 11, opacity: 0.85 }}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>Chargement...</div>
      ) : transactions.length === 0 ? (
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 40, textAlign: 'center', color: '#8888A0', fontSize: 14 }}>Aucune transaction</div>
      ) : (
        <>
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 1fr 1.2fr 0.8fr 1fr 24px', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#8888A0', fontWeight: 600 }}>
            <span>Date</span><span>Photographe</span><span>Événement</span><span>Moyen</span><span>Téléphone payeur</span><span>Montant</span><span>Statut</span><span></span>
          </div>
          {transactions.map(t => {
            const op = operatorMeta[(t.payment_method || '').toLowerCase()];
            const isOpen = expandedId === t.id;
            return (
              <div key={t.id}>
                <div
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 1fr 1.2fr 0.8fr 1fr 24px', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ fontSize: 12 }}>{fdate(t.created_at)}</div>
                    <div style={{ fontSize: 10, color: '#6b6b80', fontFamily: 'monospace' }} title={t.reference}>{(t.reference || '').slice(0, 8)}...</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.studio_name}</div>
                    <div style={{ fontSize: 11, color: '#6b6b80' }}>{t.photographer_email}</div>
                  </div>
                  <span>{t.event_name}</span>
                  <span>
                    {op ? (
                      <span style={{ background: op.bg, color: op.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{op.label}</span>
                    ) : (
                      <span style={{ textTransform: 'capitalize', color: '#8888A0' }}>{t.payment_method || '—'}</span>
                    )}
                  </span>
                  <span>{t.phone}</span>
                  <span style={{ fontWeight: 700 }}>{fcfa(t.amount)} F</span>
                  <span>
                    <span style={{ background: (statusColors[t.status] || '#8888A0') + '22', color: statusColors[t.status] || '#8888A0', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 20 }}>{statusLabels[t.status] || t.status}</span>
                  </span>
                  <span style={{ color: '#6b6b80', display: 'flex', justifyContent: 'flex-end', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>{Icon.ArrowRight(14)}</span>
                </div>
                {isOpen && (
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', fontSize: 12, color: '#8888A0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>Référence complète : <span style={{ fontFamily: 'monospace', color: '#d0d0e0' }}>{t.reference}</span></span>
                    <span>Photos achetées : {t.photos_count || '—'}</span>
                    <span>Complétée le : {t.completed_at ? fdate(t.completed_at) : '—'}</span>
                    {t.event_slug && <span>Événement (slug) : {t.event_slug}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b6b80' }}>{rangeStart}–{rangeEnd} sur {total}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 14px', color: page <= 1 ? '#4a4a55' : '#8888A0', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Précédent</button>
            <span style={{ fontSize: 13, color: '#8888A0' }}>Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 14px', color: page >= totalPages ? '#4a4a55' : '#8888A0', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Suivant →</button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default Transactions;
