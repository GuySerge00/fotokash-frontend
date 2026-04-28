import './AdminSidebar.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'photographers', label: 'Photographes', icon: '👤' },
  { id: 'subscriptions', label: 'Abonnements & Commissions', icon: '$' },
  { id: 'logs', label: 'Logs', icon: '☰' },
];

const AdminSidebar = ({ currentPage, onNavigate, onLogout }) => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-logo-icon">FK</div>
        <span className="admin-logo-text">FotoKash</span>
        <span className="admin-logo-badge">Admin</span>
      </div>
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`admin-nav-item ${currentPage === item.id ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span className="admin-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <button
          className={`admin-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <span className="admin-nav-icon">⚙</span>
          <span className="admin-nav-label">Paramètres</span>
        </button>
        <button className="admin-nav-item" onClick={onLogout}>
          <span className="admin-nav-icon">↩</span>
          <span className="admin-nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;