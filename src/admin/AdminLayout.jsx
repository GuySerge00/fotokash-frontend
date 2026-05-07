import { useState, useCallback } from 'react';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './pages/Dashboard';
import Photographers from './pages/Photographers';
import Subscriptions from './pages/Subscriptions';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './AdminLayout.css';

const AdminLayout = ({ user, token, onNavigate, onLogout, initialPage }) => {
  const [currentPage, setCurrentPage] = useState(initialPage || 'dashboard');
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
      <main className="admin-main">
        {renderPage()}
      </main>

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
