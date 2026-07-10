import { useState, useRef, useCallback, useEffect } from 'react';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function PaymentStatusModal({ transactionId, amount, onSuccess, onError, onCancel }) {
  const [status, setStatus] = useState('waiting'); // waiting | completed | failed | timeout
  const [message, setMessage] = useState("En attente de confirmation du paiement...");

  const pollTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();

    pollTimerRef.current = setInterval(async () => {
      if (Date.now() - startTimeRef.current > POLL_TIMEOUT_MS) {
        stopPolling();
        setStatus('timeout');
        setMessage("Le paiement prend plus de temps que prevu. Verifiez votre historique de transactions dans quelques minutes.");
        return;
      }
      try {
        const res = await fetch('/api/payments/' + transactionId + '/status');
        if (!res.ok) return;
        const data = await res.json();
        const tx = data.transaction;

        if (tx.status === 'completed') {
          stopPolling();
          setStatus('completed');
          setMessage('Paiement confirme !');
          if (onSuccess) onSuccess(tx);
          closeTimerRef.current = setTimeout(() => {
            if (onCancel) onCancel();
          }, 3000);
        } else if (tx.status === 'failed') {
          stopPolling();
          setStatus('failed');
          setMessage('Le paiement a echoue ou a ete annule.');
          if (onError) onError(tx);
        }
      } catch (e) {
        // erreur reseau ponctuelle, on reessaie au prochain tick
      }
    }, POLL_INTERVAL_MS);

    return () => stopPolling();
  }, [transactionId, stopPolling, onSuccess, onError]);

  return (
    <div style={styles.overlay}>
      <style>{`@keyframes fk-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.modal}>
        {status === 'waiting' && (
          <>
            <div style={styles.spinner} />
            <p style={styles.text}>{message}</p>
            {amount != null && <p style={styles.amount}>{amount} FCFA</p>}
            <p style={styles.hint}>
              Une fenetre de paiement s'est ouverte. Si elle ne s'affiche pas, verifiez que les popups sont autorisees pour ce site.
            </p>
            <button style={styles.secondaryButton} onClick={onCancel}>Annuler</button>
          </>
        )}

        {status === 'completed' && (
          <>
            <p style={styles.successIcon}>✓</p>
            <p style={styles.text}>{message}</p>
            <button style={styles.secondaryButton} onClick={onCancel}>Fermer</button>
          </>
        )}

        {(status === 'failed' || status === 'timeout') && (
          <>
            <p style={styles.errorIcon}>✕</p>
            <p style={styles.text}>{message}</p>
            <button style={styles.secondaryButton} onClick={onCancel}>Fermer</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: 32, maxWidth: 380, width: '90%',
    textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  text: { margin: '0 0 16px', color: '#333', fontSize: 14, lineHeight: 1.5 },
  amount: { fontSize: 20, fontWeight: 700, margin: '0 0 16px', color: '#E8593C' },
  hint: { fontSize: 12, color: '#888', margin: '0 0 16px' },
  secondaryButton: {
    display: 'block', width: '100%', padding: '10px 20px', background: 'transparent',
    color: '#666', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer',
  },
  spinner: {
    width: 36, height: 36, margin: '0 auto 16px', border: '3px solid #eee',
    borderTopColor: '#e11d48', borderRadius: '50%', animation: 'fk-spin 0.8s linear infinite',
  },
  successIcon: { fontSize: 40, color: '#16a34a', margin: '0 0 12px' },
  errorIcon: { fontSize: 40, color: '#dc2626', margin: '0 0 12px' },
};
