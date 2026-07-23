import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";


export default function AccountTab({ token, user, onUserUpdate }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState({ text: "", color: T.textMuted });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formName, setFormName] = useState(user?.studio_name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [profileMsg, setProfileMsg] = useState({ text: "", color: T.textMuted });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pricingMode, setPricingMode] = useState(user?.default_pricing_mode || "degressive");
  const [pricingUnit, setPricingUnit] = useState(user?.default_unit_price || 200);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingMsg, setPricingMsg] = useState({ text: "", color: T.textMuted });

  const validate = () => {
    if (!currentPwd || !newPwd || !confirmPwd) { setMsg({ text: "Remplissez tous les champs.", color: T.red }); return false; }
    if (newPwd.length < 8) { setMsg({ text: "Le nouveau mot de passe doit faire au moins 8 caractères.", color: T.red }); return false; }
    if (newPwd !== confirmPwd) { setMsg({ text: "Les mots de passe ne correspondent pas.", color: T.red }); return false; }
    return true;
  };

  const handleChange = async () => {
    if (!validate()) return;
    setLoading(true);
    setMsg({ text: "Modification en cours...", color: T.textMuted });
    try {
      const res = await fetch(API + "/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "✓ Mot de passe modifié avec succès !", color: T.green });
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } else {
        setMsg({ text: data.error || "Erreur", color: T.red });
      }
    } catch {
      setMsg({ text: "Erreur de connexion.", color: T.red });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleChange(); };
  const eyeBtn = (show, setShow) => (
    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>
  );

  const pwdStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = pwdStrength(newPwd);

  useEffect(() => {
    var qs = "mode=" + pricingMode + (pricingMode !== "free" ? "&unit_price=" + pricingUnit : "");
    var t = setTimeout(function() {
      fetch(API + "/auth/pricing/preview?" + qs, { headers: { Authorization: "Bearer " + token } })
        .then(function(r) { return r.json(); })
        .then(function(d) { setPricingPreview(d); })
        .catch(function() {});
    }, 300);
    return function() { clearTimeout(t); };
  }, [pricingMode, pricingUnit, token]);

  const handleSavePricing = async () => {
    setSavingPricing(true);
    setPricingMsg({ text: "Enregistrement...", color: T.textMuted });
    try {
      const res = await fetch(API + "/auth/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          default_pricing_mode: pricingMode,
          default_unit_price: pricingMode === "free" ? null : pricingUnit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPricingMsg({ text: "✓ Tarification mise à jour !", color: T.green });
        if (onUserUpdate) onUserUpdate((prev) => ({ ...prev, ...data.user }));
      } else {
        setPricingMsg({ text: data.error || "Erreur", color: T.red });
      }
    } catch {
      setPricingMsg({ text: "Erreur de connexion.", color: T.red });
    } finally {
      setSavingPricing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      setProfileMsg({ text: "Nom et email requis.", color: T.red });
      return;
    }
    setSavingProfile(true);
    setProfileMsg({ text: "Enregistrement...", color: T.textMuted });
    try {
      const res = await fetch(API + "/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ studio_name: formName, email: formEmail, phone: formPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ text: "✓ Profil mis à jour !", color: T.green });
        if (onUserUpdate) onUserUpdate((prev) => ({ ...prev, ...data.user }));
      } else {
        setProfileMsg({ text: data.error || "Erreur", color: T.red });
      }
    } catch {
      setProfileMsg({ text: "Erreur de connexion.", color: T.red });
    } finally {
      setSavingProfile(false);
    }
  };

  const studioName = user?.studio_name || user?.name || "Photographe";
  const initials = studioName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const plan = user?.plan;

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Mon compte</h2>

      {/* Carte profil */}
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "22px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700 }}>
              {initials}
            </div>
            <div title="Bientôt disponible" style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: T.accent, border: "2px solid " + T.card, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "default", opacity: 0.85 }}>
              {Icon.Edit(11)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{studioName}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{user?.email || "—"} · {user?.phone || "—"}</div>
          </div>
        </div>
        {plan && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20,
            background: plan === "pro" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)",
            color: plan === "pro" ? T.gold : T.textDim,
            textTransform: "uppercase", letterSpacing: 1,
          }}>Plan {plan}</span>
        )}
      </div>

      {/* Tarification */}
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px 22px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Tarification de vos photos</h3>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>Ce reglage s'applique par defaut a vos nouveaux evenements. Vous pourrez le personnaliser pour un evenement precis.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { value: "free", label: "Gratuit", desc: "Vos invites telechargent sans payer" },
            { value: "degressive", label: "Degressif", desc: "Prix par palier, comme FotoKash" },
            { value: "fixed", label: "Prix fixe", desc: "Meme prix quel que soit le nombre" },
          ].map((opt) => (
            <button key={opt.value} type="button" onClick={() => setPricingMode(opt.value)} style={{
              textAlign: "left", padding: "14px 14px", borderRadius: T.radiusSm, cursor: "pointer",
              border: "1px solid " + (pricingMode === opt.value ? T.accent : T.border),
              background: pricingMode === opt.value ? "rgba(245,158,11,0.10)" : T.bg,
              fontFamily: T.font,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: pricingMode === opt.value ? T.accent : T.text, marginBottom: 3 }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {pricingMode !== "free" && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
              {pricingMode === "fixed" ? "Prix unitaire par photo (FCFA)" : "Prix de base (FCFA) — ajuste l'echelle des paliers"}
            </label>
            <input type="number" min={pricingPreview?.minBase || 100} step={25} value={pricingUnit}
              onChange={(e) => setPricingUnit(parseInt(e.target.value, 10) || 0)}
              style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div style={{ background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Apercu pour vos invites</div>
          {pricingPreview ? (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div><span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>{pricingPreview.price1}</span><span style={{ fontSize: 11, color: T.textMuted }}> FCFA · 1 photo</span></div>
              <div><span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>{pricingPreview.price3}</span><span style={{ fontSize: 11, color: T.textMuted }}> FCFA · 3 photos</span></div>
              <div><span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>{pricingPreview.price5}</span><span style={{ fontSize: 11, color: T.textMuted }}> FCFA · 5 photos et +</span></div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: T.textMuted }}>Calcul en cours...</div>
          )}
        </div>

        {pricingMsg.text && <p style={{ fontSize: 13, marginBottom: 16, color: pricingMsg.color, minHeight: 20 }}>{pricingMsg.text}</p>}
        <button onClick={handleSavePricing} disabled={savingPricing} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: savingPricing ? "not-allowed" : "pointer", opacity: savingPricing ? 0.7 : 1, fontFamily: T.font }}>
          {savingPricing ? "Enregistrement..." : "Enregistrer la tarification"}
        </button>
      </div>

      {/* Infos + mot de passe */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* Informations personnelles */}
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px 22px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Informations personnelles</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nom complet</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Email</label>
            <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Téléphone Mobile Money</label>
            <input type="tel" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+225 07 00 00 00 00" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          {profileMsg.text && <p style={{ fontSize: 13, marginBottom: 16, color: profileMsg.color, minHeight: 20 }}>{profileMsg.text}</p>}
          <button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: "100%", background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.7 : 1, fontFamily: T.font }}>
            {savingProfile ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        {/* Changer le mot de passe */}
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px 22px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Changer le mot de passe</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Mot de passe actuel</label>
            <div style={{ position: "relative" }}>
              <input type={showCurrent ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Votre mot de passe actuel" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {eyeBtn(showCurrent, setShowCurrent)}
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nouveau mot de passe</label>
            <div style={{ position: "relative" }}>
              <input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Minimum 8 caractères" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {eyeBtn(showNew, setShowNew)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < strength ? T.accent : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Retapez le nouveau mot de passe" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {eyeBtn(showConfirm, setShowConfirm)}
            </div>
          </div>
          {msg.text && <p style={{ fontSize: 13, marginBottom: 16, color: msg.color, minHeight: 20 }}>{msg.text}</p>}
          <button onClick={handleChange} disabled={loading} style={{ width: "100%", background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: T.font }}>
            {loading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </div>
      </div>
    </div>
  );
}
