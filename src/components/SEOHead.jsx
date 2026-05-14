import { useEffect } from 'react';

const SITE_URL = 'https://fotokash.com';
const DEFAULT_TITLE = 'FotoKash - Achetez vos photos par reconnaissance faciale';
const DEFAULT_DESC = 'Plateforme de vente de photos evenementielles. Retrouvez vos photos par reconnaissance faciale et payez via Mobile Money.';

export default function SEOHead({ title, description, path, noindex = false }) {
  useEffect(() => {
    const pageTitle = title ? title + ' | FotoKash' : DEFAULT_TITLE;
    const pageDesc = description || DEFAULT_DESC;
    const rawPath = path || window.location.pathname;
    const cleanPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
    const canonicalUrl = SITE_URL + cleanPath;

    document.title = pageTitle;

    function setMeta(attr, val, content) {
      let el = document.querySelector('meta[' + attr + '="' + val + '"]');
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    }

    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
    canon.setAttribute('href', canonicalUrl);

    setMeta('name', 'description', pageDesc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDesc);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'FotoKash');
  }, [title, description, path, noindex]);

  return null;
}