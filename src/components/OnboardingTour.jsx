import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { API } from '../utils/tokens';

const STEPS = [
  {
    target: '[data-tour="new-event"]',
    tab: 'events',
    title: "Créer ton premier événement",
    text: "Chaque mariage, baptême ou événement corporate que tu couvres devient un espace dédié. Donne-lui un nom, une date, et tu es prêt à uploader tes photos.",
  },
  {
    target: '[data-tour="upload-zone"]',
    tab: 'photos',
    title: "Ajoute tes photos à l'événement",
    text: "Une fois l'événement créé, dépose tes photos. Elles sont automatiquement protégées (pas de téléchargement direct) et prêtes à être vendues.",
  },
  {
    target: '[data-tour="qr-code"]',
    tab: 'live',
    title: "Partage l'accès à tes clients",
    text: "Chaque événement a un QR code unique. Tes clients le scannent, retrouvent leurs photos (grâce à la reconnaissance faciale) et peuvent les acheter directement.",
  },
  {
    target: '[data-tour="earnings-tab"]',
    tab: 'earnings',
    title: "Suis tes revenus en temps réel",
    text: "Chaque vente apparaît ici : montant brut, commission FotoKash, et solde disponible. Tu peux demander un retrait Mobile Money dès que ton solde le permet (frais de retrait : 2%).",
  },
  {
    target: '[data-tour="owner-pin-menu"]',
    tab: 'events',
    title: "Un code pour l'organisateur de l'événement",
    text: "Si l'organisateur veut télécharger toutes les photos sans payer (pack Business), donne-lui le PIN visible dans le menu ⋯ de l'événement.",
  },
];

function useTargetRect(selector, active, tab, onNeedTab) {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    if (!active) return;
    setRect(null);
    if (tab && onNeedTab) onNeedTab(tab);

    function measure() {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
    }

    const t = setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [selector, active, tab]);

  return rect;
}

export default function OnboardingTour({ isOpen, onComplete, onNeedTab }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const rect = useTargetRect(step?.target, isOpen, step?.tab, onNeedTab);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen) setStepIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const isLast = stepIndex === STEPS.length - 1;

  function next() {
    if (isLast) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function finish() {
    const token = localStorage.getItem('fotokash_token');
    fetch(API + '/earnings/onboarding-seen', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) console.error('onboarding-seen a échoué, code', res.status);
      })
      .catch((err) => console.error('onboarding-seen erreur réseau', err));
    onComplete();
  }

  const cardTop = rect
    ? rect.top + rect.height + 12 + window.scrollY > window.innerHeight - 220
      ? rect.top + window.scrollY - 12
      : rect.top + rect.height + window.scrollY + 12
    : window.innerHeight / 2;
  const cardTransform = rect && cardTop < rect.top + window.scrollY ? 'translateY(-100%)' : 'none';
  const cardLeft = rect
    ? Math.min(Math.max(rect.left, 16), window.innerWidth - 316)
    : window.innerWidth / 2 - 150;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Visite guidée">
      {rect && (
        <div
          style={{
            ...styles.spotlight,
            top: rect.top + window.scrollY - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      <div
        ref={cardRef}
        style={{
          ...styles.card,
          top: cardTop,
          left: cardLeft,
          transform: cardTransform,
        }}
      >
        <div style={styles.stepLabel}>Étape {stepIndex + 1} sur {STEPS.length}</div>
        <div style={styles.title}>{step.title}</div>
        <div style={styles.text}>{step.text}</div>

        <div style={styles.footer}>
          <div style={styles.dots}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.dot,
                  background: i === stepIndex ? '#2C2C2A' : '#D3D1C7',
                }}
              />
            ))}
          </div>
          <div style={styles.buttons}>
            <button style={styles.skipBtn} onClick={finish}>
              Passer
            </button>
            <button style={styles.nextBtn} onClick={next}>
              {isLast ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
  },
  spotlight: {
    position: 'absolute',
    borderRadius: 10,
    boxShadow: '0 0 0 4px rgba(55,138,221,0.35), 0 0 0 9999px rgba(0,0,0,0.45)',
    background: 'transparent',
    pointerEvents: 'none',
    transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
  },
  card: {
    position: 'absolute',
    width: 300,
    background: '#fff',
    borderRadius: 12,
    padding: '16px 18px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
    transition: 'top 0.25s ease, left 0.25s ease',
  },
  stepLabel: { fontSize: 13, color: '#888780', marginBottom: 6 },
  title: { fontSize: 15, fontWeight: 500, marginBottom: 6, color: '#2C2C2A' },
  text: { fontSize: 13, color: '#5F5E5A', lineHeight: 1.6, marginBottom: 14 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dots: { display: 'flex', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: '50%' },
  buttons: { display: 'flex', gap: 8 },
  skipBtn: {
    fontSize: 13,
    padding: '6px 10px',
    border: 'none',
    background: 'none',
    color: '#5F5E5A',
    cursor: 'pointer',
  },
  nextBtn: {
    fontSize: 13,
    padding: '6px 14px',
    background: '#2C2C2A',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
};
