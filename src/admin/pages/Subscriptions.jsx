import { useState, useEffect } from 'react';
import './Subscriptions.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const formatFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));

const Subscriptions = ({ token }) => {
  const [plans, setPlans] = useState([]);
  const [commissions, setCommissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState('30d');
  const [tab, setTab] = useState('plans');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, commRes] = await Promise.all([
        fetch(`${API_URL}/admin/plans`, { headers }),
        fetch(`${API_URL}/admin/commissions?period=${period}`, { headers })
      ]);
      if (plansRes.ok) { const d = await plansRes.json(); setPlans(d.plans || []); }
      if (commRes.ok) { const d = await commRes.json(); setCommissions(d); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [period]);

  const startEdit = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      name: plan.name,
      price: plan.price,
      commission_rate: plan.commission_rate,
      photo_limit: plan.photo_limit,
      event_limit: plan.event_limit,
      mobile_money_enabled: plan.mobile_money_enabled,
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/plans/${editingPlan}`, {
        method: 'PUT', headers, body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingPlan(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const planColors = { free: '#6b6b80', pro: '#E8593C', business: '#FFB826' };
  const planIcons = { free: '🆓', pro: '⚡', business: '🏢' };

  return (
    <div className="subscriptions-page">
      <div className="sub-header">
        <div>
          <h1 className="sub-title">Abonnements & Commissions</h1>
          <p className="sub-subtitle">Gérez les plans et suivez les revenus FotoKash</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sub-tabs">
        <button className={`sub-tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>
          Plans d'abonnement
        </button>
        <button className={`sub-tab ${tab === 'commissions' ? 'active' : ''}`} onClick={() => setTab('commissions')}>
          Commissions
        </button>
      </div>

      {loading ? (
        <div className="sub-loading">Chargement...</div>
      ) : tab === 'plans' ? (
        /* ===== PLANS TAB ===== */
        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className={`plan-card ${plan.id}`} style={{ borderColor: planColors[plan.id] || '#333' }}>
              <div className="plan-card-header">
                <span className="plan-icon">{planIcons[plan.id]}</span>
                <span className="plan-name" style={{ color: planColors[plan.id] }}>{plan.name}</span>
                {plan.id === 'pro' && <span className="plan-popular">POPULAIRE</span>}
              </div>

              {editingPlan === plan.id ? (
                /* Edit mode */
                <div className="plan-edit-form">
                  <div className="edit-field">
                    <label>Prix (FCFA/mois)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="edit-field">
                    <label>Commission (%)</label>
                    <input type="number" value={editForm.commission_rate} onChange={e => setEditForm({...editForm, commission_rate: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="edit-field">
                    <label>Photos max / événement</label>
                    <input type="number" value={editForm.photo_limit} onChange={e => setEditForm({...editForm, photo_limit: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="edit-field">
                    <label>Événements max (vide = illimité)</label>
                    <input type="number" value={editForm.event_limit || ''} onChange={e => setEditForm({...editForm, event_limit: e.target.value ? parseInt(e.target.value) : null})} placeholder="Illimité" />
                  </div>
                  <div className="edit-field">
                    <label>Mobile Money</label>
                    <button className={`toggle-btn ${editForm.mobile_money_enabled ? 'on' : 'off'}`} onClick={() => setEditForm({...editForm, mobile_money_enabled: !editForm.mobile_money_enabled})}>
                      {editForm.mobile_money_enabled ? '✓ Activé' : '✗ Désactivé'}
                    </button>
                  </div>
                  <div className="edit-actions">
                    <button className="save-btn" onClick={saveEdit} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                    <button className="cancel-btn" onClick={() => setEditingPlan(null)}>Annuler</button>
                  </div>
                </div>
              ) : (
                /* Display mode */
                <>
                  <div className="plan-price">
                    <span className="price-value">{formatFCFA(plan.price)}</span>
                    <span className="price-period">/mois</span>
                  </div>
                  <div className="plan-details">
                    <div className="plan-detail-row">
                      <span>Commission</span>
                      <span className="plan-detail-value" style={{ color: plan.commission_rate > 0 ? '#E8593C' : '#4ADE80' }}>
                        {plan.commission_rate > 0 ? `${plan.commission_rate}%` : 'Aucune'}
                      </span>
                    </div>
                    <div className="plan-detail-row">
                      <span>Photos / événement</span>
                      <span className="plan-detail-value">{plan.photo_limit}</span>
                    </div>
                    <div className="plan-detail-row">
                      <span>Événements actifs</span>
                      <span className="plan-detail-value">{plan.event_limit || 'Illimité'}</span>
                    </div>
                    <div className="plan-detail-row">
                      <span>Mobile Money</span>
                      <span className="plan-detail-value" style={{ color: plan.mobile_money_enabled ? '#4ADE80' : '#ef4444' }}>
                        {plan.mobile_money_enabled ? '✓ Oui' : '✗ Non'}
                      </span>
                    </div>
                  </div>
                  {/* Plan distribution */}
                  {commissions && commissions.planDistribution && (
                    <div className="plan-users">
                      {commissions.planDistribution.filter(p => p.plan === plan.id).map(p => (
                        <span key={p.plan}>{p.count} photographe{p.count > 1 ? 's' : ''}</span>
                      ))}
                      {!commissions.planDistribution.find(p => p.plan === plan.id) && (
                        <span>0 photographe</span>
                      )}
                    </div>
                  )}
                  <button className="edit-plan-btn" onClick={() => startEdit(plan)}>✏️ Modifier le plan</button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ===== COMMISSIONS TAB ===== */
        <div className="commissions-section">
          <div className="comm-period-selector">
            {[{key: 'today', label: "Aujourd'hui"}, {key: '7d', label: '7 jours'}, {key: '30d', label: '30 jours'}].map(p => (
              <button key={p.key} className={`period-btn ${period === p.key ? 'active' : ''}`} onClick={() => setPeriod(p.key)}>
                {p.label}
              </button>
            ))}
          </div>

          {/* KPIs */}
          <div className="comm-kpis">
            <div className="comm-kpi">
              <span className="comm-kpi-label">Revenus totaux</span>
              <span className="comm-kpi-value">{formatFCFA(commissions?.totals?.revenue || 0)}</span>
              <span className="comm-kpi-unit">F CFA</span>
            </div>
            <div className="comm-kpi highlight">
              <span className="comm-kpi-label">Commissions FotoKash</span>
              <span className="comm-kpi-value">{formatFCFA(commissions?.totals?.commission || 0)}</span>
              <span className="comm-kpi-unit">F CFA gagnés</span>
            </div>
          </div>

          {/* Par plan */}
          {commissions?.byPlan && commissions.byPlan.length > 0 ? (
            <div className="comm-table-card">
              <h3 className="comm-table-title">Détail par plan</h3>
              <div className="comm-table">
                <div className="comm-table-header">
                  <span>Plan</span>
                  <span>Taux</span>
                  <span>Ventes</span>
                  <span>CA brut</span>
                  <span>Commission</span>
                  <span>Photographe</span>
                </div>
                {commissions.byPlan.map(row => (
                  <div key={row.plan} className="comm-table-row">
                    <span style={{ color: planColors[row.plan] || '#fff', fontWeight: 600 }}>{row.plan.toUpperCase()}</span>
                    <span>{row.commissionRate}%</span>
                    <span>{row.totalSales}</span>
                    <span>{formatFCFA(row.totalRevenue)}</span>
                    <span style={{ color: '#E8593C', fontWeight: 600 }}>{formatFCFA(row.totalCommission)}</span>
                    <span>{formatFCFA(row.photographerRevenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="comm-empty">Aucune transaction sur cette période</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;