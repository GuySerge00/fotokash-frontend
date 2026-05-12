// fix-compress-upload.cjs
// Injecte la compression côté client dans App.jsx
// Usage: node fix-compress-upload.cjs

const fs = require('fs');
const FILE = '/home/fotokash-frontend/src/App.jsx';

let code = fs.readFileSync(FILE, 'utf8');

// ============================================================
// 1. Ajouter la fonction compressImage() juste avant processFiles
// ============================================================
const PROCESS_FILES_ANCHOR = 'const processFiles = useCallback((newFiles) => {';

const COMPRESS_FUNCTION = `// ── Compression côté client (réduit taille avant envoi serveur) ──
  const compressImage = (file, maxWidth = 3000, quality = 0.85) => {
    return new Promise((resolve) => {
      // Si le fichier est petit (< 2Mo), pas besoin de compresser
      if (file.size < 2 * 1024 * 1024) {
        resolve(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Si l'image est déjà petite, garder telle quelle
        if (img.width <= maxWidth && img.height <= maxWidth && file.size < 5 * 1024 * 1024) {
          resolve(file);
          return;
        }
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxWidth) {
          if (w > h) { h = Math.round(h * maxWidth / w); w = maxWidth; }
          else { w = Math.round(w * maxWidth / h); h = maxWidth; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressed = new File([blob], file.name.replace(/\\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: file.lastModified,
              });
              console.log("Compressed: " + file.name + " " + (file.size / 1024 / 1024).toFixed(1) + "Mo -> " + (compressed.size / 1024 / 1024).toFixed(1) + "Mo");
              resolve(compressed);
            } else {
              resolve(file); // Original plus petit, garder tel quel
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file); // En cas d'erreur, envoyer l'original
      };
      img.src = url;
    });
  };

  `;

if (code.includes('const compressImage')) {
  console.log('compressImage deja presente, skip.');
} else if (code.includes(PROCESS_FILES_ANCHOR)) {
  code = code.replace(PROCESS_FILES_ANCHOR, COMPRESS_FUNCTION + PROCESS_FILES_ANCHOR);
  console.log('OK: compressImage() injectee.');
} else {
  console.error('ERREUR: Anchor processFiles introuvable!');
  process.exit(1);
}

// ============================================================
// 2. Modifier uploadBatch pour compresser les fichiers avant envoi
// ============================================================
const OLD_UPLOAD_BATCH = `const uploadBatch = async (pending) => {
    const eventId = selectedEvent;
    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    for (let i = 0; i < pending.length; i += 5) {
      const batch = pending.slice(i, i + 5);
      const formData = new FormData();
      formData.append("event_id", eventId);
      batch.forEach((f) => formData.append("photos", f.file));`;

const NEW_UPLOAD_BATCH = `const uploadBatch = async (pending) => {
    const eventId = selectedEvent;
    let doneCount = 0;
    setUploadProgress({ done: 0, total: pending.length });

    for (let i = 0; i < pending.length; i += 5) {
      const batch = pending.slice(i, i + 5);
      const formData = new FormData();
      formData.append("event_id", eventId);
      // Compression côté client avant envoi
      const compressedFiles = await Promise.all(batch.map((f) => compressImage(f.file)));
      compressedFiles.forEach((f) => formData.append("photos", f));`;

if (code.includes(OLD_UPLOAD_BATCH)) {
  code = code.replace(OLD_UPLOAD_BATCH, NEW_UPLOAD_BATCH);
  console.log('OK: uploadBatch() modifie avec compression.');
} else {
  console.error('ATTENTION: uploadBatch anchor non trouvee exactement, tentative flexible...');
  // Tentative flexible : chercher juste la ligne batch.forEach photos
  const OLD_BATCH_LINE = 'batch.forEach((f) => formData.append("photos", f.file));';
  const NEW_BATCH_LINES = `// Compression côté client avant envoi
      const compressedFiles = await Promise.all(batch.map((f) => compressImage(f.file)));
      compressedFiles.forEach((f) => formData.append("photos", f));`;
  
  if (code.includes(OLD_BATCH_LINE)) {
    // Remplacer seulement la première occurrence (dans uploadBatch)
    code = code.replace(OLD_BATCH_LINE, NEW_BATCH_LINES);
    console.log('OK: uploadBatch() modifie (methode flexible).');
  } else {
    console.error('ERREUR: Impossible de trouver uploadBatch!');
  }
}

// ============================================================
// 3. Modifier retryFile pour compresser aussi
// ============================================================
const OLD_RETRY = `formData.append("photos", fileItem.file);
    try {
      const res = await fetch(API + "/photos/upload", { method: "POST", headers: { Authorization: \`Bearer \${token}\` }, body: formData });`;

const NEW_RETRY = `const compressedRetry = await compressImage(fileItem.file);
    formData.append("photos", compressedRetry);
    try {
      const res = await fetch(API + "/photos/upload", { method: "POST", headers: { Authorization: \`Bearer \${token}\` }, body: formData });`;

if (code.includes(OLD_RETRY)) {
  code = code.replace(OLD_RETRY, NEW_RETRY);
  console.log('OK: retryFile() modifie avec compression.');
} else {
  console.error('ATTENTION: retryFile anchor non trouvee, skip.');
}

// ============================================================
// Écrire le résultat
// ============================================================
fs.writeFileSync(FILE, code, 'utf8');
console.log('');
console.log('=== DONE ===');
console.log('App.jsx mis a jour avec compression cote client.');
console.log('Prochaine etape: npm run build && systemctl restart nginx');
