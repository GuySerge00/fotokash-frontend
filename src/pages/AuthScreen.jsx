import { useState } from "react";
import { T, API } from "../utils/tokens";
import { Icon } from "../utils/icons";
import { Btn } from "../components/Btn";


export default function AuthScreen({ mode: initialMode, onNavigate, onAuth }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Nom du studio requis";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = "Email invalide";
    if (!form.password || form.password.length < 8) errs.password = "Minimum 8 caractères";
    if (mode === "signup" && form.password !== form.confirm) errs.confirm = "Les mots de passe ne correspondent pas";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { studio_name: form.name, email: form.email, phone: form.phone, password: form.password };

      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      if (data.pending) {
        setError("");
        alert(data.message);
        setMode("login");
        return;
      }
      localStorage.setItem("fotokash_token", data.token);
      onAuth(data.user || data.photographer, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const inputBase = {
    width: "100%", padding: "11px 14px", borderRadius: T.radiusSm,
    border: "1px solid " + T.border, background: T.bg, color: T.text,
    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: T.font,
    transition: "border-color 0.2s",
  };

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {show
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      }
    </svg>
  );

  const FieldError = ({ msg }) => msg ? (
    <div style={{ color: T.red, fontSize: 11, marginTop: 5, marginBottom: 4 }}>{msg}</div>
  ) : null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center",
           padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
           position: "sticky", top: 0, zIndex: 50,
           background: T.bg || "#0f0f12", backdropFilter: "blur(8px)" }}>
        <div onClick={() => onNavigate("landing")}
             style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent,
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {Icon.Camera(20)}
          </div>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Foto<span style={{ color: T.accent }}>Kash</span>
          </span>
        </div>
      </div>
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.accentDim} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400, animation: "fadeUp 0.4s ease" }}>
        {/* Tagline */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ color: T.textMuted, fontSize: 13 }}>
            La plateforme des photographes événementiels
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`,
          padding: "32px 28px",
        }}>
          {/* Toggle tabs */}
          <div style={{
            display: "flex", background: T.bg, borderRadius: T.radiusSm,
            padding: 3, marginBottom: 28,
          }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setFieldErrors({}); }} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                background: mode === m ? T.cardAlt : "transparent",
                color: mode === m ? T.text : T.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", fontFamily: T.font,
              }}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Champs inscription */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
                  Nom du studio <span style={{ color: T.red }}>*</span>
                </label>
                <input
                  style={{ ...inputBase, borderColor: fieldErrors.name ? T.red : T.border }}
                  placeholder="Ex: Studio Lumière CI"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors(p => ({ ...p, name: "" })); }}
                  onKeyDown={handleKeyDown}
                />
                <FieldError msg={fieldErrors.name} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>Téléphone</label>
                <input
                  style={inputBase}
                  placeholder="+225 07 XX XX XX XX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
              Email <span style={{ color: T.red }}>*</span>
            </label>
            <input
              type="email"
              style={{ ...inputBase, borderColor: fieldErrors.email ? T.red : T.border }}
              placeholder="vous@email.com"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }}
              onKeyDown={handleKeyDown}
            />
            <FieldError msg={fieldErrors.email} />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
                Mot de passe <span style={{ color: T.red }}>*</span>
              </label>
              {mode === "login" && (
                <span style={{ fontSize: 11, color: T.accent, cursor: "pointer" }}
                  onClick={() => alert("Contactez-nous sur WhatsApp pour réinitialiser votre mot de passe.")}>
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{ ...inputBase, paddingRight: 42, borderColor: fieldErrors.password ? T.red : T.border }}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors(p => ({ ...p, password: "" })); }}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, display: "flex" }}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <FieldError msg={fieldErrors.password} />
            {mode === "signup" && form.password.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => {
                  const strength = form.password.length >= 12 ? 4 : form.password.length >= 10 ? 3 : form.password.length >= 8 ? 2 : 1;
                  const colors = ["", T.red, "#F59E0B", "#3B82F6", T.green];
                  return <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? colors[strength] : T.border, transition: "background 0.3s" }} />;
                })}
                <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 6 }}>
                  {form.password.length < 8 ? "Trop court" : form.password.length < 10 ? "Correct" : form.password.length < 12 ? "Bien" : "Fort"}
                </span>
              </div>
            )}
          </div>

          {/* Confirmer mot de passe (signup only) */}
          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>
                Confirmer le mot de passe <span style={{ color: T.red }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  style={{ ...inputBase, paddingRight: 42, borderColor: fieldErrors.confirm ? T.red : form.confirm && form.confirm === form.password ? T.green : T.border }}
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setFieldErrors(p => ({ ...p, confirm: "" })); }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, display: "flex" }}
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              <FieldError msg={fieldErrors.confirm} />
              {form.confirm && form.confirm === form.password && (
                <div style={{ color: T.green, fontSize: 11, marginTop: 5, marginBottom: 4 }}>✓ Les mots de passe correspondent</div>
              )}
            </div>
          )}

          {/* Erreur globale */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", color: T.red, padding: "10px 14px",
              borderRadius: 8, fontSize: 13, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {Icon.AlertCircle(14)} {error}
            </div>
          )}

          {/* Bouton submit */}
          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "13px 0" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                {mode === "login" ? "Connexion..." : "Création..."}
              </span>
            ) : (
              mode === "login" ? "Se connecter" : "Créer mon compte"
            )}
          </Btn>
        </div>
      </div>
    </div>
    </>
  );
}


