import React, { useMemo, useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { picons } from "../portfolioData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { sicons, stakingAssets, LOCK_FILTERS, stakePortfolio, rewards, activity } from "../stakeData";

function StakeTable({ rows, staked, onStake }) {
  const last = rows.length - 1;
  return (
    <div className="pf-table-scroll st-table-scroll">
      <div className="mk-table st-table" role="table" aria-label="Available staking assets">
        <div className="mk-row mk-row--head st-row" role="row">
          {["Coin", "APY", "Staked Amount", "Est. Rewards (Yearly)", "Lock Period", "Action"].map((h) => (
            <span key={h} role="columnheader">
              {h}
            </span>
          ))}
        </div>
        <div className="mk-rows st-rows">
          {rows.map((c, i) => (
            <div key={c.symbol} className={`mk-row st-row${i === last ? " is-last" : ""}`} role="row">
              <div className="mk-cell mk-cell--coin" role="cell">
                <img src={c.icon} alt="" width="32" height="32" />
                <div className="pf-two">
                  <span>{c.name}</span>
                  <span className="pf-two__sub">{c.symbol}</span>
                </div>
              </div>
              <div className="mk-cell st-apy" role="cell">{c.apy}</div>
              <div className="mk-cell" role="cell">
                <div className="pf-two">
                  <span>{c.staked}</span>
                  <span className="pf-two__sub">{c.stakedUsd}</span>
                </div>
              </div>
              <div className="mk-cell" role="cell">
                <div className="pf-two">
                  <span>{c.rewards}</span>
                  <span className="pf-two__sub">{c.rewardsUsd}</span>
                </div>
              </div>
              <div className="mk-cell" role="cell">{c.lock}</div>
              <div className="mk-cell" role="cell">
                <button
                  type="button"
                  className={`btn-primary st-btn${staked.has(c.symbol) ? " is-staked" : ""}`}
                  onClick={() => onStake(c.symbol)}
                  aria-pressed={staked.has(c.symbol)}
                >
                  {staked.has(c.symbol) ? "Staked" : "Stake"}
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="mk-empty">No assets match your search.</p>}
        </div>
      </div>
    </div>
  );
}

function StakePortfolio() {
  return (
    <div className="convert st-portfolio" style={{ backgroundImage: `url(${icons.convertBg})` }}>
      <div className="convert__inner st-portfolio__inner">
        <div className="st-portfolio__head">
          <div className="st-portfolio__text">
            <span className="st-portfolio__label">Stake Portfolio</span>
            <div className="st-portfolio__value">
              <span className="st-portfolio__amount">{stakePortfolio.value}</span>
              <span className="up">{stakePortfolio.change}</span>
            </div>
            <span className="st-portfolio__sub">Total value locked</span>
          </div>
          <img className="st-portfolio__spark" src={sicons.spark} alt="" width="121" height="64" />
        </div>
        <div className="st-portfolio__stats">
          {stakePortfolio.stats.map((s) => (
            <div key={s.label} className="st-portfolio__stat">
              <span className="st-portfolio__stat-label">{s.label}</span>
              <span className="st-portfolio__stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Rewards() {
  const last = rewards.length - 1;
  return (
    <div className="card st-rewards">
      <CardTitle title="Your Rewards" />
      <div className="st-list">
        {rewards.map((r, i) => (
          <div key={r.symbol} className={`st-list__row${i === last ? " is-last" : ""}`}>
            <span className="st-reward__coin">
              <img src={r.icon} alt="" width="18" height="18" />
              <span className="pf-two">
                <span>{r.symbol}</span>
                <span className="pf-two__sub">{r.price}</span>
              </span>
            </span>
            <span className="pf-two">
              <span>{r.amount}</span>
              <span className="pf-two__sub">{r.usd}</span>
            </span>
            <span className="st-received">Received</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="card st-activity">
      <CardTitle title="Recent Activity" />
      <ol className="st-timeline">
        {activity.map((a) => (
          <li key={a.title} className="st-timeline__item">
            <img className="st-timeline__icon" src={sicons.check} alt="" width="22" height="60" />
            <span className="pf-two st-timeline__text">
              <span>{a.title}</span>
              <span className="pf-two__sub">
                {a.date} ・{a.time}
              </span>
            </span>
            <span className="st-received">Complete</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Stake() {
  const [query, setQuery] = useState("");
  const [lock, setLock] = useState(null);
  const [staked, setStaked] = useState(() => new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stakingAssets.filter(
      (c) =>
        (!q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)) &&
        (!lock || (lock === "Flexible" ? c.lock === "Flexible" : c.lock !== "Flexible")),
    );
  }, [query, lock]);

  const toggleStake = (symbol) =>
    setStaked((s) => {
      const next = new Set(s);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });

  const cycleLock = () => {
    const list = [null, ...LOCK_FILTERS];
    setLock((l) => list[(list.indexOf(l) + 1) % list.length]);
  };

  return (
    <main className="content markets stake">
      <section className="main-col mk-col">
        <div className="pf-header">
          <div className="pf-header__text">
            <h1 className="pf-header__title">Stake</h1>
            <p className="pf-header__sub">
              <span className="pf-desktop-only">
                Earn rewards by staking your assets, Flexible options, competitive rates, and secure protocols
              </span>
              <span className="pf-mobile-only">Stake assets securely to earn rewards.</span>
            </p>
          </div>
          <button type="button" className="pf-export st-export">
            <img className="mono" src={picons.upload} alt="" width="18" height="18" />
            <span>Export</span>
          </button>
        </div>
        <div className="card mk-main">
          <Stats />
          <div className="mk-body st-body">
            <div className="st-head">
              <div className="st-head__text">
                <h2 className="card-title">Available Staking Assets</h2>
                <p className="st-head__sub">Select assets and earn rewards today.</p>
              </div>
              <div className="st-filters">
                <label className="st-search">
                  <img className="mono" src={icons.search} alt="" width="18" height="18" />
                  <input
                    type="search"
                    placeholder="Search assets"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search assets"
                  />
                </label>
                <button type="button" className="chip dropdown st-assets" onClick={cycleLock}>
                  <span>{lock ? `${lock} only` : "All Assets"}</span>
                  <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
                </button>
              </div>
              <button type="button" className="mk-chip st-mobile-filters" onClick={cycleLock}>
                <span>{lock || "Filters"}</span>
                <img className="mono" src={micons.tune} alt="" width="18" height="18" />
              </button>
            </div>
            <StakeTable rows={rows} staked={staked} onStake={toggleStake} />
          </div>
        </div>
      </section>
      <aside className="right-col pf-side st-side">
        <StakePortfolio />
        <Rewards />
        <RecentActivity />
      </aside>
    </main>
  );
}
