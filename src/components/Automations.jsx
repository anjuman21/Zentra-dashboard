import React, { useState } from "react";
import { icons } from "../data";
import { picons } from "../portfolioData";
import { micons } from "../marketsData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { SectionHead, ViewAll } from "./YieldFarming";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { auicons, autoStats, SORTS, health } from "../autoData";
import { autoStore, healthScore, pauseRule, resumeRule } from "./flows/AutomationFlows";

const pop = (name, props) => (e) => {
  e.stopPropagation();
  openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });
};

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
        <button type="button" className="btn-primary pf-add" aria-label="Create Automation" aria-haspopup="dialog" onClick={() => openFlow("auto.create")}>
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

function AutomationTable({ rows }) {
  const last = rows.length - 1;
  return (
    <div className="mk-body au-list">
      <SectionHead title="My Automations">
        <ViewAll onClick={() => (window.location.hash = "#/history")} />
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
              <div key={r.name} className={`mk-row au-row is-clickable${i === last ? " is-last" : ""}`} role="row" onClick={() => openFlow("auto.detail", { name: r.name })}>
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
                    <span className="pf-two__sub">{r.pair}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">
                  <button
                    type="button"
                    className={`au-pill${r.status === "Active" ? " is-active" : r.status === "Failed" ? " is-failed" : ""}`}
                    title={r.status === "Active" ? "Pause automation" : r.status === "Failed" ? "See what went wrong" : "Resume automation"}
                    aria-haspopup={r.status === "Failed" ? "dialog" : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (r.status === "Failed") openFlow("auto.failed", { name: r.name });
                      else if (r.status === "Active") pauseRule(r.name);
                      else resumeRule(r.name);
                    }}
                  >
                    {r.status}
                  </button>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span className={r.status === "Failed" ? "au-attention" : undefined}>{r.next}</span>
                    <span className="pf-two__sub">{r.nextSub}</span>
                  </div>
                </div>
                <div className="mk-cell mk-cell--action" role="cell">
                  <button type="button" className="icon-btn" aria-haspopup="dialog" aria-label={`More actions for ${r.name}`} onClick={pop("auto.menu", { name: r.name })}>
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
  const st = autoStore.use();
  const score = healthScore(st);
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
      <button type="button" className="au-health__gauge au-health__btn" aria-haspopup="dialog" aria-label={`Automation health ${score}% — ${score >= 85 ? "Great" : health.label}, see what it means`} onClick={pop("auto.health")}>
        <img src={auicons.gauge} alt="" width="241" height="114" />
        <span className="au-health__score">
          <span className="au-health__value">{score}%</span>
          <span className="au-health__label">{score >= 85 ? "Great" : health.label}</span>
        </span>
      </button>
    </div>
  );
}

function RecentExecutions() {
  const { executions } = autoStore.use();
  return (
    <div className="card au-exec">
      <CardTitle title="Recent Executions" onOpen={() => (window.location.hash = "#/history")} />
      <ul className="au-exec__list">
        {executions.map((e, i) => (
          <li
            key={e.title + e.date + e.time}
            className="au-exec__item is-clickable"
            role="button"
            tabIndex={0}
            onClick={() => openFlow(e.status === "Failed" ? "auto.failed" : "auto.receipt", e.status === "Failed" ? { name: e.auto } : { index: i })}
            onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && ev.currentTarget.click()}
          >
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
              <span className={`au-pill au-pill--sm${e.status === "Success" ? " is-active" : e.status === "Failed" ? " is-failed" : " is-pending"}`}>{e.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Automations() {
  const [sort, setSort] = useState(SORTS[0]);
  const st = autoStore.use();
  const rows = sortRows(st.rules, sort);
  const active = st.rules.filter((r) => r.status === "Active").length;
  const stats = autoStats.map((s, i) => (i === 0 ? { ...s, value: `${active}/${st.rules.length}` } : s));

  return (
    <main className="portfolio automations">
      <Header sort={sort} onSort={setSort} />
      <div className="content pf-content">
        <section className="main-col pf-main">
          <div className="card mk-main au-card">
            <Stats items={stats} />
            <AutomationTable rows={rows} />
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
