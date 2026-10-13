import React, { useMemo, useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { aicons } from "../analyticsData";
import { CardTitle } from "./Portfolio";
import { Pagination } from "./Markets";
import {
  hicons,
  historyStats,
  TYPES,
  STATUSES,
  ASSETS,
  transactions,
  quickStats,
  trendY,
  trendMonths,
  historyTopAssets,
} from "../historyData";

// A filter chip cycles through "All …" and each option.
function FilterChip({ allLabel, options, value, onChange }) {
  const list = [null, ...options];
  const next = () => onChange(list[(list.indexOf(value) + 1) % list.length]);
  return (
    <button type="button" className="pf-export hi-chip" onClick={next} aria-label={`Filter: ${value || allLabel}`}>
      <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
      <span>{value || allLabel}</span>
    </button>
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

function TransactionTable({ rows }) {
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
            <div key={`${t.date}${t.time}`} className={`mk-row hi-row${i === last ? " is-last" : ""}`} role="row">
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
              <div className={`mk-cell hi-status hi-status--${t.status.toLowerCase()}`} role="cell">
                {t.status}
              </div>
              <div className="mk-cell mk-cell--action" role="cell">
                <button type="button" className="icon-btn" aria-label={`Open ${t.type} ${t.asset} on ${t.date}`}>
                  <img className="mono" src={micons.chevronRight} alt="" width="18" height="18" />
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="mk-empty">No transactions match these filters.</p>}
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
        {quickStats.map((q) => (
          <div key={q.label} className="hi-quick__row">
            <span className="hi-quick__label">{q.label}</span>
            <span>{q.value}</span>
            <span className={q.change.startsWith("-") ? "down" : "up"}>{q.change}</span>
          </div>
        ))}
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
  const [type, setType] = useState(null);
  const [asset, setAsset] = useState(null);
  const [status, setStatus] = useState(null);
  const filtered = type || asset || status;

  const rows = useMemo(
    () =>
      transactions.filter(
        (t) => (!type || t.type === type) && (!asset || t.asset === asset) && (!status || t.status === status),
      ),
    [type, asset, status],
  );

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
                <button type="button" className="pf-export an-date">
                  <img className="mono" src={aicons.calendar} alt="" width="18" height="18" />
                  <span>Sep 01, 2026 - Sep 07, 2026</span>
                </button>
                <FilterChip allLabel="All Types" options={TYPES} value={type} onChange={setType} />
                <FilterChip allLabel="All Assets" options={ASSETS} value={asset} onChange={setAsset} />
                <FilterChip allLabel="All Status" options={STATUSES} value={status} onChange={setStatus} />
              </div>
              <button type="button" className="pf-export hi-export">
                <span>Export</span>
                <img className="mono" src={aicons.download} alt="" width="18" height="18" />
              </button>
            </div>
            <div className="hi-title">
              <h2 className="card-title">Recent Transaction</h2>
              <button type="button" className="mk-chip pf-mobile-only hi-mobile-filters">
                <span>Filters</span>
                <img className="mono" src={micons.tune} alt="" width="18" height="18" />
              </button>
            </div>
            <TransactionTable rows={rows} />
          </div>
          <Pagination key={`${type}${asset}${status}`} total={filtered ? rows.length : 100} />
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
