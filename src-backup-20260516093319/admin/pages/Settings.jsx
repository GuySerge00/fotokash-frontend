import { useState, useEffect } from 'react';
import './Settings.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const settingGroups = {
  'Général': ['platform_name', 'platform_email', 'currency', 'maintenance_mode'],
  'Photos & Upload': ['max_upload_size_mb', 'max_photos_per_upload', 'watermark_text'],
  'Reconnaissance faciale': ['face_search_threshold'],
  'Tarifs clients': ['photo_price_1', 'photo_price_6', 'photo_price_10'],
};

const settingIcons = {
  'Général': '🏠',
  'Photos & Upload': '📷',
  'Reconnaissance faciale': '🔍',
  'Tarifs clients': '💰',
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

                  if (setting.key === 'maintenance_mode') {
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