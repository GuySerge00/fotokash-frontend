import { useState, useEffect } from 'react';
import { Icon } from '../../utils/icons';
import './Settings.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const settingGroups = {
  'Général': ['platform_name', 'platform_email', 'currency', 'maintenance_mode'],
  'Photos & Upload': ['max_upload_size_mb', 'max_photos_per_upload', 'watermark_text', 'photo_editing_enabled'],
  'Reconnaissance faciale': ['face_search_threshold', 'min_selfie_quality'],
  'Tarifs clients': ['photo_price_1', 'photo_price_3', 'photo_price_5'],
};

const groupAnchors = { 'Général': 'general', 'Photos & Upload': 'photos', 'Reconnaissance faciale': 'reco', 'Tarifs clients': 'tarifs' };

const unitByKey = { max_upload_size_mb: 'Mo', max_photos_per_upload: 'photos', min_selfie_quality: '%' };
const toggleKeys = ['maintenance_mode', 'photo_editing_enabled'];
const priceMeta = {
  photo_price_1: { label: '1 photo', count: 1 },
  photo_price_3: { label: '6 photos', count: 6 },
  photo_price_5: { label: '10+ photos', count: 10 },
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

const ToggleSwitch = ({ checked, onChange }) => (
  <button onClick={onChange} style={{
    width: 44, height: 24, borderRadius: 20, border: 'none', cursor: 'pointer',
    background: checked ? '#E8593C' : 'rgba(255,255,255,0.14)', position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
  }}>
    <span style={{
      position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%',
      background: '#fff', transition: 'left 0.2s',
    }} />
  </button>
);

const InfoTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', marginLeft: 6 }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #555568', color: '#6b6b80', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>i</span>
      {show && (
        <span style={{ position: 'absolute', bottom: '140%', left: 0, background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#d0d0e0', fontFamily: 'monospace', whiteSpace: 'nowrap', zIndex: 20 }}>{text}</span>
      )}
    </span>
  );
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

  const cancelAll = () => setModified({});

  const hasChanges = Object.keys(modified).length > 0;

  const scrollTo = (anchor) => {
    const el = document.getElementById('settings-anchor-' + anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="settings-page" style={{ paddingBottom: hasChanges ? 90 : 0 }}>
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Paramètres</h1>
          <p className="settings-subtitle">Configuration globale de FotoKash</p>
        </div>
        {saved && <span className="saved-badge">✓ Sauvegardé !</span>}
      </div>

      {/* Table des matières collante */}
      <div className="settings-toc">
        {Object.keys(settingGroups).map(group => (
          <button key={group} onClick={() => scrollTo(groupAnchors[group])} className="settings-toc-item">
            {group}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="settings-loading">Chargement...</div>
      ) : (
        <div className="settings-groups">
          {Object.entries(settingGroups).map(([group, keys]) => (
            <div key={group} id={'settings-anchor-' + groupAnchors[group]} className="settings-group">
              <div className="group-header">
                <span className="group-icon">{settingIcons[group]}</span>
                <h2 className="group-title">{group}</h2>
              </div>

              {group === 'Tarifs clients' ? (
                <div className="price-cards">
                  {keys.map(key => {
                    const setting = settings.find(s => s.key === key);
                    if (!setting) return null;
                    const meta = priceMeta[key] || { label: setting.description, count: 1 };
                    const value = getValue(key);
                    const isModified = modified[key] !== undefined;
                    const perPhoto = value ? Math.round((parseFloat(value) / meta.count) * 100) / 100 : 0;
                    return (
                      <div key={key} className={"price-card" + (isModified ? " modified" : "")}>
                        <div className="price-card-label">{meta.label}</div>
                        <div className="price-card-input-row">
                          <input
                            className="price-card-input"
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                          <span className="price-card-suffix">F</span>
                        </div>
                        <div className="price-card-sub">
                          {meta.count > 1 ? '≈ ' + perPhoto + ' F/photo' : perPhoto + ' F/photo'}
                        </div>
                        <div className="price-card-raw">{setting.key}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="group-fields">
                  {keys.map(key => {
                    const setting = settings.find(s => s.key === key);
                    if (!setting) return null;
                    const value = getValue(key);
                    const isModified = modified[key] !== undefined;

                    if (key === 'maintenance_mode') {
                      return (
                        <div key={key} className="maintenance-alert">
                          <div className="maintenance-alert-left">
                            <span className="maintenance-alert-icon">{Icon.AlertCircle(18)}</span>
                            <div>
                              <div className="maintenance-alert-title">{setting.description}</div>
                              <div className="maintenance-alert-sub">Bascule toute la plateforme en mode indisponible pour les visiteurs.</div>
                            </div>
                          </div>
                          <ToggleSwitch checked={value === 'true'} onChange={() => handleChange(key, value === 'true' ? 'false' : 'true')} />
                        </div>
                      );
                    }

                    if (toggleKeys.includes(key)) {
                      return (
                        <div key={key} className={`setting-row ${isModified ? 'modified' : ''}`}>
                          <div className="setting-info">
                            <span className="setting-key">{setting.description || setting.key}<InfoTooltip text={setting.key} /></span>
                          </div>
                          <ToggleSwitch checked={value === 'true'} onChange={() => handleChange(key, value === 'true' ? 'false' : 'true')} />
                        </div>
                      );
                    }

                    if (key === 'face_search_threshold') {
                      return (
                        <div key={key} className="setting-row-slider">
                          <div className="setting-info" style={{ marginBottom: 10 }}>
                            <span className="setting-key">{setting.description || setting.key}<InfoTooltip text={setting.key} /></span>
                          </div>
                          <div className="slider-labels">
                            <span>Strict</span>
                            <span className="slider-value">{parseFloat(value || 0).toFixed(2)}</span>
                            <span>Permissif</span>
                          </div>
                          <input
                            type="range" min="0" max="1" step="0.05"
                            value={parseFloat(value) || 0}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="setting-slider"
                          />
                        </div>
                      );
                    }

                    const unit = unitByKey[key];
                    return (
                      <div key={key} className={`setting-row ${isModified ? 'modified' : ''}`}>
                        <div className="setting-info">
                          <span className="setting-key">{setting.description || setting.key}<InfoTooltip text={setting.key} /></span>
                        </div>
                        <div className="setting-input-wrap">
                          {unit && <span className="setting-input-unit">{unit}</span>}
                          <input
                            className="setting-input"
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bandeau sticky de sauvegarde */}
      {hasChanges && (
        <div className="settings-save-bar">
          <span className="settings-save-bar-text">● Modifications non enregistrées</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="settings-cancel-btn" onClick={cancelAll}>Annuler</button>
            <button className="save-all-btn" onClick={saveAll} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
