import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './pages/Dashboard';
import Photographers from './pages/Photographers';
import Subscriptions from './pages/Subscriptions';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import './AdminLayout.css';

const AdminLayout = ({ user, token, onNavigate, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard token={token} />;
      case 'photographers':
        return <Photographers token={token} />;
      case 'subscriptions':
        return <Subscriptions token={token} />;
      case 'commissions':
        return <Subscriptions token={token} />;
      case 'logs':
        return <Logs token={token} />;
      case 'settings':
        return <Settings token={token} />;
      default:
        return <Dashboard token={token} />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout} />
      <main className="admin-main">
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminLayout;