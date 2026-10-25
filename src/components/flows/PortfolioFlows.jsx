import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton, anchorOf } from "../Modal";
import { Badge } from "../Help";
import { Toggle, Segmented } from "../Settings";
import { Row } from "./HomeFlows";
import { openFlow, closeFlow } from "../../flows";
import { assets } from "../../portfolioData";
import { COINS } from "../../homeFlowData";
import {
  pficons,
  chartStore,
  hiddenAssets,
  RANGES,
  OVERLAYS,
  TRACK_OPTIONS,
  EXPORT_FORMATS,
  EXPORT_PARTS,
  PERIODS,
  PERIOD_RANGE,
  GAP,
  ASSET_DETAIL,
  TARGETS,
  BY_CHAIN,
  BY_WALLET,
  ROW_ACTIONS,
} from "../../portfolioFlowData";

const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};

function Head({ id, title, sub, onBack }) {
  return (
    <div className="fl-head">
      {onBack && (
        <button type="button" className="fl-back" aria-label="Back" onClick={onBack}>
          <img className="mono" src={pficons.chevron} alt="" width="16" height="16" />
        </button>
      )}
      <div className="fl-head__text">
        <h2 id={id} className="fl-head__title">
          {title}
        </h2>
        {sub && <p className="fl-head__sub fl-muted">{sub}</p>}
      </div>
      <CloseButton onClick={closeFlow} />
    </div>
  );
}

/* ───────────── 01A · Add assets · Choose method ───────────── */

export function AddAssets() {
  return (
    <Modal onClose={closeFlow} labelledBy="pf-add-title" width={480} className="fl-pad-32">
      <div className="fl-dialog">
        <Head id="pf-add-title" title="Add assets" sub="How do you want to add to your portfolio?" />
        <section className="fl-stack-8">
          <h3 className="fl-section">Add money</h3>
          <div className="fl-tiles">
            <button type="button" className="fl-tile" onClick={() => go("trade")}>
              <span className="fl-tile__icon">
                <span className="fl-paid">$</span>
              </span>
              <span className="fl-coin__name">
                <span className="fl-strong fl-strong--15">Buy crypto</span>
                <span className="fl-sub fl-sub--13 fl-muted">Card, bank or Apple Pay · instant</span>
              </span>
            </button>
            <button type="button" className="fl-tile" onClick={() => go("deposit")}>
              <span className="fl-tile__icon">
                <img className="mono" src={pficons.download} alt="" width="18" height="18" />
              </span>
              <span className="fl-coin__name">
                <span className="fl-strong fl-strong--15">Deposit crypto</span>
                <span className="fl-sub fl-sub--13 fl-muted">Send coins from another wallet</span>
              </span>
            </button>
          </div>
        </section>
        <section className="fl-stack-8">
          <h3 className="fl-section">Track holdings you already own</h3>
          <div className="fl-options">
            {TRACK_OPTIONS.map((o) => (
              <button key={o.key} type="button" className="fl-option" onClick={() => (o.route ? go(o.route) : openFlow("portfolio.manual"))}>
                <span className="fl-tile__icon">
                  <img className="mono" src={o.icon} alt="" width="18" height="18" />
                </span>
                <span className="fl-coin__name">
                  <span className="fl-option__title">
                    <span className="fl-strong fl-strong--15">{o.title}</span>
                    {o.tag && <span className="fl-tag is-green">{o.tag}</span>}
                  </span>
                  <span className="fl-sub fl-sub--13 fl-muted">{o.sub}</span>
                </span>
                <img className="mono" src={pficons.chevron} alt="" width="16" height="16" />
              </button>
            ))}
          </div>
          <p className="fl-trust">
            <img className="mono" src={pficons.shield} alt="" width="16" height="16" />
            Connections are read-only. Zentra never moves funds without your approval.
          </p>
        </section>
      </div>
    </Modal>
  );
}

/* ───────────── 01B · Add assets · Manual transaction ───────────── */

export function ManualTransaction() {
  const [kind, setKind] = useState("Buy");
  const [coin, setCoin] = useState("BTC");
  const [qty, setQty] = useState("0.25");
  const [price, setPrice] = useState("61240.00");
  const [fee, setFee] = useState("12.40");
  const [date, setDate] = useState("2026-03-12T14:20");
  const [saved, setSaved] = useState(false);
  const c = COINS[coin];
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  const f = parseFloat(fee) || 0;
  const spent = q * p + f;
  const now = q * c.price;
  const pnl = now - spent;
  const usd = (n) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <Modal onClose={closeFlow} labelledBy="pf-manual-title" width={480} className="fl-pad-32">
      <form
        className="fl-dialog"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          setTimeout(closeFlow, 900);
        }}
      >
        <Head id="pf-manual-title" title="Add transaction" sub={`${c.name} will be added to Your Assets`} onBack={() => openFlow("portfolio.add")} />
        <Segmented options={["Buy", "Sell", "Transfer in"]} value={kind} onChange={setKind} label="Transaction type" className="fl-range" />
        <div className="fl-amountbox">
          <label className="fl-coin-select">
            <img src={c.icon} alt="" width="20" height="20" />
            <span>
              {c.name} · {coin}
            </span>
            <img className="mono" src={pficons.arrowDown} alt="" width="18" height="18" />
            <select value={coin} onChange={(e) => setCoin(e.target.value)} aria-label="Coin">
              {Object.keys(COINS).map((k) => (
                <option key={k} value={k}>
                  {COINS[k].name}
                </option>
              ))}
            </select>
          </label>
          <span className="fl-qty">
            <input value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" aria-label="Quantity" style={{ width: `${Math.max(2, qty.length) + 0.3}ch` }} />
            <span>{coin}</span>
          </span>
          <span className="fl-muted fl-sub--14r">
            ≈ {usd(q * p)} at {usd(p)} per coin
          </span>
        </div>
        <div className="fl-grid2">
          <label className="sg-field fl-field">
            <span className="fl-label">Price per coin</span>
            <span className="sg-input sg-input--sunk fl-input">
              <span>$</span>
              <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
            </span>
            <button type="button" className="hp-link fl-left" onClick={() => setPrice(c.price.toFixed(2))}>
              Use market price · {usd(c.price)}
            </button>
          </label>
          <label className="sg-field fl-field">
            <span className="fl-label">Date & time</span>
            <span className="sg-input sg-input--sunk fl-input">
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </span>
          </label>
          <label className="sg-field fl-field">
            <span className="fl-label">Fees (optional)</span>
            <span className="sg-input sg-input--sunk fl-input">
              <span>$</span>
              <input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
            </span>
          </label>
          <label className="sg-field fl-field">
            <span className="fl-label">Wallet</span>
            <span className="sg-input sg-input--sunk fl-input sg-select">
              <img className="mono" src={pficons.wallet} alt="" width="18" height="18" />
              <span className="sg-input__value">Unified Trading</span>
              <img className="mono" src={pficons.arrowDown} alt="" width="18" height="18" />
              <select defaultValue="Unified Trading" aria-label="Wallet">
                <option>Unified Trading</option>
                <option>Funding</option>
              </select>
            </span>
          </label>
        </div>
        <div className="fl-summary">
          <Row label={kind === "Sell" ? "Total received" : "Total spent"} value={usd(spent)} />
          <Row label="Value today" value={usd(now)} />
          <Row label="Unrealized P&L" value={`${pnl < 0 ? "−" : "+"}${usd(pnl)} (${spent ? `${pnl < 0 ? "−" : "+"}${Math.abs((pnl / spent) * 100).toFixed(1)}%` : "0%"})`} tone={pnl < 0 ? "down" : "up"} />
        </div>
        <div className="fl-actions fl-actions--16">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="submit" className="btn-primary ob-btn" disabled={!q || !p}>
            {saved ? "Added" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────── 02A · Export · Report options ───────────── */

export function ExportPortfolio() {
  const [format, setFormat] = useState("PDF");
  const [period, setPeriod] = useState("1Y");
  const [parts, setParts] = useState(() => Object.fromEntries(EXPORT_PARTS.map((p) => [p.key, p.on])));
  const [email, setEmail] = useState(true);
  const [state, setState] = useState("idle");
  const pages = EXPORT_PARTS.filter((p) => parts[p.key]).reduce((n, p) => n + p.pages, 0);
  const run = () => {
    setState("busy");
    setTimeout(() => setState("done"), 1200);
  };
  return (
    <Modal onClose={closeFlow} labelledBy="pf-export-title" width={480} className="fl-pad-32">
      <div className="fl-dialog fl-dialog--32">
        <div className="fl-stack-24">
          <Head id="pf-export-title" title="Export portfolio" sub="Download a report or the raw data" />
          <div className="fl-stack-8">
            <span className="fl-label">Format</span>
            <div className="fl-formats" role="radiogroup" aria-label="Format">
              {EXPORT_FORMATS.map((f) => (
                <button key={f.key} type="button" role="radio" aria-checked={format === f.key} className={`fl-format${format === f.key ? " is-on" : ""}`} onClick={() => setFormat(f.key)}>
                  <span className="fl-format__top">
                    <span className="fl-format__icon">
                      <img className="mono" src={f.icon} alt="" width="18" height="18" />
                    </span>
                    {format === f.key && (
                      <span className="fl-format__check">
                        <img src={pficons.check} alt="" width="12" height="12" />
                      </span>
                    )}
                  </span>
                  <span className="fl-format__title">{f.title}</span>
                  <span className="fl-sub">{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="fl-stack-8">
            <span className="fl-label">Period</span>
            <Segmented options={PERIODS} value={period} onChange={setPeriod} label="Period" className="fl-range" />
            <span className="fl-period">
              <img className="mono" src={pficons.calendar} alt="" width="16" height="16" />
              {PERIOD_RANGE[period]}
            </span>
          </div>
          <div className="fl-stack-8">
            <span className="fl-label">Include</span>
            <div className="fl-checklist">
              {EXPORT_PARTS.map((p) => (
                <label key={p.key} className="fl-check">
                  <input type="checkbox" checked={parts[p.key]} onChange={(e) => setParts({ ...parts, [p.key]: e.target.checked })} />
                  <span className={`fl-check__box${parts[p.key] ? " is-on" : ""}`}>{parts[p.key] && <img src={pficons.check} alt="" width="12" height="12" />}</span>
                  <span className="fl-coin__name">
                    <span className="fl-strong">{p.title}</span>
                    <span className="fl-sub fl-muted">{p.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="fl-email">
            <span className="fl-coin__name">
              <span className="fl-strong">Email me a copy</span>
              <span className="fl-sub">Sent to itachi.uchiha@gmail.com</span>
            </span>
            <Toggle on={email} onChange={setEmail} label="Email me a copy" />
          </div>
        </div>
        <div className="fl-export-foot">
          <span className="fl-muted fl-sub--13r">{state === "done" ? (email ? "Downloaded · copy sent to your email" : "Downloaded") : `~${pages} page${pages === 1 ? "" : "s"} · ready in 5s`}</span>
          <button type="button" className="ob-btn ob-btn--secondary fl-btn-auto" onClick={closeFlow}>
            {state === "done" ? "Close" : "Cancel"}
          </button>
          <button type="button" className="btn-primary ob-btn fl-btn-auto" onClick={run} disabled={!pages || state === "busy"}>
            {state === "busy" ? "Preparing…" : state === "done" ? "Export again" : `Export ${format}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 03A · Chart · Range & overlays ───────────── */

export function RangeMenu({ anchor }) {
  const chart = chartStore.use();
  return (
    <Popover onClose={closeFlow} label="Chart range" anchor={anchor} width={236}>
      <div className="fl-menu fl-menu--range">
        <ul className="fl-menu__list">
          {RANGES.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                className={`fl-menu__item${chart.range === r.key ? " is-active" : ""}`}
                aria-current={chart.range === r.key}
                onClick={() => {
                  chartStore.set({ ...chart, range: r.key });
                  closeFlow();
                }}
              >
                <span className="fl-menu__label">{r.label}</span>
                <span className="hp-meta">{r.key === "ALL" ? "ALL" : r.key}</span>
              </button>
            </li>
          ))}
        </ul>
        <hr className="fl-hr fl-hr--menu" />
        <button type="button" className="fl-menu__item">
          <span className="fl-menu__label">Custom range...</span>
          <img className="mono" src={pficons.calendar} alt="" width="16" height="16" />
        </button>
        <hr className="fl-hr fl-hr--menu" />
        <p className="fl-menu__group">CHART OVERLAYS</p>
        {OVERLAYS.map((o) => (
          <label key={o.key} className="fl-menu__item">
            <span className="fl-dot" style={{ background: o.color }} />
            <span className="fl-menu__label fl-menu__label--reg">{o.label}</span>
            <Toggle on={chart[o.key]} onChange={(v) => chartStore.set({ ...chart, [o.key]: v })} label={o.label} />
          </label>
        ))}
      </div>
    </Popover>
  );
}

/* ───────────── 04A · Chart · Actual vs Potential ───────────── */

export function ActualVsPotential({ anchor, date = "Jul 28, 2026", actual = "$12.4k", potential = "$20.9k" }) {
  return (
    <Popover onClose={closeFlow} label="Actual vs Potential" anchor={anchor} align="left" width={360}>
      <div className="fl-avp">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 className="fl-head__title">Actual vs Potential</h2>
            <p className="fl-sub fl-muted">{date}</p>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={pficons.close} alt="" width="20" height="20" />
          </button>
        </div>
        <div className="fl-avp__cards">
          <div className="fl-stat">
            <span className="fl-sub">Actual</span>
            <span className="fl-avp__value">{actual}</span>
          </div>
          <div className="fl-stat">
            <span className="fl-sub">Potential</span>
            <span className="fl-avp__value is-orange">{potential}</span>
          </div>
        </div>
        <p className="fl-avp__gap">
          <span>Missed gain</span>
          <b>−$8.5k (−40.7%)</b>
        </p>
        <p className="fl-sub fl-sub--13 fl-lh">Potential = what your portfolio would be worth if you had held your May allocation without selling.</p>
        <div className="fl-stack-8">
          <span className="fl-strong fl-strong--13">Where the gap came from</span>
          {GAP.map((g) => (
            <div key={g.text} className="fl-gap">
              <img src={COINS[g.coin].icon} alt="" width="16" height="16" />
              <span className="fl-gap__text">{g.text}</span>
              <span className="fl-gap__value">{g.value}</span>
            </div>
          ))}
        </div>
        <div className="fl-actions fl-actions--8">
          <button type="button" className="fl-soft-btn is-purple" onClick={() => go("history")}>
            View those trades
          </button>
          <button
            type="button"
            className="fl-soft-btn"
            onClick={() => {
              chartStore.set((c) => ({ ...c, potential: !c.potential }));
              closeFlow();
            }}
          >
            {chartStore.get().potential ? "Hide potential line" : "Show potential line"}
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 05A · Your Assets · Asset detail ───────────── */

const TX_ICON = { swap: pficons.swap, buy: "/assets/arrow-downward.svg", in: pficons.download };

export function AssetDetail({ symbol = "BTC" }) {
  const row = assets.find((a) => a.symbol === symbol) || assets[0];
  const coin = COINS[symbol] || COINS.BTC;
  const share = parseFloat(row.share);
  const base = ASSET_DETAIL[symbol] ?? {
    cost: row.value,
    avg: `$${(coin.price * 0.82).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    pnl: row.pnl,
    ret: row.pnlPct,
    share,
    target: Math.round(share / 5) * 5 || 5,
    wallets: [{ name: "Unified Trading", value: row.value, amount: row.holding }],
    txs: [{ kind: "buy", title: `Bought ${row.holding}`, sub: "Aug 21 · Unified Trading", value: `+${row.holding}`, up: true }],
  };
  const drift = +(base.share - base.target).toFixed(1);
  const over = drift > 0;
  return (
    <Drawer onClose={closeFlow} labelledBy="pf-asset-title">
      <div className="fl-drawer">
        <div className="fl-drawer__scroll">
          <div className="fl-qv__head">
            <img src={row.icon} alt="" width="32" height="32" />
            <span className="fl-qv__name">
              <span id="pf-asset-title" className="fl-qv__title fl-qv__title--m">
                {row.name}
              </span>
              <span className="fl-sub">
                {symbol} · {row.share} of portfolio
              </span>
            </span>
            <button type="button" className="fl-icon-btn" aria-label="More actions" onClick={(e) => openFlow("portfolio.row", { symbol, anchor: anchorOf(e.currentTarget) })}>
              <img className="mono" src={pficons.more} alt="" width="18" height="18" />
            </button>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="fl-stack-8">
            <span className="fl-qv__value fl-qv__value--32">{row.value}</span>
            <span className="fl-qv__change">
              <span className="fl-sub fl-sub--13">{row.holding}</span>
              <Badge tone={row.change.startsWith("-") ? "red" : "green"}>{row.change} 24h</Badge>
            </span>
          </div>
          <div className="fl-stats fl-stats--8">
            {[
              ["Cost basis", base.cost],
              ["Avg. buy price", base.avg],
              ["Unrealized P&L", base.pnl, !base.pnl.startsWith("-")],
              ["Return", base.ret, !base.ret.startsWith("-")],
            ].map(([k, v, up]) => (
              <div key={k} className="fl-stat fl-stat--lg">
                <span className="fl-sub">{k}</span>
                <span className={`fl-stat__value${up === true ? " is-up" : up === false ? " is-down" : ""}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="fl-target">
            <div className="fl-target__top">
              <span className="fl-sub fl-sub--13">Allocation vs target</span>
              <span className={`fl-tag ${over ? "is-orange" : "is-green"}`}>
                {over ? "Overweight" : "On target"} {over ? `+${drift}%` : ""}
              </span>
            </div>
            <span className="fl-target__bar">
              <span style={{ width: `${Math.min(100, base.share * 2)}%` }} />
              <i style={{ left: `${Math.min(100, base.target * 2)}%` }} />
            </span>
            <span className="fl-sub">
              {base.share.toFixed(2)}% now · target {base.target}% (set in Allocation)
            </span>
          </div>
          <div className="fl-stack-16">
            <span className="fl-strong fl-strong--13 fl-dim">Held in</span>
            <div className="fl-held">
              {base.wallets.map((w) => (
                <div key={w.name} className="fl-held__row">
                  <img className="mono" src={pficons.wallet} alt="" width="16" height="16" />
                  <span className="fl-strong">{w.name}</span>
                  <span className="fl-coin__price">
                    <span className="fl-strong">{w.value}</span>
                    <span className="fl-sub fl-muted">{w.amount}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="fl-stack-8">
            <div className="fl-activity__head">
              <span className="fl-strong--13">Recent transactions</span>
              <button type="button" className="hp-link" onClick={() => go("history")}>
                See all {symbol === "BTC" ? 38 : base.txs.length}
              </button>
            </div>
            {base.txs.map((t) => (
              <div key={t.title} className="fl-tx">
                <span className="fl-tx__icon">
                  <img className="mono" src={TX_ICON[t.kind]} alt="" width="16" height="16" />
                </span>
                <span className="fl-coin__name">
                  <span className="fl-strong">{t.title}</span>
                  <span className="fl-sub">{t.sub}</span>
                </span>
                <span className={`fl-strong${t.up ? " is-up" : ""}`}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fl-actions3">
          <button type="button" className="btn-primary ob-btn" onClick={() => go("trade")}>
            Buy
          </button>
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("trade")}>
            Sell
          </button>
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("home.convert-review", { from: "BTC", to: "ETH" })}>
            Convert
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 06A · Your Assets · Row actions ───────────── */

export function RowActions({ symbol = "BTC", anchor }) {
  const row = assets.find((a) => a.symbol === symbol) || assets[0];
  const run = (it) => {
    if (it.key === "hide") {
      hiddenAssets.set((h) => [...h, symbol]);
      closeFlow();
    } else if (it.key === "convert") openFlow("home.convert-review", { from: symbol === "ETH" ? "ETH" : "BTC", to: symbol === "ETH" ? "BTC" : "ETH" });
    else go(it.route);
  };
  // B / S / C shortcuts while the menu is open.
  React.useEffect(() => {
    const onKey = (e) => {
      const it = ROW_ACTIONS.find((x) => x.hint && x.hint.toLowerCase() === e.key.toLowerCase());
      if (it) run(it);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <Popover onClose={closeFlow} label={`${row.name} actions`} anchor={anchor} width={240}>
      <div className="fl-menu">
        <p className="fl-menu__title">
          <img src={row.icon} alt="" width="16" height="16" />
          {row.name} · {row.holding}
        </p>
        {ROW_ACTIONS.map((it, i) =>
          it.sep ? (
            <hr key={i} className="fl-hr fl-hr--menu" />
          ) : (
            <button key={it.key} type="button" className={`fl-menu__item fl-menu__item--sm${it.danger ? " is-danger" : ""}`} onClick={() => run(it)}>
              {it.danger ? <span className="fl-x">×</span> : <img className="mono" src={it.icon} alt="" width="16" height="16" />}
              <span className="fl-menu__label fl-menu__label--reg">{it.label}</span>
              {it.hint && <span className="hp-meta">{it.hint}</span>}
            </button>
          ),
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 07A · Allocation · Details & rebalance ───────────── */

export function AllocationDetails() {
  const [view, setView] = useState("By asset");
  const [auto, setAuto] = useState(false);
  const [edit, setEdit] = useState(false);
  const [targets, setTargets] = useState(() => Object.fromEntries(TARGETS.map((t) => [t.key, t.target])));
  const [queued, setQueued] = useState(false);
  const rows = view === "By asset" ? TARGETS.map((t) => ({ ...t, target: targets[t.key] })) : view === "By chain" ? BY_CHAIN : BY_WALLET;
  const drift = rows.reduce((n, r) => n + Math.abs(r.now - r.target), 0).toFixed(1);
  const total = Object.values(targets).reduce((a, b) => a + b, 0);
  return (
    <Modal onClose={closeFlow} labelledBy="pf-alloc-title" width={496}>
      <div className="fl-dialog">
        <Head id="pf-alloc-title" title="Assets allocation" sub="Current mix vs. your target · $124,458.94" />
        <Segmented options={["By asset", "By chain", "By wallet"]} value={view} onChange={setView} label="Group by" className="fl-range" />
        <div className="fl-alloc" role="table" aria-label="Allocation">
          <div className="fl-alloc__row fl-alloc__row--head" role="row">
            <span>Asset</span>
            <span>Current vs target</span>
            <span>Now</span>
            <span>Target</span>
            <span>Drift</span>
          </div>
          {rows.map((r) => {
            const d = +(r.now - r.target).toFixed(1);
            return (
              <div key={r.key} className="fl-alloc__row" role="row">
                <span className="fl-alloc__name">
                  {r.icon ? <img src={r.icon} alt="" width="20" height="20" /> : <span className="fl-alloc__blank" />}
                  {r.name}
                </span>
                <span className="fl-alloc__bar">
                  <span style={{ width: `${Math.min(100, r.now * 2)}%`, background: r.color }} />
                  <i style={{ left: `${Math.min(100, r.target * 2)}%` }} />
                </span>
                <span className="fl-strong fl-strong--13">{r.now}%</span>
                {edit && view === "By asset" ? (
                  <input
                    className="fl-alloc__input"
                    value={r.target}
                    inputMode="numeric"
                    aria-label={`${r.name} target`}
                    onChange={(e) => setTargets({ ...targets, [r.key]: Math.min(100, parseInt(e.target.value, 10) || 0) })}
                  />
                ) : (
                  <span className="fl-sub fl-sub--13">{r.target}%</span>
                )}
                <span className={`fl-drift${Math.abs(d) < 2 ? "" : d > 0 ? " is-over" : " is-under"}`}>
                  {d > 0 ? "+" : d < 0 ? "−" : ""}
                  {Math.abs(d)}%
                </span>
              </div>
            );
          })}
          <span className="fl-sub fl-alloc__legend">
            <i /> = your target{edit && total !== 100 ? ` · targets add up to ${total}%` : ""}
          </span>
        </div>
        <div className="fl-drifted">
          <img src={pficons.stars} alt="" width="16" height="16" className="fl-purple-icon" />
          <span className="fl-coin__name">
            <span className="fl-drifted__title">{queued ? "Rebalance queued for review" : `You’ve drifted ${drift}% from target`}</span>
            <span className="fl-sub fl-sub--13">
              Rebalancing sells 0.135 BTC and buys 1.75 ETH + 0.69 BNB. Est. fees $18.40 · no tax lots under 1 year are sold.
            </span>
          </span>
        </div>
        <div className="fl-email">
          <span className="fl-coin__name">
            <span className="fl-strong">Auto-rebalance monthly</span>
            <span className="fl-sub">Only when drift is above 5%</span>
          </span>
          <Toggle on={auto} onChange={setAuto} label="Auto-rebalance monthly" />
        </div>
        <div className="fl-actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setEdit((e) => !e)} disabled={view !== "By asset"}>
            {edit ? "Done editing" : "Edit targets"}
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => setQueued(true)} disabled={queued}>
            {queued ? "Queued" : "Review rebalance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
