const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');

// Ajouter la detection de /p/CODE dans l'init du screen
let screenInit = c.indexOf('if (p.startsWith("/e/")) return "client"');
if (screenInit !== -1) {
  let afterCheck = c.indexOf(';', screenInit) + 1;
  let qrCheck = '\n    if (p.startsWith("/p/")) return "qr-photo";';
  c = c.substring(0, afterCheck) + qrCheck + c.substring(afterCheck);
  console.log('QR screen init added');
}

// Ajouter dans screenProps aussi
let propsInit = c.indexOf('if (p.startsWith("/e/")) return { slug: p.replace("/e/", "") }');
if (propsInit !== -1) {
  let afterPropsCheck = c.indexOf(';', propsInit) + 1;
  let qrPropsCheck = '\n    if (p.startsWith("/p/")) return { qrCode: p.replace("/p/", "") };';
  c = c.substring(0, afterPropsCheck) + qrPropsCheck + c.substring(afterPropsCheck);
  console.log('QR props init added');
}

// Ajouter /p/ dans le check auto-login
let autoLoginCheck = c.indexOf('if (currentPath.startsWith("/e/"))');
if (autoLoginCheck !== -1) {
  let returnLine = c.indexOf('return;', autoLoginCheck);
  let afterReturn = c.indexOf('\n', returnLine) + 1;
  let qrLoginCheck = '    if (currentPath.startsWith("/p/")) return;\n';
  c = c.substring(0, afterReturn) + qrLoginCheck + c.substring(afterReturn);
  console.log('QR auto-login skip added');
}

// Ajouter le composant QrPhotoPage et le screen render
// D'abord le composant, avant FotoKashApp
let appIdx = c.indexOf('export default function FotoKashApp');
if (appIdx !== -1) {
  let qrComponent = `
function QrPhotoPage({ qrCode, onNavigate }) {
  var photoData = null;
  var loading = true;
  var error = null;
  var containerRef = null;

  function QrPhotoInner() {
    var ref = useState;
    var statePhoto = ref(null);
    var stateLoading = ref(true);
    var stateError = ref(null);

    useEffect(function() {
      fetch(API + "/photos/qr/" + qrCode)
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.photo) {
            statePhoto[1](d.photo);
          } else {
            stateError[1]("Photo introuvable.");
          }
          stateLoading[1](false);
        })
        .catch(function() { stateError[1]("Erreur de connexion."); stateLoading[1](false); });
    }, []);

    if (stateLoading[0]) {
      return React.createElement("div", { style: { minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted } }, "Chargement...");
    }

    if (stateError[0] || !statePhoto[0]) {
      return React.createElement("div", { style: { minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.textMuted, gap: 16 } },
        React.createElement("p", null, stateError[0] || "Photo introuvable."),
        React.createElement("button", { onClick: function() { onNavigate("landing"); }, style: { background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer" } }, "Retour")
      );
    }

    var photo = statePhoto[0];
    var downloadPhoto = function() {
      fetch(photo.watermarked_url || photo.thumbnail_url)
        .then(function(r) { return r.blob(); })
        .then(function(blob) {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "fotokash-" + photo.qr_code_id + ".jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    };

    return React.createElement("div", { style: { minHeight: "100vh", background: T.bg, padding: 24 } },
      React.createElement("header", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24 } },
        React.createElement("div", { style: { width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" } }, Icon.Camera(14)),
        React.createElement("span", { style: { fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 } }, "Foto", React.createElement("span", { style: { color: T.accent } }, "Kash"))
      ),
      React.createElement("div", { style: { maxWidth: 500, margin: "0 auto", textAlign: "center" } },
        React.createElement("h2", { style: { fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 8 } }, photo.event_name || "Photo FotoKash"),
        React.createElement("p", { style: { color: T.textMuted, fontSize: 13, marginBottom: 20 } }, "Code: " + photo.qr_code_id),
        React.createElement("div", { style: { borderRadius: 14, overflow: "hidden", marginBottom: 20 } },
          React.createElement("img", { src: photo.watermarked_url || photo.thumbnail_url, style: { width: "100%", display: "block" } })
        ),
        React.createElement("button", { onClick: downloadPhoto, style: { background: T.green, color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.font, width: "100%" } }, "Telecharger en HD")
      )
    );
  }

  return React.createElement(QrPhotoInner, null);
}

`;
  c = c.substring(0, appIdx) + qrComponent + c.substring(appIdx);
  console.log('QrPhotoPage component added');
}

// Ajouter le render du screen qr-photo
let adminScreen = c.indexOf('{screen === "admin"');
if (adminScreen !== -1) {
  let afterAdmin = c.indexOf('\n', adminScreen) + 1;
  let qrScreen = '      {screen === "qr-photo" && <QrPhotoPage qrCode={screenProps.qrCode} onNavigate={navigate} />}\n';
  c = c.substring(0, afterAdmin) + qrScreen + c.substring(afterAdmin);
  console.log('QR screen render added');
}

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
