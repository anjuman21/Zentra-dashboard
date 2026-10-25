import React, { useEffect, useRef, useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { aicons } from "../analyticsData";
import { CardTitle } from "./Portfolio";
import { Pagination } from "./Markets";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { fmtDay } from "./flows/AnalyticsFlows";
import { historyStore, historyDates, filterRows, resultCount, statusOf, SearchResults } from "./flows/HistoryFlows";
import {
  hicons,
  historyStats,
  STATUSES,
  ASSETS,
  quickStats,
  trendY,
  trendMonths,
  historyTopAssets,
} from "../historyData";

const pop = (name, props) => (e) => openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });

// A filter chip opens its menu under itself.
function FilterChip({ label, active, onClick }) {
  return (
    <button type="button" className={`pf-export hi-chip${active ? " is-active" : ""}`} aria-haspopup="dialog" onClick={onClick}>
      <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
      <span>{label}</span>
    </button>
  );
}

// "Sep 01 - Sep 07, 2026", with the year on both ends only when they differ.
const rangeLabel = ({ from, to }) => (from[0] === to[0] ? `${fmtDay(from).slice(0, 6)} - ${fmtDay(to)}` : `${fmtDay(from)} - ${fmtDay(to)}`);

const typesLabel = (types) => (!types.length ? "All Types" : types.length <= 2 ? types.join(", ") : `${types.length} types`);

// 07A · the search field, with its results dropped under it.
function SearchField() {
  const st = historyStore.use();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const off = (e) => !box.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);
  const setQuery = (query) => historyStore.set((s) => ({ ...s, query }));
  return (
    <div className={`hi-search${open && st.query.trim() ? " is-open" : ""}`} ref={box}>
      {open && st.query.trim() && <div className="nv-backdrop hi-search__backdrop" aria-hidden="true" />}
      <label className={`hi-search__field${open || st.query ? " is-focus" : ""}`}>
        <img className="mono" src={icons.search} alt="" width="18" height="18" />
        <input
          value={st.query}
          placeholder="Search by hash"
          aria-label="Search transactions"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        />
        {st.query && (
          <button type="button" className="hi-search__clear" aria-label="Clear search" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </label>
      {open && st.query.trim() && (
        <div className="hi-search__drop">
          <SearchResults
            query={st.query}
            notes={st.notes}
            onPick={(t) => {
              setOpen(false);
              openFlow("history.tx", { id: t.id });
            }}
          />
        </div>
      )}
    </div>
  );
}

function EmptyResults({ st }) {
  const what = [st.status && st.status.toLowerCase(), st.asset, st.types.length ? st.types.map((t) => t.toLowerCase() + "s").join(" or ") : "transactions"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="hi-empty">
      <span className="hi-empty__icon">
        <img className="mono" src="/assets/history.svg" alt="" width="20" height="20" />
      </span>
      <div className="hi-empty__text">
        <h3>No transactions match these filters</h3>
        <p>There are no {what} between Aug 18 – Aug 27. Try removing a filter or widening the date range.</p>
      </div>
      <div className="hi-empty__actions">
        <button type="button" className="ob-btn ob-btn--secondary" onClick={() => historyStore.set((s) => ({ ...s, types: [], asset: null, status: null }))}>
          Clear all filters
        </button>
        <button
          type="button"
          className="btn-primary ob-btn"
          onClick={() => {
            historyDates.set({ from: [2026, 5, 10], to: [2026, 8, 7], preset: "Last 90 days" });
            historyStore.set((s) => ({ ...s, status: null }));
          }}
        >
          Show last 90 days
        </button>
      </div>
    </div>
  );
}

function ActiveFilters({ st }) {
  const chips = [
    ...st.types.map((t) => [`Type: ${t}`, (s) => ({ ...s, types: s.types.filter((x) => x !== t) })]),
    st.asset && [`Asset: ${st.asset}`, (s) => ({ ...s, asset: null })],
    st.status && [`Status: ${st.status}`, (s) => ({ ...s, status: null })],
  ].filter(Boolean);
  if (!chips.length) return null;
  return (
    <div className="hi-active">
      {chips.map(([label, drop]) => (
        <span key={label} className="hi-active__chip">
          {label}
          <button type="button" aria-label={`Remove ${label}`} onClick={() => historyStore.set(drop)}>
            ×
          </button>
        </span>
      ))}
      <button type="button" className="hi-active__clear" onClick={() => historyStore.set((s) => ({ ...s, types: [], asset: null, status: null }))}>
        Clear all
      </button>
    </div>
  );
}

function Stats() {
  return (
    <div className="pf-stats mk-stats">
      {historyStats.map((s) => (
        <div key={s.key} className="pf-stat">
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

function TransactionTable({ rows, st }) {
  const last = rows.length - 1;
  return (
    <div className="pf-table-scroll hi-table-scroll">
      <div className="mk-table hi-table" role="table" aria-label="Recent transactions">
        <div className="mk-row mk-row--head hi-row" role="row">
          {["Date & Time", "Type", "Asset", "Amount", "Price (USD)", "Total (USD)", "Status"].map((h) => (
            <span key={h} role="columnheader">
              {h}
            </span>
          ))}
          <span role="columnheader" aria-label="Details" />
        </div>
        <div className="mk-rows hi-rows">
          {rows.map((t, i) => (
            <div key={t.id} className={`mk-row hi-row is-clickable${i === last ? " is-last" : ""}`} role="row" onClick={() => openFlow("history.tx", { id: t.id })}>
              <div className="mk-cell hi-date" role="cell">
                <span>{t.date}</span>
                <span className="pf-two__sub">{t.time}</span>
              </div>
              <div className={`mk-cell hi-type hi-type--${t.type.toLowerCase()}`} role="cell">
                {t.type}
              </div>
              <div className="mk-cell mk-cell--coin" role="cell">
                <img src={t.icon} alt="" width="32" height="32" />
                <span>{t.asset}</span>
              </div>
              <div className="mk-cell" role="cell">{t.amount}</div>
              <div className="mk-cell" role="cell">{t.price}</div>
              <div className="mk-cell" role="cell">{t.total}</div>
              <div className={`mk-cell hi-status hi-status--${statusOf(t, st).toLowerCase()}`} role="cell">
                {statusOf(t, st) === "Complete" ? (
                  statusOf(t, st)
                ) : (
                  <button
                    type="button"
                    className="hi-status__btn"
                    aria-haspopup="dialog"
                    onClick={(e) => {
                      e.stopPropagation();
                      pop("history.status", { id: t.id })(e);
                    }}
                  >
                    {statusOf(t, st)}
                  </button>
                )}
              </div>
              <div className="mk-cell mk-cell--action" role="cell">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Open ${t.type} ${t.asset} on ${t.date}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFlow("history.tx", { id: t.id });
                  }}
                >
                  <img className="mono" src={micons.chevronRight} alt="" width="18" height="18" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickStats() {
  return (
    <div className="card hi-quick">
      <h2 className="card-title">Quick Stats</h2>
      <div className="hi-quick__list">
        {quickStats.map((q) =>
          q.label === "Total Fees" ? (
            <button key={q.label} type="button" className="hi-quick__row is-btn" aria-haspopup="dialog" onClick={pop("history.fees")}>
              <span className="hi-quick__label">{q.label}</span>
              <span>{q.value}</span>
              <span className="down">{q.change}</span>
            </button>
          ) : (
            <div key={q.label} className="hi-quick__row">
              <span className="hi-quick__label">{q.label}</span>
              <span>{q.value}</span>
              <span className={q.change.startsWith("-") ? "down" : "up"}>{q.change}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

const RANGES = ["24H", "7D", "1M", "1Y"];

function BalanceTrend() {
  const [range, setRange] = useState("7D");
  return (
    <div className="card hi-trend">
      <div className="an-card__head an-card__head--center">
        <h2 className="card-title">Balance Trend</h2>
        <button type="button" className="chip dropdown" onClick={() => setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length])}>
          <span>{range}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="hi-trend__graph">
        <div className="hi-trend__plot">
          <img className="hi-trend__chart" src={hicons.trend} alt="" width="224" height="202" aria-hidden="true" />
          <span className="hi-trend__cursor" aria-hidden="true" />
          <img className="hi-trend__dot" src={aicons.dot} alt="" width="10" height="10" aria-hidden="true" />
          <div className="tr-tip hi-tip">
            <span className="tr-tip__date">Thu, 04 Sept ‘26</span>
            <span className="tr-tip__row">
              <span className="tr-tip__value">$2.44T</span>
              <span className="tr-tip__change up">+3.45%</span>
            </span>
          </div>
          <div className="hi-trend__months">
            {trendMonths.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <div className="hi-trend__y">
          {trendY.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopAssets() {
  const last = historyTopAssets.length - 1;
  return (
    <div className="card hi-top">
      <CardTitle title="Top Assets" />
      <div className="an-list hi-list">
        <div className="an-list__row an-list__row--head">
          <span>Assets</span>
          <span>Value (USD)</span>
          <span>Change</span>
        </div>
        {historyTopAssets.map((t, i) => (
          <div key={t.asset} className={`an-list__row${i === last ? " is-last" : ""}`}>
            <span className="an-list__asset">
              <img src={t.icon} alt="" width="18" height="18" />
              {t.asset}
            </span>
            <span>{t.value}</span>
            <span className="up">{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const st = historyStore.use();
  const dates = historyDates.use();
  const filtered = st.types.length || st.asset || st.status;
  const rows = filterRows(st);
  const total = resultCount(st, rows);

  return (
    <main className="content markets history">
      <section className="main-col mk-col">
        <div className="pf-header">
          <div className="pf-header__text">
            <h1 className="pf-header__title">Transaction History</h1>
            <p className="pf-header__sub">
              <span className="pf-desktop-only">View all your trades. deposits, withdrawals and more in one place.</span>
              <span className="pf-mobile-only">View all trades, deposits, and withdrawals in one place.</span>
            </p>
          </div>
        </div>
        <div className="card mk-main">
          <Stats />
          <div className="mk-body hi-body">
            <div className="hi-filters">
              <div className="hi-filters__group">
                <button
                  type="button"
                  className="pf-export an-date"
                  aria-haspopup="dialog"
                  onClick={pop("analytics.date", { store: historyDates, note: "Applies to your transaction list" })}
                >
                  <img className="mono" src={aicons.calendar} alt="" width="18" height="18" />
                  <span>{rangeLabel(dates)}</span>
                </button>
                <FilterChip label={typesLabel(st.types)} active={st.types.length} onClick={pop("history.types")} />
                <FilterChip label={st.asset || "All Assets"} active={st.asset} onClick={pop("history.pick", { field: "asset", all: "All Assets", options: ASSETS })} />
                <FilterChip label={st.status || "All Status"} active={st.status} onClick={pop("history.pick", { field: "status", all: "All Status", options: STATUSES })} />
              </div>
              <div className="hi-filters__end">
                <SearchField />
                <button type="button" className="pf-export hi-export" aria-haspopup="dialog" onClick={() => openFlow("history.export")}>
                  <img className="mono" src={aicons.download} alt="" width="18" height="18" />
                  <span>Export</span>
                </button>
              </div>
            </div>
            <div className="hi-title">
              <h2 className="card-title">
                Recent Transaction{filtered ? "s" : ""}
                {filtered ? <span className="hi-title__count">{total} result{total === 1 ? "" : "s"}</span> : null}
              </h2>
              <button type="button" className="mk-chip pf-mobile-only hi-mobile-filters" aria-haspopup="dialog" onClick={() => openFlow("history.filters")}>
                <span>Filters</span>
                <img className="mono" src={micons.tune} alt="" width="18" height="18" />
              </button>
            </div>
            <ActiveFilters st={st} />
            {rows.length ? <TransactionTable rows={rows} st={st} /> : <EmptyResults st={st} />}
          </div>
          {rows.length > 0 && <Pagination key={`${st.types}${st.asset}${st.status}`} total={total} />}
        </div>
      </section>
      <aside className="right-col pf-side hi-side">
        <QuickStats />
        <BalanceTrend />
        <TopAssets />
      </aside>
    </main>
  );
}
