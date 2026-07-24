const fs = require('fs');
const path = 'src/admin/pages/Settings.jsx';
function replaceOnce(content, find, replace, label) {
  const parts = content.split(find);
  if (parts.length !== 2) throw new Error('Ancre "' + label + '" trouvee ' + (parts.length - 1) + ' fois. Abandon.');
  return parts.join(replace);
}
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-frontend-admin-settings';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/Settings.jsx', src);
console.log('Backup : ' + bkdir + '/Settings.jsx');

// 1. Ajouter les 2 cles au groupe, sans toucher aux 3 existantes (mini-cartes inchangees)
src = replaceOnce(
  src,
  "'Tarifs clients': ['photo_price_1', 'photo_price_3', 'photo_price_5'],",
  "'Tarifs clients': ['photo_price_1', 'photo_price_3', 'photo_price_5', 'min_base_unit_price', 'pricing_reference_base'],",
  'settingGroups Tarifs clients'
);

// 2. Suffixe F pour les 2 nouveaux champs
src = replaceOnce(
  src,
  "const unitByKey = { max_upload_size_mb: 'Mo', max_photos_per_upload: 'photos', min_selfie_quality: '%' };",
  "const unitByKey = { max_upload_size_mb: 'Mo', max_photos_per_upload: 'photos', min_selfie_quality: '%', min_base_unit_price: 'F', pricing_reference_base: 'F' };",
  'unitByKey'
);

// 3. Rendu : apres les price-cards (photo_price_1/3/5), ajouter un bandeau explicatif + les 2 champs en style generique
src = replaceOnce(
  src,
  `              {group === 'Tarifs clients' ? (
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
              ) : (`,
  `              {group === 'Tarifs clients' ? (
                <>
                  <div className="price-cards">
                    {keys.filter(k => priceMeta[k]).map(key => {
                      const setting = settings.find(s => s.key === key);
                      if (!setting) return null;
                      const meta = priceMeta[key];
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
                  <div className="maintenance-alert" style={{ marginTop: 16, marginBottom: 4 }}>
                    <div className="maintenance-alert-left">
                      <span className="maintenance-alert-icon">{Icon.AlertCircle(18)}</span>
                      <div>
                        <div className="maintenance-alert-title">Tarification personnalisée</div>
                        <div className="maintenance-alert-sub">Les photographes Pro/Business peuvent désormais définir leur propre prix par événement. Ci-dessous, les bornes qui encadrent cette liberté — la grille ci-dessus reste le tarif par défaut.</div>
                      </div>
                    </div>
                  </div>
                  <div className="group-fields" style={{ marginTop: 8 }}>
                    {keys.filter(k => !priceMeta[k]).map(key => {
                      const setting = settings.find(s => s.key === key);
                      if (!setting) return null;
                      const value = getValue(key);
                      const isModified = modified[key] !== undefined;
                      const unit = unitByKey[key];
                      return (
                        <div key={key} className={\`setting-row \${isModified ? 'modified' : ''}\`}>
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
                </>
              ) : (`,
  'rendu Tarifs clients'
);

fs.writeFileSync(path, src);
console.log('Settings.jsx patche : min_base_unit_price + pricing_reference_base ajoutes.');
