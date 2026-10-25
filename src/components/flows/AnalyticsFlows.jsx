import React, { useState } from "react";
import { Drawer, Popover, CloseButton } from "../Modal";
import { Toggle } from "../Settings";
import { Row, LineChart } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { COINS } from "../../homeFlowData";

const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};

// Date range and comparison shared by every chart on the Analytics page.
export const analyticsStore = createStore({ from: [2026, 8, 1], to: [2026, 8, 7], preset: "Last 7 days", compare: null });

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = [2026, 8, 7];
const toDate = ([y, m, d]) => new Date(y, m, d);
const fromDate = (dt) => [dt.getFullYear(), dt.getMonth(), dt.getDate()];
const pad = (n) => String(n).padStart(2, "0");
export const fmtDay = ([y, m, d]) => `${SHORT[m]} ${pad(d)}, ${y}`;
const days = (a, b) => Math.round((toDate(b) - toDate(a)) / 864e5) + 1;

const PRESETS = [
  ["Today", 0],
  ["Last 7 days", 6],
  ["Last 30 days", 29],
  ["Last 90 days", 89],
  ["Year to date", null],
  ["Last 12 months", 364],
  ["All time", 1000],
  ["Custom", -1],
];

/* ───────────── 01A · Date range ───────────── */

export function DateRange({ anchor, store = analyticsStore, note = "Applies to every chart on this page" }) {
  const st = store.get();
  const [from, setFrom] = useState(st.from);
  const [to, setTo] = useState(st.to);
  const [preset, setPreset] = useState(st.preset);
  const [view, setView] = useState([st.from[0], st.from[1]]);
  const [picking, setPicking] = useState(false);

  const applyPreset = (name, back) => {
    setPreset(name);
    if (back === -1) return;
    const end = TODAY;
    const start = back === null ? [2026, 0, 1] : fromDate(new Date(toDate(end).getTime() - back * 864e5));
    setFrom(start);
    setTo(end);
    setView([start[0], start[1]]);
  };

  const click = (day) => {
    setPreset("Custom");
    if (!picking) {
      setFrom(day);
      setTo(day);
      setPicking(true);
    } else {
      if (toDate(day) < toDate(from)) {
        setTo(from);
        setFrom(day);
      } else setTo(day);
      setPicking(false);
    }
  };

  const [y, m] = view;
  const first = new Date(y, m, 1).getDay();
  const cells = Array.from({ length: 42 }, (_, i) => fromDate(new Date(y, m, i - first + 1)));
  const inRange = (d) => toDate(d) >= toDate(from) && toDate(d) <= toDate(to);
  const same = (a, b) => a.join() === b.join();
  const shift = (n) => {
    const dt = new Date(y, m + n, 1);
    setView([dt.getFullYear(), dt.getMonth()]);
  };

  return (
    <Popover onClose={closeFlow} label="Date range" anchor={anchor} width={560}>
      <div className="af-date">
        <div className="af-date__body">
          <ul className="af-presets">
            {PRESETS.map(([name, back]) => (
              <li key={name}>
                <button type="button" className={`af-preset${preset === name ? " is-on" : ""}`} onClick={() => applyPreset(name, back)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
          <div className="af-cal">
            <div className="af-cal__head">
              <button type="button" className="fl-icon-btn" aria-label="Previous month" onClick={() => shift(-1)}>
                ‹
              </button>
              <span className="fl-strong">
                {MONTHS[m]} {y}
              </span>
              <button type="button" className="fl-icon-btn" aria-label="Next month" onClick={() => shift(1)}>
                ›
              </button>
            </div>
            <div className="af-cal__grid" role="grid">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="af-cal__dow">
                  {d}
                </span>
              ))}
              {cells.map((d) => {
                const outside = d[1] !== m;
                const edge = same(d, from) || same(d, to);
                const future = toDate(d) > toDate(TODAY);
                return (
                  <button
                    key={d.join()}
                    type="button"
                    disabled={future}
                    className={`af-day${outside ? " is-out" : ""}${inRange(d) ? " is-in" : ""}${edge ? " is-edge" : ""}`}
                    onClick={() => click(d)}
                  >
                    {d[2]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="af-date__foot">
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">
              {SHORT[from[1]]} {pad(from[2])} – {SHORT[to[1]]} {pad(to[2])}, {to[0]} · {days(from, to)} day{days(from, to) === 1 ? "" : "s"}
            </span>
            <span className="fl-sub">{note}</span>
          </span>
          <button type="button" className="ob-btn ob-btn--ghost fl-btn-auto" onClick={closeFlow}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary ob-btn fl-btn-auto"
            onClick={() => {
              store.set((s) => ({ ...s, from, to, preset }));
              closeFlow();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 02A · Compare · Pick a baseline ───────────── */

export const BASELINES = [
  { key: "prev", label: "Previous period", sub: "Aug 25 – Aug 31, 2026", short: "vs previous", icon: "/assets/history.svg" },
  { key: "year", label: "Same period last year", sub: "Sep 01 – 07, 2025", short: "vs last year", icon: "/assets/i-calendar.svg" },
  { key: "btc", label: "Bitcoin (benchmark)", sub: "Buy-and-hold BTC", short: "vs Bitcoin", coin: "BTC" },
  { key: "index", label: "Market index", sub: "Top-10 crypto basket", short: "vs Index", icon: "/assets/i-autorenew.svg" },
  { key: "custom", label: "Custom range", sub: "Pick any dates", short: "vs custom", icon: "/assets/filter-tilt-shift.svg" },
];

export function CompareMenu({ anchor }) {
  const st = analyticsStore.use();
  return (
    <Popover onClose={closeFlow} label="Compare to" anchor={anchor} width={236}>
      <div className="fl-menu">
        {BASELINES.map((b) => (
          <button
            key={b.key}
            type="button"
            className={`af-base${st.compare === b.key ? " is-on" : ""}`}
            onClick={() => {
              analyticsStore.set((s) => ({ ...s, compare: s.compare === b.key ? null : b.key }));
              closeFlow();
            }}
          >
            {b.coin ? <img src={COINS[b.coin].icon} alt="" width="18" height="18" /> : <img className="mono" src={b.icon} alt="" width="16" height="16" />}
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">{b.label}</span>
              <span className="fl-sub fl-sub--11">{b.sub}</span>
            </span>
          </button>
        ))}
        {st.compare && (
          <button
            type="button"
            className="fl-menu__item fl-menu__item--sm is-danger"
            onClick={() => {
              analyticsStore.set((s) => ({ ...s, compare: null }));
              closeFlow();
            }}
          >
            <span className="fl-x">×</span>
            <span className="fl-menu__label fl-menu__label--reg">Remove comparison</span>
          </button>
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 03A · Export · Report & data ───────────── */

export function ExportMenu({ anchor }) {
  const [weekly, setWeekly] = useState(false);
  const [done, setDone] = useState(null);
  const items = [
    { key: "pdf", label: "PDF report", sub: "All charts + KPIs, ready to share", icon: "/assets/p-upload.svg" },
    { key: "csv", label: "CSV of trades", sub: "128 trades with P&L per trade", icon: "/assets/st-copy.svg" },
    { key: "png", label: "Chart images (PNG)", sub: "Each card as an image", icon: "/assets/ob-camera.svg" },
    { key: "link", label: "Copy share link", sub: "View-only, expires in 7 days", icon: "/assets/call-made.svg" },
  ];
  const run = (k) => {
    if (k === "link") navigator.clipboard?.writeText("https://zentra.app/share/an-7f3c2e").catch(() => {});
    setDone(k);
    setTimeout(() => setDone(null), 1500);
  };
  return (
    <Popover onClose={closeFlow} label="Export" anchor={anchor} width={300}>
      <div className="fl-menu">
        {items.map((it) => (
          <button key={it.key} type="button" className={`af-base${done === it.key ? " is-on" : ""}`} onClick={() => run(it.key)}>
            <img className="mono" src={it.icon} alt="" width="16" height="16" />
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">{done === it.key ? (it.key === "link" ? "Link copied" : "Downloading…") : it.label}</span>
              <span className="fl-sub fl-sub--11">{it.sub}</span>
            </span>
          </button>
        ))}
        <hr className="fl-hr fl-hr--menu" />
        <div className="af-base af-base--static">
          <img className="mono" src="/assets/ob-schedule.svg" alt="" width="16" height="16" />
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">Email weekly report</span>
            <span className="fl-sub fl-sub--11">Every Monday, 9:00 AM</span>
          </span>
          <Toggle on={weekly} onChange={setWeekly} label="Email weekly report" />
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 04A · Trades by time · Cell details ───────────── */

const SLOT = ["12 AM – 2 AM", "2 AM – 4 AM", "4 AM – 6 AM", "6 AM – 8 AM", "8 AM – 10 AM", "10 AM – 12 PM", "12 PM – 2 PM", "2 PM – 4 PM", "4 PM – 6 PM", "6 PM – 8 PM", "8 PM – 10 PM"];
const DAY = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

export function HeatCell({ anchor, day = "Wed", slot = 8, level = 5 }) {
  const trades = [1, 3, 5, 8, 11, 14][level];
  const win = [50, 55, 60, 64, 68, 71][level];
  const pnl = [4.1, 18.6, 42.3, 96.5, 151.2, 212.4][level];
  return (
    <Popover onClose={closeFlow} label="Trades in this slot" anchor={anchor} align="left" width={236}>
      <div className="af-cell">
        <span className="fl-strong fl-strong--13">
          {DAY[day]} · {SLOT[slot]}
        </span>
        <div className="fl-stack-8">
          <Row label="Trades" value={trades} />
          <Row label="Win rate" value={`${win}%`} tone="up" />
          <Row label="Net P&L" value={`+$${pnl.toFixed(2)}`} tone="up" />
          <Row label="Most traded" value={level > 2 ? "BTC/USDT" : "ETH/USDT"} />
        </div>
        <button type="button" className="hp-link fl-inline-link" onClick={() => go("history")}>
          View these {trades} trades ›
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 05A · PnL · Month breakdown ───────────── */

export function MonthBreakdown({ anchor, month = "Sep" }) {
  const name = MONTHS[SHORT.indexOf(month)] || "September";
  const seed = SHORT.indexOf(month) + 1;
  const profit = month === "Sep" ? 1642.1 : 600 + seed * 97.3;
  const loss = month === "Sep" ? 461.7 : 200 + seed * 41.1;
  const net = profit - loss;
  const trades = month === "Sep" ? 38 : 20 + seed;
  const wins = month === "Sep" ? 24 : Math.round(trades * 0.6);
  return (
    <Popover onClose={closeFlow} label={`${name} P&L`} anchor={anchor} align="left" width={300}>
      <div className="af-month">
        <div className="fl-head">
          <div className="fl-head__text">
            <span className="fl-strong fl-strong--15">{name} 2026</span>
            <span className="fl-sub">Monthly P&L summary</span>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src="/assets/hp-close.svg" alt="" width="20" height="20" />
          </button>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--13">Net P&L</span>
          <span className={`af-month__net${net < 0 ? " is-down" : ""}`}>
            {net < 0 ? "−" : "+"}${Math.abs(net).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="af-split">
            <span style={{ flex: profit }} />
            <span style={{ flex: loss }} />
          </span>
          <span className="af-split__legend">
            <span className="is-up">Profit +${profit.toFixed(2)}</span>
            <span className="is-down">Loss −${loss.toFixed(2)}</span>
          </span>
        </div>
        <div className="af-month__stats">
          {[
            [trades, "Trades"],
            [wins, "Wins"],
            [trades - wins, "Losses"],
          ].map(([v, k]) => (
            <span key={k} className="fl-stat">
              <span className="fl-stat__value">{v}</span>
              <span className="fl-sub">{k}</span>
            </span>
          ))}
        </div>
        <div className="fl-stack-8">
          <div className="af-best">
            <img src={COINS.BTC.icon} alt="" width="16" height="16" />
            <span>Best · BTC/USDT long</span>
            <b className="is-up">+$412.80</b>
          </div>
          <div className="af-best">
            <img src={COINS.AVAX.icon} alt="" width="16" height="16" />
            <span>Worst · AVAX/USDT</span>
            <b className="is-down">−$62.10</b>
          </div>
        </div>
        <button type="button" className="hp-link fl-inline-link" onClick={() => go("history")}>
          Open {name} in History ›
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Performance · Asset analytics ───────────── */

const ASSET = {
  BTC: { share: "50.2%", profit: "$1,230.45", ret: "+15.34%", trades: 46, win: "67%", realized: "+$812.10", unreal: "+$418.35", hold: "2d 6h", avg: "+$52.40 / −$27.90", fees: "$38.20" },
  ETH: { share: "27.8%", profit: "$680.21", ret: "+12.21%", trades: 31, win: "61%", realized: "+$402.66", unreal: "+$277.55", hold: "1d 14h", avg: "+$38.10 / −$22.40", fees: "$21.75" },
  SOL: { share: "13.1%", profit: "$320.14", ret: "+9.11%", trades: 24, win: "58%", realized: "+$210.00", unreal: "+$110.14", hold: "19h", avg: "+$24.30 / −$18.60", fees: "$12.10" },
};

export function AssetAnalytics({ asset = "BTC" }) {
  const sym = ["USDT", "Other"].includes(asset) ? "BTC" : asset;
  const coin = COINS[sym] || COINS.BTC;
  const d = ASSET[sym] || ASSET.BTC;
  return (
    <Drawer onClose={closeFlow} labelledBy="af-asset-title">
      <div className="fl-drawer">
        <div className="fl-drawer__scroll">
          <div className="fl-qv__head">
            <img src={coin.icon} alt="" width="32" height="32" />
            <span className="fl-qv__name">
              <span id="af-asset-title" className="fl-qv__title fl-qv__title--m">
                {coin.name}
              </span>
              <span className="fl-sub">{d.share} of your profit · Sep 01 – 07</span>
            </span>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="fl-stats fl-stats--8">
            {[
              ["Profit", d.profit, true],
              ["Return", d.ret, true],
              ["Trades", d.trades],
              ["Win rate", d.win],
            ].map(([k, v, up]) => (
              <div key={k} className="fl-stat fl-stat--lg">
                <span className="fl-sub">{k}</span>
                <span className={`fl-stat__value${up ? " is-up" : ""}`}>{v}</span>
              </div>
            ))}
          </div>
          <LineChart points={[0.05, 0.12, 0.2, 0.28, 0.35, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.86]} color="#48b187" height={110} label={`$${Math.round(parseFloat(d.profit.replace(/[$,]/g, "")) * 1.04).toLocaleString()} ${sym}`} />
          <div className="fl-rows fl-rows--8">
            <Row label="Realized P&L" value={d.realized} tone="up" />
            <Row label="Unrealized P&L" value={d.unreal} tone="up" />
            <Row label="Avg. hold time" value={d.hold} />
            <Row label="Avg. win / avg. loss" value={d.avg} />
            <Row label="Fees paid" value={d.fees} />
          </div>
        </div>
        <div className="fl-actions fl-actions--8">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("portfolio")}>
            Open in Portfolio
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => go("trade")}>
            Trade {sym}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 07A · Win rate · What it means ───────────── */

export function WinRate({ anchor }) {
  return (
    <Popover onClose={closeFlow} label="Win rate" anchor={anchor} align="left" width={340}>
      <div className="af-month">
        <div className="fl-head">
          <div className="fl-head__text">
            <span className="fl-strong fl-strong--15">Win rate · 62.45%</span>
            <span className="fl-sub">Share of closed trades that made money</span>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src="/assets/hp-close.svg" alt="" width="20" height="20" />
          </button>
        </div>
        <div className="fl-stack-8">
          <span className="af-split">
            <span style={{ flex: 80 }} />
            <span style={{ flex: 48 }} />
          </span>
          <span className="af-split__legend">
            <span className="is-up">80 wins</span>
            <span className="is-down">48 losses</span>
          </span>
        </div>
        <div className="fl-stack-8">
          <Row label="Avg. win" value="+$48.20" tone="up" />
          <Row label="Avg. loss" value="−$29.10" tone="down" />
          <Row label="Profit factor" value="2.05" />
          <Row label="vs previous 7 days" value="−1.8 pts" tone="down" />
        </div>
        <p className="mf-note">
          <img className="mono" src="/assets/ob-help.svg" alt="" width="16" height="16" />
          Shown in red because it dipped vs last week — it’s still above your 30-day average of 58%.
        </p>
      </div>
    </Popover>
  );
}

// Phones: date range and comparison live behind the ⋮ next to Export.
export function MoreMenu({ anchor }) {
  const st = analyticsStore.use();
  const base = BASELINES.find((b) => b.key === st.compare);
  return (
    <Popover onClose={closeFlow} label="Analytics options" anchor={anchor} width={240}>
      <div className="fl-menu">
        <button type="button" className="af-base" onClick={() => openFlow("analytics.date", { anchor })}>
          <img className="mono" src="/assets/i-calendar.svg" alt="" width="16" height="16" />
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">Date range</span>
            <span className="fl-sub fl-sub--11">
              {fmtDay(st.from)} – {fmtDay(st.to)}
            </span>
          </span>
        </button>
        <button type="button" className="af-base" onClick={() => openFlow("analytics.compare", { anchor })}>
          <img className="mono" src="/assets/insert-chart.svg" alt="" width="16" height="16" />
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">Compare</span>
            <span className="fl-sub fl-sub--11">{base ? base.label : "Pick a baseline"}</span>
          </span>
        </button>
      </div>
    </Popover>
  );
}
