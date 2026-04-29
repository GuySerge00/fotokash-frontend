const fs = require('fs');
const p = '/home/fotokash-frontend/src/admin/pages/Photographers.jsx';
let c = fs.readFileSync(p, 'utf8');
let lines = c.split('\n');

// Trouver la ligne avec "detail-actions"
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('detail-actions')) {
    startIdx = i;
  }
  if (startIdx > 0 && i > startIdx && lines[i].trim() === '</div>') {
    endIdx = i;
    break;
  }
}

console.log('Found detail-actions from line', startIdx + 1, 'to', endIdx + 1);

if (startIdx > 0 && endIdx > 0) {
  let newBlock = [
    '                <div className="detail-actions">',
    '                  <button className="action-btn activate" onClick={async () => { if (window.confirm("Reinitialiser le mot de passe ?")) { try { const res = await fetch(API_URL + "/admin/photographers/" + detail.photographer.id + "/password", { method: "PATCH", headers }); const data = await res.json(); if (res.ok) alert("Nouveau mot de passe : " + data.defaultPassword); } catch(e){console.error(e)} } }}>',
    '                    Reinitialiser le mot de passe',
    '                  </button>',
    '                  <button className={"action-btn " + (detail.photographer.status === "active" ? "deactivate" : "activate")} onClick={() => toggleStatus(detail.photographer.id, detail.photographer.status)}>',
    '                    {detail.photographer.status === "active" ? "Desactiver le compte" : "Activer le compte"}',
    '                  </button>',
    '                  <button className="action-btn deactivate" onClick={async () => { if (window.confirm("Supprimer definitivement ce compte ?")) { try { const res = await fetch(API_URL + "/admin/photographers/" + detail.photographer.id, { method: "DELETE", headers }); if (res.ok) { setPhotographers(function(prev){return prev.filter(function(x){return x.id !== detail.photographer.id})}); setSelected(null); setDetail(null); } } catch(e){console.error(e)} } }}>',
    '                    Supprimer definitivement',
    '                  </button>',
    '                  <button className="action-btn close" onClick={() => { setSelected(null); setDetail(null); }}>',
    '                    Fermer',
    '                  </button>',
    '                </div>',
  ];

  lines.splice(startIdx, endIdx - startIdx + 1, ...newBlock);
  fs.writeFileSync(p, lines.join('\n'), 'utf8');
  console.log('Block replaced successfully');
} else {
  console.log('Block not found!');
}
