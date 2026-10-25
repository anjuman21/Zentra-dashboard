import React, { useState } from "react";
import { icons } from "../data";
import { micons } from "../marketsData";
import { picons } from "../portfolioData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { sicons, stakeStats, rewards } from "../stakeData";
import { stakeStore, filterAssets, portfolio, valueOf, usd, amt } from "./flows/StakeFlows";

const pop = (name, props) => (e) => openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });

function StakeTable({ rows, positions }) {
  const last = rows.length - 1;
  return (
    <div className="pf-table-scroll st-table-scroll">
      <div className="mk-table st-table" role="table" aria-label="Available staking assets">
        <div className="mk-row mk-row--head st-row" role="row">
          {["Coin", "APY", "Your Stake", "Est. Rewards (Yearly)", "Lock Period", "Action"].map((h) => (
            <span key={h} role="columnheader">
              {h}
            </span>
          ))}
        </div>
        <div className="mk-rows st-rows">
          {rows.map((c, i) => {
            const p = positions[c.symbol];
            const reward = p ? (p.amount * c.apy) / 100 : 0;
            return (
              <div key={c.symbol} className={`mk-row st-row${i === last ? " is-last" : ""}`} role="row">
                <div className="mk-cell mk-cell--coin" role="cell">
                  <img src={c.icon} alt="" width="32" height="32" />
                  <div className="pf-two">
                    <span>{c.name}</span>
                    <span className="pf-two__sub">{c.symbol}</span>
                  </div>
                </div>
                <div className="mk-cell st-apy" role="cell">
                  <button type="button" className="st-apy__btn" aria-haspopup="dialog" aria-label={`${c.name} APY ${c.apy}%, details`} onClick={pop("stake.apy", { symbol: c.symbol })}>
                    {c.apy.toFixed(2)}%
                  </button>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span>{p ? `${amt(p.amount)} ${c.symbol}` : "—"}</span>
                    <span className="pf-two__sub">{p ? usd(valueOf(c.symbol, p)) : "Not staked"}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">
                  <div className="pf-two">
                    <span className={p ? "st-earn" : undefined}>{p ? `${amt(reward)} ${c.symbol}` : `$${(c.apy * 10).toFixed(2)} / yr`}</span>
                    <span className="pf-two__sub">{p ? usd(reward * c.price) : "per $1,000"}</span>
                  </div>
                </div>
                <div className="mk-cell" role="cell">{c.lock}</div>
                <div className="mk-cell" role="cell">
                  {p ? (
                    <button type="button" className="st-btn st-btn--manage" aria-haspopup="dialog" onClick={() => openFlow("stake.manage", { symbol: c.symbol })}>
                      Manage
                    </button>
                  ) : (
                    <button type="button" className="btn-primary st-btn" aria-haspopup="dialog" onClick={() => openFlow("stake.amount", { symbol: c.symbol })}>
                      Stake
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {rows.length === 0 && <p className="mk-empty">No assets match your search.</p>}
        </div>
      </div>
    </div>
  );
}

function StakePortfolio() {
  const st = stakeStore.use();
  const { list, total, apy } = portfolio(st);
  const stats = [
    { label: "Active Stakes", value: String(list.length) },
    { label: "Total Rewards", value: "$342.18" },
    { label: "Est. APY", value: `${apy.toFixed(2)}%` },
  ];
  return (
    <button
      type="button"
      className="convert st-portfolio st-portfolio--btn"
      style={{ backgroundImage: `url(${icons.convertBg})` }}
      aria-haspopup="dialog"
      aria-label={`Your staking: ${usd(total)}, see breakdown`}
      onClick={pop("stake.breakdown")}
    >
      <div className="convert__inner st-portfolio__inner">
        <div className="st-portfolio__head">
          <div className="st-portfolio__text">
            <span className="st-portfolio__label">Your Staking</span>
            <div className="st-portfolio__value">
              <span className="st-portfolio__amount">{usd(total)}</span>
              <span className="up">+5.32%</span>
            </div>
            <span className="st-portfolio__sub">
              Total staked · {list.length} position{list.length === 1 ? "" : "s"}
            </span>
          </div>
          <img className="st-portfolio__spark" src={sicons.spark} alt="" width="121" height="64" />
        </div>
        <div className="st-portfolio__stats">
          {stats.map((s) => (
            <div key={s.label} className="st-portfolio__stat">
              <span className="st-portfolio__stat-label">{s.label}</span>
              <span className="st-portfolio__stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function Rewards() {
  const last = rewards.length - 1;
  return (
    <div className="card st-rewards">
      <CardTitle title="Your Rewards" onOpen={() => openFlow("stake.rewards")} />
      <div className="st-list">
        {rewards.map((r, i) => (
          <div key={i} className={`st-list__row${i === last ? " is-last" : ""}`}>
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
  const { activity } = stakeStore.use();
  return (
    <div className="card st-activity">
      <CardTitle title="Recent Activity" onOpen={() => (window.location.hash = "#/history")} />
      <ol className="st-timeline">
        {activity.map((a) => (
          <li key={a.title + a.date} className="st-timeline__item">
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
  const st = stakeStore.use();
  const [query, setQuery] = useState("");
  const rows = filterAssets(st, query);
  // Total staked and average APY follow the positions you hold.
  const { total, apy } = portfolio(st);
  const stats = stakeStats.map((s, i) => (i === 0 ? { ...s, value: usd(total) } : i === 2 ? { ...s, value: `${apy.toFixed(2)}%` } : s));
  const label = st.filtered ? (st.filter.show === "All" ? `Sorted by ${st.filter.sort}` : st.filter.show) : "All Assets";

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
          <Stats items={stats} />
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
                <button type="button" className={`chip dropdown st-assets${st.filtered ? " is-active" : ""}`} aria-haspopup="dialog" onClick={pop("stake.filter")}>
                  <span>{label}</span>
                  <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
                </button>
              </div>
              <button type="button" className="mk-chip st-mobile-filters" aria-haspopup="dialog" onClick={pop("stake.filter")}>
                <span>{st.filtered ? label : "Filters"}</span>
                <img className="mono" src={micons.tune} alt="" width="18" height="18" />
              </button>
            </div>
            <StakeTable rows={rows} positions={st.positions} />
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
