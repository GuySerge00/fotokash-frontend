import { useState, useEffect } from 'react';
import './Withdrawals.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const fcfa = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fdate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Transactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const headers = { 'Authorization': 'Bearer ' + token };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('limit', '30');
      const res = await fetch(API_URL + '/admin/transactions?' + params.toString(), { headers });
      if (res.ok) {
        const d = await res.json();
        setTransactions(d.transactions || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, [status, page]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchTransactions(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const statusColors = { pending: '#FFB826', completed: '#4ADE80', failed: '#EF4444' };
  const statusLabels = { pending: 'En attente', completed: 'Completée', failed: 'Échouée' };

  return (
    <div className="withdrawals-page">
      <div className="wd-header">
        <div>
          <h1 className="wd-title">Transactions</h1>
          <p className="wd-subtitle">{total} transaction{total !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={fetchTransactions} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8888A0', fontSize: 13, cursor: 'pointer' }}>↻ Actualiser</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher (référence, événement, photographe)..."
          style={{ flex: 1, minWidth: 240, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#F0F0F5', fontSize: 13, outline: 'none' }}
        />
        {[
          { id: '', label: 'Tous' },
          { id: 'completed', label: 'Complétées' },
          { id: 'pending', label: 'En attente' },
          { id: 'failed', label: 'Échouées' },
        ].map(f => (
          <button key={f.id} onClick={() => { setStatus(f.id); setPage(1); }} style={{
            background: status === f.id ? 'rgba(232,89,60,0.12)' : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (status === f.id ? '#E8593C' : 'rgba(255,255,255,0.06)'),
            borderRadius: 8, padding: '7px 16px',
            color: status === f.id ? '#E8593C' : '#8888A0',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>Chargement...</div>
      ) : transactions.length === 0 ? (
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 40, textAlign: 'center', color: '#8888A0', fontSize: 14 }}>Aucune transaction</div>
      ) : (
        <>
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 1fr 1.2fr 0.8fr 1fr', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#8888A0', fontWeight: 600 }}>
            <span>Date</span><span>Photographe</span><span>Événement</span><span>Moyen</span><span>Téléphone payeur</span><span>Montant</span><span>Statut</span>
          </div>
          {transactions.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 1fr 1.2fr 0.8fr 1fr', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12 }}>{fdate(t.created_at)}</div>
                <div style={{ fontSize: 10, color: '#6b6b80', fontFamily: 'monospace' }} title={t.reference}>{(t.reference || '').slice(0, 8)}...</div>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{t.studio_name}</div>
                <div style={{ fontSize: 11, color: '#6b6b80' }}>{t.photographer_email}</div>
              </div>
              <span>{t.event_name}</span>
              <span style={{ textTransform: 'capitalize' }}>{t.payment_method}</span>
              <span>{t.phone}</span>
              <span style={{ fontWeight: 700 }}>{fcfa(t.amount)} F</span>
              <span style={{ color: statusColors[t.status] || '#8888A0', fontWeight: 600, fontSize: 12 }}>{statusLabels[t.status] || t.status}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 14px', color: page <= 1 ? '#4a4a55' : '#8888A0', fontSize: 13, cursor: page <= 1 ? 'default' : 'pointer' }}>← Précédent</button>
          <span style={{ fontSize: 13, color: '#8888A0' }}>Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 14px', color: page >= totalPages ? '#4a4a55' : '#8888A0', fontSize: 13, cursor: page >= totalPages ? 'default' : 'pointer' }}>Suivant →</button>
        </div>
        </>
      )}
    </div>
  );
};

export default Transactions;