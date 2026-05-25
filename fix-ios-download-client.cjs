const fs = require('fs');
const path = '/home/fotokash-frontend/src/pages/ClientPage.jsx';
let c = fs.readFileSync(path, 'utf8');

const oldIOS = `if (isIOS) {
          // iOS : ouvrir chaque photo dans un nouvel onglet
          // L'utilisateur fait appui long > "Ajouter aux photos"
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            window.open(p.original_url, "_blank");
            // Petit delai entre chaque ouverture pour eviter le blocage popup
            if (i < regData.photos.length - 1) {
              await new Promise(function(r) { setTimeout(r, 600); });
            }
          }
          alert("Photos ouvertes ! Appuyez longuement sur chaque image puis \\"Ajouter aux photos\\" pour les enregistrer dans votre galerie.");
        } else {`;

const newIOS = `if (isIOS) {
          // iOS : telecharger via blob + navigator.share ou fallback blob URL
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            try {
              var response = await fetch(p.original_url);
              var blob = await response.blob();
              var file = new File([blob], "fotokash-" + p.id + ".jpg", { type: "image/jpeg" });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "FotoKash Photo" });
              } else {
                // Fallback : ouvrir le blob (pas l'URL Cloudinary) dans un nouvel onglet
                var blobUrl = window.URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
                alert("Appuyez longuement sur l'image puis \\"Enregistrer l'image\\" pour la sauvegarder.");
              }
            } catch (err) {
              console.error("Erreur telechargement iOS:", err);
              window.open(p.original_url, "_blank");
            }
            if (i < regData.photos.length - 1) {
              await new Promise(function(r) { setTimeout(r, 800); });
            }
          }
        } else {`;

if (c.includes(oldIOS)) {
  c = c.replace(oldIOS, newIOS);
  fs.writeFileSync(path, c, 'utf8');
  console.log('OK - ClientPage.jsx iOS download fixed');
} else {
  console.log('ERREUR - Bloc iOS non trouve dans ClientPage.jsx');
  // Chercher un bout pour debug
  const idx = c.indexOf('isIOS');
  if (idx > -1) console.log('isIOS trouve a position:', idx, c.substring(idx, idx+200));
}
