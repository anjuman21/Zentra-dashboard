import React, { useLayoutEffect, useRef, useState } from "react";
import StatSpark from "./StatSpark";
import ChartHover, { dateAt } from "./ChartHover";
import { icons } from "../data";
import { picons, RULER_TICKS, rulerMajor } from "../portfolioData";
import {
  aicons,
  kpis,
  yAxis,
  months,
  ACTIVE_MONTH,
  RULER_ACTIVE_TICK,
  volume,
  pnlAxis,
  pnl,
  heatDays,
  heatTimes,
  heat,
  performance,
  performanceTotal,
  topAssets,
} from "../analyticsData";
import { openFlow } from "../flows";
import { anchorOf } from "./Modal";
import { analyticsStore, BASELINES, fmtDay } from "./flows/AnalyticsFlows";

const PLOT_WIDTH = 840;

function useScale(base) {
  const ref = useRef(null);
  const [sx, setSx] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setSx(Math.max(0.2, el.clientWidth / base));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [base]);
  return [ref, sx];
}

function cycle(list, value) {
  return list[(list.indexOf(value) + 1) % list.length];
}

function Header() {
  const st = analyticsStore.use();
  const base = BASELINES.find((b) => b.key === st.compare);
  const pop = (name) => (e) => openFlow(name, { anchor: anchorOf(e.currentTarget) });
  return (
    <div className="pf-header">
      <div className="pf-header__text">
        <h1 className="pf-header__title">Analytics</h1>
        <p className="pf-header__sub">
          <span className="pf-desktop-only">Track your performance, analyse trends, and make smarter trading decisions</span>
          <span className="pf-mobile-only">Track performance, analyze trends.</span>
        </p>
      </div>
      <div className="an-actions">
        <button type="button" className="pf-export an-date" aria-haspopup="dialog" onClick={pop("analytics.date")}>
          <img className="mono" src={aicons.calendar} alt="" width="18" height="18" />
          <span>
            {fmtDay(st.from)} - {fmtDay(st.to)}
          </span>
        </button>
        <button type="button" className={`pf-export an-compare${base ? " is-on" : ""}`} aria-haspopup="dialog" onClick={pop("analytics.compare")}>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          <span>{base ? base.short : "Compare to..."}</span>
        </button>
        <button type="button" className="pf-square an-more pf-mobile-only" aria-label="More options" aria-haspopup="dialog" onClick={pop("analytics.more")}>
          <img className="mono" src="/assets/more-horiz.svg" alt="" width="18" height="18" />
        </button>
        <button type="button" className="pf-export an-square" aria-label="Export" aria-haspopup="dialog" onClick={pop("analytics.export")}>
          <img className="mono" src={aicons.download} alt="" width="18" height="18" />
        </button>
      </div>
    </div>
  );
}

function Kpis() {
  return (
    <div className="pf-stats mk-stats">
      {kpis.map((k) => (
        <div
          key={k.label}
          className={`pf-stat${k.label === "Win Rate" ? " an-kpi--btn" : ""}`}
          {...(k.label === "Win Rate"
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": "Win rate details",
                onClick: (e) => openFlow("analytics.winrate", { anchor: anchorOf(e.currentTarget) }),
                onKeyDown: (e) => e.key === "Enter" && openFlow("analytics.winrate", { anchor: anchorOf(e.currentTarget) }),
              }
            : {})}
        >
          <div className="pf-stat__text">
            <p className="kpi__label">{k.label}</p>
            <div className="kpi__value">
              <span className={`kpi__number pf-stat__number an-kpi ${k.tone}`}>{k.value}</span>
            </div>
          </div>
          <StatSpark src={k.spark} value={k.value} />
        </div>
      ))}
    </div>
  );
}

const RANGES = ["24H", "7D", "1M", "1Y"];

function PerformanceChart() {
  const st = analyticsStore.use();
  const base = BASELINES.find((b) => b.key === st.compare);
  const [mode, setMode] = useState("Value");
  const [range, setRange] = useState("7D");
  const [ref, sx] = useScale(PLOT_WIDTH);

  return (
    <div className="an-perf">
      <div className="pf-chart__header">
        <div className="pf-chart__title">
          <p className="pf-chart__label">Portfolio Performance</p>
          <div className="pf-chart__amount">
            <span className="pf-chart__value">$39,551.76</span>
            <span className="pf-chart__change up">+5.33%</span>
          </div>
          {base && (
            <div className="an-cmp-legend">
              <span>
                <i className="is-you" />
                Your portfolio +5.33%
              </span>
              <span>
                <i className="is-base" />
                {base.key === "btc" ? "Bitcoin" : base.label} +2.14%
              </span>
            </div>
          )}
        </div>
        <div className="an-filters">
          <div className="tr-seg an-seg" role="tablist" aria-label="Chart mode">
            {["Value", "Performance"].map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={`tr-seg__btn${mode === m ? " is-active" : ""}`}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <button type="button" className="chip dropdown" onClick={() => setRange((r) => cycle(RANGES, r))}>
            <span>{range}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="an-graph" ref={ref} style={{ "--sx": sx }}>
        {yAxis.map((l, i) => (
          <div key={l} className="an-graph__row" style={{ top: [0, 51, 103, 154, 205][i] }}>
            <span className="an-graph__line" />
            <span className="an-graph__label">{l}</span>
          </div>
        ))}
        <div className="an-graph__volume" aria-hidden="true">
          {volume.map((h, i) => (
            <span key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="an-graph__layer" aria-hidden="true">
          <img className="an-graph__line-img" src={aicons.line} alt="" width="719" height="70" />
          {base && (
            <svg className="an-graph__base" viewBox="0 0 719 70" preserveAspectRatio="none">
              <polyline
                points="0,48 60,46 120,47 180,43 240,44 300,40 360,42 420,38 480,37 540,34 600,33 660,32 719,30"
                fill="none"
                stroke="#5720f5"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
        <span className="an-graph__cursor" aria-hidden="true" />
        <img className="an-graph__dot" src={aicons.dot} alt="" width="10" height="10" aria-hidden="true" />

        <div className="timeline an-timeline">
          <div className="timeline__labels pf-dates__labels">
            {months.map((m) => (
              <span key={m} className={m === ACTIVE_MONTH ? "is-active" : ""}>
                {m}
              </span>
            ))}
          </div>
          <div className="timeline__ruler">
            <div className="timeline__ticks pf-dates__ticks">
              {Array.from({ length: RULER_TICKS }, (_, i) => (
                <span
                  key={i}
                  className={`${rulerMajor.has(i) ? "is-major" : ""}${i === RULER_ACTIVE_TICK ? " is-active" : ""}`}
                />
              ))}
            </div>
            <div className="timeline__base" />
          </div>
        </div>
        <span className="date-pill an-pill">Tue, Sep 04 ‘26</span>
        <ChartHover
          images=".an-graph__line-img"
          colors={["#FE7701"]}
          axis=".an-graph__label"
          values={[42000, 40000, 38000, 36000, 34000]}
          span=".an-timeline"
          tipWidth={170}
          render={(h) => ({
            date: dateAt(h.frac, new Date(2026, 3, 1), new Date(2026, 9, 31)),
            rows: [
              { label: "Portfolio", color: "#FE7701", value: h.v[0] == null ? "—" : `$${Math.round(h.v[0]).toLocaleString("en-US")}` },
              { label: "vs Apr 01", value: h.v[0] == null ? "—" : `${h.v[0] >= 37550 ? "+" : "−"}${(Math.abs(h.v[0] - 37550) / 375.5).toFixed(2)}%`, tone: h.v[0] >= 37550 ? "up" : "down" },
            ],
          })}
        />
      </div>
    </div>
  );
}

function PnlChart() {
  const [currency, setCurrency] = useState("USD");
  return (
    <div className="card an-card">
      <div className="an-card__head">
        <div className="an-card__title">
          <h2 className="card-title">PnL Over Time</h2>
          <div className="legend an-legend">
            <span className="legend__item">
              <span className="an-dot an-dot--gain" />
              Profit
            </span>
            <span className="legend__item">
              <span className="an-dot an-dot--loss" />
              Loss
            </span>
          </div>
        </div>
        <button type="button" className="chip dropdown" onClick={() => setCurrency((c) => cycle(["USD", "EUR", "BTC"], c))}>
          <span>{currency}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="an-pnl">
        <div className="an-pnl__grid">
          {pnlAxis.map((l) => (
            <div key={l} className="an-pnl__row">
              <span className="an-pnl__label">{l}</span>
              <span className="an-pnl__line" />
            </div>
          ))}
          <div className="an-pnl__bars" aria-label="Profit and loss by period">
            {pnl.map(([gain, gainTone, loss, lossTone], i) => (
              <button
                key={i}
                type="button"
                className="an-pnl__col an-pnl__col--btn"
                aria-label={`P&L for ${months[Math.min(months.length - 1, Math.floor((i / pnl.length) * months.length))]}`}
                onClick={(e) => openFlow("analytics.month", { anchor: anchorOf(e.currentTarget), month: months[Math.min(months.length - 1, Math.floor((i / pnl.length) * months.length))] })}
              >
                <span className={`an-bar an-bar--up is-${gainTone}`} style={{ height: gain }} />
                <span className={`an-bar an-bar--down is-${lossTone}`} style={{ height: loss }} />
              </button>
            ))}
          </div>
        </div>
        <div className="an-pnl__months">
          {months.map((m) => (
            <span key={m} className={m === ACTIVE_MONTH ? "is-active" : ""}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TradesByTime() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="card an-card">
      <div className="an-card__head an-card__head--center">
        <h2 className="card-title">Trades by Time</h2>
        <button type="button" className="chip dropdown" onClick={() => setFilter((f) => cycle(["All", "Buy", "Sell"], f))}>
          <span>{filter}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="an-heat">
        <div className="an-heat__grid" role="img" aria-label="Number of trades by weekday and time of day">
          {heat.map((row, r) => (
            <React.Fragment key={heatDays[r]}>
              <span className="an-heat__day">{heatDays[r]}</span>
              {row.map((level, c) => (
                <button
                  key={c}
                  type="button"
                  className={`an-heat__cell an-heat__cell--btn lv-${level}`}
                  aria-label={`${heatDays[r]} slot ${c + 1}, activity ${level + 1} of 6`}
                  onClick={(e) => openFlow("analytics.cell", { anchor: anchorOf(e.currentTarget), day: heatDays[r], slot: c, level })}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="an-heat__times">
          {heatTimes.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="an-heat__range">
          <span>Low</span>
          <div className="an-heat__scale">
            {[0, 1, 2, 3, 4, 5].map((l) => (
              <span key={l} className={`an-heat__cell lv-${l}`} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

function PerformanceCard() {
  const [by, setBy] = useState("By Assets");
  return (
    <div className="card an-perfcard">
      <div className="an-card__head an-card__head--center">
        <h2 className="card-title">Performance</h2>
        <button type="button" className="chip dropdown" onClick={() => setBy((b) => cycle(["By Assets", "By Sector"], b))}>
          <span>{by}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="an-list an-list--perf">
        <div className="an-list__row an-list__row--head">
          <span>Assets</span>
          <span>Profit (USD)</span>
          <span>Return</span>
        </div>
        {performance.map((p) => (
          <div
            key={p.asset}
            className="an-list__row an-list__row--btn"
            role="button"
            tabIndex={0}
            onClick={() => openFlow("analytics.asset", { asset: p.asset })}
            onKeyDown={(e) => e.key === "Enter" && openFlow("analytics.asset", { asset: p.asset })}
          >
            <span className="an-list__asset">
              <img src={p.dot} alt="" width="8" height="8" />
              {p.asset}
            </span>
            <span>{p.profit}</span>
            <span className="up">{p.ret}</span>
          </div>
        ))}
        <div className="an-list__row an-list__row--total">
          <span>Total</span>
          <span>{performanceTotal.profit}</span>
          <span className="up">{performanceTotal.ret}</span>
        </div>
      </div>
      <div className="pf-gauge an-gauge" aria-hidden="true">
        <img className="pf-gauge__arcs" src={picons.gauge} alt="" width="269" height="124" />
        <img className="pf-gauge__ring" src={picons.gaugeRing} alt="" width="198" height="88" />
      </div>
      <div className="pf-gauge__total an-gauge__total">
        <span className="pf-gauge__label">Total Profit</span>
        <span className="pf-gauge__value">$2,450.45</span>
      </div>
    </div>
  );
}

function TopAssets() {
  const [by, setBy] = useState("By Return");
  const last = topAssets.length - 1;
  return (
    <div className="card an-top">
      <div className="an-card__head an-card__head--center">
        <h2 className="card-title">Top Assets</h2>
        <button type="button" className="chip dropdown" onClick={() => setBy((b) => cycle(["By Return", "By Profit"], b))}>
          <span>{by}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="an-list an-list--top">
        <div className="an-list__row an-list__row--head">
          <span>Assets</span>
          <span>Return</span>
          <span>Profit (USD)</span>
        </div>
        {topAssets.map((t, i) => (
          <div
            key={t.asset}
            className={`an-list__row an-list__row--btn${i === last ? " is-last" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => openFlow("analytics.asset", { asset: t.asset })}
            onKeyDown={(e) => e.key === "Enter" && openFlow("analytics.asset", { asset: t.asset })}
          >
            <span className="an-list__asset">
              <img src={t.icon} alt="" width="18" height="18" />
              {t.asset}
            </span>
            <span className="up">{t.ret}</span>
            <span>{t.profit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <main className="portfolio analytics">
      <Header />
      <div className="content pf-content">
        <section className="main-col pf-main">
          <div className="card pf-overview an-dashboard">
            <Kpis />
            <PerformanceChart />
          </div>
          <div className="an-pair">
            <PnlChart />
            <TradesByTime />
          </div>
        </section>
        <aside className="right-col pf-side">
          <PerformanceCard />
          <TopAssets />
        </aside>
      </div>
    </main>
  );
}
