import React, { useLayoutEffect, useRef, useState } from "react";
import { icons, graphTools } from "../data";
import { micons } from "../marketsData";
import { CardTitle } from "./Portfolio";
import {
  ticons,
  pair,
  pairStats,
  yLabels,
  xLabels,
  X_ACTIVE,
  chartToggles,
  orderTabs,
  openOrders,
  asks,
  bids,
  bookRatio,
  AVAILABLE_USDT,
  BTC_PRICE,
  FEE_RATE,
} from "../tradeData";

// Figma plot: 773px of chart + 16px gap + 51px y-axis inside an 840px box.
const PLOT_WIDTH = 773;
const AXIS = 67;

function usePlotScale() {
  const ref = useRef(null);
  const [sx, setSx] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setSx(Math.max(0.2, (el.clientWidth - AXIS) / PLOT_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, sx];
}

const money = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PairHeader() {
  return (
    <div className="tr-head">
      <div className="tr-pair">
        <img src={pair.icon} alt="" width="32" height="32" />
        <div className="tr-pair__text">
          <span className="tr-pair__symbol">{pair.symbol}</span>
          <span className="tr-pair__name">{pair.name}</span>
        </div>
      </div>
      <div className="tr-price">
        <span className="tr-price__value">{pair.price}</span>
        <span className="tr-price__sub">
          {pair.sub} <span className="up">{pair.change}</span>
        </span>
      </div>
      <div className="tr-stats">
        {pairStats.map((s) => (
          <div key={s.label} className="tr-stat">
            <span className="tr-stat__label">{s.label}</span>
            <span className="tr-stat__value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }) {
  return (
    <button type="button" className="tr-toggle" aria-pressed={on} onClick={onChange}>
      <span className={`tr-switch${on ? " is-on" : ""}`}>
        <span className="tr-switch__knob" />
      </span>
      <span>{label}</span>
    </button>
  );
}

const RANGES = ["1M", "3M", "6M", "1Y"];

function PriceChart() {
  const [metric, setMetric] = useState("Price");
  const [kind, setKind] = useState("line");
  const [toggles, setToggles] = useState(() => Object.fromEntries(chartToggles.map((t) => [t.label, t.on])));
  const [range, setRange] = useState("1Y");
  const [tool, setTool] = useState("location");
  const [plotRef, sx] = usePlotScale();

  return (
    <div className="card tr-chart">
      <div className="tr-chart__bar">
        <div className="tr-chart__left">
          <div className="tr-seg" role="tablist" aria-label="Chart metric">
            {["Price", "Market Cap"].map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={metric === m}
                className={`tr-seg__btn${metric === m ? " is-active" : ""}`}
                onClick={() => setMetric(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="tr-seg tr-seg--icons" role="tablist" aria-label="Chart type">
            {[
              { id: "bars", icon: ticons.waterfall, label: "Bar chart" },
              { id: "line", icon: ticons.timeline, label: "Line chart" },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                role="tab"
                aria-label={k.label}
                aria-selected={kind === k.id}
                className={`tr-seg__btn tr-seg__btn--icon${kind === k.id ? " is-active" : ""}`}
                onClick={() => setKind(k.id)}
              >
                <img className="mono" src={k.icon} alt="" width="18" height="18" />
              </button>
            ))}
          </div>
        </div>
        <div className="tr-chart__right">
          {chartToggles.map((t) => (
            <Toggle
              key={t.label}
              label={t.label}
              on={toggles[t.label]}
              onChange={() => setToggles((s) => ({ ...s, [t.label]: !s[t.label] }))}
            />
          ))}
          <button
            type="button"
            className="chip dropdown tr-range"
            onClick={() => setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length])}
          >
            <span>{range}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="tr-plot" ref={plotRef} style={{ "--sx": sx }}>
        <div className="tr-plot__layer" aria-hidden="true">
          <img
            className="tr-plot__chart"
            src={ticons.chart}
            alt=""
            width="783"
            height="371"
          />
        </div>
        <img className="tr-plot__hline" src={ticons.hline} alt="" aria-hidden="true" />
        <img className="tr-plot__vline" src={ticons.vline} alt="" width="1" height="333" aria-hidden="true" />
        <img className="tr-plot__dot" src={ticons.dot} alt="" width="14" height="14" aria-hidden="true" />
        <div className="tr-tip">
          <span className="tr-tip__date">Thu, 04 Sept ‘26</span>
          <span className="tr-tip__row">
            <span className="tr-tip__value">$2.44T</span>
            <span className="tr-tip__change up">+3.45%</span>
          </span>
        </div>
        <div className="tr-plot__y">
          {yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="tr-plot__x">
          {xLabels.map((l) => (
            <span key={l} className={l === X_ACTIVE ? "is-active" : ""}>
              {l}
            </span>
          ))}
        </div>
        <div className="graph-tools tr-tools">
          {graphTools.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`graph-tools__btn${tool === t.id ? " is-active" : ""}`}
              aria-label={t.id}
              onClick={() => setTool(t.id)}
            >
              <img className="mono" src={t.icon} alt="" width="18" height="18" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [tab, setTab] = useState(orderTabs[0]);
  const rows = tab === orderTabs[0] ? openOrders : openOrders.slice(0, 3);
  const last = rows.length - 1;
  return (
    <div className="card tr-orders">
      <div className="mk-toolbar tr-orders__bar">
        <div className="mk-tabs tr-tabs" role="tablist" aria-label="Orders">
          {orderTabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              className={`mk-tab${t === tab ? " is-active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mk-filters">
          <button type="button" className="mk-chip">
            <span>USD</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
          <button type="button" className="mk-chip">
            <span>Filters</span>
            <img className="mono" src={micons.tune} alt="" width="18" height="18" />
          </button>
        </div>
      </div>
      <div className="pf-table-scroll tr-table-scroll">
        <div className="mk-table tr-table" role="table" aria-label={tab}>
          <div className="mk-row mk-row--head tr-row" role="row">
            {["Pair", "Type", "Side", "Price", "Amount", "Filed", "Total"].map((h) => (
              <span key={h} role="columnheader">
                {h}
              </span>
            ))}
            <span role="columnheader" aria-label="Actions" />
          </div>
          <div className="mk-rows">
            {rows.map((o, i) => (
              <div key={o.symbol} className={`mk-row tr-row${i === last ? " is-last" : ""}`} role="row">
                <div className="mk-cell mk-cell--coin" role="cell">
                  <img src={o.icon} alt="" width="32" height="32" />
                  <div className="pf-two">
                    <span>{o.name}</span>
                    <span className="pf-two__sub">{o.symbol}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">{o.type}</div>
                <div className={`mk-cell ${o.side === "Buy" ? "is-up" : "is-down"}`} role="cell">{o.side}</div>
                <div className="mk-cell" role="cell">{o.price}</div>
                <div className="mk-cell" role="cell">{o.amount}</div>
                <div className="mk-cell" role="cell">{o.filled}</div>
                <div className="mk-cell" role="cell">{o.total}</div>
                <div className="mk-cell mk-cell--action" role="cell">
                  <button type="button" className="icon-btn" aria-label={`More actions for ${o.name}`}>
                    <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const TICKS = 31;
const MAJOR_TICKS = new Set([0, 8, 15, 23, 30]);

function TradeForm() {
  const [side, setSide] = useState("Buy");
  const [mode, setMode] = useState("Limit");
  const [price, setPrice] = useState("0.1");
  const [pct, setPct] = useState(37);
  const [touched, setTouched] = useState(false);

  const limit = parseFloat(price) > 1 ? parseFloat(price) : BTC_PRICE;
  const spend = (AVAILABLE_USDT * pct) / 100;
  const amount = touched ? `~${(spend / limit).toFixed(4)}` : "~2.5938";
  const fee = touched ? `${money(spend * FEE_RATE)} USDT` : "12.35 USDT";

  return (
    <div className="convert tr-form" style={{ backgroundImage: `url(${icons.convertBg})` }}>
      <div className="convert__inner">
        <div className="tr-form__top">
          <div className="tabs tr-form__tabs" role="tablist">
            {["Buy", "Sell"].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={side === t}
                className={`tabs__tab${side === t ? " is-active" : ""}`}
                onClick={() => setSide(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button type="button" className="tr-select" onClick={() => setMode((m) => (m === "Limit" ? "Market" : "Limit"))}>
            <span>{mode}</span>
            <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
          </button>
        </div>

        <div className="tr-form__body">
          <div className="tr-line">
            <span className="tr-line__label">Available Balance</span>
            <span className="tr-line__value">{money(AVAILABLE_USDT)} USDT</span>
          </div>

          <div className="tr-form__fields">
            <div className="convert__fields">
              <div className="field">
                <div className="field__text">
                  <label className="field__label" htmlFor="trade-price">
                    Price
                  </label>
                  <input
                    id="trade-price"
                    className="field__value"
                    inputMode="decimal"
                    value={mode === "Market" ? "Market" : price}
                    disabled={mode === "Market"}
                    onChange={(e) => {
                      setPrice(e.target.value.replace(/[^0-9.]/g, ""));
                      setTouched(true);
                    }}
                  />
                </div>
                <span className="tr-select tr-select--field">
                  <span>USDT</span>
                  <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
                </span>
              </div>
              <div className="field field--receive">
                <div className="field__text">
                  <span className="field__label">Amount</span>
                  <span className="field__value">{amount}</span>
                </div>
                <span className="tr-select tr-select--field">
                  <span>BTC</span>
                  <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
                </span>
              </div>
              <button type="button" className="swap-btn" aria-label="Switch side" onClick={() => setSide((s) => (s === "Buy" ? "Sell" : "Buy"))}>
                <img className="mono" src={icons.swapVert} alt="" width="18" height="18" />
              </button>
            </div>

            <div className="tr-slider">
              <div className="tr-slider__track" style={{ "--pct": pct }}>
                <div className="tr-slider__ticks" aria-hidden="true">
                  {Array.from({ length: TICKS }, (_, i) => (
                    <span key={i} className={MAJOR_TICKS.has(i) ? "is-major" : ""} />
                  ))}
                </div>
                <div className="tr-slider__fill" aria-hidden="true" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pct}
                  aria-label="Share of balance"
                  onChange={(e) => {
                    setPct(Number(e.target.value));
                    setTouched(true);
                  }}
                />
              </div>
              <div className="tr-slider__labels">
                {[0, 25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPct(p);
                      setTouched(true);
                    }}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="button" className="btn-primary btn-block">
            {side} BTC
          </button>

          <div className="tr-line">
            <span className="tr-line__label">Est. Fee</span>
            <span className="tr-line__value">{fee}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookSide({ rows, kind }) {
  return (
    <div className={`tr-book__side tr-book__side--${kind}`}>
      <div className="tr-book__row tr-book__row--head">
        <span>Price (USDT)</span>
        <span>Amount (BTC)</span>
        <span>Total (BTC)</span>
      </div>
      {rows.map((r) => (
        <div key={r.price} className="tr-book__row" style={{ "--depth": `${(r.depth / 268) * 100}%` }}>
          <span className="tr-book__price">{r.price}</span>
          <span>{r.amount}</span>
          <span>{r.total}</span>
        </div>
      ))}
    </div>
  );
}

function OrderBook() {
  return (
    <div className="card tr-book">
      <CardTitle title="Order Book" />
      <BookSide rows={asks} kind="ask" />
      <div className="tr-book__last">
        <span className="tr-book__last-value">
          {pair.price}
          <img src={icons.arrowUpward} alt="" width="18" height="18" />
        </span>
        <span className="tr-book__last-sub">{pair.sub}</span>
      </div>
      <BookSide rows={bids} kind="bid" />
      <div className="tr-book__ratio">
        <div className="tr-book__ratio-side">
          <span className="tr-book__bar tr-book__bar--buy" />
          <span className="tr-book__pct up">
            <span className="tr-book__badge tr-book__badge--buy">B</span>
            {bookRatio.buy}%
          </span>
        </div>
        <div className="tr-book__ratio-side tr-book__ratio-side--sell">
          <span className="tr-book__bar tr-book__bar--sell" />
          <span className="tr-book__pct down">
            {bookRatio.sell}%
            <span className="tr-book__badge tr-book__badge--sell">S</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Trade() {
  return (
    <main className="content markets trade">
      <section className="main-col mk-col">
        <PairHeader />
        <div className="tr-main">
          <PriceChart />
          <Orders />
        </div>
      </section>
      <aside className="right-col pf-side tr-side">
        <TradeForm />
        <OrderBook />
      </aside>
    </main>
  );
}
