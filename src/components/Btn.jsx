import { T } from "../utils/tokens";

export const Btn = ({ children, onClick, variant = "primary", disabled, style, ...rest }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 24px", borderRadius: T.radiusSm, fontSize: 14, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer", border: "none",
    transition: "all 0.2s", fontFamily: T.font, letterSpacing: "0.01em",
    opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary: { background: T.accent, color: "#fff" },
    ghost: { background: "transparent", color: T.textMuted, border: `1px solid ${T.border}` },
    dark: { background: T.cardAlt, color: T.text },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }} {...rest}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</span></button>;
};
