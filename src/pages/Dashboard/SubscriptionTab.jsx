import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import PaymentStatusModal from "../../components/PaymentStatusModal";

const planOrder = ["free", "pro", "business"];
const planFeatureLabels = {
  qr_code: "Codes QR",
  face_search: "Recherche faciale",
  advanced_stats: "Statistiques avancées",
  priority_support: "Support prioritaire",
};

export default function SubscriptionTab({ token, user, onUserUpdate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const [phone, setPhone] = useState(user?.phone || "");
  const [method, setMethod] = useState("orange");
  const [initiating, setInitiating] = useState(false);
  const [initError, setInitError] = useState("");
  const [activePayment, setActivePayment] = useState(null);

  useEffect(() => {
    fetch(API + "/subscriptions/plans", { headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.plans || []).slice().sort((a, b) => planOrder.indexOf(a.id) - planOrder.indexOf(b.id));
        setPlans(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const currentPlan = user?.plan || "free";
  const expiresAt = user?.plan_expires_at ? new Date(user.plan_expires_at) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const startPayment = (plan) => {
    setPayingPlan(plan);
    setInitError("");
  };

  const confirmPayment = async () => {
    if (!phone.trim()) { setInitError("Numéro Mobile Money requis."); return; }
    setInitiating(true);
    setInitError("");
    try {
      const res = await fetch(API + "/subscriptions/upgrade/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ plan_id: payingPlan.id, payment_method: method, phone_number: phone }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.payment_url) window.open(data.payment_url, "_blank");
        setActivePayment({ id: data.payment_id, amount: data.amount });
        setPayingPlan(null);
      } else {
        setInitError(data.error || "Erreur lors de l'initiation du paiement.");
      }
    } catch {
      setInitError("Erreur de connexion.");
    } finally {
      setInitiating(false);
    }
  };

  const handlePaymentSuccess = () => {
    fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then((r) => r.json())
      .then((d) => { if (d.user && onUserUpdate) onUserUpdate((prev) => ({ ...prev, ...d.user })); })
      .catch(() => {});
  };

  const planColors = { free: T.textMuted, pro: T.accent, business: T.gold || T.accent };
  const planLabels = { free: "Free", pro: "Pro", business: "Business" };

  return (
    <div>
      <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Abonnement</h2>

      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Plan actuel</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, color: planColors[currentPlan] }}>{planLabels[currentPlan] || currentPlan}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {expiresAt ? (
              <>
                <div style={{ fontSize: 12, color: T.textMuted }}>Expire le</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: daysLeft <= 5 ? T.red : T.text }}>{expiresAt.toLocaleDateString("fr-FR")}</div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: T.textMuted }}>Pas d'expiration</div>
            )}
          </div>
        </div>
        {expiresAt && daysLeft <= 5 && (
          <div style={{ marginTop: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: T.radiusSm, padding: "10px 14px", fontSize: 13, color: T.red }}>
            ⚠ Votre plan expire dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}. Renouvelez pour ne pas repasser en Free.
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: T.textMuted, fontSize: 13 }}>Chargement des plans...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isFree = parseFloat(plan.price) <= 0;
            return (
              <div key={plan.id} style={{
                background: T.card, borderRadius: T.radius, padding: "22px 20px",
                border: "1px solid " + (isCurrent ? T.accent : T.border),
                position: "relative",
              }}>
                {isCurrent && (
                  <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: T.accent }}>ACTUEL</span>
                )}
                <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{planLabels[plan.id] || plan.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>
                  {isFree ? "Gratuit" : new Intl.NumberFormat("fr-FR").format(plan.price) + " F"}
                  {!isFree && <span style={{ fontSize: 12, fontWeight: 400, color: T.textMuted }}> / mois</span>}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Commission {plan.commission_rate}%</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <li style={{ fontSize: 12, color: T.textMuted }}>{plan.photo_limit} photos / événement</li>
                  {plan.event_limit && <li style={{ fontSize: 12, color: T.textMuted }}>{plan.event_limit} événements max</li>}
                  {plan.features && Object.entries(plan.features).filter(([, v]) => v).map(([k]) => (
                    <li key={k} style={{ fontSize: 12, color: T.textMuted }}>✓ {planFeatureLabels[k] || k}</li>
                  ))}
                </ul>
                {isFree ? (
                  <div style={{ fontSize: 12, color: T.textDim, textAlign: "center" }}>—</div>
                ) : isCurrent ? (
                  <button onClick={() => startPayment(plan)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "10px 0", color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Renouveler</button>
                ) : (
                  <button onClick={() => startPayment(plan)} style={{ width: "100%", background: T.accent, border: "none", borderRadius: T.radiusSm, padding: "10px 0", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Passer à ce plan</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {payingPlan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setPayingPlan(null)}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: T.card, borderRadius: T.radius, padding: "28px 24px", maxWidth: 360, width: "100%", border: "1px solid " + T.border }}>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Paiement — {planLabels[payingPlan.id]}</h3>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.accent, marginBottom: 16 }}>{new Intl.NumberFormat("fr-FR").format(payingPlan.price)} F</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Opérateur</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {["orange", "mtn", "wave"].map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)} style={{
                    padding: "8px 0", borderRadius: T.radiusSm, cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", fontFamily: T.font,
                    border: "1px solid " + (method === m ? T.accent : T.border),
                    background: method === m ? "rgba(245,158,11,0.10)" : T.bg,
                    color: method === m ? T.accent : T.textMuted,
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Numéro Mobile Money</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00 00" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "12px 16px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            {initError && <p style={{ fontSize: 13, color: T.red, marginBottom: 12 }}>{initError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setPayingPlan(null)} style={{ background: "transparent", border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "10px 18px", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>Annuler</button>
              <button onClick={confirmPayment} disabled={initiating} style={{ background: T.accent, border: "none", borderRadius: T.radiusSm, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: initiating ? "not-allowed" : "pointer", opacity: initiating ? 0.7 : 1, fontFamily: T.font }}>
                {initiating ? "..." : "Payer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activePayment && (
        <PaymentStatusModal
          transactionId={activePayment.id}
          amount={activePayment.amount}
          statusUrl={API + "/subscriptions/upgrade/" + activePayment.id + "/status"}
          dataKey="payment"
          onSuccess={handlePaymentSuccess}
          onCancel={() => { setActivePayment(null); handlePaymentSuccess(); }}
        />
      )}
    </div>
  );
}
