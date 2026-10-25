import React, { useMemo, useState } from "react";
import { icons } from "../data";
import { Allocation, CardTitle } from "./Portfolio";
import {
  micons,
  marketStats,
  marketTabs,
  coins,
  TOTAL_RESULTS,
  PAGE_SIZES,
  fearGreed,
  trendingPairs,
} from "../marketsData";
import { openFlow } from "../flows";
import { anchorOf } from "./Modal";
import { marketWatch, currencyStore, filterStore, applyFilters, POPULAR_WATCH, convertPrice, mficons } from "../marketsFlowData";
import { COINS } from "../homeFlowData";
import { LineChart } from "./flows/HomeFlows";

const pct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

// Each tab is a view over the same list, so switching tabs is instant.
function coinsForTab(tab, watch) {
  switch (tab) {
    case "Watchlists":
      return coins.filter((c) => watch.includes(c.symbol));
    case "Top Gainers":
      return [...coins].filter((c) => c.change24h > 0).sort((x, y) => y.change24h - x.change24h);
    case "Top Losers":
      return [...coins].filter((c) => c.change24h < 0).sort((x, y) => x.change24h - y.change24h);
    case "New Listings":
      return coins.filter((c) => c.isNew);
    default:
      return coins;
  }
}

// 1 2 … 10 style page list (Figma shows four number slots).
function pageList(page, last) {
  if (last <= 4) return Array.from({ length: last }, (_, i) => i + 1);
  if (page <= 2) return [1, 2, "…", last];
  if (page >= last - 1) return [1, "…", last - 1, last];
  return [1, "…", page, "…", last];
}

function Header() {
  return (
    <div className="pf-header">
      <div className="pf-header__text">
        <h1 className="pf-header__title">Markets</h1>
        <p className="pf-header__sub">Explore crypto markets, prices, and trends in real time</p>
      </div>
    </div>
  );
}

// Four-up KPI strip with sparklines; other pages pass their own items.
export function Stats({ items = marketStats }) {
  return (
    <div className="pf-stats mk-stats">
      {items.map((s) => (
        <div key={s.label} className="pf-stat">
          <div className="pf-stat__text">
            <p className="kpi__label">{s.label}</p>
            <div className="kpi__value">
              <span className="kpi__number pf-stat__number">{s.value}</span>
              <span className={`kpi__change ${s.change.startsWith("-") ? "down" : "up"}`}>{s.change}</span>
            </div>
          </div>
          <img className="pf-stat__spark" src={s.spark} alt="" width="183" height="36" />
        </div>
      ))}
    </div>
  );
}

function Toolbar({ tab, onTab }) {
  const currency = currencyStore.use();
  const filters = filterStore.use();
  return (
    <div className="mk-toolbar">
      <div className="mk-tabs" role="tablist" aria-label="Market lists">
        {marketTabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            className={`mk-tab${t === tab ? " is-active" : ""}`}
            onClick={() => onTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mk-filters">
        <button type="button" className="mk-chip" aria-haspopup="dialog" onClick={(e) => openFlow("markets.currency", { anchor: anchorOf(e.currentTarget) })}>
          <span>{currency}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
        <button
          type="button"
          className={`mk-chip${filters ? " is-filtered" : ""}`}
          aria-haspopup="dialog"
          onClick={(e) => openFlow("markets.filters", { anchor: anchorOf(e.currentTarget) })}
        >
          <span>{filters ? "Filters · on" : "Filters"}</span>
          <img className="mono" src={micons.tune} alt="" width="18" height="18" />
        </button>
      </div>
    </div>
  );
}

function CoinTable({ rows }) {
  const last = rows.length - 1;
  const cur = currencyStore.use();
  const open = (symbol) => openFlow("markets.coin", { symbol });
  return (
    <div className="pf-table-scroll mk-table-scroll">
      <div className="mk-table" role="table" aria-label="Cryptocurrency prices">
        <div className="mk-row mk-row--head" role="row">
          <span role="columnheader">Coin</span>
          <span role="columnheader">Price</span>
          <span role="columnheader">24h Change %</span>
          <span role="columnheader">7D Change %</span>
          <span role="columnheader">24h Volume</span>
          <span role="columnheader">Market Cap</span>
          <span role="columnheader" aria-label="Actions" />
        </div>
        <div className="mk-rows">
          {rows.map((c, i) => (
            <div
              key={c.symbol}
              className={`mk-row mk-row--btn${i === last ? " is-last" : ""}`}
              role="row"
              tabIndex={0}
              onClick={() => open(c.symbol)}
              onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && open(c.symbol)}
            >
              <div className="mk-cell mk-cell--coin" role="cell">
                <img src={c.icon} alt="" width="32" height="32" />
                <div className="pf-two">
                  <span>{c.name}</span>
                  <span className="pf-two__sub">{c.symbol}</span>
                </div>
              </div>
              <div className="mk-cell" role="cell">{convertPrice(c.price, cur)}</div>
              <div className={`mk-cell mk-cell--change ${c.change24h < 0 ? "is-down" : "is-up"}`} role="cell">
                {pct(c.change24h)}
              </div>
              <div className={`mk-cell mk-cell--change ${c.change7d < 0 ? "is-down" : "is-up"}`} role="cell">
                {pct(c.change7d)}
              </div>
              <div className="mk-cell" role="cell">{convertPrice(c.volume, cur)}</div>
              <div className="mk-cell" role="cell">{convertPrice(c.cap, cur)}</div>
              <div className="mk-cell mk-cell--action" role="cell">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`More actions for ${c.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFlow("markets.row", { symbol: c.symbol, anchor: anchorOf(e.currentTarget) });
                  }}
                >
                  <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="mk-empty">No coins match these filters.</p>}
        </div>
      </div>
    </div>
  );
}

export function Pagination({ total }) {
  const [page, setPage] = useState(1);
  const [sizeIndex, setSizeIndex] = useState(0);
  const size = PAGE_SIZES[sizeIndex];
  const last = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, last);
  const from = total === 0 ? 0 : (current - 1) * size + 1;
  const to = Math.min(current * size, total);

  return (
    <div className="mk-pagination">
      <p className="mk-pagination__text">
        Showing {from} to {to} of {total} results
      </p>
      <nav className="mk-pages" aria-label="Pagination">
        <button
          type="button"
          className="mk-page mk-page--nav"
          aria-label="Previous page"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          <img className="mono" src={micons.chevronLeft} alt="" width="16" height="16" />
        </button>
        {pageList(current, last).map((p, i) =>
          p === "…" ? (
            <span key={`gap${i}`} className="mk-page mk-page--gap">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`mk-page${p === current ? " is-active" : ""}`}
              aria-current={p === current ? "page" : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="mk-page mk-page--nav mk-page--next"
          aria-label="Next page"
          disabled={current === last}
          onClick={() => setPage(current + 1)}
        >
          <img className="mono" src={micons.chevronRight} alt="" width="16" height="16" />
        </button>
        <button
          type="button"
          className="mk-chip mk-page-size"
          onClick={() => {
            setSizeIndex((s) => (s + 1) % PAGE_SIZES.length);
            setPage(1);
          }}
        >
          <span>{size}/ Page</span>
          <img className="mono" src={icons.arrowDown} alt="" width="16" height="16" />
        </button>
      </nav>
    </div>
  );
}

function FearGreed() {
  return (
    <button type="button" className="card mk-fg mk-fg--btn" onClick={() => openFlow("markets.fg")} aria-label="Fear and Greed Index details">
      <h2 className="card-title">
        Fear &amp; Greed Index
        <img className="mono mk-fg__info" src={mficons.info} alt="" width="16" height="16" />
      </h2>
      <img className="mk-fg__gauge" src={micons.fearGreed} alt="" width="294" height="134" />
      <div className="mk-fg__reading">
        <span className="mk-fg__value">{fearGreed.value}</span>
        <span className="mk-fg__label">{fearGreed.label}</span>
      </div>
      <p className="mk-fg__yesterday">
        <span>Yesterday:</span>
        <span className="mk-fg__yesterday-value">{fearGreed.yesterday}</span>
      </p>
    </button>
  );
}

function TrendingPairs() {
  const last = trendingPairs.length - 1;
  return (
    <div className="card pf-holdings mk-trending">
      <CardTitle title="Trending Pairs" />
      <div className="pf-hold">
        {trendingPairs.map((p, i) => (
          <div key={p.symbol} className={`pf-hold__row mk-pair${i === last ? " is-last" : ""}`}>
            <span className="pf-hold__asset">
              <img src={p.icon} alt="" width="18" height="18" />
              {p.symbol}
            </span>
            <span>{p.value}</span>
            <span className={p.change.startsWith("-") ? "down" : "up"}>{p.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 02A · first visit to Watchlists: explain, suggest, and offer to add coins.
function EmptyWatchlist({ onBrowse }) {
  const watch = marketWatch.use();
  return (
    <div className="mf-empty">
      <div className="mf-empty__card">
        <img src={mficons.empty} alt="" width="134" height="130" />
        <div className="mf-empty__text">
          <h3 className="mf-empty__title">Your watchlist is empty</h3>
          <p className="mf-empty__sub">Tap the ☆ next to any coin to track its price here. Your watchlist also appears on Home.</p>
        </div>
        <div className="mf-empty__actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={onBrowse}>
            Browse all cryptos
          </button>
          <button
            type="button"
            className="btn-primary ob-btn"
            onClick={() => openFlow("home.add-watch", { store: marketWatch, sub: "Pick the coins you want to track in Markets" })}
          >
            Add coins
          </button>
        </div>
      </div>
      <div className="mf-popular">
        <div className="mf-popular__head">
          <span className="mf-popular__title">Popular to watch</span>
          <span className="hp-meta">Based on Zentra traders</span>
        </div>
        <div className="mf-popular__grid">
          {POPULAR_WATCH.map((p, i) => {
            const c = COINS[p.coin];
            const on = watch.includes(p.coin);
            return (
              <div key={p.coin} className="mf-pop">
                <span className="mf-pop__name">
                  <img src={c.icon} alt="" width="20" height="20" />
                  {c.name}
                </span>
                <span className="mf-pop__price">{p.price}</span>
                <span className={`mf-pop__change${p.up ? " is-up" : ""}`}>{p.change}</span>
                <LineChart points={[0.3, 0.45, 0.4, 0.55, 0.5, 0.6, 0.58, 0.7, 0.66, 0.78].map((v) => (p.up ? v : 1 - v))} color={p.up ? "#48b187" : "#f82a51"} height={44} />
                <button
                  type="button"
                  className={`mf-pop__watch${on ? " is-on" : ""}`}
                  aria-pressed={on}
                  onClick={() => marketWatch.set((w) => (on ? w.filter((s) => s !== p.coin) : [...w, p.coin]))}
                >
                  {on ? "✓ Watching" : "+ Watch"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Markets() {
  const [tab, setTab] = useState(marketTabs[0]);
  const watch = marketWatch.use();
  const filters = filterStore.use();
  const rows = useMemo(() => applyFilters(coinsForTab(tab, watch), filters), [tab, watch, filters]);
  const total = tab === marketTabs[0] && !filters ? TOTAL_RESULTS : rows.length;
  const emptyWatch = tab === "Watchlists" && watch.length === 0;

  return (
    // Unlike Portfolio, the right column starts level with the page title.
    <main className="content markets">
      <section className="main-col mk-col">
        <Header />
        <div className="card mk-main">
            <Stats />
          <div className="mk-body">
            <Toolbar tab={tab} onTab={setTab} />
            {emptyWatch ? <EmptyWatchlist onBrowse={() => setTab(marketTabs[0])} /> : <CoinTable rows={rows} />}
          </div>
          {!emptyWatch && <Pagination key={tab} total={total} />}
        </div>
      </section>
      <aside className="right-col pf-side">
        <Allocation title="Market Overview" />
        <FearGreed />
        <TrendingPairs />
      </aside>
    </main>
  );
}
