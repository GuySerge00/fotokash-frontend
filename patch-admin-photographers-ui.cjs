const fs = require('fs');
const path = 'src/admin/pages/Photographers.jsx';
function replaceOnce(content, find, replace, label) {
  const parts = content.split(find);
  if (parts.length !== 2) throw new Error('Ancre "' + label + '" trouvee ' + (parts.length - 1) + ' fois. Abandon.');
  return parts.join(replace);
}
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-admin-photographers-jsx';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/Photographers.jsx', src);
console.log('Backup : ' + bkdir + '/Photographers.jsx');

// --- 1. Ajouter la mini-carte Tarification apres la carte "Inscrit le" ---
const cardAnchor =
`                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Inscrit le</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f5' }}>{formatDate(detail.photographer.createdAt)}</div>
                </div>
              </div>`;

const cardReplacement =
`                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Inscrit le</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f5' }}>{formatDate(detail.photographer.createdAt)}</div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:10, color:'#8888A0', textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Tarification par défaut</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#f0f0f5', textTransform:'capitalize' }}>
                    {{ free: 'Gratuit', fixed: 'Prix fixe', degressive: 'Dégressif', tiers: 'Paliers' }[detail.photographer.defaultPricingMode] || detail.photographer.defaultPricingMode}
                  </div>
                  {detail.photographer.defaultUnitPrice != null && (
                    <div style={{ fontSize:11, color:'#8888A0', marginTop:2 }}>{detail.photographer.defaultUnitPrice} F de base</div>
                  )}
                </div>
              </div>`;

src = replaceOnce(src, cardAnchor, cardReplacement, 'mini-carte Tarification');

// --- 2. Badge de surcharge sur les evenements ayant un pricing_mode propre ---
const eventAnchor =
`                          <span className="detail-event-name" style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</span>
                          <span className="detail-event-date">{e.date ? formatDate(e.date) : '—'} · {e.photoCount} photos</span>`;

const eventReplacement =
`                          <span className="detail-event-name" style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {e.name}
                            {e.pricingMode && (
                              <span style={{ marginLeft:8, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'rgba(245,158,11,0.15)', color:'#f59e0b', textTransform:'uppercase', letterSpacing:0.3 }}>
                                {{ free: 'Gratuit', fixed: 'Prix fixe', degressive: 'Dégressif' }[e.pricingMode] || e.pricingMode}{e.unitPrice != null ? ' · ' + e.unitPrice + ' F' : ''}
                              </span>
                            )}
                          </span>
                          <span className="detail-event-date">{e.date ? formatDate(e.date) : '—'} · {e.photoCount} photos</span>`;

src = replaceOnce(src, eventAnchor, eventReplacement, 'badge surcharge evenement');

fs.writeFileSync(path, src);
console.log('Photographers.jsx patche : carte Tarification + badges surcharge evenements.');
