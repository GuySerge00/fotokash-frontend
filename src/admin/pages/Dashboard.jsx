import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatFCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount));
};

const periods = [
  { key: 'today', label: "Aujourd'hui" },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
];

const Dashboard = ({ token }) => {
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, chartRes, salesRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats?period=${period}`, { headers }),
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
  }, [period]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Vue d'ensemble de FotoKash</p>
        </div>
        <div className="period-selector">
          {periods.map((p) => (
            <button
              key={p.key}
              className={`period-btn ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

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
            <span className="kpi-unit">{period === 'today' ? "aujourd'hui" : `sur ${period}`}</span>
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