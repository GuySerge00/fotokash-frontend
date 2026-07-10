import { useState, useEffect } from "react";
import { T, API } from "../../utils/tokens";
import { Icon } from "../../utils/icons";

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F";
const fdate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
              <div style={{ fontSize: 12, color: T.textMuted }}>Minimum {fcfa(e.min_withdrawal || 5000)} · Solde: {fcfa(e.available_balance || 0)}</div>
            </div>
            <button onClick={() => setShowWithdrawForm(true)} disabled={(e.available_balance || 0) < (e.min_withdrawal || 5000)} style={{
              background: (e.available_balance || 0) >= (e.min_withdrawal || 5000) ? T.accent : "rgba(255,255,255,0.04)",
              border: "none", borderRadius: 10, padding: "10px 22px",
              color: (e.available_balance || 0) >= (e.min_withdrawal || 5000) ? "#fff" : T.textMuted,
              fontSize: 14, fontWeight: 700, cursor: (e.available_balance || 0) >= (e.min_withdrawal || 5000) ? "pointer" : "default",
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
                <input type="number" value={withdrawAmount} onChange={ev => setWithdrawAmount(ev.target.value)} placeholder={"Min " + (e.min_withdrawal || 5000)} style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 8, padding: "10px 14px", color: T.text, fontSize: 14, outline: "none", fontFamily: T.font }} />
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
                <div key={i}>
                  <div onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "12px 18px", borderBottom: "1px solid " + T.border, fontSize: 12, alignItems: "center", cursor: "pointer" }}>
                    <span style={{ color: T.textMuted }}>{fdate(tx.created_at)}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.event_name || "—"}</span>
                    <span style={{ color: T.textMuted }}>{tx.photos_count || "—"}</span>
                    <span style={{ color: tx.status === "completed" ? T.green : T.gold, fontWeight: 600 }}>{fcfa(tx.amount)}</span>
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
    </div>
  );
}
