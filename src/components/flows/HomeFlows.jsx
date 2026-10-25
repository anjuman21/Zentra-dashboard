import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/flows.css";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Badge } from "../Help";
import { Toggle, Segmented } from "../Settings";
import { openFlow, closeFlow } from "../../flows";
import { transactions } from "../../data";
import {
  ficons,
  COINS,
  ADDABLE,
  WATCH_TABS,
  watchStore,
  hideStore,
  money,
  pct,
  RATE,
  QUICK_VIEW,
  SERIES,
  RANGE_AXIS,
  TX_STEPS,
  STATUS_STEP,
  AI_MOVERS,
} from "../../homeFlowData";

const go = (route) => {
  closeFlow();
  window.location.hash = route === "overview" ? "#/" : `#/${route}`;
};

export function Row({ label, value, strong, tone, children }) {
  return (
    <div className={`fl-row${strong ? " is-strong" : ""}`}>
      <span className="fl-row__label">{label}</span>
      <span className={`fl-row__value${tone ? ` is-${tone}` : ""}`}>
        {value}
        {children}
      </span>
    </div>
  );
}

export function CopyText({ text, shown = text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="fl-copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      <span>{done ? "Copied" : shown}</span>
      <img src={done ? ficons.check : ficons.copy} alt="" width="16" height="16" />
    </button>
  );
}

function Head({ id, title, sub, onClose, children }) {
  return (
    <div className="fl-head">
      <div className="fl-head__text">
        <h2 id={id} className="fl-head__title">
          {title}
        </h2>
        {sub && <p className="fl-head__sub">{sub}</p>}
      </div>
      {children}
      <CloseButton onClick={onClose} />
    </div>
  );
}

/* ───────────── 01A / 01B · Convert ───────────── */

function CoinPill({ code }) {
  return (
    <span className="fl-coin-pill">
      <img src={COINS[code].icon} alt="" width="18" height="18" />
      <span>{code}</span>
      <img className="mono" src={ficons.arrowDown} alt="" width="18" height="18" />
    </span>
  );
}

export function ConvertReview({ amount = "0.1", from = "BTC", to = "ETH" }) {
  const [pair, setPair] = useState({ from, to });
  const [left, setLeft] = useState(12);
  const n = parseFloat(amount) || 0;
  const rate = pair.from === "BTC" ? RATE : 1 / RATE;
  const out = n * rate;
  const usd = n * COINS[pair.from].price;
  const fee = usd * 0.001;

  // The quote is locked for a few seconds, then refreshed.
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 30 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (v) => v.toFixed(4);
  return (
    <Modal onClose={closeFlow} labelledBy="fl-convert-title" width={496}>
      <div className="fl-dialog fl-dialog--32">
        <Head id="fl-convert-title" title="Review conversion" sub="Check the details before you confirm" onClose={closeFlow} />
        <div className="fl-stack-16">
          <div className="fl-swapbox">
            <div className="fl-amount">
              <span className="fl-amount__text">
                <span className="fl-amount__label">You pay</span>
                <span className="fl-amount__value">{n}</span>
                <span className="fl-amount__usd">≈ {money(usd)}</span>
              </span>
              <CoinPill code={pair.from} />
            </div>
            <div className="fl-amount">
              <span className="fl-amount__text">
                <span className="fl-amount__label">You receive (estimated)</span>
                <span className="fl-amount__value">{fmt(out)}</span>
                <span className="fl-amount__usd">≈ {money(usd - fee - 11.54)}</span>
              </span>
              <CoinPill code={pair.to} />
            </div>
            <button type="button" className="fl-swapbtn" aria-label="Swap direction" onClick={() => setPair((p) => ({ from: p.to, to: p.from }))}>
              <img className="mono" src={ficons.arrowDownward} alt="" width="18" height="18" />
            </button>
          </div>
          <div className="fl-rows">
            <Row label="Rate" value={`1 ${pair.from} = ${pair.from === "BTC" ? RATE : (1 / RATE).toFixed(5)} ${pair.to}`} />
            <Row label="Network fee" value={`0.00012 BTC · $11.54`} />
            <Row label="Zentra fee (0.1%)" value={money(fee)} />
            <Row label="Slippage tolerance" value="0.5%" />
            <hr className="fl-hr" />
            <Row strong label="Minimum received" value={`${fmt(out * 0.995)} ${pair.to}`} />
          </div>
        </div>
        <div className="fl-stack-16">
          <p className="fl-timer">
            <img className="mono" src={ficons.schedule} alt="" width="16" height="16" />
            <span>Price locked for 0:{String(left).padStart(2, "0")} · we'll refresh the quote automatically</span>
          </p>
          <div className="fl-actions">
            <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary ob-btn"
              onClick={() => openFlow("home.convert-success", { paid: n, from: pair.from, to: pair.to, got: out, usd: usd - fee - 11.54, rate })}
            >
              Confirm convert
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ConvertSuccess({ paid = 0.1, from = "BTC", to = "ETH", got = 2.5938, usd = 9597.16, rate = RATE }) {
  return (
    <Modal onClose={closeFlow} labelledBy="fl-done-title" width={496}>
      <div className="fl-dialog">
        <img className="fl-done__art" src={ficons.done} alt="" width="240" height="176" />
        <div className="fl-stack-16">
          <div className="fl-done__text">
            <h2 id="fl-done-title" className="fl-done__title">
              Conversion complete
            </h2>
            <p className="fl-done__amount">
              +{got.toFixed(4)} {to}
            </p>
            <p className="fl-done__sub">≈ {money(usd)} · now in your Unified Trading wallet</p>
          </div>
          <div className="fl-summary">
            <Row label="Paid" value={`−${paid} ${from}`} />
            <Row label="Rate" value={`1 ${from} = ${rate < 1 ? rate.toFixed(5) : rate} ${to}`} />
            <Row label="Total fees" value="$21.16" />
            <Row label="Completed" value="20 Oct 2026, 10:41" />
            <Row label="Transaction ID">
              <CopyText text="0x8f3c2e9b7d41a91c" shown="0x8f3c…a91c" />
            </Row>
          </div>
        </div>
        <div className="fl-actions fl-actions--16">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("home.tx", { index: 0 })}>
            View transaction
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 03A · Watchlist · Add coins ───────────── */

function Change({ value, bold }) {
  return <span className={`fl-change ${value < 0 ? "is-down" : "is-up"}${bold ? " is-bold" : ""}`}>{pct(value)}</span>;
}

export function AddWatchlist() {
  const watched = watchStore.use();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(["DOGE", "DOT"]);
  const list = WATCH_TABS[tab].filter((s) => {
    const c = COINS[s];
    return !q || `${c.name} ${c.symbol}`.toLowerCase().includes(q.toLowerCase());
  });
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const add = () => {
    watchStore.set((w) => [...w, ...picked.filter((s) => !w.includes(s))]);
    closeFlow();
  };
  return (
    <Modal onClose={closeFlow} labelledBy="fl-watch-title" width={496}>
      <div className="fl-dialog">
        <Head id="fl-watch-title" title="Add to Watchlist" sub="Pick the coins you want to track on Home" onClose={closeFlow} />
        <div className="fl-stack-24">
          <label className="fl-search">
            <img className="mono" src={ficons.search} alt="" width="18" height="18" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or symbol" aria-label="Search coins" />
          </label>
          <div className="fl-stack-16">
            <div className="hp-tabs fl-tabs" role="tablist">
              {Object.keys(WATCH_TABS).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={t === tab} className={`hp-tab${t === tab ? " is-active" : ""}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <ul className="fl-coins">
              {list.map((s) => {
                const c = COINS[s];
                const inList = watched.includes(s);
                const on = inList || picked.includes(s);
                return (
                  <li key={s}>
                    <button
                      type="button"
                      className={`fl-coin${picked.includes(s) ? " is-picked" : ""}`}
                      aria-pressed={on}
                      disabled={inList}
                      onClick={() => toggle(s)}
                    >
                      <img src={c.icon} alt="" width="24" height="24" />
                      <span className="fl-coin__name">
                        <span className="fl-strong">{c.name}</span>
                        <span className="fl-sub">
                          {s}
                          {inList ? " · In watchlist" : ""}
                        </span>
                      </span>
                      <span className="fl-coin__price">
                        <span className="fl-strong">{money(c.price, c.price < 1 ? 4 : 2)}</span>
                        <Change value={c.change} bold />
                      </span>
                      <span className={`fl-radio${on ? " is-on" : ""}${inList ? " is-locked" : ""}`} />
                    </button>
                  </li>
                );
              })}
              {list.length === 0 && <li className="hp-empty-line">No coins match “{q}”.</li>}
            </ul>
          </div>
        </div>
        <div className="fl-foot">
          <span className="fl-foot__text">
            <span className="fl-strong">{picked.length} selected</span>
            <span className="fl-sub">{picked.join(", ") || "Pick at least one coin"}</span>
          </span>
          <button type="button" className="ob-btn ob-btn--ghost fl-btn-auto" onClick={() => setPicked([])} disabled={!picked.length}>
            Clear
          </button>
          <button type="button" className="btn-primary ob-btn fl-btn-auto" disabled={!picked.length} onClick={add}>
            Add {picked.length} coin{picked.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 03B · Watchlist · Coin quick view ───────────── */

export function LineChart({ points, color = "#f7931a", height = 170, label, axis, yLabels }) {
  const w = 400;
  const h = height - 22;
  const xs = points.map((_, i) => (i / (points.length - 1)) * (w - 40));
  const ys = points.map((p) => 8 + (1 - p) * (h - 16));
  const line = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const id = useMemo(() => `g${Math.random().toString(36).slice(2, 8)}`, []);
  const lx = xs[xs.length - 1];
  const ly = ys[ys.length - 1];
  return (
    <div className="fl-chart" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" role="img" aria-label="Price chart">
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.15, 0.4, 0.65, 0.9].map((g) => (
          <line key={g} x1="0" x2={w - 40} y1={g * h} y2={g * h} className="fl-chart__grid" />
        ))}
        <path d={`${line} L${lx},${h} L0,${h} Z`} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1={lx} x2={lx} y1={ly} y2={h} className="fl-chart__drop" />
        <circle cx={lx} cy={ly} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />
      </svg>
      {label && (
        <span className="fl-chart__tip" style={{ right: 44, top: Math.max(0, ly - 30) }}>
          {label}
        </span>
      )}
      {yLabels && (
        <span className="fl-chart__y">
          {yLabels.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </span>
      )}
      {axis && (
        <span className="fl-chart__x">
          {axis.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </span>
      )}
    </div>
  );
}

export function CoinQuickView({ symbol = "BTC" }) {
  const coin = COINS[symbol] || COINS.BTC;
  const data = QUICK_VIEW[symbol];
  const watched = watchStore.use();
  const [range, setRange] = useState("1D");
  const [alert, setAlert] = useState(false);
  const watching = watched.includes(symbol);
  const changeUsd = (coin.price * coin.change) / (100 + coin.change);
  const p = coin.price;
  return (
    <Drawer onClose={closeFlow} labelledBy="fl-qv-title">
      <div className="fl-drawer">
        <div className="fl-drawer__scroll">
          <div className="fl-qv__head">
            <img src={coin.icon} alt="" width="32" height="32" />
            <span className="fl-qv__name">
              <span id="fl-qv-title" className="fl-qv__title">
                {coin.name}
              </span>
              <span className="fl-sub">
                {symbol} · Rank #{coin.rank}
              </span>
            </span>
            <button
              type="button"
              className={`fl-watching${watching ? " is-on" : ""}`}
              aria-pressed={watching}
              onClick={() => watchStore.set((w) => (watching ? w.filter((s) => s !== symbol) : [...w, symbol]))}
            >
              <img src={ficons.stars} alt="" width="12" height="12" />
              {watching ? "Watching" : "Watch"}
            </button>
            <button type="button" className={`fl-round${alert ? " is-on" : ""}`} aria-label="Price alert" aria-pressed={alert} onClick={() => setAlert((x) => !x)}>
              <img className="mono" src={ficons.bell} alt="" width="18" height="18" />
            </button>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="fl-stack-24">
            <div className="fl-qv__price">
              <span className="fl-qv__value">{money(p, p < 1 ? 4 : 2)}</span>
              <span className="fl-qv__change">
                <Badge tone={coin.change < 0 ? "red" : "green"}>{pct(coin.change)}</Badge>
                <span className="fl-sub fl-sub--13">{data?.up ?? `${changeUsd < 0 ? "−" : "+"}${money(Math.abs(changeUsd))} today`}</span>
              </span>
            </div>
            <Segmented options={Object.keys(SERIES)} value={range} onChange={setRange} label="Chart range" className="fl-range" />
          </div>
          <LineChart
            points={SERIES[range]}
            color={coin.color}
            label={money(p, p < 1 ? 4 : 2)}
            axis={RANGE_AXIS[range]}
            yLabels={[0.97, 0.93, 0.89, 0.85].map((f) => (p > 1000 ? `$${Math.round((p * f) / 1000)}k` : `$${(p * f).toFixed(p < 1 ? 3 : 2)}`))}
          />
          <div className="fl-stack-6">
            <div className="fl-stats">
              {(data?.stats ?? [
                ["Market cap", "$12.4B"],
                ["24h volume", "$1.1B"],
                ["24h high", money(p * 1.03, p < 1 ? 4 : 2)],
                ["24h low", money(p * 0.95, p < 1 ? 4 : 2)],
              ]).map(([k, v]) => (
                <div key={k} className="fl-stat">
                  <span className="fl-sub">{k}</span>
                  <span className="fl-stat__value">{v}</span>
                </div>
              ))}
            </div>
            {data && (
              <div className="fl-holdings">
                <div className="fl-holdings__top">
                  <span className="fl-holdings__label">
                    <img className="mono" src={ficons.wallet} alt="" width="16" height="16" />
                    Your holdings
                  </span>
                  <span className="hp-meta">Unified Trading</span>
                </div>
                <div className="fl-holdings__value">
                  <span>{data.holding.amount}</span>
                  <span className="fl-sub fl-sub--14">{data.holding.value}</span>
                </div>
                <div className="fl-rows fl-rows--8">
                  <Row label="Avg. buy price" value={data.holding.avg} />
                  <Row label="Unrealized P&L" value={data.holding.pnl} tone="up" />
                </div>
              </div>
            )}
          </div>
          {data && (
            <div className="fl-activity">
              <div className="fl-activity__head">
                <span>Your recent activity</span>
                <button type="button" className="fl-link-dark" onClick={() => go("history")}>
                  See all
                </button>
              </div>
              <ul>
                {data.activity.map((x) => (
                  <li key={x.title} className="fl-activity__row">
                    <span className="fl-coin__name">
                      <span className="fl-strong">{x.title}</span>
                      <span className="fl-sub">{x.sub}</span>
                    </span>
                    <span className={`fl-strong${x.up ? " is-up" : ""}`}>{x.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="button" className="fl-open-link" onClick={() => go("markets")}>
          Open full {coin.name} page
          <img src={ficons.chevron} alt="" width="16" height="16" className="fl-purple-icon" />
        </button>
      </div>
    </Drawer>
  );
}

/* ───────────── 04A · Transactions · Detail ───────────── */

export function TxDetail({ index = 0 }) {
  const tx = transactions[index] || transactions[0];
  const [cancelled, setCancelled] = useState(false);
  const reached = cancelled ? 0 : STATUS_STEP[tx.status] ?? 2;
  const done = reached >= 4;
  const [amount, pair] = tx.buy.pair.split(" ");
  const [base, quote] = pair.split("/");
  const status = cancelled ? { label: "Cancelled", tone: "red" } : done ? { label: "Completed", tone: "green" } : reached === 0 ? { label: "Not started", tone: "neutral" } : { label: tx.status === "Pending Review" ? "In progress" : tx.status, tone: "orange" };
  return (
    <Drawer onClose={closeFlow} labelledBy="fl-tx-title">
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-head fl-head--center">
            <h2 id="fl-tx-title" className="fl-head__title">
              Transaction details
            </h2>
            <button type="button" className="fl-icon-btn" aria-label="More actions">
              <img className="mono" src={ficons.more} alt="" width="18" height="18" />
            </button>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="fl-receipt">
            <div className="fl-receipt__hero">
              <span className="fl-pair-icons">
                <img src={COINS[quote]?.icon || COINS.BTC.icon} alt="" width="44" height="44" />
                <img src={tx.buy.icon} alt="" width="44" height="44" />
              </span>
              <span className="fl-receipt__name">
                <span className="fl-receipt__amount">
                  +{amount} {base}
                </span>
                <span className="fl-sub fl-sub--13">Buying with 0.20491 {quote} · Market order</span>
              </span>
              <span className="fl-receipt__status">
                <span className={`fl-pill is-${status.tone}`}>{status.label}</span>
                <span className="fl-sub fl-sub--13">{done ? "Settled to your wallet" : cancelled ? "Funds returned to Unified Trading" : "Usually done in ~10 min"}</span>
              </span>
            </div>
            <div className="fl-perf" aria-hidden="true" />
            <div className="fl-receipt__rows">
              <Row label="Price" value={`0.03856 ${quote}`} />
              <Row label="Fee" value={`0.00020 ${quote}`} />
              <Row label="Wallet" value="Unified Trading" />
              <Row label="Order ID">
                <CopyText text="ZN-8841-2026" />
              </Row>
              <hr className="fl-hr" />
              <Row strong label="Total" value={`0.20491 ${quote}`} />
            </div>
          </div>
          <div className="fl-stack-16">
            <div className="fl-activity__head">
              <span>Progress</span>
              <span className="hp-meta">Step {Math.min(reached + 1, 4)} of 4</span>
            </div>
            <ol className="fl-steps">
              {TX_STEPS.map((s, i) => {
                const state = i < reached ? "done" : i === reached && !cancelled ? "current" : "todo";
                return (
                  <li key={s.title} className={`fl-step is-${state}`}>
                    <span className="fl-step__rail">
                      <span className="fl-step__dot">{state === "done" && <img src={ficons.checkWhite} alt="" width="14" height="14" />}</span>
                    </span>
                    <span className="fl-coin__name">
                      <span className="fl-strong">{s.title}</span>
                      <span className="fl-sub">{s.sub}</span>
                    </span>
                    <span className="hp-meta">{s.time}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div className="fl-actions fl-actions--16">
          <button type="button" className="ob-btn ob-btn--secondary" disabled={done || cancelled} onClick={() => setCancelled(true)}>
            {cancelled ? "Order cancelled" : "Cancel order"}
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => go("help/chat")}>
            Contact support
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 05A · Ask AI · Assistant panel ───────────── */

const AI_REPLY = "I looked at your holdings and recent trades. Your biggest exposure is BTC (41%), and most of today’s move came from ETH. Want me to set an alert or show a chart?";

export function AskAiPanel() {
  const [chat, setChat] = useState([{ from: "me", text: "Why is my portfolio down today?" }, { from: "ai", rich: true }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [chat, busy]);

  const send = (v = text) => {
    if (!v.trim() || busy) return;
    setText("");
    setChat((c) => [...c, { from: "me", text: v.trim() }]);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setChat((c) => [...c, { from: "ai", text: AI_REPLY }]);
    }, 1100);
  };

  return (
    <Drawer onClose={closeFlow} labelledBy="fl-ai-title" side="left" width={480}>
      <div className="fl-ai">
        <div className="fl-ai__head">
          <span className="fl-ai__mark">
            <img src={ficons.stars} alt="" width="18" height="18" />
          </span>
          <span className="fl-ai__title">
            <span className="fl-ai__name">
              <span id="fl-ai-title">Zentra AI</span>
              <span className="fl-beta">Beta</span>
            </span>
            <span className="fl-sub">Knows your portfolio, markets & activity</span>
          </span>
          <button type="button" className="fl-round" aria-label="Chat history" onClick={() => go("ai")}>
            <img className="mono" src={ficons.history} alt="" width="18" height="18" />
          </button>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="fl-ai__body">
          <div className="fl-ai__chat">
            {chat.map((m, i) =>
              m.from === "me" ? (
                <p key={i} className="fl-ai__me">
                  {m.text}
                </p>
              ) : m.rich ? (
                <div key={i} className="fl-ai__answer">
                  <p className="fl-ai__text">
                    You’re <b>down 2.4% (−$1,168.40)</b> in the last 24h. Most of it comes from ETH (−8%), which is 28% of your holdings. <b>BTC (+12%)</b> offset part of the drop.
                  </p>
                  <div className="fl-movers">
                    <span className="fl-movers__title">Biggest movers · last 24h</span>
                    {AI_MOVERS.map((m2) => (
                      <div key={m2.coin} className="fl-mover">
                        <img src={COINS[m2.coin].icon} alt="" width="20" height="20" />
                        <span className="fl-coin__name">
                          <span className="fl-strong fl-strong--13">{COINS[m2.coin].name}</span>
                          <span className="fl-sub fl-sub--11">{m2.sub}</span>
                        </span>
                        <span className={`fl-mover__value${m2.up ? " is-up" : ""}`}>{m2.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fl-chips">
                    <button type="button" className="fl-chip" onClick={() => go("alerts")}>
                      <img className="mono" src={ficons.bell} alt="" width="14" height="14" />
                      Set ETH price alert
                    </button>
                    <button type="button" className="fl-chip" onClick={() => openFlow("home.coin", { symbol: "ETH" })}>
                      <img className="mono" src={ficons.history} alt="" width="14" height="14" />
                      Show ETH chart
                    </button>
                    <button type="button" className="fl-chip" onClick={() => send("Give me rebalance ideas")}>
                      <img src={ficons.stars} alt="" width="14" height="14" className="fl-purple-icon" />
                      Rebalance ideas
                    </button>
                  </div>
                </div>
              ) : (
                <p key={i} className="fl-ai__text">
                  {m.text}
                </p>
              ),
            )}
            {busy && (
              <span className="hp-typing__dots fl-ai__typing" aria-label="Zentra AI is typing">
                <span />
                <span />
                <span />
              </span>
            )}
            <span ref={end} />
          </div>
          <div className="fl-ai__foot">
            <form
              className="fl-ai__input"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <span className="fl-ai__context">$ Home · Unified Trading + Funding</span>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about coins, portfolio or market trends..." aria-label="Ask Zentra AI" />
              <span className="fl-ai__bar">
                <button type="button" className="fl-ai__btn" aria-label="Add context">
                  <img className="mono" src={ficons.add} alt="" width="18" height="18" />
                </button>
                <span className="fl-ai__model">Cortex 5.0</span>
                <button type="button" className="fl-ai__btn" aria-label="Speak">
                  <img className="mono" src={ficons.mic} alt="" width="18" height="18" />
                </button>
                <button type="submit" className="btn-primary fl-ai__send" aria-label="Send" disabled={!text.trim()}>
                  <img src={ficons.send} alt="" width="18" height="18" />
                </button>
              </span>
            </form>
            <p className="fl-ai__note">Zentra AI can make mistakes. Not financial advice.</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 06A · Balances · Breakdown ───────────── */

export function BalancesPopover() {
  const hidden = hideStore.use();
  const [mask, setMask] = useState(false);
  const v = (s) => (mask ? "••••••" : s);
  return (
    <Popover onClose={closeFlow} label="Balances" width={400}>
      <div className="fl-bal">
        <div className="fl-bal__body">
          <div className="fl-bal__head">
            <div className="fl-bal__top">
              <span className="fl-sub fl-sub--13">Total balance</span>
              <button type="button" className="fl-round fl-round--32" aria-label={mask ? "Show balances" : "Hide balances"} aria-pressed={mask} onClick={() => setMask((m) => !m)}>
                <img className="mono" src={ficons.eye} alt="" width="16" height="16" />
              </button>
            </div>
            <span className="fl-bal__total">{v("$47,511.87")}</span>
            <span className="fl-qv__change">
              <Badge tone="green">+2.6%</Badge>
              <span className="fl-sub">{v("+$1,203.44")} today</span>
            </span>
            <span className="fl-bal__bar">
              <span style={{ flex: 83 }} />
              <span style={{ flex: 17 }} />
            </span>
          </div>
          <div className="fl-wallets">
            {[
              ["Unified Trading", "83% of total", "$39,551.76", "+5.33%", "purple"],
              ["Funding", "17% of total", "$7,960.11", "+1.98%", "blue"],
            ].map(([name, share, value, change, tone]) => (
              <button key={name} type="button" className="fl-wallet" onClick={() => go("portfolio")}>
                <span className={`fl-wallet__dot is-${tone}`} />
                <span className="fl-coin__name">
                  <span className="fl-strong">{name}</span>
                  <span className="fl-sub">{share}</span>
                </span>
                <span className="fl-coin__price">
                  <span className="fl-strong">{v(value)}</span>
                  <span className="fl-change is-up is-bold">{change}</span>
                </span>
                <img className="mono" src={ficons.chevron} alt="" width="16" height="16" />
              </button>
            ))}
          </div>
          <div className="fl-quick">
            <button type="button" className="btn-primary fl-quick__btn" onClick={() => go("deposit")}>
              <img src={ficons.download} alt="" width="18" height="18" className="fl-white-icon" />
              Deposit
            </button>
            <button type="button" className="fl-quick__btn fl-quick__btn--line" onClick={() => go("deposit")}>
              <img className="mono" src={ficons.upload} alt="" width="18" height="18" />
              Withdraw
            </button>
            <button type="button" className="fl-quick__btn fl-quick__btn--line" onClick={() => openFlow("home.convert-review", {})}>
              <img className="mono" src={ficons.swap} alt="" width="18" height="18" />
              Transfer
            </button>
          </div>
        </div>
        <div className="fl-bal__foot">
          <label className="fl-bal__hide">
            <span>Hide balances on Home</span>
            <Toggle on={hidden} onChange={(x) => hideStore.set(x)} label="Hide balances on Home" />
          </label>
          <button type="button" className="hp-link fl-inline-link" onClick={() => go("portfolio")}>
            View full portfolio
            <img src={ficons.chevron} alt="" width="16" height="16" className="fl-purple-icon" />
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 07A · Profile · Account menu ───────────── */

export function ProfileMenu() {
  const items = [
    { icon: ficons.settings, label: "Account settings", route: "settings" },
    { icon: ficons.shield, label: "Security", route: "settings/security", tag: <span className="fl-tag is-green">2FA on</span> },
    { icon: ficons.bell, label: "Notifications", route: "alerts", tag: <span className="fl-tag is-count">3</span> },
    { icon: null, label: "Fees & limits", route: "help/article/withdrawal-limits", meta: "VIP 1" },
    { icon: ficons.language, label: "Language", route: "settings/preferences", meta: "English" },
  ];
  return (
    <Popover onClose={closeFlow} label="Account menu" width={320} top={64}>
      <div className="fl-menu">
        <div className="fl-menu__user">
          <img src={ficons.avatar} alt="" width="48" height="48" />
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--15">Itachi Uchiha</span>
            <span className="fl-sub">itachi.uchiha@gmail.com</span>
            <span className="fl-verified">
              <img src={ficons.check} alt="" width="12" height="12" />
              Verified · Level 2
            </span>
          </span>
        </div>
        <ul className="fl-menu__list">
          {items.map((it) => (
            <li key={it.label}>
              <button type="button" className="fl-menu__item" onClick={() => go(it.route)}>
                {it.icon ? <img className="mono" src={it.icon} alt="" width="18" height="18" /> : <span className="fl-paid">$</span>}
                <span className="fl-menu__label">{it.label}</span>
                {it.tag}
                {it.meta && <span className="hp-meta">{it.meta}</span>}
              </button>
            </li>
          ))}
        </ul>
        <hr className="fl-hr fl-hr--menu" />
        <button type="button" className="fl-menu__item is-danger" onClick={() => go("login")}>
          <img src={ficons.logout} alt="" width="18" height="18" />
          <span className="fl-menu__label">Log out</span>
        </button>
      </div>
    </Popover>
  );
}
