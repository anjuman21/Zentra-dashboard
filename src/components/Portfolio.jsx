import React, { useLayoutEffect, useRef, useState } from "react";
import { icons } from "../data";
import { openFlow } from "../flows";
import { anchorOf } from "./Modal";
import { chartStore, hiddenAssets } from "../portfolioFlowData";
import {
  picons,
  stats,
  chartMonths,
  RULER_TICKS,
  rulerMajor,
  RULER_ACTIVE_FROM,
  RULER_ACTIVE_TO,
  chartCallouts,
  assets,
  allocation,
  topHoldings,
  performance,
} from "../portfolioData";

const RANGES = ["1M", "3M", "6M", "1Y"];

// The Figma plot is 840px wide. The bars and lines stretch horizontally with the
// card; markers and tooltips move with them but keep their own size.
const PLOT_WIDTH = 840;

function usePlotScale() {
  const ref = useRef(null);
  const [state, setState] = useState({ sx: 1, width: PLOT_WIDTH });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const width = el.clientWidth;
      setState({ sx: Math.max(0.2, width / PLOT_WIDTH), width });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, state];
}

function Header() {
  return (
    <div className="pf-header">
      <div className="pf-header__text">
        <h1 className="pf-header__title">Portfolio Overview</h1>
        <p className="pf-header__sub">
          <span className="pf-desktop-only">Your overall portfolio performance and distribution</span>
          <span className="pf-mobile-only">Portfolio performance and distribution</span>
        </p>
      </div>
      <div className="pf-header__actions">
        <button type="button" className="btn-primary pf-add" aria-label="Add Assets" onClick={() => openFlow("portfolio.add")}>
          <span className="pf-btn-label">Add Assets</span>
          <img src={picons.add} alt="" width="18" height="18" />
        </button>
        <button type="button" className="pf-export" aria-label="Export" onClick={() => openFlow("portfolio.export")}>
          <span className="pf-btn-label">Export</span>
          <img className="mono" src={picons.upload} alt="" width="18" height="18" />
        </button>
      </div>
    </div>
  );
}

function Stats() {
  return (
    <div className="pf-stats">
      {stats.map((s) => (
        <div key={s.key} className={`pf-stat pf-stat--${s.key}`}>
          <div className="pf-stat__text">
            <p className="kpi__label">{s.label}</p>
            <div className="kpi__value">
              <span className="kpi__number pf-stat__number">{s.value}</span>
              <span className="kpi__change up">{s.change}</span>
            </div>
          </div>
          <img className="pf-stat__spark" src={s.spark} alt="" width="183" height="36" />
        </div>
      ))}
    </div>
  );
}

function PortfolioChart() {
  const chart = chartStore.use();
  const [plotRef, { sx, width }] = usePlotScale();

  return (
    <div className="pf-chart">
      <div className="pf-chart__header">
        <div className="pf-chart__title">
          <p className="pf-chart__label">Portfolio Chart</p>
          <div className="pf-chart__amount">
            <span className="pf-chart__value">$124,458.94</span>
            <span className="pf-chart__change up">+4.35%</span>
          </div>
        </div>
        <button
          type="button"
          className="chip dropdown"
          aria-haspopup="dialog"
          onClick={(e) => openFlow("portfolio.range", { anchor: anchorOf(e.currentTarget) })}
        >
          <span>{chart.range}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>

      <div className={`pf-plot${chart.potential ? "" : " no-potential"}${chart.volume ? "" : " no-volume"}`} ref={plotRef} style={{ "--sx": sx }}>
        <div className="pf-plot__layer" aria-hidden="true">
          <img className="pf-plot__bars" src={picons.chartBars} alt="" width="839" height="211" />
          <img className="pf-plot__line pf-plot__line--1" src={picons.lineBefore} alt="" width="283" height="79" />
          <img className="pf-plot__line pf-plot__line--2" src={picons.lineActive} alt="" width="284" height="77" />
          <img className="pf-plot__line pf-plot__line--3" src={picons.lineAfter} alt="" width="284" height="127" />
        </div>

        {chartCallouts.map((c, i) => {
          // Keep the tooltip centred on its marker, but inside the plot.
          const center = c.tipCenter * sx;
          const left = Math.min(Math.max(center - c.tipWidth / 2, 0), Math.max(width - c.tipWidth, 0));
          return (
            <React.Fragment key={c.x}>
              <img
                className="pf-marker"
                style={{ left: c.x * sx - 6, top: c.markerTop }}
                src={picons.marker}
                alt=""
                width="12"
                height="10"
              />
              <button
                type="button"
                className={`pf-tip pf-tip--btn pf-tip--${i + 1}`}
                style={{ left, "--tip-top": `${c.tipTop}px`, "--tip-top-m": `${c.tipTopMobile}px` }}
                onClick={(e) =>
                  openFlow("portfolio.avp", {
                    anchor: anchorOf(e.currentTarget),
                    actual: c.actual.replace("$", "$"),
                    potential: c.potential,
                    date: i ? "Jul 28, 2026" : "Jun 14, 2026",
                  })
                }
              >
                <span className="pf-tip__actual">Actual: {c.actual}</span>
                <span className="pf-tip__potential">Potential: {c.potential}</span>
              </button>
            </React.Fragment>
          );
        })}

        <div className="pf-dates">
          <div className="timeline__labels pf-dates__labels">
            {chartMonths.map((m) => (
              <span key={m.label} className={m.active ? "is-active" : ""}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="timeline__ruler">
            <div className="timeline__ticks pf-dates__ticks">
              {Array.from({ length: RULER_TICKS }, (_, i) => (
                <span
                  key={i}
                  className={`${rulerMajor.has(i) ? "is-major" : ""}${
                    i >= RULER_ACTIVE_FROM && i <= RULER_ACTIVE_TO ? " is-active" : ""
                  }`}
                />
              ))}
            </div>
            <div className="timeline__base" />
          </div>
        </div>
        <span className="pf-range-line" />
      </div>
    </div>
  );
}

function YourAssets() {
  const hidden = hiddenAssets.use();
  const rows = assets.filter((a) => !hidden.includes(a.symbol));
  const last = rows.length - 1;
  return (
    <div className="card pf-assets">
      <div className="tx-card__header">
        <h2 className="card-title">Your Assets</h2>
        <button type="button" className="chip view-more">
          View More
        </button>
      </div>
      <div className="tx-card__divider" />

      <div className="pf-table-scroll">
        <div className="pf-table" role="table" aria-label="Your assets">
          <div className="pf-row pf-row--head" role="row">
            <span role="columnheader">Assets</span>
            <span role="columnheader">Holding</span>
            <span role="columnheader">Value</span>
            <span role="columnheader">24h Changes</span>
            <span role="columnheader">Profit/ Loss</span>
            <span role="columnheader" aria-label="Actions" />
          </div>
          <div className="pf-rows">
            {rows.map((a, i) => {
              const up = !a.change.startsWith("-");
              const gain = !a.pnl.startsWith("-");
              return (
                <div
                  key={a.symbol}
                  className={`pf-row pf-row--btn${i === last ? " is-last" : ""}`}
                  role="row"
                  tabIndex={0}
                  onClick={() => openFlow("portfolio.asset", { symbol: a.symbol })}
                  onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && openFlow("portfolio.asset", { symbol: a.symbol })}
                >
                  <div className="pf-cell pf-cell--asset" role="cell">
                    <img src={a.icon} alt="" width="32" height="32" />
                    <div className="pf-two">
                      <span>{a.name}</span>
                      <span className="pf-two__sub">{a.symbol}</span>
                    </div>
                  </div>
                  <div className="pf-cell pf-cell--holding" role="cell">
                    <div className="pf-two">
                      <span>{a.holding}</span>
                      <span className="pf-two__sub">{a.holdingValue}</span>
                    </div>
                  </div>
                  <div className="pf-cell pf-cell--value" role="cell">
                    <div className="pf-two">
                      <span>{a.value}</span>
                      <span className="pf-two__sub">{a.share}</span>
                    </div>
                  </div>
                  <div className={`pf-cell pf-cell--change ${up ? "is-up" : "is-down"}`} role="cell">
                    {a.change}
                  </div>
                  <div className={`pf-cell pf-cell--pnl ${gain ? "is-up" : "is-down"}`} role="cell">
                    <span>{a.pnl}</span>
                    <span className="pf-cell__pct">{a.pnlPct}</span>
                  </div>
                  <div className="pf-cell pf-cell--action" role="cell">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`More actions for ${a.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFlow("portfolio.row", { symbol: a.symbol, anchor: anchorOf(e.currentTarget) });
                      }}
                    >
                      <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardTitle({ title, children, onOpen }) {
  return (
    <div className="pf-card__title">
      <h2 className="card-title">{title}</h2>
      {children || (
        <button type="button" className="pf-square" aria-label={`Open ${title}`} onClick={onOpen}>
          <img className="mono" src={picons.callMade} alt="" width="18" height="18" />
        </button>
      )}
    </div>
  );
}

export function Allocation({ title = "Assets Allocation", onOpen = () => openFlow("portfolio.alloc") }) {
  return (
    <div className="card pf-alloc">
      <CardTitle title={title} onOpen={onOpen} />
      <div className="pf-alloc__list">
        {allocation.map((col, i) => (
          <div key={i} className="pf-alloc__col">
            {col.map((r) => (
              <div key={r.label} className="pf-alloc__row">
                <span className="pf-alloc__key">
                  <img src={r.dot} alt="" width="8" height="8" />
                  {r.label}
                </span>
                <span className="pf-alloc__value" style={{ color: r.color }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pf-gauge" aria-hidden="true">
        <img className="pf-gauge__arcs" src={picons.gauge} alt="" width="269" height="124" />
        <img className="pf-gauge__ring" src={picons.gaugeRing} alt="" width="198" height="88" />
      </div>
      <div className="pf-gauge__total">
        <span className="pf-gauge__label">Total Value</span>
        <span className="pf-gauge__value">$124,458.94</span>
      </div>
    </div>
  );
}

function TopHoldings() {
  const last = topHoldings.length - 1;
  return (
    <div className="card pf-holdings">
      <CardTitle title="Top Holdings" />
      <div className="pf-hold">
        <div className="pf-hold__row pf-hold__row--head">
          <span>Asset</span>
          <span>Value</span>
          <span>Change (24h)</span>
        </div>
        {topHoldings.map((h, i) => {
          const up = !h.change.startsWith("-");
          return (
            <div key={h.symbol} className={`pf-hold__row${i === last ? " is-last" : ""}`}>
              <span className="pf-hold__asset">
                <img src={h.icon} alt="" width="18" height="18" />
                {h.symbol}
              </span>
              <span>{h.value}</span>
              <span className={up ? "up" : "down"}>{h.change}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceSummary() {
  const [range, setRange] = useState("1M");
  const cycleRange = () => setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length]);

  return (
    <div className="card pf-perf">
      <CardTitle title="Performance Summary">
        <button type="button" className="chip dropdown pf-perf__range" onClick={cycleRange}>
          <span>{range}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </CardTitle>
      <div className="pf-perf__grid">
        {performance.map((p) => (
          <div key={p.label} className="pf-metric">
            <span className="pf-metric__icon" style={{ background: p.color }}>
              <img src={p.icon} alt="" width="18" height="18" />
            </span>
            <span className="pf-metric__text">
              <span className="pf-metric__label">{p.label}</span>
              <span className={`pf-metric__value${p.positive ? " is-positive" : ""}`}>{p.value}</span>
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="pf-export pf-perf__cta">
        <span>See Full Analytics</span>
        <img className="mono" src={picons.upload} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

export default function Portfolio() {
  return (
    <main className="portfolio">
      <Header />
      <div className="content pf-content">
        <section className="main-col pf-main">
          <div className="card pf-overview">
            <Stats />
            <PortfolioChart />
          </div>
          <YourAssets />
        </section>
        <aside className="right-col pf-side">
          <Allocation />
          <TopHoldings />
          <PerformanceSummary />
        </aside>
      </div>
    </main>
  );
}
