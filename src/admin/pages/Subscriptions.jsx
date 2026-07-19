import { useState, useEffect, useCallback } from 'react';
import './Subscriptions.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const formatFCFA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));

/* ─── SVG Icons ───────────────────────────────────────────── */
const IconFree     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconPro      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconBusiness = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>;
const IconEdit     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconRefresh  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconCoin     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 6v12M9 9.5a2.5 2.5 0 0 1 2.5-1.5h1a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h1a2.5 2.5 0 0 0 2.5-1.5"/></svg>;

const planIcons = { free: <IconFree />, pro: <IconPro />, business: <IconBusiness /> };
const planColors = { free: '#6b6b80', pro: '#E8593C', business: '#FFB826' };
const planOrder = ['free', 'pro', 'business'];

/* ─── Confirm Modal ───────────────────────────────────────── */
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
    <div style={{ background:'#1a1a24',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:28,width:380,maxWidth:'90vw' }}>
      <h3 style={{ margin:'0 0 8px',color:'#F0F0F5',fontSize:16,fontWeight:700 }}>{title}</h3>
      <p style={{ margin:'0 0 22px',color:'#8888A0',fontSize:13,lineHeight:1.6 }}>{message}</p>
      <div style={{ display:'flex',gap:10 }}>
        <button onClick={onCancel} style={{ flex:1,background:'rgba(255,255,255,0.06)',border:'none',borderRadius:8,padding:'11px 0',color:'#8888A0',fontSize:14,fontWeight:600,cursor:'pointer' }}>
          Annuler
        </button>
        <button onClick={onConfirm} style={{ flex:1,background:'#E8593C',color:'#fff',border:'none',borderRadius:8,padding:'11px 0',fontSize:14,fontWeight:700,cursor:'pointer' }}>
          Confirmer
        </button>
      </div>
    </div>
  </div>
);

/* ─── Donut Chart (répartition Free/Pro/Business) ────────── */
const DonutChart = ({ distribution, total }) => {
  const r = 54, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = planOrder.map(planId => {
    const entry = distribution?.find(p => p.plan === planId);
    const count = entry ? parseInt(entry.count) : 0;
    const pct = total > 0 ? count / total : 0;
    const seg = { planId, count, pct, offset };
    offset += pct;
    return seg;
  });
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {segments.map(s => s.pct > 0 && (
          <circle
            key={s.planId} cx={cx} cy={cy} r={r} fill="none"
            stroke={planColors[s.planId]} strokeWidth="14"
            strokeDasharray={`${s.pct * circumference} ${circumference}`}
            strokeDashoffset={-s.offset * circumference}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
      </svg>
      <div className="donut-center">
        <span className="donut-total">{total}</span>
        <span className="donut-total-label">compte{total !== 1 ? 's' : ''} au total</span>
      </div>
      <div className="donut-legend">
        {planOrder.map(p => (
          <span key={p} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ background: planColors[p] }} />
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

const Subscriptions = ({ token, showToast }) => {
  const [plans, setPlans] = useState([]);
  const [commissions, setCommissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState('30d');
  const [tab, setTab] = useState('plans');
  const [confirmSave, setConfirmSave] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const toast = useCallback((msg, type = 'success') => {
    if (showToast) showToast(msg, type);
  }, [showToast]);

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

  useEffect(() => { fetchData(); }, [period, refreshKey]);

  const startEdit = (plan) => {
    setEditingPlan(plan.id);
    setValidationError('');
    setEditForm({
      name: plan.name,
      price: plan.price,
      commission_rate: plan.commission_rate,
      photo_limit: plan.photo_limit,
      event_limit: plan.event_limit,
      mobile_money_enabled: plan.mobile_money_enabled,
      photo_editing_level: plan.photo_editing_level || 'none',
    });
  };

  const validateForm = () => {
    if (editForm.commission_rate < 0 || editForm.commission_rate > 100) {
      return 'La commission doit être entre 0 et 100 %.';
    }
    if (!editForm.photo_limit || editForm.photo_limit < 1) {
      return 'La limite de photos doit être au moins 1.';
    }
    if (editForm.price < 0) {
      return 'Le prix ne peut pas être négatif.';
    }
    return '';
  };

  const requestSave = () => {
    const err = validateForm();
    if (err) { setValidationError(err); return; }
    setValidationError('');
    setConfirmSave(true);
  };

  const saveEdit = async () => {
    setConfirmSave(false);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/plans/${editingPlan}`, {
        method: 'PUT', headers, body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast(`Plan ${editingPlan.toUpperCase()} mis à jour`);
        setEditingPlan(null);
        fetchData();
      } else {
        const d = await res.json();
        toast(d.error || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Erreur de connexion', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalPhotographers = commissions?.planDistribution
    ? commissions.planDistribution.reduce((s, p) => s + parseInt(p.count), 0)
    : 0;

  const getPlanCount = (planId) => {
    const entry = commissions?.planDistribution?.find(p => p.plan === planId);
    return entry ? parseInt(entry.count) : 0;
  };

  const getPlanRevenue = (planId) => {
    const row = commissions?.byPlan?.find(r => r.plan === planId);
    return row ? row.totalRevenue : 0;
  };

  const totals = commissions?.totals || {};
  const commissionPct = totals.revenue > 0 ? Math.round((totals.commission / totals.revenue) * 100) : 0;
  const netPct = 100 - commissionPct;
  const marginDelta = totals.marginDelta || 0;
  const deltaStable = Math.abs(marginDelta) < 0.5;
  const deltaLabel = deltaStable ? 'stable vs période précédente' : (marginDelta > 0 ? '+' + marginDelta.toFixed(1) + '% vs période précédente' : marginDelta.toFixed(1) + '% vs période précédente');
  const deltaColor = deltaStable ? '#4ADE80' : (marginDelta > 0 ? '#4ADE80' : '#EF4444');

  const byPlanTotals = commissions?.byPlan?.reduce((acc, r) => ({
    totalSales: acc.totalSales + r.totalSales,
    totalRevenue: acc.totalRevenue + r.totalRevenue,
    totalCommission: acc.totalCommission + r.totalCommission,
    photographerRevenue: acc.photographerRevenue + r.photographerRevenue,
  }), { totalSales: 0, totalRevenue: 0, totalCommission: 0, photographerRevenue: 0 }) || null;

  return (
    <div className="subscriptions-page">
      {confirmSave && (
        <ConfirmModal
          title="Confirmer les modifications"
          message={`Vous allez modifier le plan ${editingPlan?.toUpperCase()}. Ces changements s'appliquent immédiatement à tous les photographes sur ce plan.`}
          onConfirm={saveEdit}
          onCancel={() => setConfirmSave(false)}
        />
      )}

      <div className="sub-header">
        <div>
          <h1 className="sub-title">Abonnements & Commissions</h1>
          <p className="sub-subtitle">Gérez les plans et suivez les revenus FotoKash</p>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'nowrap' }}>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ flexShrink:0,height:38,boxSizing:'border-box',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'0 14px',color:'#8888A0',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap' }}
          >
            <IconRefresh /> Actualiser
          </button>
          <div className="comm-period-selector" style={{ flexShrink:0,height:38,boxSizing:'border-box',margin:0 }}>
            {[{key:'today',label:"Aujourd'hui"},{key:'7d',label:'7 jours'},{key:'30d',label:'30 jours'}].map(p => (
              <button key={p.key} className={`period-btn ${period === p.key ? 'active' : ''}`} onClick={() => setPeriod(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

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
        <>
          <div className="plans-grid">
            {plans.map(plan => {
              const count = getPlanCount(plan.id);
              const isDormant = plan.id === 'business' && count === 0;
              return (
                <div key={plan.id} className={`plan-card ${plan.id} ${isDormant ? 'dormant' : ''}`} style={{ borderColor: planColors[plan.id] || '#333' }}>
                  <div className="plan-card-header">
                    <span style={{ color: planColors[plan.id] || '#6b6b80' }}>{planIcons[plan.id]}</span>
                    <span className="plan-name" style={{ color: planColors[plan.id] }}>{plan.name}</span>
                    {plan.id === 'pro' && <span className="plan-popular">POPULAIRE</span>}
                  </div>

                  {editingPlan === plan.id ? (
                    <div className="plan-edit-form">
                      <div className="edit-field">
                        <label>Prix (FCFA/mois)</label>
                        <input type="number" min="0" value={editForm.price}
                          onChange={e => setEditForm({...editForm, price: parseInt(e.target.value) || 0})} />
                      </div>
                      <div className="edit-field">
                        <label>Commission (%) — 0 à 100</label>
                        <input type="number" min="0" max="100" step="0.1" value={editForm.commission_rate}
                          onChange={e => setEditForm({...editForm, commission_rate: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="edit-field">
                        <label>Photos max / événement</label>
                        <input type="number" min="1" value={editForm.photo_limit}
                          onChange={e => setEditForm({...editForm, photo_limit: parseInt(e.target.value) || 1})} />
                      </div>
                      <div className="edit-field">
                        <label>Événements max (vide = illimité)</label>
                        <input type="number" min="1" value={editForm.event_limit || ''}
                          onChange={e => setEditForm({...editForm, event_limit: e.target.value ? parseInt(e.target.value) : null})}
                          placeholder="Illimité" />
                      </div>
                      <div className="edit-field">
                        <label>Mobile Money</label>
                        <button className={`toggle-btn ${editForm.mobile_money_enabled ? 'on' : 'off'}`}
                          onClick={() => setEditForm({...editForm, mobile_money_enabled: !editForm.mobile_money_enabled})}>
                          {editForm.mobile_money_enabled ? '✓ Activé' : '✗ Désactivé'}
                        </button>
                      </div>
                      <div className="edit-field">
                        <label>Retouche Photo</label>
                        <select
                          value={editForm.photo_editing_level}
                          onChange={e => setEditForm({...editForm, photo_editing_level: e.target.value})}
                          style={{ width:'100%', background:'#12121a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 14px', color:'#f0f0f5', fontSize:14 }}
                        >
                          <option value="none">Désactivé</option>
                          <option value="basic">Recadrage uniquement</option>
                          <option value="standard">Recadrage + Amélioration</option>
                          <option value="full">Recadrage + Amélioration + Filtres</option>
                        </select>
                      </div>
                      {validationError && (
                        <div style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#EF4444' }}>
                          {validationError}
                        </div>
                      )}
                      <div className="edit-actions">
                        <button className="save-btn" onClick={requestSave} disabled={saving}>
                          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button className="cancel-btn" onClick={() => { setEditingPlan(null); setValidationError(''); }}>Annuler</button>
                      </div>
                    </div>
                  ) : (
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
                        <div className="plan-detail-row">
                          <span>Retouche Photo</span>
                          <span className="plan-detail-value" style={{ color: plan.photo_editing_level === 'none' ? '#ef4444' : plan.photo_editing_level === 'full' ? '#4ADE80' : '#FFB826' }}>
                            {plan.photo_editing_level === 'none' ? '✗ Désactivé' : plan.photo_editing_level === 'basic' ? 'Recadrage' : plan.photo_editing_level === 'standard' ? 'Recadrage + Amélioration' : 'Complet'}
                          </span>
                        </div>
                      </div>

                      {isDormant ? (
                        <div className="plan-dormant-msg">Aucun photographe sur ce plan pour l'instant</div>
                      ) : commissions?.planDistribution && (
                        <div className="plan-count-row">
                          <span><strong>{count}</strong> photographe{count !== 1 ? 's' : ''}</span>
                          <span className="plan-count-pct">{totalPhotographers > 0 ? Math.round((count / totalPhotographers) * 100) : 0}%</span>
                        </div>
                      )}

                      <button className="edit-plan-btn" onClick={() => startEdit(plan)}>
                        <IconEdit /> Modifier le plan
                        {getPlanRevenue(plan.id) > 0 && (
                          <span className="edit-plan-revenue"><IconCoin /> {formatFCFA(getPlanRevenue(plan.id))} F ce mois</span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="commissions-section">
          <div className="comm-kpis">
            <div className="comm-kpi">
              <span className="comm-kpi-label">Revenus totaux</span>
              <span className="comm-kpi-value">{formatFCFA(totals.revenue || 0)}</span>
              <span className="comm-kpi-unit">F CFA</span>
            </div>
            <div className="comm-kpi highlight">
              <span className="comm-kpi-label">Commissions FotoKash</span>
              <span className="comm-kpi-value">{formatFCFA(totals.commission || 0)}</span>
              <span className="comm-kpi-unit">F CFA gagnés</span>
            </div>
            <div className="comm-kpi">
              <span className="comm-kpi-label">Marge moyenne</span>
              <span className="comm-kpi-value">{totals.margin != null ? totals.margin.toFixed(0) : 0}%</span>
              <span className="comm-kpi-unit" style={{ color: deltaColor }}>{deltaLabel}</span>
            </div>
          </div>

          {totals.revenue > 0 && (
            <div className="comm-stacked-card">
              <h3 className="comm-table-title">Répartition CA brut — commission vs revenu net</h3>
              <div className="comm-stacked-bar">
                <div className="comm-stacked-seg comm-seg-commission" style={{ width: commissionPct + '%' }}>{commissionPct}%</div>
                <div className="comm-stacked-seg comm-seg-net" style={{ width: netPct + '%' }}>{netPct}%</div>
              </div>
              <div className="comm-stacked-legend">
                <span><span className="dot" style={{ background: '#E8593C' }} /> Commission FotoKash</span>
                <span><span className="dot" style={{ background: '#4ADE80' }} /> Revenu net photographes</span>
              </div>
            </div>
          )}

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
                  <span>Revenu net photo.</span>
                </div>
                {commissions.byPlan.map(row => (
                  <div key={row.plan} className="comm-table-row">
                    <span style={{ color: planColors[row.plan] || '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="dot" style={{ background: planColors[row.plan] || '#8888A0' }} />
                      {row.plan.toUpperCase()}
                    </span>
                    <span>{row.commissionRate}%</span>
                    <span>{row.totalSales}</span>
                    <span>{formatFCFA(row.totalRevenue)} F</span>
                    <span style={{ color: '#E8593C', fontWeight: 600 }}>{formatFCFA(row.totalCommission)} F</span>
                    <span style={{ color: '#4ADE80' }}>{formatFCFA(row.photographerRevenue)} F</span>
                  </div>
                ))}
                {byPlanTotals && (
                  <div className="comm-table-row comm-table-total">
                    <span>Total</span>
                    <span></span>
                    <span>{byPlanTotals.totalSales}</span>
                    <span>{formatFCFA(byPlanTotals.totalRevenue)} F</span>
                    <span style={{ color: '#E8593C' }}>{formatFCFA(byPlanTotals.totalCommission)} F</span>
                    <span style={{ color: '#4ADE80' }}>{formatFCFA(byPlanTotals.photographerRevenue)} F</span>
                  </div>
                )}
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
