import { useState, useEffect } from 'react';
import './Settings.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const settingGroups = {
  'Général': ['platform_name', 'platform_email', 'currency', 'maintenance_mode'],
  'Photos & Upload': ['max_upload_size_mb', 'max_photos_per_upload', 'watermark_text', 'photo_editing_enabled'],
  'Reconnaissance faciale': ['face_search_threshold'],
  'Tarifs clients': ['photo_price_1', 'photo_price_3', 'photo_price_5'],
};

const settingIcons = {
  'Général': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  'Photos & Upload': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  'Reconnaissance faciale': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  'Tarifs clients': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  ),
};

const Settings = ({ token }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState({});
  const [saved, setSaved] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const getValue = (key) => {
    if (modified[key] !== undefined) return modified[key];
    const s = settings.find(s => s.key === key);
    return s ? s.value : '';
  };

  const handleChange = (key, value) => {
    setModified(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const toSave = Object.entries(modified).map(([key, value]) => ({ key, value }));
      if (toSave.length === 0) return;

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT', headers, body: JSON.stringify({ settings: toSave })
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
        setModified({});
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const hasChanges = Object.keys(modified).length > 0;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Paramètres</h1>
          <p className="settings-subtitle">Configuration globale de FotoKash</p>
        </div>
        {hasChanges && (
          <button className="save-all-btn" onClick={saveAll} disabled={saving}>
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications'}
          </button>
        )}
        {saved && <span className="saved-badge">✓ Sauvegardé !</span>}
      </div>

      {loading ? (
        <div className="settings-loading">Chargement...</div>
      ) : (
        <div className="settings-groups">
          {Object.entries(settingGroups).map(([group, keys]) => (
            <div key={group} className="settings-group">
              <div className="group-header">
                <span className="group-icon">{settingIcons[group]}</span>
                <h2 className="group-title">{group}</h2>
              </div>
              <div className="group-fields">
                {keys.map(key => {
                  const setting = settings.find(s => s.key === key);
                  if (!setting) return null;
                  const value = getValue(key);
                  const isModified = modified[key] !== undefined;

                  if (setting.key === 'maintenance_mode' || setting.key === 'photo_editing_enabled') {
                    return (
                      <div key={key} className={`setting-row ${isModified ? 'modified' : ''}`}>
                        <div className="setting-info">
                          <span className="setting-key">{setting.description || setting.key}</span>
                          <span className="setting-key-raw">{setting.key}</span>
                        </div>
                        <button
                          className={`setting-toggle ${value === 'true' ? 'on' : 'off'}`}
                          onClick={() => handleChange(key, value === 'true' ? 'false' : 'true')}
                        >
                          {value === 'true' ? '✓ Activé' : '✗ Désactivé'}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className={`setting-row ${isModified ? 'modified' : ''}`}>
                      <div className="setting-info">
                        <span className="setting-key">{setting.description || setting.key}</span>
                        <span className="setting-key-raw">{setting.key}</span>
                      </div>
                      <input
                        className="setting-input"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settings;