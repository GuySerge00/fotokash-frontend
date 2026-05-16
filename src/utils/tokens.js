export const API = import.meta.env.VITE_API_URL || "/api";

export const T = {
  accent: "#E8593C",
  accentDim: "rgba(232,89,60,0.12)",
  accentGlow: "rgba(232,89,60,0.25)",
  bg: "#0B0B0F",
  card: "#141419",
  cardAlt: "#1A1A22",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#F0F0F5",
  textMuted: "#8888A0",
  textDim: "#555568",
  green: "#4ADE80",
  red: "#EF4444",
  gold: "#FFB826",
  radius: 14,
  radiusSm: 10,
  font: "'DM Sans', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0B0B0F; color: #F0F0F5; font-family: 'DM Sans', system-ui, sans-serif; }
  ::selection { background: #E8593C; color: white; }
  input, select, textarea { font-family: 'DM Sans', system-ui, sans-serif; }
  @media (max-width: 768px) {
    .landing-nav { padding: 12px 14px !important; }
    .landing-nav button { padding: 8px 14px !important; font-size: 12px !important; }
    .desktop-tab-bar { display: none !important; }
    .mobile-logout-btn { display: flex !important; }
    .desktop-header-extras { display: none !important; }
    .dashboard-content { padding: 16px !important; padding-bottom: 90px !important; }
    .header-main { padding: 12px 16px !important; }
  }
  @media (min-width: 769px) {
    .mobile-bottom-nav { display: none !important; }
    .mobile-logout-btn { display: none !important; }
  }
`;
