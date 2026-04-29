const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Trouver la zone qui affiche le nom et la date de l'evenement dans ClientPage
// Chercher "event?.location"
let locIdx = c.indexOf("event?.location");
if (locIdx === -1) {
  console.log('event?.location not found');
  process.exit();
}

// Trouver la fin du </p> apres location
let pEnd = c.indexOf('</p>', locIdx);
let afterP = pEnd + 4;

// Ajouter les infos du photographe
let photographerInfo = `
              {event?.photographer_name && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, background: T.card, borderRadius: T.radiusSm, padding: "10px 14px", border: "1px solid " + T.border }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: T.accentDim, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{event.photographer_name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{event.photographer_name}</div>
                    {event.photographer_phone && (
                      <a href={"https://wa.me/" + event.photographer_phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: T.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        {Icon.Phone(12)} Contacter sur WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}`;

c = c.substring(0, afterP) + photographerInfo + c.substring(afterP);
fs.writeFileSync(path, c, 'utf8');
console.log('Photographer info added to client page');
