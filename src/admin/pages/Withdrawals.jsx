import { useState, useEffect } from 'react';
import './Withdrawals.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const fcfa = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));
const fdate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const Withdrawals = ({ token, showToast }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/admin/withdrawals?status=' + filter, { headers });
      if (res.ok) { const d = await res.json(); setWithdrawals(d.withdrawals || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      const realStatus = action === 'rejected' ? 'rejected' : 'approved';
      const body = { status: realStatus, admin_note: adminNote };
      if (action === 'manual') body.manual = true;
      const res = await fetch(API_URL + '/admin/withdrawals/' + id, {
        method: 'PUT', headers,
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const msg = action === 'approved' ? 'Retrait approuvé (transfert automatique envoyé)'
          : action === 'manual' ? 'Retrait marqué comme traité manuellement'
          : 'Retrait rejeté';
        if (showToast) showToast(msg);
        setNoteModal(null);
        setAdminNote('');
        fetchWithdrawals();
      } else {
        const d = await res.json();
        if (showToast) showToast(d.error || 'Erreur', 'error');
      }
    } catch (err) { if (showToast) showToast('Erreur de connexion', 'error'); }
    finally { setProcessing(null); }
  };

  const statusColors = { pending: '#FFB826', approved: '#4ADE80', rejected: '#EF4444' };
  const statusLabels = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="withdrawals-page">
      {/* Note/Reject modal */}
      {noteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 28, width: 400, maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 8px', color: '#F0F0F5', fontSize: 16, fontWeight: 700 }}>
              {noteModal.action === 'approved' ? 'Approuver le retrait (transfert automatique)' : noteModal.action === 'manual' ? 'Marquer comme traite manuellement' : 'Rejeter le retrait'}
            </h3>
            {noteModal.action === 'manual' && (
              <p style={{ margin: '0 0 6px', color: '#818CF8', fontSize: 12 }}>{"Aucun transfert ne sera declenche - a utiliser seulement si vous avez deja paye ce retrait autrement (ex: appli Jeko directement)."}</p>
            )}
            <p style={{ margin: '0 0 6px', color: '#8888A0', fontSize: 13 }}>
              {noteModal.studio_name} — {fcfa(noteModal.amount)} F CFA — {noteModal.phone}
            </p>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder={noteModal.action === 'rejected' ? 'Motif du rejet (obligatoire)...' : noteModal.action === 'manual' ? 'Reference du paiement manuel (optionnel)...' : 'Note (optionnel)...'}
              style={{ width: '100%', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0f0f5', fontSize: 13, minHeight: 80, resize: 'vertical', marginTop: 12, fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => { setNoteModal(null); setAdminNote(''); }} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '11px 0', color: '#8888A0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button
                onClick={() => handleAction(noteModal.id, noteModal.action)}
                disabled={noteModal.action === 'rejected' && !adminNote.trim()}
                style={{ flex: 1, background: noteModal.action === 'approved' ? '#4ADE80' : noteModal.action === 'manual' ? '#818CF8' : '#EF4444', color: noteModal.action === 'rejected' ? '#fff' : '#000', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: (noteModal.action === 'rejected' && !adminNote.trim()) ? 0.4 : 1 }}
              >{noteModal.action === 'approved' ? 'Approuver' : noteModal.action === 'manual' ? 'Confirmer' : 'Rejeter'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="wd-header">
        <div>
          <h1 className="wd-title">Retraits</h1>
          <p className="wd-subtitle">Gérez les demandes de retrait des photographes</p>
        </div>
        <button onClick={fetchWithdrawals} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8888A0', fontSize: 13, cursor: 'pointer' }}>↻ Actualiser</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { id: 'pending', label: 'En attente' },
          { id: 'approved', label: 'Approuvés' },
          { id: 'rejected', label: 'Rejetés' },
          { id: 'all', label: 'Tous' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: filter === f.id ? '#E8593C' : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (filter === f.id ? '#E8593C' : 'rgba(255,255,255,0.06)'),
            borderRadius: 8, padding: '7px 16px',
            color: filter === f.id ? '#fff' : '#8888A0',
            fontSize: 13, fontWeight: filter === f.id ? 700 : 600, cursor: 'pointer'
          }}>{f.label}{f.id === 'pending' && pendingCount > 0 ? ' (' + pendingCount + ')' : ''}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>Chargement...</div>
      ) : withdrawals.length === 0 ? (
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 40, textAlign: 'center', color: '#8888A0', fontSize: 14 }}>Aucune demande de retrait</div>
      ) : (
        <div style={{ background: '#141419', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#8888A0', fontWeight: 600 }}>
            <span>Photographe</span><span>Contact</span><span>Montant</span><span>Date</span><span>Statut</span><span>Actions</span>
          </div>
          {withdrawals.map(w => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{w.studio_name}</div>
                <div style={{ fontSize: 11, color: '#6b6b80' }}>{w.plan?.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12 }}>{w.phone}</div>
                <div style={{ fontSize: 11, color: '#6b6b80' }}>{w.email}</div>
              </div>
              <span style={{ fontWeight: 700 }}>{fcfa(w.amount)} F</span>
              <span style={{ fontSize: 12, color: '#8888A0' }}>{fdate(w.requested_at)}</span>
              <span style={{ color: statusColors[w.status], fontWeight: 600, fontSize: 12 }}>{statusLabels[w.status] || w.status}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {w.status === 'pending' && (
                  <>
                    <button onClick={() => setNoteModal({ ...w, action: 'approved' })} disabled={processing === w.id} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '5px 10px', color: '#4ADE80', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Approuver</button>
                    <button onClick={() => setNoteModal({ ...w, action: 'manual' })} disabled={processing === w.id} style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: 6, padding: '5px 10px', color: '#818CF8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Manuel</button>
                    <button onClick={() => setNoteModal({ ...w, action: 'rejected' })} disabled={processing === w.id} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 10px', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Rejeter</button>
                  </>
                )}
                {w.status !== 'pending' && w.admin_note && (
                  <span style={{ fontSize: 11, color: '#6b6b80', fontStyle: 'italic' }}>{w.admin_note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
