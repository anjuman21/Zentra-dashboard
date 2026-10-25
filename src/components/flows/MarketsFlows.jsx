import React, { useEffect, useMemo, useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Badge } from "../Help";
import { Toggle, Segmented } from "../Settings";
import { LineChart, Row } from "./HomeFlows";
import { openFlow, closeFlow } from "../../flows";
import { COINS, SERIES, RANGE_AXIS, money } from "../../homeFlowData";
import {
  mficons,
  marketWatch,
  currencyStore,
  DEFAULT_FILTERS,
  filterStore,
  CATEGORIES,
  CAPS,
  VOLUMES,
  matchCount,
  CURRENCY_GROUPS,
  DETAIL_STATS,
  ALERT_KINDS,
  REPEAT,
  CHANNELS,
  COMPARE_ROWS,
  COMPARE_SERIES,
  FG_DRIVERS,
  FG_WEEK,
  MARKET_ROW_ACTIONS,
} from "../../marketsFlowData";

const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};
const coinOf = (symbol) => COINS[symbol] || COINS.BTC;
const toggleWatch = (symbol) => marketWatch.set((w) => (w.includes(symbol) ? w.filter((s) => s !== symbol) : [...w, symbol]));

/* ───────────── 01A · Filters ───────────── */

function RangeSlider({ min, max, onChange }) {
  // Values run from −50 to +50 (% change in 24h).
  const pos = (v) => ((v + 50) / 100) * 100;
  const bars = useMemo(() => Array.from({ length: 48 }, (_, i) => 6 + Math.round(Math.abs(Math.sin(i * 1.7) * 14 + Math.cos(i * 0.6) * 6))), []);
  return (
    <div className="mf-range">
      <div className="mf-range__bars" aria-hidden="true">
        {bars.map((h, i) => {
          const v = -50 + (i / 47) * 100;
          return <span key={i} style={{ height: h }} className={v >= min && v <= max ? "is-in" : ""} />;
        })}
      </div>
      <div className="mf-range__track">
        <span className="mf-range__fill" style={{ left: `${pos(min)}%`, right: `${100 - pos(max)}%` }} />
        <input type="range" min={-50} max={50} value={min} aria-label="Minimum 24h change" onChange={(e) => onChange(Math.min(+e.target.value, max - 1), max)} />
        <input type="range" min={-50} max={50} value={max} aria-label="Maximum 24h change" onChange={(e) => onChange(min, Math.max(+e.target.value, min + 1))} />
      </div>
      <div className="mf-range__axis">
        <span>−50%</span>
        <span>0</span>
        <span>+50%</span>
      </div>
    </div>
  );
}

export function MarketFilters({ anchor }) {
  const [f, setF] = useState(() => filterStore.get() ?? DEFAULT_FILTERS);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const n = matchCount(f);
  const toggleCat = (c) => set({ categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c] });
  return (
    <Popover onClose={closeFlow} label="Filters" anchor={anchor} width={400}>
      <div className="mf-filters">
        <div className="mf-filters__head">
          <h2 className="fl-head__title">Filters</h2>
          <button type="button" className="hp-link" onClick={() => setF(DEFAULT_FILTERS)}>
            Reset
          </button>
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Category</span>
          <div className="mf-chips">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" aria-pressed={f.categories.includes(c)} className={`mf-chip${f.categories.includes(c) ? " is-on" : ""}`} onClick={() => toggleCat(c)}>
                {f.categories.includes(c) && "✓ "}
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Market cap</span>
          <Segmented options={CAPS} value={f.cap} onChange={(cap) => set({ cap })} label="Market cap" className="fl-range" />
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">24h change</span>
          <div className="mf-minmax">
            <span className="mf-box">{f.min > 0 ? "+" : f.min < 0 ? "−" : ""}{Math.abs(f.min)}%</span>
            <span className="mf-box">{f.max > 0 ? "+" : f.max < 0 ? "−" : ""}{Math.abs(f.max)}%</span>
          </div>
          <RangeSlider min={f.min} max={f.max} onChange={(min, max) => set({ min, max })} />
        </div>
        <div className="mf-lines">
          <label className="mf-line">
            <span>Min. 24h volume</span>
            <span className="mf-select">
              {f.volume}
              <img className="mono" src={mficons.arrowDown} alt="" width="16" height="16" />
              <select value={f.volume} onChange={(e) => set({ volume: e.target.value })} aria-label="Minimum 24h volume">
                {VOLUMES.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </span>
          </label>
          <div className="mf-line">
            <span>Hide stablecoins</span>
            <Toggle on={f.hideStable} onChange={(hideStable) => set({ hideStable })} label="Hide stablecoins" />
          </div>
          <div className="mf-line">
            <span>Only coins I can trade on Zentra</span>
            <Toggle on={f.tradable} onChange={(tradable) => set({ tradable })} label="Only tradable coins" />
          </div>
        </div>
        <div className="fl-actions">
          <button
            type="button"
            className="ob-btn ob-btn--ghost"
            onClick={() => {
              filterStore.set(null);
              closeFlow();
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            className="btn-primary ob-btn"
            onClick={() => {
              filterStore.set(f);
              closeFlow();
            }}
          >
            Show {n} coin{n === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 03A · Coin row · Detail with quick trade ───────────── */

export function MarketCoin({ symbol = "BTC" }) {
  const coin = coinOf(symbol);
  const watching = marketWatch.use().includes(symbol);
  const [range, setRange] = useState("1D");
  const [side, setSide] = useState("Buy");
  const [usd, setUsd] = useState(500);
  const [done, setDone] = useState(false);
  const available = 7960.11;
  const amt = usd / coin.price;
  return (
    <Drawer onClose={closeFlow} labelledBy="mf-coin-title">
      <div className="fl-drawer">
        <div className="fl-drawer__scroll">
          <div className="fl-qv__head">
            <img src={coin.icon} alt="" width="32" height="32" />
            <span className="fl-qv__name">
              <span id="mf-coin-title" className="fl-qv__title fl-qv__title--m">
                {coin.name}
              </span>
              <span className="fl-sub">
                {symbol} · Rank #{coin.rank} · Layer 1
              </span>
            </span>
            <button type="button" className={`mf-watch${watching ? " is-on" : ""}`} aria-pressed={watching} onClick={() => toggleWatch(symbol)}>
              <img src={mficons.star} alt="" width="14" height="14" className={watching ? "fl-purple-icon" : "mono"} />
              {watching ? "Watching" : "Watch"}
            </button>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="fl-stack-8">
            <span className="fl-qv__value fl-qv__value--32">{money(coin.price, coin.price < 1 ? 4 : 2)}</span>
            <span className="fl-qv__change">
              <Badge tone={coin.change < 0 ? "red" : "green"}>
                {coin.change < 0 ? "−" : "+"}
                {Math.abs(symbol === "BTC" ? 12.34 : coin.change).toFixed(2)}% 24h
              </Badge>
              <span className="fl-sub fl-sub--13">
                H {money(coin.price * 1.013, 0)} · L {money(coin.price * 0.885, 0)}
              </span>
            </span>
          </div>
          <Segmented options={Object.keys(SERIES)} value={range} onChange={setRange} label="Chart range" className="fl-range" />
          <LineChart
            points={SERIES[range]}
            color={coin.color}
            label={money(coin.price, coin.price < 1 ? 4 : 2)}
            axis={RANGE_AXIS[range]}
            yLabels={[0.97, 0.93, 0.89, 0.85].map((x) => (coin.price > 1000 ? `$${Math.round((coin.price * x) / 1000)}k` : `$${(coin.price * x).toFixed(2)}`))}
          />
          <div className="mf-stats">
            {DETAIL_STATS.map(([k, v, tone]) => (
              <div key={k} className="fl-stat">
                <span className="fl-sub">{k}</span>
                <span className={`fl-stat__value${tone ? ` is-${tone}` : ""}`}>{symbol === "BTC" || !k.includes("Supply") ? v : `—`}</span>
              </div>
            ))}
          </div>
          <div className="fl-stack-8">
            <div className="fl-activity__head">
              <span className="fl-strong">Quick trade</span>
              <span className="hp-meta">Available {money(available)}</span>
            </div>
            <Segmented options={["Buy", "Sell"]} value={side} onChange={setSide} label="Side" className="fl-range" />
            <label className="mf-amount">
              <span className="mf-amount__row">
                $
                <input
                  value={usd}
                  inputMode="decimal"
                  aria-label="Amount in USD"
                  onChange={(e) => setUsd(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0)}
                  style={{ width: `${String(usd).length + 3}ch` }}
                />
              </span>
              <span className="fl-sub">
                ≈ {amt.toFixed(5)} {symbol}
              </span>
            </label>
            <div className="mf-presets">
              {[10, 25, 50, 100].map((p) => (
                <button key={p} type="button" className="mf-preset" onClick={() => setUsd(+((available * p) / 100).toFixed(2))}>
                  {p === 100 ? "Max" : `${p}%`}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary ob-btn"
              disabled={!usd || usd > available}
              onClick={() => {
                setDone(true);
                setTimeout(() => setDone(false), 1600);
              }}
            >
              {done ? `${side === "Buy" ? "Bought" : "Sold"} ${amt.toFixed(5)} ${symbol}` : usd > available ? "Not enough balance" : `${side} ${symbol}`}
            </button>
          </div>
        </div>
        <div className="fl-actions fl-actions--8">
          <button type="button" className="fl-soft-btn mf-foot-btn" onClick={() => openFlow("markets.alert", { symbol })}>
            <img className="mono" src={mficons.bell} alt="" width="16" height="16" />
            Set price alert
          </button>
          <button type="button" className="fl-soft-btn mf-foot-btn" onClick={() => go("trade")}>
            <img className="mono" src={mficons.open} alt="" width="16" height="16" />
            Open full page
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 04A · Row ⋮ · Quick actions ───────────── */

export function MarketRowMenu({ symbol = "BTC", anchor }) {
  const coin = coinOf(symbol);
  const watching = marketWatch.get().includes(symbol);
  const [copied, setCopied] = useState(false);
  const run = (key) => {
    if (key === "watch") {
      toggleWatch(symbol);
      closeFlow();
    } else if (key === "trade") go("trade");
    else if (key === "convert") openFlow("home.convert-review", { from: "BTC", to: "ETH" });
    else if (key === "alert") openFlow("markets.alert", { symbol });
    else if (key === "compare") openFlow("markets.compare", { a: symbol, b: symbol === "ETH" ? "BTC" : "ETH" });
    else if (key === "copy") {
      navigator.clipboard?.writeText("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599").catch(() => {});
      setCopied(true);
      setTimeout(closeFlow, 700);
    } else window.open("https://etherscan.io", "_blank", "noopener");
  };
  useEffect(() => {
    const onKey = (e) => {
      const it = MARKET_ROW_ACTIONS.find((x) => x.hint && x.hint.toLowerCase() === e.key.toLowerCase());
      if (it) run(it.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <Popover onClose={closeFlow} label={`${coin.name} actions`} anchor={anchor} width={248}>
      <div className="fl-menu">
        <p className="fl-menu__title">
          <img src={coin.icon} alt="" width="16" height="16" />
          {coin.name} · {money(coin.price, coin.price < 1 ? 4 : 2)}
        </p>
        {MARKET_ROW_ACTIONS.map((it, i) =>
          it.sep ? (
            <hr key={i} className="fl-hr fl-hr--menu" />
          ) : (
            <button key={it.key} type="button" className="fl-menu__item fl-menu__item--sm" onClick={() => run(it.key)}>
              <img className="mono" src={it.icon} alt="" width="16" height="16" />
              <span className="fl-menu__label fl-menu__label--reg">
                {it.key === "watch" && watching ? "Remove from watchlist" : it.key === "trade" ? `Trade ${symbol}` : it.key === "copy" && copied ? "Copied" : it.label}
              </span>
              {it.hint && <span className="hp-meta">{it.hint}</span>}
            </button>
          ),
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 04B · Price alert · Create ───────────── */

export function PriceAlert({ symbol = "BTC" }) {
  const coin = coinOf(symbol);
  const [kind, setKind] = useState(ALERT_KINDS[0]);
  const [target, setTarget] = useState(symbol === "BTC" ? 100000 : +(coin.price * 1.04).toFixed(2));
  const [repeat, setRepeat] = useState(REPEAT[0]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [made, setMade] = useState(false);
  const diff = ((target - coin.price) / coin.price) * 100;
  const presets = kind === "Price drops below" ? [-5, -10, -25] : [5, 10, 25];
  const pctMode = kind === "% change";
  // Mini chart: last 7 days against the alert line.
  const pts = [0.1, 0.18, 0.12, 0.25, 0.2, 0.32, 0.28, 0.4, 0.36, 0.45, 0.5];
  const lineY = Math.max(0.05, Math.min(0.95, 0.5 + diff / 10));
  return (
    <Modal onClose={closeFlow} labelledBy="mf-alert-title" width={496}>
      <div className="fl-dialog">
        <div className="fl-head">
          <img src={coin.icon} alt="" width="32" height="32" />
          <div className="fl-head__text">
            <h2 id="mf-alert-title" className="fl-head__title">
              Price alert
            </h2>
            <p className="fl-head__sub fl-muted">
              {coin.name} · now {money(coin.price, coin.price < 1 ? 4 : 2)}
            </p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <Segmented options={ALERT_KINDS} value={kind} onChange={setKind} label="Alert type" className="fl-range" />
        <div className="mf-target">
          <span className="fl-sub fl-sub--13">{pctMode ? "Change in 24h" : "Target price"}</span>
          <label className="mf-target__value">
            {!pctMode && "$"}
            <input
              value={pctMode ? Math.round(diff) : target.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              inputMode="decimal"
              aria-label="Target"
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(/[^0-9.-]/g, "")) || 0;
                setTarget(pctMode ? +(coin.price * (1 + v / 100)).toFixed(2) : v);
              }}
            />
            {pctMode && "%"}
          </label>
          <span className={`fl-tag ${diff < 0 ? "is-red" : "is-green"}`}>
            {diff >= 0 ? "+" : "−"}
            {Math.abs(diff).toFixed(2)}% from now
          </span>
          <div className="mf-presets mf-presets--center">
            {presets.map((p) => (
              <button key={p} type="button" className="mf-preset" onClick={() => setTarget(+(coin.price * (1 + p / 100)).toFixed(2))}>
                {p > 0 ? "+" : "−"}
                {Math.abs(p)}%
              </button>
            ))}
            {symbol === "BTC" && kind !== "Price drops below" && (
              <button type="button" className="mf-preset" onClick={() => setTarget(108268)}>
                ATH $108,268
              </button>
            )}
          </div>
        </div>
        <div className="mf-alert-chart">
          <div className="fl-activity__head">
            <span className="fl-sub">Last 7 days</span>
            <span className="fl-sub">Target hit 0× this week</span>
          </div>
          <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="mf-alert-chart__svg" aria-hidden="true">
            <rect x="0" y="0" width="300" height={(1 - lineY) * 90} className="mf-alert-chart__zone" />
            <line x1="0" x2="300" y1={(1 - lineY) * 90} y2={(1 - lineY) * 90} className="mf-alert-chart__line" />
            <polyline fill="none" stroke="#5720f5" strokeWidth="2" points={pts.map((p, i) => `${(i / (pts.length - 1)) * 300},${90 - p * 90}`).join(" ")} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="mf-alert-chart__label" style={{ top: `${(1 - lineY) * 100}%` }}>
            Alert at {money(target, 0)}
          </span>
        </div>
        <div className="mf-settings">
          <label className="mf-setting">
            <span>Repeat</span>
            <span className="mf-select">
              {repeat}
              <img className="mono" src={mficons.chevron} alt="" width="16" height="16" />
              <select value={repeat} onChange={(e) => setRepeat(e.target.value)} aria-label="Repeat">
                {REPEAT.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </span>
          </label>
          <label className="mf-setting">
            <span>Notify me via</span>
            <span className="mf-select">
              {channel}
              <img className="mono" src={mficons.chevron} alt="" width="16" height="16" />
              <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Notify me via">
                {CHANNELS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <div className="fl-actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary ob-btn"
            onClick={() => {
              setMade(true);
              setTimeout(closeFlow, 900);
            }}
          >
            {made ? "Alert created" : "Create alert"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 04C · Compare · Side by side ───────────── */

const PALETTE = ["#f7931a", "#627eea", "#9945ff", "#f3ba2f"];

export function CompareCoins({ a = "BTC", b = "ETH" }) {
  const [list, setList] = useState([a, b]);
  const [adding, setAdding] = useState(false);
  const options = Object.keys(COMPARE_SERIES).filter((s) => !list.includes(s));
  const last = (s) => COMPARE_SERIES[s][COMPARE_SERIES[s].length - 1];
  const pctOf = (s) => `+${(last(s) * 25).toFixed(1)}%`;
  const w = 300;
  const h = 100;
  return (
    <Modal onClose={closeFlow} labelledBy="mf-cmp-title" width={496}>
      <div className="fl-dialog">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="mf-cmp-title" className="fl-head__title">
              Compare coins
            </h2>
            <p className="fl-head__sub fl-muted">Normalized performance · last 30 days</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="mf-cmp-chips">
          {list.map((s) => (
            <span key={s} className="mf-cmp-chip">
              <img src={coinOf(s).icon} alt="" width="16" height="16" />
              {coinOf(s).name}
              {list.length > 2 && (
                <button type="button" aria-label={`Remove ${s}`} onClick={() => setList((l) => l.filter((x) => x !== s))}>
                  ×
                </button>
              )}
            </span>
          ))}
          {list.length < 4 &&
            (adding ? (
              options.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="mf-cmp-chip mf-cmp-chip--add"
                  onClick={() => {
                    setList((l) => [...l, s]);
                    setAdding(false);
                  }}
                >
                  + {s}
                </button>
              ))
            ) : (
              <button type="button" className="mf-cmp-chip mf-cmp-chip--add" onClick={() => setAdding(true)}>
                + Add coin
              </button>
            ))}
        </div>
        <div className="mf-cmp-chart">
          <p className="mf-cmp-legend">
            {list.map((s, i) => (
              <span key={s}>
                <i style={{ background: PALETTE[i] }} />
                {s} {pctOf(s)}
              </span>
            ))}
          </p>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-label="Normalized performance chart" role="img">
            {[0.1, 0.5, 0.9].map((g) => (
              <line key={g} x1="0" x2={w} y1={g * h} y2={g * h} className="fl-chart__grid" />
            ))}
            {list.map((s, i) => (
              <polyline
                key={s}
                fill="none"
                stroke={PALETTE[i]}
                strokeWidth="2"
                strokeDasharray={i ? "4 3" : undefined}
                vectorEffect="non-scaling-stroke"
                points={COMPARE_SERIES[s].map((p, j) => `${(j / (COMPARE_SERIES[s].length - 1)) * w},${h - p * h}`).join(" ")}
              />
            ))}
          </svg>
          <span className="fl-chart__x">
            {["Sep 16", "Sep 23", "Sep 30", "Oct 07", "Oct 15"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </span>
        </div>
        <div className="mf-cmp-table" role="table" aria-label="Comparison" style={{ "--cols": list.length }}>
          <div className="mf-cmp-row mf-cmp-row--head" role="row">
            <span>Metric</span>
            {list.map((s) => (
              <span key={s} className="mf-cmp-coin">
                <img src={coinOf(s).icon} alt="" width="16" height="16" />
                {coinOf(s).name}
              </span>
            ))}
          </div>
          {COMPARE_ROWS.map((r) => (
            <div key={r.label} className="mf-cmp-row" role="row">
              <span className="fl-sub fl-sub--13">{r.label}</span>
              {list.map((s) => {
                const v = r.values[s];
                const tone = /^\+/.test(v) ? " is-up" : /^−/.test(v) ? " is-down" : "";
                return (
                  <span key={s} className={`fl-strong fl-strong--13${tone}`}>
                    {v}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="fl-actions">
          <button
            type="button"
            className="ob-btn ob-btn--secondary"
            onClick={() => {
              marketWatch.set((w2) => [...w2, ...list.filter((s) => !w2.includes(s))]);
              closeFlow();
            }}
          >
            Add {list.length === 2 ? "both" : "all"} to watchlist
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => go("trade")}>
            Trade {list[1]}/{list[0]}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 05A · Currency · Switch quote currency ───────────── */

export function CurrencyMenu({ anchor }) {
  const current = currencyStore.use();
  const [q, setQ] = useState("");
  const groups = CURRENCY_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((c) => !q || `${c.code} ${c.name}`.toLowerCase().includes(q.toLowerCase())),
  })).filter((g) => g.items.length);
  return (
    <Popover onClose={closeFlow} label="Quote currency" anchor={anchor} width={280}>
      <div className="fl-menu">
        <label className="fl-search mf-cur-search">
          <img className="mono" src={mficons.search} alt="" width="16" height="16" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search currency" aria-label="Search currency" autoFocus />
        </label>
        {groups.map((g) => (
          <React.Fragment key={g.title}>
            <p className="fl-menu__group">{g.title}</p>
            {g.items.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`mf-cur${current === c.code ? " is-active" : ""}`}
                aria-current={current === c.code}
                onClick={() => {
                  currencyStore.set(c.code);
                  closeFlow();
                }}
              >
                <span className="mf-cur__sym">{c.symbol}</span>
                <span className="fl-coin__name">
                  <span className="fl-strong fl-strong--13">{c.code}</span>
                  <span className="fl-sub fl-sub--11">{c.name}</span>
                </span>
              </button>
            ))}
          </React.Fragment>
        ))}
        {groups.length === 0 && <p className="nv-empty">No currency matches “{q}”.</p>}
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Fear & Greed · Explainer ───────────── */

function Gauge({ value }) {
  // Five bands across a 180° arc, with a dot at the reading.
  const bands = ["#f82a51", "#fe7701", "#d9d9d9", "#a7dcc5", "#48b187"];
  const r = 80;
  const cx = 100;
  const cy = 96;
  const arc = (from, to) => {
    const a0 = Math.PI * (1 - from);
    const a1 = Math.PI * (1 - to);
    return `M${cx + r * Math.cos(a0)},${cy - r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy - r * Math.sin(a1)}`;
  };
  const a = Math.PI * (1 - value / 100);
  return (
    <svg viewBox="0 0 200 110" className="mf-gauge" aria-hidden="true">
      {bands.map((c, i) => (
        <path key={c} d={arc(i / 5 + 0.012, (i + 1) / 5 - 0.012)} stroke={c} strokeWidth="14" fill="none" />
      ))}
      <circle cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)} r="5" fill="#191919" stroke="#fff" strokeWidth="2" className="mf-gauge__dot" />
    </svg>
  );
}

export function FearGreedExplainer() {
  const avg = Math.round(FG_WEEK.reduce((n, d) => n + d.v, 0) / FG_WEEK.length);
  return (
    <Modal onClose={closeFlow} labelledBy="mf-fg-title" width={352}>
      <div className="fl-dialog mf-fg">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="mf-fg-title" className="fl-head__title fl-head__title--18">
              Fear &amp; Greed Index
            </h2>
            <p className="fl-sub fl-muted">Updated 5 min ago · 0 = extreme fear, 100 = extreme greed</p>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={mficons.close} alt="" width="20" height="20" />
          </button>
        </div>
        <div className="mf-fg__gauge">
          <Gauge value={68} />
          <div className="mf-fg__reading">
            <span className="mf-fg__value">68</span>
            <span className="mf-fg__label">Greed</span>
            <span className="fl-sub fl-sub--11">+6 vs yesterday</span>
          </div>
          <span className="mf-fg__ends">
            <span>Extreme fear</span>
            <span>Extreme greed</span>
          </span>
        </div>
        <div className="fl-stack-8">
          <span className="fl-strong fl-strong--13">What’s driving it</span>
          {FG_DRIVERS.map((d) => (
            <Row key={d.label} label={d.label} value={<span className={`mf-tone is-${d.tone}`}>{d.value}</span>} />
          ))}
        </div>
        <div className="fl-stack-8">
          <div className="fl-activity__head">
            <span className="fl-strong fl-strong--13">Last 7 days</span>
            <span className="hp-meta">Avg {avg}</span>
          </div>
          <div className="mf-week">
            {FG_WEEK.map((d, i) => (
              <span key={d.d} className={`mf-week__day${i === FG_WEEK.length - 1 ? " is-today" : ""}`}>
                <span className="mf-week__bar">
                  <span style={{ height: `${d.v}%` }}>{d.v}</span>
                </span>
                {d.d}
              </span>
            ))}
          </div>
        </div>
        <p className="mf-note">
          <img className="mono" src={mficons.info} alt="" width="16" height="16" />
          High greed has often come before short-term pullbacks. This is context, not financial advice.
        </p>
      </div>
    </Modal>
  );
}
