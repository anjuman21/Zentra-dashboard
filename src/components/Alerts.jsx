import React, { useMemo, useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { aicons } from "../analyticsData";
import { CardTitle } from "./Portfolio";
import { ViewAll } from "./YieldFarming";
import {
  alicons,
  alertTabs,
  alertTypes,
  alertAssets,
  alertStatuses,
  alerts,
  quickActions,
  alertSummary,
  recentAlerts,
} from "../alertData";

const next = (list, value) => list[(list.indexOf(value) + 1) % list.length];

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
      <button type="button" className="pf-square al-more" aria-label="More options">
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

function AlertRow({ alert, onRead }) {
  return (
    <li className={`al-row${alert.unread ? " is-unread" : ""}`}>
      <button type="button" className="al-row__main" onClick={() => onRead(alert.id)}>
        <img className="al-row__icon" src={alert.icon} alt="" width="34" height="34" />
        <span className="al-row__text">
          <span className="al-row__title">{alert.title}</span>
          <span className="al-row__msg">
            <span className="pf-desktop-only">{alert.message}</span>
            <span className="pf-mobile-only">{alert.short}</span>
          </span>
          <span className="al-row__time">{alert.time}</span>
        </span>
      </button>
      <span className="al-row__side">
        <span className={`al-badge is-${alert.tone}`}>{alert.badge}</span>
        <button type="button" className="icon-btn" aria-label={`More actions for ${alert.title}`}>
          <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
        </button>
      </span>
    </li>
  );
}

function AlertFeed() {
  const [tab, setTab] = useState(alertTabs[0]);
  const [type, setType] = useState(alertTypes[0]);
  const [asset, setAsset] = useState(alertAssets[0]);
  const [status, setStatus] = useState(alertStatuses[0]);
  const [read, setRead] = useState(() => new Set());

  const rows = useMemo(
    () =>
      alerts
        .map((x) => ({ ...x, unread: x.unread && !read.has(x.id) }))
        .filter((x) => tab === alertTabs[0] || x.tabs.includes(tab))
        .filter((x) => type === alertTypes[0] || x.type === type)
        .filter((x) => asset === alertAssets[0] || x.asset === asset)
        .filter((x) => status === alertStatuses[0] || (status === "Unread") === Boolean(x.unread)),
    [tab, type, asset, status, read],
  );
  const markRead = (id) => setRead((prev) => new Set(prev).add(id));
  const cycleAll = () => {
    // One mobile chip steps through the type filter.
    setType((t) => next(alertTypes, t));
  };

  return (
    <div className="card al-feed">
      <div className="mk-tabs al-tabs" role="tablist" aria-label="Alert lists">
        {alertTabs.map((t) => (
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
      <div className="al-feed__body">
        <div className="al-toolbar">
          <div className="al-filters pf-desktop-only">
            <Chip label="Aug 12, 2026 - Aug 18, 2026" icon={aicons.calendar} />
            <Chip label={type} onClick={() => setType((t) => next(alertTypes, t))} />
            <Chip label={asset} onClick={() => setAsset((t) => next(alertAssets, t))} />
            <Chip label={status} onClick={() => setStatus((t) => next(alertStatuses, t))} />
          </div>
          <Chip
            label={type === alertTypes[0] ? "Filters" : type}
            icon={micons.tune}
            className="al-mobile-filters"
            onClick={cycleAll}
          />
          <ViewAll />
        </div>
        <ul className="al-list">
          {rows.map((x) => (
            <AlertRow key={x.id} alert={x} onRead={markRead} />
          ))}
          {rows.length === 0 && <li className="mk-empty">No alerts match these filters.</li>}
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
          <button key={q.label} type="button" className="al-tile al-tile--action">
            <img src={q.icon} alt="" width="30" height="30" />
            <span className="al-tile__label">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Summary() {
  return (
    <div className="card al-side-card al-summary">
      <h2 className="card-title">Alert Summary</h2>
      <div className="al-tiles">
        {alertSummary.map((s) => (
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

function RecentAlerts() {
  const last = recentAlerts.length - 1;
  return (
    <div className="card al-recent">
      <CardTitle title="Recent Alerts" />
      <ul className="al-recent__list">
        {recentAlerts.map((r, i) => (
          <li key={r.title} className={`al-recent__item${i === last ? " is-last" : ""}`}>
            <img src={r.icon} alt="" width="24" height="24" />
            <span className="al-recent__text">
              <span className="al-recent__title">{r.title}</span>
              <span className="al-recent__time">{r.time}</span>
            </span>
            <span className="al-recent__status">
              <span className={`al-badge al-badge--sm is-${r.tone}`}>{r.badge}</span>
            </span>
          </li>
        ))}
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
          <RecentAlerts />
        </aside>
      </div>
    </main>
  );
}
