import { T } from "../utils/tokens";

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    <input
      {...props}
      style={{
        width: "100%", background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm, padding: "12px 16px", color: T.text,
        fontSize: 14, outline: "none", transition: "border-color 0.2s",
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = T.accent; props.onFocus?.(e); }}
      onBlur={(e) => { e.target.style.borderColor = T.border; props.onBlur?.(e); }}
    />
  </div>
);
