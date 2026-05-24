import { useState, useCallback, useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './pages/Dashboard';
import Photographers from './pages/Photographers';
import Subscriptions from './pages/Subscriptions';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './AdminLayout.css';

const AdminLayout = ({ user, token, onNavigate, onLogout, initialPage }) => {
  const [currentPage, setCurrentPage] = useState(initialPage || 'dashboard');

  // sync page to URL on page change
  useEffect(() => {
    const url = currentPage && currentPage !== "dashboard" ? "/admin/" + currentPage : "/admin";
    if (window.location.pathname !== url) {
      window.history.replaceState({ screen: "admin", props: { page: currentPage } }, "", url);
    }
  }, [currentPage]);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    onNavigate('admin', { page });
  };

  const toastColors = { success: '#4ADE80', error: '#EF4444', info: '#818CF8' };
  const toastBg = { success: 'rgba(74,222,128,0.12)', error: 'rgba(239,68,68,0.12)', info: 'rgba(129,140,248,0.12)' };

  const renderPage = () => {
    const props = { token, showToast };
    switch (currentPage) {
      case 'dashboard':      return <Dashboard {...props} />;
      case 'photographers':  return <Photographers {...props} />;
      case 'subscriptions':  return <Subscriptions {...props} />;
      case 'commissions':    return <Subscriptions {...props} />;
      case 'logs':           return <Logs {...props} />;
      case 'settings':       return <Settings {...props} />;
      default:               return <Dashboard {...props} />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar currentPage={currentPage} onNavigate={handleNavigate} onLogout={onLogout} />
            {/* HEADER MOBILE ADMIN */}
      <div className="admin-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #E8593C, #d44a2f)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#fff" }}>FK</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#f0f0f5" }}>FotoKash <span style={{ fontSize: 10, fontWeight: 600, color: "#E8593C", background: "rgba(232,89,60,0.1)", padding: "2px 8px", borderRadius: 20, marginLeft: 4 }}>Admin</span></span>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b8b9e", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "DM Sans, system-ui, sans-serif" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
      <main className="admin-main">
        {renderPage()}
      </main>


      {/* ADMIN BOTTOM NAV MOBILE */}
      <div className="admin-bottom-nav">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
          { id: 'photographers', label: 'Photos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          { id: 'subscriptions', label: 'Plans', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          { id: 'logs', label: 'Logs', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { id: 'settings', label: 'Config', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
        ].map((item) => (
          <button key={item.id} className={currentPage === item.id ? 'active' : ''} onClick={() => handleNavigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentPage === item.id && <span className="nav-dot" />}
          </button>
        ))}
      </div>
      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: toastBg[t.type] || toastBg.info,
            border: '1px solid ' + (toastColors[t.type] || toastColors.info),
            borderRadius: 10, padding: '12px 18px',
            color: toastColors[t.type] || toastColors.info,
            fontSize: 13, fontWeight: 600,
            maxWidth: 320, animation: 'fadeUp 0.25s ease',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <span style={{ color: '#F0F0F5', fontWeight: 400 }}>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;
