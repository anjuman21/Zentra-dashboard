import React, { useMemo, useState } from "react";
import { icons } from "../data";
import { picons } from "../portfolioData";
import { micons } from "../marketsData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { SectionHead, ViewAll } from "./YieldFarming";
import { auicons, autoStats, SORTS, automations, health, executions } from "../autoData";

function sortRows(rows, sort) {
  switch (sort) {
    case "Next Run":
      return [...rows].sort((x, y) => x.order - y.order);
    case "Name":
      return [...rows].sort((x, y) => x.name.localeCompare(y.name));
    case "Status":
      return [...rows].sort((x, y) => (x.status === y.status ? 0 : x.status === "Active" ? -1 : 1));
    default:
      return rows;
  }
}

function Header({ sort, onSort }) {
  return (
    <div className="pf-header">
      <div className="pf-header__text">
        <h1 className="pf-header__title">Automations</h1>
        <p className="pf-header__sub">
          <span className="pf-desktop-only">Set rule to automate your trading and portfolio tasks.</span>
          <span className="pf-mobile-only">Automate trading tasks.</span>
        </p>
      </div>
      <div className="pf-header__actions">
        <button type="button" className="btn-primary pf-add" aria-label="Create Automation">
          <span className="pf-btn-label">Create Automation</span>
          <img src={picons.add} alt="" width="18" height="18" />
        </button>
        <button
          type="button"
          className="pf-export au-sort"
          aria-label={`Sort by: ${sort}`}
          onClick={() => onSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])}
        >
          <span className="pf-btn-label">
            Sort by: <span className="au-sort__value">{sort}</span>
          </span>
          <img className="mono pf-desktop-only" src={icons.arrowDown} alt="" width="18" height="18" />
          <img className="mono pf-mobile-only" src={micons.tune} alt="" width="18" height="18" />
        </button>
      </div>
    </div>
  );
}

function AutomationTable({ rows, onToggle }) {
  const last = rows.length - 1;
  return (
    <div className="mk-body au-list">
      <SectionHead title="My Automations">
        <ViewAll />
      </SectionHead>
      <div className="pf-table-scroll au-table-scroll">
        <div className="mk-table au-table" role="table" aria-label="My automations">
          <div className="mk-row mk-row--head au-row" role="row">
            {["Name", "Trigger/Condition", "Action", "Asset/ pair", "Status", "Next Run"].map((h) => (
              <span key={h} role="columnheader">
                {h}
              </span>
            ))}
            <span role="columnheader" aria-label="Actions" />
          </div>
          <div className="mk-rows au-rows">
            {rows.map((r, i) => (
              <div key={r.name} className={`mk-row au-row${i === last ? " is-last" : ""}`} role="row">
                <div className="mk-cell mk-cell--coin" role="cell">
                  <img src={r.icon} alt="" width="32" height="32" />
                  <div className="pf-two">
                    <span>{r.name}</span>
                    <span className="pf-two__sub">{r.desc}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span>{r.trigger}</span>
                    <span className="pf-two__sub">{r.triggerSub}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span>{r.action}</span>
                    <span className="pf-two__sub">Market Order</span>
                  </div>
                </div>
                <div className="mk-cell au-asset" role="cell">
                  <img src={r.assetIcon} alt="" width="24" height="24" />
                  <div className="pf-two">
                    <span>{r.asset}</span>
                    <span className="pf-two__sub">/USDT</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">
                  <button
                    type="button"
                    className={`au-pill${r.status === "Active" ? " is-active" : ""}`}
                    title={r.status === "Active" ? "Pause automation" : "Resume automation"}
                    onClick={() => onToggle(r.name)}
                  >
                    {r.status}
                  </button>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span>{r.next}</span>
                    <span className="pf-two__sub">{r.nextSub}</span>
                  </div>
                </div>
                <div className="mk-cell mk-cell--action" role="cell">
                  <button type="button" className="icon-btn" aria-label={`More actions for ${r.name}`}>
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

function Health() {
  return (
    <div className="card au-health">
      <h2 className="card-title">Portfolio Automation Health</h2>
      <dl className="au-health__stats">
        {health.stats.map((s) => (
          <div key={s.label} className="au-health__row">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="au-health__gauge" role="img" aria-label={`Automation health ${health.score}% — ${health.label}`}>
        <img src={auicons.gauge} alt="" width="241" height="114" />
        <div className="au-health__score">
          <span className="au-health__value">{health.score}%</span>
          <span className="au-health__label">{health.label}</span>
        </div>
      </div>
    </div>
  );
}

function RecentExecutions() {
  return (
    <div className="card au-exec">
      <CardTitle title="Recent Executions" />
      <ul className="au-exec__list">
        {executions.map((e) => (
          <li key={e.title} className="au-exec__item">
            <img src={e.icon} alt="" width="24" height="24" />
            <div className="au-exec__text">
              <span className="au-exec__title">{e.title}</span>
              <span className="au-exec__sub">{e.pair}</span>
              <span className="au-exec__sub">
                {e.date} <span className="au-exec__dot">・</span>
                {e.time}
              </span>
            </div>
            <div className="au-exec__result">
              <span className="au-exec__amount">{e.amount}</span>
              <span className={`au-pill au-pill--sm${e.status === "Success" ? " is-active" : " is-pending"}`}>{e.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Automations() {
  const [sort, setSort] = useState(SORTS[0]);
  const [paused, setPaused] = useState(() => new Set(automations.filter((r) => r.status === "Paused").map((r) => r.name)));
  const rows = useMemo(
    () => sortRows(automations.map((r) => ({ ...r, status: paused.has(r.name) ? "Paused" : "Active" })), sort),
    [paused, sort],
  );
  const toggle = (name) =>
    setPaused((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  // The card starts at the Figma figure (5/8) and moves as rules are paused or resumed.
  const [startPaused] = useState(paused.size);
  const active = 5 + startPaused - paused.size;
  const stats = autoStats.map((s, i) => (i === 0 ? { ...s, value: `${active}/${automations.length}` } : s));

  return (
    <main className="portfolio automations">
      <Header sort={sort} onSort={setSort} />
      <div className="content pf-content">
        <section className="main-col pf-main">
          <div className="card mk-main au-card">
            <Stats items={stats} />
            <AutomationTable rows={rows} onToggle={toggle} />
          </div>
        </section>
        <aside className="right-col pf-side au-side">
          <Health />
          <RecentExecutions />
        </aside>
      </div>
    </main>
  );
}
