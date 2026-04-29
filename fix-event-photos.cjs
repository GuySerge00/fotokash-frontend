const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Ajouter un composant EventPhotosViewer avant la fonction EventsTab
let eventsTabIdx = c.indexOf('function EventsTab(');
if (eventsTabIdx === -1) {
  console.log('EventsTab not found');
  process.exit();
}

let viewer = `
function EventPhotosViewer({ eventId, eventName, token, onClose }) {
  var photosState = useState([]);
  var loadingState = useState(true);
  var photos = photosState[0];
  var setPhotos = photosState[1];
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  useEffect(function() {
    fetch(API + "/photos/event/" + eventId + "/public")
      .then(function(r) { return r.json(); })
      .then(function(d) { setPhotos(d.photos || []); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, [eventId]);

  var deletePhoto = function(photoId) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    fetch(API + "/photos/" + photoId, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    }).then(function(r) {
      if (r.ok) setPhotos(function(prev) { return prev.filter(function(p) { return p.id !== photoId; }); });
    });
  };

  return (
    <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: 24, marginBottom: 20, animation: "slideDown 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{eventName}</h3>
          <p style={{ fontSize: 12, color: T.textMuted }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "8px 16px", color: T.textMuted, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>Fermer</button>
      </div>
      {loading ? (
        <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Chargement...</p>
      ) : photos.length === 0 ? (
        <p style={{ color: T.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Aucune photo</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {photos.map(function(p) {
            return (
              <div key={p.id} style={{ position: "relative", borderRadius: T.radiusSm, overflow: "hidden", aspectRatio: "1", border: "1px solid " + T.border }}>
                <img src={p.thumbnail_url || p.watermarked_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <button onClick={function() { deletePhoto(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(239,68,68,0.85)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", fontSize: 12 }}>X</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

`;

c = c.substring(0, eventsTabIdx) + viewer + c.substring(eventsTabIdx);
console.log('EventPhotosViewer added');

// Maintenant ajouter un state et un bouton dans EventsTab
// Ajouter viewingEvent state
let eventsTabNew = c.indexOf('function EventsTab(');
let showFormIdx = c.indexOf('const [showForm, setShowForm]', eventsTabNew);
if (showFormIdx !== -1) {
  let lineEnd = c.indexOf('\n', showFormIdx) + 1;
  c = c.substring(0, lineEnd) + '  const [viewingEvent, setViewingEvent] = useState(null);\n' + c.substring(lineEnd);
  console.log('viewingEvent state added');
}

// Ajouter EventPhotosViewer dans le rendu, juste apres le showForm block
let showFormEnd = c.indexOf('{showForm && (');
if (showFormEnd !== -1) {
  // Trouver la fin du bloc showForm
  let depth = 0;
  let i = showFormEnd;
  let foundStart = false;
  for (; i < c.length; i++) {
    if (c[i] === '{' && !foundStart) { foundStart = true; }
    if (foundStart) {
      if (c[i] === '{') depth++;
      if (c[i] === '}') depth--;
      if (depth === 0) break;
    }
  }
  let afterShowForm = c.indexOf('\n', i) + 1;
  
  let viewerRender = `
      {viewingEvent && (
        <EventPhotosViewer
          eventId={viewingEvent.id}
          eventName={viewingEvent.name}
          token={token}
          onClose={function() { setViewingEvent(null); }}
        />
      )}

`;
  c = c.substring(0, afterShowForm) + viewerRender + c.substring(afterShowForm);
  console.log('EventPhotosViewer render added');
}

// Ajouter onClick sur chaque event card pour voir les photos
// Chercher le div de chaque evenement et ajouter un bouton "Voir photos"
let photoCountIdx = c.indexOf('{e.photos_count || 0} photo');
if (photoCountIdx !== -1) {
  let spanEnd = c.indexOf('</span>', photoCountIdx) + 7;
  let viewBtn = '\n                <button onClick={function(ev) { ev.stopPropagation(); setViewingEvent(e); }} style={{ background: T.accentDim, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: T.accent, fontSize: 11, fontWeight: 600 }}>Voir photos</button>';
  c = c.substring(0, spanEnd) + viewBtn + c.substring(spanEnd);
  console.log('View photos button added');
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
