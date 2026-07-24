const fs = require('fs');
const path = 'src/pages/Dashboard/EventsTab.jsx';
function replaceOnce(content, find, replace, label) {
  const parts = content.split(find);
  if (parts.length !== 2) throw new Error('Ancre "' + label + '" trouvee ' + (parts.length - 1) + ' fois. Abandon.');
  return parts.join(replace);
}
let src = fs.readFileSync(path, 'utf8');
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const bkdir = '/root/backups-fotokash/' + ts + '-frontend-eventstab-edit';
fs.mkdirSync(bkdir, { recursive: true });
fs.writeFileSync(bkdir + '/EventsTab.jsx', src);
console.log('Backup : ' + bkdir + '/EventsTab.jsx');

// --- 1. nouveaux etats pour l'edition (apres les etats pricing de creation) ---
src = replaceOnce(
  src,
  '  const [pricingPreview, setPricingPreview] = useState(null);',
  '  const [pricingPreview, setPricingPreview] = useState(null);\n' +
  '  const [editPricingId, setEditPricingId] = useState(null);\n' +
  '  const [editPricingMode, setEditPricingMode] = useState("default");\n' +
  '  const [editPricingUnit, setEditPricingUnit] = useState(200);\n' +
  '  const [editPricingPreview, setEditPricingPreview] = useState(null);\n' +
  '  const [savingEditPricing, setSavingEditPricing] = useState(false);',
  'etats edition pricing'
);

// --- 2. apercu live pour l'edition + handlers, avant createEvent ---
src = replaceOnce(
  src,
  '  const createEvent = async () => {',
  '  useEffect(() => {\n' +
  '    if (editPricingMode === "default" || editPricingMode === "free") { \n' +
  '      if (editPricingMode === "free") {\n' +
  '        fetch(API + "/auth/pricing/preview?mode=free", { headers: { Authorization: "Bearer " + token } })\n' +
  '          .then(r => r.json()).then(d => setEditPricingPreview(d)).catch(() => {});\n' +
  '      } else {\n' +
  '        setEditPricingPreview(null);\n' +
  '      }\n' +
  '      return;\n' +
  '    }\n' +
  '    var qs = "mode=" + editPricingMode + "&unit_price=" + editPricingUnit;\n' +
  '    var t = setTimeout(function() {\n' +
  '      fetch(API + "/auth/pricing/preview?" + qs, { headers: { Authorization: "Bearer " + token } })\n' +
  '        .then(r => r.json()).then(d => setEditPricingPreview(d)).catch(() => {});\n' +
  '    }, 300);\n' +
  '    return function() { clearTimeout(t); };\n' +
  '  }, [editPricingMode, editPricingUnit, token]);\n' +
  '\n' +
  '  const openPricingEdit = (e) => {\n' +
  '    setEditPricingId(e.id);\n' +
  '    setEditPricingMode(e.pricing_mode || "default");\n' +
  '    setEditPricingUnit(e.unit_price || 200);\n' +
  '    setMenuOpen(null);\n' +
  '  };\n' +
  '\n' +
  '  const saveEditPricing = async (e) => {\n' +
  '    setSavingEditPricing(true);\n' +
  '    try {\n' +
  '      const body = editPricingMode === "default"\n' +
  '        ? { clear_pricing_override: true }\n' +
  '        : { pricing_mode: editPricingMode, unit_price: editPricingMode === "free" ? null : editPricingUnit };\n' +
  '      const res = await fetch(API + "/events/" + e.id, {\n' +
  '        method: "PUT",\n' +
  '        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },\n' +
  '        body: JSON.stringify(body),\n' +
  '      });\n' +
  '      const data = await res.json();\n' +
  '      if (res.ok && data.event) {\n' +
  '        setEvents((prev) => prev.map((x) => x.id === e.id ? { ...x, pricing_mode: data.event.pricing_mode, unit_price: data.event.unit_price } : x));\n' +
  '        setEditPricingId(null);\n' +
  '      }\n' +
  '    } catch {}\n' +
  '    setSavingEditPricing(false);\n' +
  '  };\n' +
  '\n' +
  '  const createEvent = async () => {',
  'handlers edition pricing'
);

// --- 3. menu : ajouter l'entree "Modifier la tarification" apres "Voir la page" ---
src = replaceOnce(
  src,
  '                        { icon: Icon.ExternalLink(14), label: "Voir la page", action: () => { window.open("https://fotokash.com/e/" + e.slug, "_blank"); setMenuOpen(null); } },\n' +
  '                        { icon: Icon.Edit(14), label: "Renommer", action: () => startRename(e) },',
  '                        { icon: Icon.ExternalLink(14), label: "Voir la page", action: () => { window.open("https://fotokash.com/e/" + e.slug, "_blank"); setMenuOpen(null); } },\n' +
  '                        { icon: "💰", label: "Modifier la tarification", action: () => openPricingEdit(e) },\n' +
  '                        { icon: Icon.Edit(14), label: "Renommer", action: () => startRename(e) },',
  'menu item tarification'
);

// --- 4. panneau d'edition, insere juste apres la fermeture du header (avant Stats) ---
const uiAnchor =
  '              {/* Stats : photos / vendues / revenus */}';

const uiReplacement =
  '              {editPricingId === e.id && (\n' +
  '                <div style={{ background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: 16, marginBottom: 14 }} onClick={(ev) => ev.stopPropagation()}>\n' +
  '                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>Tarification de cet événement</div>\n' +
  '                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: editPricingMode !== "default" ? 12 : 0 }}>\n' +
  '                    {[\n' +
  '                      { value: "default", label: "Par défaut" },\n' +
  '                      { value: "free", label: "Gratuit" },\n' +
  '                      { value: "degressive", label: "Dégressif" },\n' +
  '                      { value: "fixed", label: "Prix fixe" },\n' +
  '                    ].map((opt) => (\n' +
  '                      <button key={opt.value} type="button" onClick={() => setEditPricingMode(opt.value)} style={{\n' +
  '                        padding: "10px 8px", borderRadius: T.radiusSm, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.font,\n' +
  '                        border: "1px solid " + (editPricingMode === opt.value ? T.accent : T.border),\n' +
  '                        background: editPricingMode === opt.value ? "rgba(245,158,11,0.10)" : T.cardAlt,\n' +
  '                        color: editPricingMode === opt.value ? T.accent : T.textMuted,\n' +
  '                      }}>{opt.label}</button>\n' +
  '                    ))}\n' +
  '                  </div>\n' +
  '\n' +
  '                  {editPricingMode !== "default" && editPricingMode !== "free" && (\n' +
  '                    <input type="number" min={editPricingPreview?.minBase || 100} step={25} value={editPricingUnit}\n' +
  '                      onChange={(ev) => setEditPricingUnit(parseInt(ev.target.value, 10) || 0)}\n' +
  '                      placeholder="Prix unitaire (FCFA)"\n' +
  '                      style={{ width: "100%", background: T.cardAlt, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />\n' +
  '                  )}\n' +
  '\n' +
  '                  {editPricingPreview && (\n' +
  '                    <div style={{ background: T.cardAlt, borderRadius: T.radiusSm, padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>\n' +
  '                      <span style={{ fontSize: 12, color: T.textMuted }}><strong style={{ color: T.accent }}>{editPricingPreview.price1}</strong> F · 1 photo</span>\n' +
  '                      <span style={{ fontSize: 12, color: T.textMuted }}><strong style={{ color: T.accent }}>{editPricingPreview.price3}</strong> F · 3 photos</span>\n' +
  '                      <span style={{ fontSize: 12, color: T.textMuted }}><strong style={{ color: T.accent }}>{editPricingPreview.price5}</strong> F · 5+ photos</span>\n' +
  '                    </div>\n' +
  '                  )}\n' +
  '\n' +
  '                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>\n' +
  '                    <Btn variant="ghost" onClick={() => setEditPricingId(null)}>Annuler</Btn>\n' +
  '                    <Btn onClick={() => saveEditPricing(e)} disabled={savingEditPricing}>{savingEditPricing ? "Enregistrement..." : "Enregistrer"}</Btn>\n' +
  '                  </div>\n' +
  '                </div>\n' +
  '              )}\n' +
  '\n' +
  '              {/* Stats : photos / vendues / revenus */}';

src = replaceOnce(src, uiAnchor, uiReplacement, 'panneau edition tarification');

fs.writeFileSync(path, src);
console.log('EventsTab.jsx patche : edition de la tarification post-creation ajoutee.');
