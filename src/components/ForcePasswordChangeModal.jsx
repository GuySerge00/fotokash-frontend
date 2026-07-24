import { useState } from "react";
import { T, API } from "../utils/tokens";

export default function ForcePasswordChangeModal({ token, onSuccess }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [msg, setMsg] = useState({ text: "", color: T.textMuted });
  const [loading, setLoading] = useState(false);

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
        onSuccess();
      } else {
        setMsg({ text: data.error || "Erreur", color: T.red });
        setLoading(false);
      }
    } catch {
      setMsg({ text: "Erreur de connexion.", color: T.red });
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleChange(); };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: T.bg, color: T.text,
    fontSize: 14, fontFamily: T.font, marginBottom: 12, boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: T.card, borderRadius: 16, padding: 28,
        maxWidth: 400, width: "100%", border: `1px solid ${T.border}`,
      }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, marginBottom: 6, color: T.text }}>
          Changement de mot de passe requis
        </h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          Pour la sécurité de votre compte, vous devez définir un nouveau mot de passe avant de continuer.
        </p>

        <input type="password" placeholder="Mot de passe actuel" value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)} onKeyDown={onKeyDown} style={inputStyle} />
        <input type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)} onKeyDown={onKeyDown} style={inputStyle} />
        <input type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)} onKeyDown={onKeyDown} style={inputStyle} />

        {msg.text && <p style={{ fontSize: 12, color: msg.color, marginBottom: 12 }}>{msg.text}</p>}

        <button onClick={handleChange} disabled={loading} style={{
          width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
          background: T.accent, color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "..." : "Confirmer"}
        </button>
      </div>
    </div>
  );
}
