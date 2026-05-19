import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount));
};

const periods = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d', label: '7j' },
  { key: '30d', label: '30j' },
  { key: 'custom', label: <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4,verticalAlign:'middle'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Période</> },
];

const Dashboard = ({ token }) => {
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectStep, setSelectStep] = useState(0);
  const [hoverDay, setHoverDay] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, chartRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats?period=${period}${period==="custom" && startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : ""}`, { headers }),
        fetch(`${API_URL}/admin/dashboard/revenue-chart?days=7`, { headers }),
        fetch(`${API_URL}/admin/dashboard/recent-sales`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (chartRes.ok) {
        const chartResult = await chartRes.json();
        setChartData(chartResult.chartData || []);
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setRecentSales(salesData.sales || []);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetch(API_URL + '/live/stats/global').then(r => r.json()).then(d => setGlobalStats(d.stats)).catch(() => {});
  }, [period, startDate, endDate, refreshKey]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const fmtD = (y, m, d) => y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  const handleDayClick = (day) => {
    const clicked = fmtD(calYear, calMonth, day);
    if (selectStep === 0) {
      setStartDate(clicked);
      setEndDate('');
      setSelectStep(1);
    } else {
      if (clicked < startDate) {
        setEndDate(startDate);
        setStartDate(clicked);
      } else {
        setEndDate(clicked);
      }
      setSelectStep(0);
      setShowCalendar(false);
      setPeriod('custom');
    }
  };

  const handleDayDblClick = (day) => {
    const clicked = fmtD(calYear, calMonth, day);
    setStartDate(clicked);
    setEndDate(clicked);
    setSelectStep(0);
    setShowCalendar(false);
    setPeriod('custom');
  };

  const isInRange = (day) => {
    if (!startDate) return false;
    const d = fmtD(calYear, calMonth, day);
    if (selectStep === 1 && hoverDay) {
      const hd = fmtD(calYear, calMonth, hoverDay);
      const lo = hd < startDate ? hd : startDate;
      const hi = hd < startDate ? startDate : hd;
      return d >= lo && d <= hi;
    }
    if (!endDate) return d === startDate;
    return d >= startDate && d <= endDate;
  };
  const isStart = (day) => fmtD(calYear, calMonth, day) === startDate;
  const isEnd = (day) => fmtD(calYear, calMonth, day) === endDate;

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  const renderCalendar = () => {
    const days = daysInMonth(calMonth, calYear);
    const first = firstDayOfMonth(calMonth, calYear);
    const cells = [];
    for (let i = 0; i < (first === 0 ? 6 : first - 1); i++) cells.push(<div key={'e'+i} />);
    for (let d = 1; d <= days; d++) {
      const inRange = isInRange(d);
      const start = isStart(d);
      const end = isEnd(d);
      cells.push(
        <div key={d}
          onClick={() => handleDayClick(d)}
          onDoubleClick={() => handleDayDblClick(d)}
          onMouseEnter={() => { if (selectStep === 1) setHoverDay(d); }}
          onMouseLeave={() => setHoverDay(null)}
          style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: start || end ? 8 : 0,
            background: start || end ? '#E8593C' : inRange ? 'rgba(232,89,60,0.15)' : 'transparent',
            color: start || end ? '#fff' : inRange ? '#E8593C' : '#ccc',
            cursor: 'pointer', fontSize: 13, fontWeight: start || end ? 700 : 400,
            transition: 'all 0.15s'
          }}
        >{d}</div>
      );
    }
    return cells;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Vue d'ensemble de FotoKash</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px', color: '#8888A0', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Actualiser
          </button>
          <div className="period-selector">
          {periods.map((p) => (
            <button
              key={p.key}
              className={`period-btn ${period === p.key ? 'active' : ''}`}
              onClick={() => { if (p.key === 'custom') { setShowCalendar(!showCalendar); setSelectStep(0); } else { setPeriod(p.key); setShowCalendar(false); } }}
            >
              {p.label}
            </button>
          ))}
          </div>
          {period === "custom" && startDate && endDate && (
            <div style={{ fontSize: 11, color: "#E8593C", marginTop: 4, textAlign: "right" }}>
              {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
            </div>
          )}
          {showCalendar && (
            <div style={{ position: "absolute", right: 0, top: 45, background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, zIndex: 300, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", minWidth: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button onClick={prevMonth} style={{ background: "none", border: "none", color: "#8888A0", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>◀</button>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{monthNames[calMonth]} {calYear}</span>
                <button onClick={nextMonth} style={{ background: "none", border: "none", color: "#8888A0", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>▶</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 32px)", gap: 2, justifyContent: "center", marginBottom: 8 }}>
                {['Lu','Ma','Me','Je','Ve','Sa','Di'].map(d => <div key={d} style={{ width: 32, textAlign: "center", fontSize: 10, color: "#8888A0", fontWeight: 600 }}>{d}</div>)}
                {renderCalendar()}
              </div>
              {selectStep === 1 && <div style={{ fontSize: 11, color: "#E8593C", textAlign: "center", marginTop: 8 }}>Sélectionnez la date de fin</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={() => { setShowCalendar(false); setSelectStep(0); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "4px 12px", color: "#8888A0", fontSize: 11, cursor: "pointer" }}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {globalStats && (
        <div style={{ background: "#141419", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#FFB826" }}>{Number(globalStats.visitors_count).toLocaleString("fr-FR")}</div>
          <div style={{ fontSize: 12, color: "#8888A0" }}>Visiteurs total</div>
        </div>
      )}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon revenue-icon">$</div>
          <div className="kpi-content">
            <span className="kpi-label">REVENUS</span>
            <span className="kpi-value">{stats ? formatFCFA(stats.revenue.total) : '—'}</span>
            <span className="kpi-unit">F CFA</span>
          </div>
          {stats && (
            <span className={`kpi-change ${stats.revenue.change >= 0 ? 'positive' : 'negative'}`}>
              {stats.revenue.change >= 0 ? '+' : ''}{stats.revenue.change}%
            </span>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-icon photos-icon">⬜</div>
          <div className="kpi-content">
            <span className="kpi-label">PHOTOS VENDUES</span>
            <span className="kpi-value">{stats ? stats.photos.total : '—'}</span>
            <span className="kpi-unit">{period === 'today' ? "aujourd'hui" : period === 'custom' && startDate && endDate ? `du ${startDate} au ${endDate}` : `sur ${period}`}</span>
          </div>
          {stats && (
            <span className={`kpi-change ${stats.photos.change >= 0 ? 'positive' : 'negative'}`}>
              {stats.photos.change >= 0 ? '+' : ''}{stats.photos.change}%
            </span>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', fontSize: 16 }}>⬇</div>
          <div className="kpi-content">
            <span className="kpi-label">TÉLÉCHARGEMENTS</span>
            <span className="kpi-value">{stats ? stats.downloads?.total || 0 : '—'}</span>
            <span className="kpi-unit">HD + QR code</span>
          </div>
          {stats && stats.downloads?.change > 0 && (
            <span className="kpi-change positive">+{stats.downloads.change}%</span>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-icon events-icon">📅</div>
          <div className="kpi-content">
            <span className="kpi-label">ÉVÉNEMENTS ACTIFS</span>
            <span className="kpi-value">{stats ? stats.events.active : '—'}</span>
            <span className="kpi-unit">en cours</span>
          </div>
          {stats && stats.events.new > 0 && (
            <span className="kpi-change positive">+{stats.events.new} nouveau{stats.events.new > 1 ? 'x' : ''}</span>
          )}
        </div>

        <div className="kpi-card">
          <div className="kpi-icon photographers-icon">👥</div>
          <div className="kpi-content">
            <span className="kpi-label">PHOTOGRAPHES</span>
            <span className="kpi-value">{stats ? stats.photographers.total : '—'}</span>
            <span className="kpi-unit">{stats ? `${stats.photographers.active} actifs` : ''}</span>
          </div>
          {stats && stats.photographers.new > 0 && (
            <span className="kpi-change positive">+{stats.photographers.new} cette semaine</span>
          )}
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="chart-card">
          <h3 className="card-title">Revenus — 7 derniers jours</h3>
          <div className="chart-container">
            {chartData.map((d, i) => (
              <div key={i} className="chart-bar-wrapper">
                <div className="chart-bar-bg">
                  <div
                    className="chart-bar"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    title={`${formatFCFA(d.revenue)} F CFA`}
                  />
                </div>
                <span className="chart-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sales-card">
          <h3 className="card-title">Dernières ventes</h3>
          <div className="sales-list">
            {recentSales.length === 0 && !loading && (
              <p className="sales-empty">Aucune vente récente</p>
            )}
            {recentSales.map((sale) => (
              <div key={sale.id} className="sale-item">
                <div className="sale-info">
                  <span className="sale-event">{sale.eventName}</span>
                  <span className="sale-photos">{sale.photoCount} photo{sale.photoCount > 1 ? 's' : ''}</span>
                </div>
                <span className="sale-amount">{formatFCFA(sale.amount)} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;