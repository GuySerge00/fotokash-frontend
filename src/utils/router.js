export const TITLES = {
  landing: "FotoKash - Plateforme photo événementielle",
  login: "Connexion - FotoKash",
  signup: "Inscription - FotoKash",
  dashboard: "Dashboard - FotoKash",
  "dashboard/stats": "Statistiques - FotoKash",
  "dashboard/events": "Événements - FotoKash",
  "dashboard/photos": "Photos - FotoKash",
  "dashboard/live": "Live - FotoKash",
  "dashboard/earnings": "Revenus - FotoKash",
  "dashboard/account": "Mon compte - FotoKash",
  legal: "Mentions légales - FotoKash",
  faq: "FAQ — Questions fréquentes · FotoKash",
  howto: "Comment ça marche — FotoKash",
  admin: "Admin - FotoKash",
  "admin/dashboard": "Dashboard Admin - FotoKash",
  "admin/photographers": "Photographes - FotoKash Admin",
  "admin/subscriptions": "Abonnements - FotoKash Admin",
  "admin/logs": "Logs - FotoKash Admin",
  "admin/settings": "Paramètres - FotoKash Admin",
};

export function screenToUrl(s, props = {}) {
  if (s === "landing") return "/";
  if (s === "auth") return props.mode === "signup" ? "/signup" : "/login";
  if (s === "dashboard") {
    const t = props.tab;
    return t && t !== "stats" ? "/dashboard/" + t : "/dashboard";
  }
  if (s === "client" || s === "client-demo") return "/e/" + (props.slug || "");
  if (s === "live") return "/live/" + (props.slug || "");
  if (s === "legal") return "/legal";
  if (s === "faq") return "/faq";
  if (s === "howto") return "/comment-ca-marche";
  if (s === "admin") {
    const p = props.page;
    return p && p !== "dashboard" ? "/admin/" + p : "/admin";
  }
  if (s === "qr-photo") return "/p/" + (props.qrCode || "");
  return "/";
}

export function urlToScreenProps(path) {
  if (path === "/" || path === "") return { screen: "landing", props: {} };
  if (path === "/login") return { screen: "auth", props: { mode: "login" } };
  if (path === "/signup") return { screen: "auth", props: { mode: "signup" } };
  if (path.startsWith("/dashboard")) {
    const tab = path.replace("/dashboard", "").replace("/", "") || "stats";
    return { screen: "dashboard", props: { tab } };
  }
  if (path.startsWith("/e/")) return { screen: "client", props: { slug: path.replace("/e/", "") } };
  if (path.startsWith("/live/")) return { screen: "live", props: { slug: path.replace("/live/", "") } };
  if (path.startsWith("/p/")) return { screen: "qr-photo", props: { qrCode: path.replace("/p/", "") } };
  if (path === "/legal") return { screen: "legal", props: {} };
  if (path === "/faq") return { screen: "faq", props: {} };
  if (path === "/comment-ca-marche") return { screen: "howto", props: {} };
  if (path === "/admin" || path.startsWith("/admin/")) {
    const page = path.replace("/admin", "").replace("/", "") || "dashboard";
    return { screen: "admin", props: { page } };
  }
  return { screen: "landing", props: {} };
}

export function getPageTitle(s, props = {}) {
  if (s === "auth") return props.mode === "signup" ? TITLES.signup : TITLES.login;
  if (s === "dashboard" && props.tab) return TITLES["dashboard/" + props.tab] || TITLES.dashboard;
  if (s === "admin" && props.page) return TITLES["admin/" + props.page] || TITLES.admin;
  return TITLES[s] || "FotoKash";
}
