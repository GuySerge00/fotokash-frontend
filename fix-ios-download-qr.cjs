const fs = require('fs');
const path = '/home/fotokash-frontend/src/pages/QrPhotoPage.jsx';
let c = fs.readFileSync(path, 'utf8');

const oldQR = `if (isIOS) {
      // iOS : ouvrir dans un nouvel onglet pour permettre "Ajouter aux photos"
      window.open(photoUrl, "_blank");
      alert("Appuyez longuement sur l\\u0027image puis \\"Ajouter aux photos\\" pour l\\u0027enregistrer dans votre galerie.");
    } else {`;

const newQR = `if (isIOS) {
      // iOS : telecharger via blob + navigator.share
      try {
        var resp = fetch(photoUrl).then(function(r) { return r.blob(); });
        resp.then(function(blob) {
          var file = new File([blob], "fotokash-" + (photo.qr_code_id || "photo") + ".jpg", { type: "image/jpeg" });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: "FotoKash Photo" });
          } else {
            var blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank");
            alert("Appuyez longuement sur l'image puis \\"Enregistrer l'image\\" pour la sauvegarder.");
          }
        });
      } catch (err) {
        window.open(photoUrl, "_blank");
      }
    } else {`;

if (c.includes(oldQR)) {
  c = c.replace(oldQR, newQR);
  fs.writeFileSync(path, c, 'utf8');
  console.log('OK - QrPhotoPage.jsx iOS download fixed');
} else {
  console.log('ERREUR - Bloc iOS non trouve');
  // Essayer sans unicode escape
  const alt = 'window.open(photoUrl, "_blank")';
  const idx = c.indexOf(alt);
  if (idx > -1) console.log('window.open trouve a:', idx, c.substring(idx-100, idx+200));
}
