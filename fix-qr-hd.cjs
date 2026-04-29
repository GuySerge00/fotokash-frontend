const fs = require('fs');
const path = '/home/fotokash-frontend/src/App.jsx';
let c = fs.readFileSync(path, 'utf8');
let lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  // Dans QrPhotoPage, remplacer watermarked_url par original_url pour le téléchargement
  if (lines[i].includes('fetch(photo.watermarked_url') && lines[i].includes('thumbnail_url')) {
    // Vérifier qu'on est dans QrPhotoPage (pas ClientPage)
    // Chercher en remontant si on est dans downloadPhoto
    let inQr = false;
    for (let j = i; j > i - 10; j--) {
      if (lines[j] && lines[j].includes('downloadPhoto')) {
        inQr = true;
        break;
      }
    }
    if (inQr) {
      console.log('Line', i + 1, 'BEFORE:', lines[i].trim());
      lines[i] = lines[i].replace('photo.watermarked_url || photo.thumbnail_url', 'photo.original_url || photo.watermarked_url');
      console.log('Line', i + 1, 'AFTER:', lines[i].trim());
    }
  }
  
  // Aussi dans l'affichage de l'image, garder watermarked_url (pour la preview)
  // Mais pour le src de l'img dans QrPhotoPage, c'est OK de garder watermarked
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Done');
