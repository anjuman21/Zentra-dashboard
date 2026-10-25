import React, { useLayoutEffect, useRef, useState } from "react";
import ChartHover, { dateAt } from "./ChartHover";
import { icons, metrics, legend, yAxis, months, volumeBars, majorTicks, TICK_COUNT, graphTools, mobileChart } from "../data";

const RANGES = ["1M", "3M", "6M", "1Y"];

// In Figma the plot is 736px wide inside an 808px series (72px reserved for the
// y-axis labels). Track the live width so the lines, markers and tooltip scale
// together horizontally.
const PLOT_WIDTH = 736;
const AXIS_GUTTER = 72;

function usePlotScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setScale(Math.max(0.2, (el.clientWidth - AXIS_GUTTER) / PLOT_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, scale];
}

function Tooltip({ date, className = "" }) {
  return (
    <div className={`tooltip ${className}`}>
      <p className="tooltip__date">{date}</p>
      <div className="tooltip__rows">
        {legend.map((l) => (
          <div key={l.label} className="tooltip__row">
            <span className="tooltip__key">
              <img src={l.dot} alt="" width="8" height="8" />
              {l.label}
            </span>
            <span className={`tooltip__value tone-${l.tone}`}>{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DOT = { orange: icons.dotOrange, grey: icons.dotGrey, blue: icons.dotBlue };
// Horizontal positions are fractions of the 354px Figma plot, so the phone
// chart stretches with the screen while keeping the design's heights.
const mx = (x) => `${(x / mobileChart.width) * 100}%`;

const COLORS = ["#0379DF", "#FE7701", "#ADADAD"];
const PCT = [20, 10, 0, -10, -20];
const pct = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}%`;
// Volume reads on its own scale: the grey line spans roughly $20B–$120B.
const vol = (v) => `$${(70 + v * 2.5).toFixed(2)}B`;

function trendRows({ v }) {
  return [
    { label: "Market Cap", color: COLORS[0], value: v[0] == null ? "—" : pct(v[0]), tone: "blue" },
    { label: "BTC Price", color: COLORS[1], value: v[1] == null ? "—" : pct(v[1]), tone: "orange" },
    { label: "Volume", color: COLORS[2], value: v[2] == null ? "—" : vol(v[2]), tone: "grey" },
  ];
}

// Phones get their own chart window (Jul–Nov) from the mobile design.
function MobileGraph() {
  const { cursorX, date, tooltipDate, months: labels, ticks, majorTicks: majors, bars, dots } = mobileChart;
  return (
    <div className="m-graph" style={{ "--cx": mx(cursorX) }}>
      <div className="m-graph__plot">
        {yAxis.map((label, i) => (
          <div key={label} className="m-graph__row">
            <span className={`m-graph__grid${i === yAxis.length - 1 ? " is-base" : ""}`} />
            <span className="m-graph__label">{label}</span>
          </div>
        ))}
        <div className="m-graph__bars" aria-hidden="true">
          {bars.map((h, i) => (
            <span key={i} style={{ height: h }} />
          ))}
        </div>
        <img className="m-graph__lines" src={icons.mobileGraphLines} alt="Market cap, BTC price and volume trend lines" />
        <span className="m-graph__cursor" aria-hidden="true" />
        {dots.map(([x, y, tone]) => (
          <img key={`${x}-${y}`} className="m-graph__dot" style={{ left: `calc(${mx(x)} - 5px)`, top: y }} src={DOT[tone]} alt="" width="10" height="10" />
        ))}
      </div>
      <div className="m-graph__axis">
        <div className="m-graph__months">
          {labels.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="m-graph__ruler">
          <div className="m-graph__ticks">
            {Array.from({ length: ticks }, (_, i) => (
              <span key={i} className={majors.has(i) ? "is-major" : ""} />
            ))}
          </div>
        </div>
      </div>
      <span className="date-pill m-graph__pill">{date}</span>
      <ChartHover
        images=".m-graph__lines"
        colors={["#0379DF", "#FE7701", "#BABABA"]}
        axis=".m-graph__grid"
        values={PCT}
        span=".m-graph__months"
        tipWidth={150}
        render={(h) => ({ date: dateAt(h.frac, new Date(2026, 6, 1), new Date(2026, 10, 30)), rows: trendRows(h) })}
      />
      {/* The mobile frame keeps the desktop tooltip date while the pill shows Sep 12. */}
      <Tooltip date={tooltipDate} className="m-graph__tooltip" />
    </div>
  );
}

function Metrics() {
  return (
    <div className="kpis">
      {metrics.map((m, i) => (
        <React.Fragment key={m.label}>
          {i > 0 && <span className={`kpis__divider${i >= 4 ? " kpis__extra" : ""}`} />}
          <div className={`kpi${i >= 4 ? " kpis__extra" : ""}`}>
            <p className="kpi__label">{m.label}</p>
            <div className="kpi__value">
              <span className="kpi__number">{m.value}</span>
              <span className={m.up ? "kpi__change up" : "kpi__change down"}>{m.change}</span>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MarketTrends() {
  const [range, setRange] = useState("3M");
  const [tool, setTool] = useState("location");
  const [seriesRef, sx] = usePlotScale();

  const cycleRange = () => setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length]);

  return (
    <div className="card chart-card">
      <Metrics />

      <div className="chart">
        <div className="chart__header">
          <div className="chart__title">
            <h2 className="card-title">Market Trends</h2>
            <div className="legend">
              {legend.map((l) => (
                <span key={l.label} className="legend__item">
                  <img src={l.dot} alt="" width="8" height="8" />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="chip dropdown" onClick={cycleRange}>
            <span>{range}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>

        <div className="graph" style={{ "--sx": sx }}>
          <div className="series" ref={seriesRef}>
            {yAxis.map((label, i) => (
              <div key={label} className="series__row">
                <span className={`series__line${i === yAxis.length - 1 ? " is-base" : ""}`} />
                <span className="series__label">{label}</span>
              </div>
            ))}

            <div className="series__bars" aria-hidden="true">
              {volumeBars.map((h, i) => (
                <span key={i} style={{ height: h }} />
              ))}
            </div>

            <div className="series__lines">
              <div className="series__lines-inner">
                <img src={icons.graphLines} alt="Market cap, BTC price and volume trend lines" />
              </div>
            </div>

            <img className="series__cursor mono" src={icons.hoverLine} alt="" width="1" height="212" />
            <img className="series__dot is-cursor" style={{ "--x": 536, "--y": 51 }} src={icons.dotOrange} alt="" width="10" height="10" />
            <img className="series__dot" style={{ "--x": 727, "--y": 55 }} src={icons.dotOrange} alt="" width="10" height="10" />
            <img className="series__dot" style={{ "--x": 727, "--y": 66 }} src={icons.dotGrey} alt="" width="10" height="10" />
            <img className="series__dot is-cursor" style={{ "--x": 536, "--y": 121 }} src={icons.dotGrey} alt="" width="10" height="10" />
            <img className="series__dot is-cursor" style={{ "--x": 536, "--y": 133 }} src={icons.dotBlue} alt="" width="10" height="10" />
            <img className="series__dot" style={{ "--x": 728, "--y": 126 }} src={icons.dotBlue} alt="" width="10" height="10" />
          </div>

          <div className="timeline">
            <div className="timeline__labels">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <div className="timeline__ruler">
              <div className="timeline__ticks">
                {Array.from({ length: TICK_COUNT }, (_, i) => (
                  <span key={i} className={majorTicks.has(i) ? "is-major" : ""} />
                ))}
              </div>
              <div className="timeline__base" />
            </div>
          </div>

          <span className="date-pill">Tue, Aug 18 ‘26</span>

          <Tooltip date="Tue, Aug 18 ‘26" />
          <ChartHover
            images=".series__lines-inner img"
            colors={COLORS}
            axis=".series__line"
            values={PCT}
            span=".timeline"
            tipWidth={161}
            render={(h) => ({ date: dateAt(h.frac, new Date(2026, 3, 1), new Date(2026, 9, 7)), rows: trendRows(h) })}
          />
        </div>

        <MobileGraph />
      </div>

      <div className="graph-tools">
        {graphTools.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`graph-tools__btn${tool === t.id ? " is-active" : ""}`}
            onClick={() => setTool(t.id)}
            aria-label={t.id}
            aria-pressed={tool === t.id}
          >
            <img className={tool === t.id ? "" : "mono"} src={t.icon} alt="" width="18" height="18" />
          </button>
        ))}
      </div>
    </div>
  );
}
