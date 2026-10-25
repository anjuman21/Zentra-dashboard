import React, { useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { aicons } from "../analyticsData";
import { CardTitle } from "./Portfolio";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { alicons, alertTabs, quickActions } from "../alertData";
import { alertStore, filterAlerts, markRead, dateLabel } from "./flows/AlertFlows";

const pop = (name, props) => (e) => {
  e.stopPropagation();
  openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });
};

function Header() {
  return (
    <div className="pf-header">
      <div className="pf-header__text">
        <h1 className="pf-header__title">Alerts</h1>
        <p className="pf-header__sub">
          <span className="pf-desktop-only">Get real-time notifications for price changes, market updates, and more.</span>
          <span className="pf-mobile-only">Receive alerts for price updates.</span>
        </p>
      </div>
      <button type="button" className="pf-square al-more" aria-label="More options" aria-haspopup="dialog" onClick={pop("alerts.more")}>
        <img className="mono" src={alicons.more} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

function Chip({ label, icon = icons.arrowDown, onClick, className = "" }) {
  return (
    <button type="button" className={`mk-chip ${className}`} onClick={onClick}>
      <span>{label}</span>
      <img className="mono" src={icon} alt="" width="18" height="18" />
    </button>
  );
}

function AlertRow({ alert }) {
  const open = () => {
    markRead(alert.id);
    if (alert.type === "Price") openFlow("alerts.detail", { id: alert.id });
    else if (alert.type === "Security") openFlow("alerts.security", { id: alert.id });
  };
  return (
    <li className={`al-row${alert.unread ? " is-unread" : ""}${alert.muted || alert.snoozed ? " is-quiet" : ""}`}>
      <button type="button" className="al-row__main" onClick={open} aria-haspopup={alert.type === "Price" || alert.type === "Security" ? "dialog" : undefined}>
        <img className="al-row__icon" src={alert.icon} alt="" width="34" height="34" />
        <span className="al-row__text">
          <span className="al-row__title">{alert.title}</span>
          <span className="al-row__msg">
            <span className="pf-desktop-only">{alert.message}</span>
            <span className="pf-mobile-only">{alert.short}</span>
          </span>
          <span className="al-row__time">
            {alert.time}
            {alert.snoozed ? ` · snoozed ${alert.snoozed.toLowerCase()}` : alert.muted ? " · muted" : ""}
          </span>
        </span>
      </button>
      <span className="al-row__side">
        <span className={`al-badge is-${alert.tone}`}>{alert.badge}</span>
        <button type="button" className="icon-btn" aria-haspopup="dialog" aria-label={`More actions for ${alert.title}`} onClick={pop("alerts.menu", { id: alert.id })}>
          <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
        </button>
      </span>
    </li>
  );
}

function AlertFeed() {
  const st = alertStore.use();
  const [tab, setTab] = useState("All");
  const f = st.filter;
  const live = st.alerts.filter((x) => !x.deleted);
  const unread = live.filter((x) => x.unread).length;
  const rows = filterAlerts(live, f, tab);
  const filters = pop("alerts.filters");
  const filtered = f.types.length || f.status || f.asset || f.date !== "Last 7 days";
  const tabLabel = (t) => (t === "All" ? `All · ${live.length}` : t === "Unread" ? `Unread · ${unread}` : t);

  return (
    <div className="card al-feed">
      <div className="mk-tabs al-tabs" role="tablist" aria-label="Alert lists">
        {alertTabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={t === tab} className={`mk-tab${t === tab ? " is-active" : ""}`} onClick={() => setTab(t)}>
            {tabLabel(t)}
          </button>
        ))}
      </div>
      <div className="al-feed__body">
        <div className="al-toolbar">
          <div className="al-filters pf-desktop-only">
            <Chip label={dateLabel(f.date)} icon={aicons.calendar} onClick={filters} className={f.date !== "Last 7 days" ? "is-set" : ""} />
            <Chip label={f.types.length ? f.types.join(", ") : "All Types"} onClick={filters} className={f.types.length ? "is-set" : ""} />
            <Chip label={f.asset || "All Assets"} onClick={filters} className={f.asset ? "is-set" : ""} />
            <Chip label={f.status || "All Status"} onClick={filters} className={f.status ? "is-set" : ""} />
          </div>
          <Chip label={filtered ? `Filters · ${rows.length}` : "Filters"} icon={micons.tune} className="al-mobile-filters" onClick={filters} />
          <button
            type="button"
            className="yf-viewall al-markall"
            disabled={!unread}
            onClick={() => alertStore.set((s) => ({ ...s, alerts: s.alerts.map((x) => ({ ...x, unread: false })) }))}
          >
            <span>Mark all read</span>
          </button>
        </div>
        <ul className="al-list">
          {rows.map((x) => (
            <AlertRow key={x.id} alert={x} />
          ))}
          {rows.length === 0 && (
            <li className="mk-empty">
              No alerts match these filters.{" "}
              <button type="button" className="hp-link" onClick={() => alertStore.set((s) => ({ ...s, filter: { date: "Last 7 days", types: [], status: null, asset: null } }))}>
                Clear filters
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="card al-side-card al-quick">
      <h2 className="card-title">Quick Actions</h2>
      <div className="al-tiles">
        {quickActions.map((q) => (
          <button key={q.label} type="button" className="al-tile al-tile--action" aria-haspopup="dialog" onClick={q.onClick}>
            <img src={q.icon} alt="" width="30" height="30" />
            <span className="al-tile__label">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Summary() {
  const st = alertStore.use();
  const live = st.alerts.filter((x) => !x.deleted);
  const tiles = [
    { label: "Total Alerts", value: live.length, icon: "/assets/sum-bell.svg" },
    { label: "Price", value: live.filter((x) => x.type === "Price").length, icon: "/assets/sum-price.svg" },
    { label: "Unread", value: live.filter((x) => x.unread).length, icon: "/assets/sum-tx.svg" },
    { label: "System", value: live.filter((x) => x.type === "System").length, icon: "/assets/sum-system.svg" },
  ];
  return (
    <div className="card al-side-card al-summary">
      <h2 className="card-title">This week</h2>
      <div className="al-tiles">
        {tiles.map((s) => (
          <div key={s.label} className="al-tile al-tile--stat">
            <img src={s.icon} alt="" width="30" height="30" />
            <span className="al-tile__text">
              <span className="al-tile__value">{s.value}</span>
              <span className="al-tile__label">{s.label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RULE_BADGE = (r) => (r.fired ? ["Triggered", "purple"] : r.locked ? ["Always on", "blue"] : !r.on ? ["Off", "muted"] : r.group === "Price" ? ["Watching", "green"] : ["On", "green"]);

function AlertRules() {
  const { rules } = alertStore.use();
  const list = rules.slice(0, 6);
  const last = list.length - 1;
  return (
    <div className="card al-recent">
      <CardTitle title="Your alert rules" onOpen={() => openFlow("alerts.rules")} />
      <ul className="al-recent__list">
        {list.map((r, i) => {
          const [badge, tone] = RULE_BADGE(r);
          return (
            <li key={r.id} className={`al-recent__item${i === last ? " is-last" : ""}`}>
              <img src={r.icon} alt="" width="22" height="22" />
              <span className="al-recent__text">
                <span className="al-recent__title">{r.short}</span>
                <span className="al-recent__time">{r.side}</span>
              </span>
              <span className="al-recent__status">
                <span className={`al-badge al-badge--sm is-${tone}`}>{badge}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Alerts() {
  return (
    <main className="portfolio alerts">
      <Header />
      <div className="content pf-content">
        <section className="main-col pf-main">
          <AlertFeed />
        </section>
        <aside className="right-col pf-side al-side">
          <QuickActions />
          <Summary />
          <AlertRules />
        </aside>
      </div>
    </main>
  );
}
