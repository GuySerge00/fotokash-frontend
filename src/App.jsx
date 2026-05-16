import { useState, useEffect } from "react";
import { API, globalCSS } from "./utils/tokens";
import { screenToUrl, urlToScreenProps, getPageTitle } from "./utils/router";
import SEOHead from "./components/SEOHead";
import LandingPage from "./pages/LandingPage";
import AuthScreen from "./pages/AuthScreen";
import Dashboard from "./pages/Dashboard/Dashboard";
import ClientPage from "./pages/ClientPage";
import QrPhotoPage from "./pages/QrPhotoPage";
import AdminLayout from "./admin/AdminLayout";
import LiveEventPage from "./LiveEventPage";
import LegalPage from "./LegalPage";

export default function FotoKashApp() {
  const seoConfig = (() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (p.startsWith('/dashboard') || p.startsWith('/admin')) return { noindex: true };
    if (p.startsWith('/p/')) return { title: 'Telechargement Photo', noindex: true };
    if (p.startsWith('/live/')) return { title: 'Evenement en direct', noindex: true };
    if (p.startsWith('/e/')) return { title: 'Galerie Photos' };
    if (p === '/login') return { title: 'Connexion Photographe' };
    if (p === '/register') return { title: 'Inscription Photographe' };
    return {};
  })();

  const initState = urlToScreenProps(window.location.pathname);
  const [screen, setScreen] = useState(initState.screen);
  const [screenProps, setScreenProps] = useState(initState.props);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("fotokash_token"));
  const [platform, setPlatform] = useState({ name: "FotoKash", email: "contact@fotokash.com" });

  useEffect(function() {
    fetch(API + "/photos/platform").then(function(r) { return r.json(); }).then(function(d) { setPlatform(d); }).catch(function() {});
  }, []);

  // Auto-login if token exists (skip public pages)
  useEffect(() => {
    const pub = ["/e/", "/p/", "/live/"];
    if (pub.some(p => window.location.pathname.startsWith(p))) return;
    if (token && !user) {
      fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(d) {
          var u = d.user || d.photographer || d;
          setUser(u);
          const dest = u.role === "admin" ? "admin" : "dashboard";
          const destProps = dest === "admin" ? { page: "dashboard" } : { tab: "stats" };
          setScreen(dest);
          setScreenProps(destProps);
          const url = screenToUrl(dest, destProps);
          window.history.replaceState({ screen: dest, props: destProps }, "", url);
          document.title = getPageTitle(dest, destProps);
        })
        .catch(function() { localStorage.removeItem("fotokash_token"); setToken(null); });
    }
  }, [token]);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const { screen: s, props: p } = urlToScreenProps(window.location.pathname);
      setScreen(s);
      setScreenProps(p);
      document.title = getPageTitle(s, p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (s, props = {}) => {
    const url = screenToUrl(s, props);
    const title = getPageTitle(s, props);
    const isSamePath = window.location.pathname === url;
    if (!isSamePath) {
      window.history.pushState({ screen: s, props }, "", url);
    }
    document.title = title;
    setScreen(s);
    setScreenProps(props);
  };

  const handleAuth = (u, t) => {
    setUser(u); setToken(t);
    const dest = u.role === "admin" ? "admin" : "dashboard";
    const destProps = dest === "admin" ? { page: "dashboard" } : { tab: "stats" };
    navigate(dest, destProps);
  };

  const handleLogout = () => {
    localStorage.removeItem("fotokash_token");
    setUser(null); setToken(null);
    navigate("landing");
  };

  return (
    <>
      <SEOHead {...seoConfig} />
      <style>{globalCSS}</style>
      {screen === "landing" && <LandingPage onNavigate={navigate} platform={platform} />}
      {screen === "auth" && <AuthScreen mode={screenProps.mode} onNavigate={navigate} onAuth={handleAuth} />}
      {screen === "dashboard" && <Dashboard user={user} token={token} onNavigate={navigate} onLogout={handleLogout} initialTab={screenProps.tab} />}
      {(screen === "client" || screen === "client-demo") && <ClientPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "legal" && <LegalPage tab={screenProps.tab} onNavigate={navigate} />}
      {screen === "live" && <LiveEventPage slug={screenProps.slug} onNavigate={navigate} />}
      {screen === "admin" && <AdminLayout user={user} token={token} onNavigate={navigate} onLogout={handleLogout} initialPage={screenProps.page} />}
      {screen === "qr-photo" && <QrPhotoPage qrCode={screenProps.qrCode} onNavigate={navigate} />}
    </>
  );
}
