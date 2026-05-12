// fix-ios-download.cjs
// Corrige le téléchargement des photos sur iPhone/Safari
// Usage: node fix-ios-download.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');
let changes = 0;

// ============================================================
// 1. Remplacer handleFreeDownload (galerie client, multi-photos)
// ============================================================
const OLD_FREE_DOWNLOAD = `const handleFreeDownload = async () => {
    try {
      const regRes = await fetch(API + "/photos/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_ids: selectedPhotos }),
      });
      const regData = await regRes.json();
      if (regRes.ok && regData.photos) {
        for (let i = 0; i < regData.photos.length; i++) {
          var p = regData.photos[i];
          try {
            var response = await fetch(p.original_url);
            var blob = await response.blob();
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "fotokash-" + p.id + ".jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Erreur telechargement:", err);
          }
        }
        alert("Telechargement termine !");`;

const NEW_FREE_DOWNLOAD = `const handleFreeDownload = async () => {
    // Detecter iOS (Safari ne supporte pas a.download)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    try {
      const regRes = await fetch(API + "/photos/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_ids: selectedPhotos }),
      });
      const regData = await regRes.json();
      if (regRes.ok && regData.photos) {
        if (isIOS) {
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
        } else {
          // Desktop/Android : download classique via blob
          for (let i = 0; i < regData.photos.length; i++) {
            var p = regData.photos[i];
            try {
              var response = await fetch(p.original_url);
              var blob = await response.blob();
              var url = window.URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = "fotokash-" + p.id + ".jpg";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error("Erreur telechargement:", err);
            }
          }
          alert("Telechargement termine !");
        }`;

if (code.includes(OLD_FREE_DOWNLOAD)) {
  code = code.replace(OLD_FREE_DOWNLOAD, NEW_FREE_DOWNLOAD);
  changes++;
  console.log('OK: handleFreeDownload() corrige pour iOS.');
} else {
  console.error('ERREUR: handleFreeDownload anchor non trouvee!');
}

// ============================================================
// 2. Remplacer downloadPhoto (page QR /p/:code, single photo)
// ============================================================
const OLD_DOWNLOAD_PHOTO = `var downloadPhoto = function() {
    if (!photo) return;
    fetch(photo.original_url || photo.watermarked_url)
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
  };`;

const NEW_DOWNLOAD_PHOTO = `var downloadPhoto = function() {
    if (!photo) return;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var photoUrl = photo.original_url || photo.watermarked_url;
    if (isIOS) {
      // iOS : ouvrir dans un nouvel onglet pour permettre "Ajouter aux photos"
      window.open(photoUrl, "_blank");
      alert("Appuyez longuement sur l\\u0027image puis \\"Ajouter aux photos\\" pour l\\u0027enregistrer dans votre galerie.");
    } else {
      // Desktop/Android : download via blob
      fetch(photoUrl)
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
    }
  };`;

if (code.includes(OLD_DOWNLOAD_PHOTO)) {
  code = code.replace(OLD_DOWNLOAD_PHOTO, NEW_DOWNLOAD_PHOTO);
  changes++;
  console.log('OK: downloadPhoto() corrige pour iOS.');
} else {
  console.error('ERREUR: downloadPhoto anchor non trouvee!');
}

// ============================================================
// 3. Modifier le texte du bouton pour indiquer iOS
// ============================================================
const OLD_DL_BTN = 'Telecharger en HD';
const NEW_DL_BTN = 'Telecharger en HD';
// On garde le meme texte, pas de changement necessaire ici

// ============================================================
// Ecrire le resultat
// ============================================================
fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE === (' + changes + ' corrections appliquees)');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
