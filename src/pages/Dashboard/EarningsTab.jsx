import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F";
const fdate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fdateShort = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const WalletIcon = (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/><path d="M2 10h20"/></svg>;
const WithdrawIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const HistoryIcon = (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

const periods = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7j" },
  { key: "30d", label: "30j" },
  { key: "custom", label: "Période" },
];

export default function EarningsTab({ token }) {
  const [earnings, setEarnings] = useState(null);
  const [history, setHistory] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("overview");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawOperator, setWithdrawOperator] = useState("");
  const WITHDRAWAL_FEE_PERCENT = 2;
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState(null);

  const [period, setPeriod] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectStep, setSelectStep] = useState(0);
  const [hoverDay, setHoverDay] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);

  const headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" };

  const periodQuery = () => {
    var q = "?period=" + period;
    if (period === "custom" && startDate && endDate) q += "&startDate=" + startDate + "&endDate=" + endDate;
    return q;
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, hRes, wRes] = await Promise.all([
        fetch(API + "/earnings", { headers }).then(r => r.json()),
        fetch(API + "/earnings/history" + periodQuery(), { headers }).then(r => r.json()),
        fetch(API + "/earnings/withdrawals", { headers }).then(r => r.json()),
      ]);
      setEarnings(eRes);
      setHistory(hRes);
      setWithdrawals(wRes.withdrawals || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [token, period, startDate, endDate]);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const fmtD = (y, m, d) => y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  const handleDayClick = (day) => {
    const clicked = fmtD(calYear, calMonth, day);
    if (selectStep === 0) {
      setStartDate(clicked);
      setEndDate("");
      setSelectStep(1);
    } else {
      if (clicked < startDate) { setEndDate(startDate); setStartDate(clicked); }
      else { setEndDate(clicked); }
      setSelectStep(0);
      setShowCalendar(false);
      setPeriod("custom");
    }
  };

  const handleDayDblClick = (day) => {
    const clicked = fmtD(calYear, calMonth, day);
    setStartDate(clicked);
    setEndDate(clicked);
    setSelectStep(0);
    setShowCalendar(false);
    setPeriod("custom");
  };

  const isInRange = (day) => {
    if (!startDate) return false;
    const d = fmtD(calYear, calMonth, day);
    if (selectStep === 1 && hoverDay) {
      const hd = fmtD(calYear, calMonth, hoverDay);
      const lo = hd < startDate ? hd : startDate;
      const hi = hd < startDate ? startDate : hd;
      return d >= lo && d <= hi;
    }
    if (!endDate) return d === startDate;
    return d >= startDate && d <= endDate;
  };
  const isStart = (day) => fmtD(calYear, calMonth, day) === startDate;
  const isEnd = (day) => fmtD(calYear, calMonth, day) === endDate;
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  const renderCalendar = () => {
    const days = daysInMonth(calMonth, calYear);
    const first = firstDayOfMonth(calMonth, calYear);
    const cells = [];
    for (let i = 0; i < (first === 0 ? 6 : first - 1); i++) cells.push(<div key={"e" + i} />);
    for (let d = 1; d <= days; d++) {
      const inRange = isInRange(d);
      const start = isStart(d);
      const end = isEnd(d);
      cells.push(
        <div key={d}
          onClick={() => handleDayClick(d)}
          onDoubleClick={() => handleDayDblClick(d)}
          onMouseEnter={() => { if (selectStep === 1) setHoverDay(d); }}
          onMouseLeave={() => setHoverDay(null)}
          style={{
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: start || end ? 8 : 0,
            background: start || end ? T.accent : inRange ? "rgba(232,89,60,0.15)" : "transparent",
            color: start || end ? "#fff" : inRange ? T.accent : "#ccc",
            cursor: "pointer", fontSize: 13, fontWeight: start || end ? 700 : 400,
          }}
        >{d}</div>
      );
    }
    return cells;
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await fetch(API + "/earnings/export/" + format + periodQuery(), { headers: { Authorization: "Bearer " + token } });
      if (!res.ok) throw new Error("Export échoué");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fotokash-releve." + (format === "pdf" ? "pdf" : "xlsx");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone || !withdrawOperator) return;
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch(API + "/earnings/withdraw", {
        method: "POST", headers,
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), phone: withdrawPhone, operator: withdrawOperator })
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

  if (loading && !earnings) {
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

  const minWithdrawal = e.min_withdrawal || 5000;
  const availableBalance = e.available_balance || 0;
  const withdrawProgress = Math.min(100, (availableBalance / minWithdrawal) * 100);
  const missingForWithdrawal = Math.max(0, minWithdrawal - availableBalance);

  const recentActivity = [
    ...((history?.transactions || []).map((tx, i) => ({ id: "s" + (tx.id || i), type: "sale", date: tx.created_at, label: "Vente photo — " + (tx.event_name || "—"), amount: tx.amount }))),
    ...((withdrawals || []).map((w, i) => ({ id: "w" + i, type: "withdrawal", date: w.requested_at, label: "Retrait Mobile Money", amount: -w.amount }))),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div style={{ position: "relative" }}>
      {loading && earnings && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,6,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, zIndex: 50 }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: T.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12, position: "relative" }}>
        <div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>{WalletIcon(22)} Revenus</h2>
          <p style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>Suivez vos gains et demandez un retrait</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={fetchAll} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "7px 14px", color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>↻ Actualiser</button>
            <div style={{ display: "flex", background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, overflow: "hidden" }}>
              {periods.map(p => (
                <button key={p.key} onClick={() => { if (p.key === "custom") { setShowCalendar(!showCalendar); setSelectStep(0); } else { setPeriod(p.key); setShowCalendar(false); } }} style={{
                  background: period === p.key ? T.accentDim : "transparent", border: "none", padding: "7px 12px",
                  color: period === p.key ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", borderRadius: 8
                }}>{p.label}</button>
              ))}
            </div>
            <button onClick={() => handleExport("pdf")} disabled={exporting} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "7px 14px", color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: exporting ? "default" : "pointer", fontFamily: T.font }}>PDF</button>
            <button onClick={() => handleExport("excel")} disabled={exporting} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: T.radiusSm, padding: "7px 14px", color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: exporting ? "default" : "pointer", fontFamily: T.font }}>Excel</button>
          </div>
          {period === "custom" && startDate && endDate && (
            <div style={{ fontSize: 11, color: T.accent }}>{startDate === endDate ? startDate : startDate + " → " + endDate}</div>
          )}
          {showCalendar && (
            <div style={{ position: "absolute", right: 0, top: 45, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 16, zIndex: 300, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", minWidth: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button onClick={prevMonth} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>◀</button>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{monthNames[calMonth]} {calYear}</span>
                <button onClick={nextMonth} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>▶</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 32px)", gap: 2, justifyContent: "center", marginBottom: 8 }}>
                {["Lu","Ma","Me","Je","Ve","Sa","Di"].map(d => <div key={d} style={{ width: 32, textAlign: "center", fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{d}</div>)}
                {renderCalendar()}
              </div>
              {selectStep === 1 && <div style={{ fontSize: 11, color: T.accent, textAlign: "center", marginTop: 8 }}>Sélectionnez la date de fin</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={() => { setShowCalendar(false); setSelectStep(0); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, padding: "4px 12px", color: T.textMuted, fontSize: 11, cursor: "pointer" }}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, padding: "20px 18px", animation: "fadeUp 0.4s ease " + (i * 0.1) + "s both" }}>
            <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontFamily: T.fontNumber, fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
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
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Demander un retrait</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Minimum {fcfa(minWithdrawal)} · Solde: {fcfa(availableBalance)}</div>
              </div>
              <button onClick={() => setShowWithdrawForm(true)} disabled={availableBalance < minWithdrawal} style={{
                background: availableBalance >= minWithdrawal ? T.accent : "rgba(255,255,255,0.04)",
                border: "none", borderRadius: 10, padding: "10px 22px",
                color: availableBalance >= minWithdrawal ? "#fff" : T.textMuted,
                fontSize: 14, fontWeight: 700, cursor: availableBalance >= minWithdrawal ? "pointer" : "default",
                fontFamily: T.font, display: "flex", alignItems: "center", gap: 6
              }}>{WithdrawIcon(16)} Retirer</button>
            </div>
            {availableBalance < minWithdrawal && (
              <div style={{ marginTop: 14 }}>
                <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: withdrawProgress + "%", background: T.accent, borderRadius: 4, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
                  {fcfa(missingForWithdrawal)} restants pour débloquer le retrait
                </div>
              </div>
            )}
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
                <input type="number" value={withdrawAmount} onChange={ev => setWithdrawAmount(ev.target.value)} placeholder={"Min " + minWithdrawal} style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: T.font }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 6 }}>{"Numéro Mobile Money"}</label>
                <input type="tel" value={withdrawPhone} onChange={ev => setWithdrawPhone(ev.target.value)} placeholder="07 XX XX XX XX" style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: T.font }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 6 }}>{"Opérateur"}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {[
                  { id: "orange", label: "Orange" },
                  { id: "mtn", label: "MTN" },
                  { id: "wave", label: "Wave" },
                  { id: "moov", label: "Moov" },
                ].map(op => (
                  <button key={op.id} type="button" onClick={() => setWithdrawOperator(op.id)} style={{
                    background: withdrawOperator === op.id ? T.accentDim : T.bg,
                    border: "1px solid " + (withdrawOperator === op.id ? T.accent : T.border),
                    borderRadius: 8, padding: "9px 0",
                    color: withdrawOperator === op.id ? T.accent : T.textMuted,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font
                  }}>{op.label}</button>
                ))}
              </div>
            </div>
            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: T.textMuted }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>{"Frais de retrait (" + WITHDRAWAL_FEE_PERCENT + "%)"}</span>
                  <span>{"-" + fcfa(parseFloat(withdrawAmount) * WITHDRAWAL_FEE_PERCENT / 100) + " F"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: T.text }}>
                  <span>Vous recevrez</span>
                  <span>{fcfa(parseFloat(withdrawAmount) * (1 - WITHDRAWAL_FEE_PERCENT / 100)) + " F"}</span>
                </div>
              </div>
            )}
            <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || !withdrawPhone || !withdrawOperator} style={{
              width: "100%", background: (withdrawing || !withdrawAmount || !withdrawPhone || !withdrawOperator) ? "rgba(255,255,255,0.04)" : T.accent,
              border: "none", borderRadius: 10, padding: "12px 0",
              color: (withdrawing || !withdrawAmount || !withdrawPhone || !withdrawOperator) ? T.textMuted : "#fff",
              fontSize: 14, fontWeight: 700, cursor: (withdrawing || !withdrawAmount || !withdrawPhone || !withdrawOperator) ? "default" : "pointer",
              fontFamily: T.font
            }}>{withdrawing ? "Envoi en cours..." : "Confirmer le retrait"}</button>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "1px solid " + T.border }}>
        {[
          { id: "overview", label: "Par événement", icon: Icon.Calendar(14), count: (history?.by_event || []).length },
          { id: "transactions", label: "Transactions", icon: HistoryIcon(14), count: (history?.transactions || []).length },
          { id: "withdrawals", label: "Retraits", icon: WithdrawIcon(14), count: withdrawals.length },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            background: "none", border: "none", borderBottom: section === s.id ? "2px solid " + T.accent : "2px solid transparent",
            padding: "10px 18px", color: section === s.id ? T.accent : T.textMuted,
            fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: T.font
          }}>
            {s.icon} {s.label}
            <span style={{
              background: section === s.id ? T.accentDim : "rgba(255,255,255,0.06)",
              color: section === s.id ? T.accent : T.textMuted,
              fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, fontFamily: T.fontNumber
            }}>{s.count}</span>
          </button>
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
                    <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: T.bg, border: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim }}>{Icon.Image(14)}</span>
                      {ev.name}
                    </span>
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
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 0.7fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                <span>Date</span><span>{"Événement"}</span><span>Photos</span><span>Moyen</span><span>Montant</span><span>Statut</span>
              </div>
              {history.transactions.map((tx, i) => (
                <div key={i}>
                  <div onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 0.7fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 12, alignItems: "center", cursor: "pointer" }}>
                    <div>
                      <div style={{ color: T.textMuted }}>{fdate(tx.created_at)}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, opacity: 0.6, fontFamily: "monospace" }} title={tx.reference}>{(tx.reference || "").slice(0, 8)}...</div>
                    </div>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.event_name || "—"}</span>
                    <span style={{ color: T.textMuted }}>{tx.photos_count || "—"}</span>
                    <span style={{ color: T.textMuted, textTransform: "capitalize" }}>{tx.payment_method || "—"}</span>
                    <span style={{ color: tx.status === "completed" ? T.green : T.gold, fontWeight: 600 }}>{fcfa(tx.amount)}</span>
                    <span style={{ color: tx.status === "completed" ? T.green : tx.status === "failed" ? "#EF4444" : T.gold, fontWeight: 600, fontSize: 11 }}>{tx.status === "completed" ? "Complétée" : tx.status === "failed" ? "Échouée" : "En attente"}</span>
                  </div>
                  {expandedTx === tx.id && (
                    <div style={{ padding: "10px 18px", borderBottom: "1px solid " + T.border, background: "rgba(255,255,255,0.02)", fontSize: 11, color: T.textMuted }}>
                      ID transaction : {tx.id}<br />
                      ID(s) photo(s) : {(tx.photo_ids || []).join(", ") || "—"}
                    </div>
                  )}
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

      {/* Dernières transactions (aperçu combiné ventes + retraits) */}
      {recentActivity.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Dernières transactions</div>
          <div style={{ background: T.card, borderRadius: T.radius, border: "1px solid " + T.border, overflow: "hidden" }}>
            {recentActivity.map((a, i) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: i < recentActivity.length - 1 ? "1px solid " + T.border : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  {a.type === "withdrawal" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, display: "inline-block", flexShrink: 0 }} />}
                  {a.label}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{fdateShort(a.date)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.fontNumber, color: a.amount >= 0 ? T.green : T.red }}>{a.amount >= 0 ? "+" : "-"}{fcfa(Math.abs(a.amount))}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
