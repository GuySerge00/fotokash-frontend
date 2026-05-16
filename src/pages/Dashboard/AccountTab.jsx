import { useState } from "react";
import { T, API } from "../../utils/tokens";


export default function AccountTab({ token }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState({ text: "", color: T.textMuted });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 24, fontWeight: 700 }}>Mon compte</h2>
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "28px 24px", maxWidth: 450 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Changer le mot de passe</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Mot de passe actuel</label>
          <div style={{ position: "relative" }}>
            <input type={showCurrent ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Votre mot de passe actuel" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showCurrent, setShowCurrent)}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Nouveau mot de passe</label>
          <div style={{ position: "relative" }}>
            <input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Minimum 8 caractères" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showNew, setShowNew)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Confirmer le nouveau mot de passe</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} onKeyDown={onKeyDown} placeholder="Retapez le nouveau mot de passe" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 44px 12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {eyeBtn(showConfirm, setShowConfirm)}
          </div>
        </div>
        {msg.text && <p style={{ fontSize: 13, marginBottom: 16, color: msg.color, minHeight: 20 }}>{msg.text}</p>}
        <button onClick={handleChange} disabled={loading} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: T.radiusSm, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: T.font }}>
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </div>
    </div>
  );
}


