import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F";
const fdate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const WalletIcon = (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/><path d="M2 10h20"/></svg>;
const WithdrawIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const HistoryIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

export default function EarningsTab({ token }) {
  const [earnings, setEarnings] = useState(null);
  const [history, setHistory] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("overview");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState(null);
  const headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, hRes, wRes] = await Promise.all([
        fetch(API + "/earnings", { headers }).then(r => r.json()),
        fetch(API + "/earnings/history", { headers }).then(r => r.json()),
        fetch(API + "/earnings/withdrawals", { headers }).then(r => r.json()),
      ]);
      setEarnings(eRes);
      setHistory(hRes);
      setWithdrawals(wRes.withdrawals || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone) return;
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch(API + "/earnings/withdraw", {
        method: "POST", headers,
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), phone: withdrawPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg({ type: "success", text: "Demande envoyée ! Montant: " + fcfa(withdrawAmount) });
        setWithdrawAmount("");
        setShowWithdrawForm(false);
        fetchAll();
      } else {
        setWithdrawMsg({ type: "error", text: data.error || "Erreur" });
      }
    } catch (err) { setWithdrawMsg({ type: "error", text: "Erreur de connexion" }); }
    finally { setWithdrawing(false); }
  };

  const statusColors = { pending: "#FFB826", approved: "#4ADE80", rejected: "#EF4444" };
  const statusLabels = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };

  if (loading) {
    return (
      <div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>{WalletIcon(22)} Revenus</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "24px 20px" }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 12, width: "60%", marginBottom: 14, animation: "pulse 1.5s infinite" }} />
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 28, width: "40%", animation: "pulse 1.5s infinite" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const e = earnings || {};
  const kpis = [
    { label: "Revenus bruts", value: fcfa(e.total_revenue || 0), color: T.accent, sub: e.total_sales + " vente" + (e.total_sales !== 1 ? "s" : "") },
    { label: "Commission FotoKash (" + (e.commission_rate || 0) + "%)", value: "- " + fcfa(e.total_commission || 0), color: T.gold, sub: "Plan " + (e.plan || "free").toUpperCase() },
    { label: "Solde disponible", value: fcfa(e.available_balance || 0), color: T.green, sub: e.pending_withdrawal > 0 ? fcfa(e.pending_withdrawal) + " en attente" : "Retrait possible" },
    { label: "Total retiré", value: fcfa(e.total_withdrawn || 0), color: "#818CF8", sub: withdrawals.filter(w => w.status === "approved").length + " retrait(s)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>{WalletIcon(22)} Revenus</h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Suivez vos gains et demandez un retrait</p>
        </div>
        <button onClick={fetchAll} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "7px 14px", color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>↻ Actualiser</button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px 18px", animation: "fadeUp 0.4s ease " + (i * 0.1) + "s both" }}>
            <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Withdraw message */}
      {withdrawMsg && (
        <div style={{ background: withdrawMsg.type === "success" ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)", border: "1px solid " + (withdrawMsg.type === "success" ? "rgba(74,222,128,0.25)" : "rgba(239,68,68,0.25)"), borderRadius: T.radiusSm, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: withdrawMsg.type === "success" ? T.green : T.red }}>{withdrawMsg.text}</span>
          <button onClick={() => setWithdrawMsg(null)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Withdraw button / form */}
      <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px 22px", marginBottom: 20 }}>
        {!showWithdrawForm ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Demander un retrait</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Minimum {fcfa(e.min_withdrawal || 1000)} · Solde: {fcfa(e.available_balance || 0)}</div>
            </div>
            <button onClick={() => setShowWithdrawForm(true)} disabled={(e.available_balance || 0) < (e.min_withdrawal || 1000)} style={{
              background: (e.available_balance || 0) >= (e.min_withdrawal || 1000) ? T.accent : "rgba(255,255,255,0.04)",
              border: "none", borderRadius: 10, padding: "10px 22px",
              color: (e.available_balance || 0) >= (e.min_withdrawal || 1000) ? "#fff" : T.textMuted,
              fontSize: 14, fontWeight: 700, cursor: (e.available_balance || 0) >= (e.min_withdrawal || 1000) ? "pointer" : "default",
              fontFamily: T.font, display: "flex", alignItems: "center", gap: 6
            }}>{WithdrawIcon(16)} Retirer</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Nouveau retrait</span>
              <button onClick={() => setShowWithdrawForm(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 6 }}>Montant (FCFA)</label>
                <input type="number" value={withdrawAmount} onChange={ev => setWithdrawAmount(ev.target.value)} placeholder={"Min " + (e.min_withdrawal || 1000)} style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: T.font }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 6 }}>{"Numéro Mobile Money"}</label>
                <input type="tel" value={withdrawPhone} onChange={ev => setWithdrawPhone(ev.target.value)} placeholder="07 XX XX XX XX" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: T.font }} />
              </div>
            </div>
            <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || !withdrawPhone} style={{
              width: "100%", background: (withdrawing || !withdrawAmount || !withdrawPhone) ? "rgba(255,255,255,0.04)" : T.accent,
              border: "none", borderRadius: 10, padding: "12px 0",
              color: (withdrawing || !withdrawAmount || !withdrawPhone) ? T.textMuted : "#fff",
              fontSize: 14, fontWeight: 700, cursor: (withdrawing || !withdrawAmount || !withdrawPhone) ? "default" : "pointer",
              fontFamily: T.font
            }}>{withdrawing ? "Envoi en cours..." : "Confirmer le retrait"}</button>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "1px solid " + T.border }}>
        {[
          { id: "overview", label: "Par événement", icon: Icon.Calendar(14) },
          { id: "transactions", label: "Transactions", icon: HistoryIcon(14) },
          { id: "withdrawals", label: "Retraits", icon: WithdrawIcon(14) },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            background: "none", border: "none", borderBottom: section === s.id ? "2px solid " + T.accent : "2px solid transparent",
            padding: "10px 18px", color: section === s.id ? T.accent : T.textMuted,
            fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.font
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {/* By event */}
      {section === "overview" && history && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, overflow: "hidden" }}>
          {(history.by_event || []).length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Aucune vente pour le moment</div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                <span>{"Événement"}</span><span>Ventes</span><span>CA brut</span><span>Net ({100 - (earnings?.commission_rate || 0)}%)</span>
              </div>
              {history.by_event.map((ev, i) => {
                var net = Math.round(parseFloat(ev.revenue) * (100 - (earnings?.commission_rate || 0)) / 100);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 18px", borderBottom: "1px solid " + T.border, fontSize: 13, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</span>
                    <span style={{ color: T.textMuted }}>{ev.sales}</span>
                    <span>{fcfa(ev.revenue)}</span>
                    <span style={{ color: T.green, fontWeight: 600 }}>{fcfa(net)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {section === "transactions" && history && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, overflow: "hidden" }}>
          {(history.transactions || []).length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Aucune transaction</div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                <span>Date</span><span>{"Événement"}</span><span>Photos</span><span>Montant</span>
              </div>
              {history.transactions.map((tx, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 12, alignItems: "center" }}>
                  <span style={{ color: T.textMuted }}>{fdate(tx.created_at)}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.event_name || "—"}</span>
                  <span style={{ color: T.textMuted }}>{tx.photos_count || "—"}</span>
                  <span style={{ color: tx.status === "completed" ? T.green : T.gold, fontWeight: 600 }}>{fcfa(tx.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawals */}
      {section === "withdrawals" && (
        <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, overflow: "hidden" }}>
          {withdrawals.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Aucune demande de retrait</div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                <span>Date</span><span>Montant</span><span>{"Téléphone"}</span><span>Statut</span>
              </div>
              {withdrawals.map((w, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 12, alignItems: "center" }}>
                  <span style={{ color: T.textMuted }}>{fdate(w.requested_at)}</span>
                  <span style={{ fontWeight: 600 }}>{fcfa(w.amount)}</span>
                  <span style={{ color: T.textMuted }}>{w.phone}</span>
                  <span style={{ color: statusColors[w.status] || T.textMuted, fontWeight: 600, fontSize: 11 }}>{statusLabels[w.status] || w.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
