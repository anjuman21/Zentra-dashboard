import React, { useLayoutEffect, useRef, useState } from "react";
import { icons } from "../data";
import { picons } from "../portfolioData";
import { sicons } from "../stakeData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { yicons, yieldStats, positions, pools, yieldMonths, pendingRewards, farmingActivity } from "../yieldData";

const RANGES = ["7D", "30D", "90D", "1Y"];

export function ViewAll({ label = "View All", onClick }) {
  return (
    <button type="button" className="yf-viewall" onClick={onClick}>
      <span>{label}</span>
      <img className="mono" src={picons.callMade} alt="" width="18" height="18" />
    </button>
  );
}

export function SectionHead({ title, sub, children }) {
  return (
    <div className="yf-head">
      <div className="yf-head__text">
        <h2 className="card-title">{title}</h2>
        {sub && <p className="st-head__sub">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function PairIcons({ icons: list, size = 24 }) {
  return (
    <span className="yf-pair-icons">
      {list.map((src, i) => (
        <img key={i} src={src} alt="" width={size} height={size} />
      ))}
    </span>
  );
}

function Positions() {
  const last = positions.length - 1;
  return (
    <div className="mk-body yf-positions">
      <SectionHead
        title="Farming Positions"
        sub={
          <>
            <span className="pf-desktop-only">Manage liquidity positions and track earnings.</span>
            <span className="pf-mobile-only">Manage liquidity and track earnings.</span>
          </>
        }
      >
        <ViewAll />
      </SectionHead>
      <div className="pf-table-scroll yf-table-scroll">
        <div className="mk-table yf-table" role="table" aria-label="Farming positions">
          <div className="mk-row mk-row--head yf-row" role="row">
            {["Pool", "Deposited", "Current Value", "Unclaimed Rewards", "APY", "Status"].map((h) => (
              <span key={h} role="columnheader">
                {h}
              </span>
            ))}
            <span role="columnheader" aria-label="Actions" />
          </div>
          <div className="mk-rows yf-rows">
            {positions.map((p, i) => (
              <div key={p.pair} className={`mk-row yf-row${i === last ? " is-last" : ""}`} role="row">
                <div className="mk-cell mk-cell--coin" role="cell">
                  <PairIcons icons={p.icons} />
                  <span className="pf-two">
                    <span>{p.pair}</span>
                    <span className="pf-two__sub">0.3% Fee</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{p.deposited}</span>
                    <span className="pf-two__sub">{p.split}</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{p.value}</span>
                    <span className="pf-two__sub yf-up">{p.valueChange}</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{p.rewards}</span>
                    <span className="pf-two__sub">{p.rewardToken}</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{p.apy}</span>
                    <span className="pf-two__sub yf-up">{p.apyChange}</span>
                  </span>
                </div>
                <div className="mk-cell yf-active" role="cell">Active</div>
                <div className="mk-cell mk-cell--action" role="cell">
                  <button type="button" className="icon-btn" aria-label={`More actions for ${p.pair}`}>
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

function FeaturedPools() {
  const [added, setAdded] = useState(null);
  return (
    <div className="card yf-pools">
      <SectionHead title="Featured Pools" sub="Join top liquidity pools and earn attractive yields">
        <ViewAll />
      </SectionHead>
      <div className="yf-pools__grid">
        {pools.map((p) => (
          <div key={p.pair} className="yf-pool">
            <div className="yf-pool__info">
              <PairIcons icons={p.icons} size={30} />
              <span className="yf-pool__name">
                <span>{p.pair}</span>
                <span className={`yf-risk ${p.risk.startsWith("Low") ? "is-low" : "is-mid"}`}>{p.risk}</span>
              </span>
            </div>
            <dl className="yf-pool__metrics">
              <dt>Pool TVL</dt>
              <dd>{p.tvl}</dd>
              <dt>APY</dt>
              <dd className="yf-up">{p.apy}</dd>
              <dt>24h Volume</dt>
              <dd>{p.volume}</dd>
              <dt>Fee Tier</dt>
              <dd>{p.fee}</dd>
            </dl>
            <button type="button" className="btn-primary yf-add" onClick={() => setAdded(p.pair)}>
              <span>{added === p.pair ? "Selected" : "Add Liquidity"}</span>
              <img src={yicons.arrowRight} alt="" width="18" height="18" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// The Figma graph is 268px wide; the line stretches with the card on wider phones.
const GRAPH_WIDTH = 268;

function YourYield() {
  const [range, setRange] = useState("30D");
  const graphRef = useRef(null);
  const [sx, setSx] = useState(1);
  useLayoutEffect(() => {
    const el = graphRef.current;
    if (!el) return undefined;
    const update = () => setSx(Math.max(0.5, el.clientWidth / GRAPH_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="card yf-yield">
      <div className="an-card__head an-card__head--center">
        <h2 className="card-title">Your Yield</h2>
        <button type="button" className="chip dropdown" onClick={() => setRange((r) => RANGES[(RANGES.indexOf(r) + 1) % RANGES.length])}>
          <span>{range}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="yf-yield__stat">
        <span className="pf-chart__label">Earned this month</span>
        <span className="pf-chart__amount">
          <span className="yf-yield__value">$482.16</span>
          <span className="up yf-yield__change">+28.4%</span>
        </span>
      </div>
      <div className="yf-yield__graph" ref={graphRef} style={{ "--sx": sx }} aria-hidden="true">
        <img className="yf-yield__chart" src={yicons.chart} alt="" width="225" height="130" />
        <span className="yf-yield__cursor" />
        <img className="yf-yield__dot" src="/assets/chart-dot.svg" alt="" width="10" height="10" />
        <div className="yf-yield__months">
          {yieldMonths.map((m) => (
            <span key={m} className={m === "Sep" ? "is-active" : ""}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PendingRewards() {
  const [claimed, setClaimed] = useState(false);
  const last = pendingRewards.length - 1;
  return (
    <div className="card yf-pending">
      <CardTitle title="Pending Rewards" />
      <div className="st-list">
        {pendingRewards.map((r, i) => (
          <div key={r.symbol} className={`st-list__row yf-pending__row${i === last ? " is-last" : ""}`}>
            <span className="st-reward__coin">
              <img src={r.icon} alt="" width="26" height="26" />
              <span className="pf-two">
                <span>{r.symbol}</span>
                <span className="pf-two__sub">{r.pair}</span>
              </span>
            </span>
            <span className="pf-two yf-pending__amount">
              <span>{claimed ? "$0.00" : `$${r.usd.toFixed(2)}`}</span>
              <span className="pf-two__sub">{r.amount}</span>
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="btn-primary yf-claim" onClick={() => setClaimed(true)} disabled={claimed}>
        <span>{claimed ? "Claimed" : "Claim All"}</span>
        <img src={yicons.arrowRight} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

export function ActivityCard({ title, items }) {
  return (
    <div className="card st-activity yf-activity">
      <CardTitle title={title} />
      <ol className="st-timeline">
        {items.map((a) => (
          <li key={a.title} className="st-timeline__item yf-activity__item">
            <img className="st-timeline__icon" src={sicons.check} alt="" width="22" height="60" />
            <span className="pf-two st-timeline__text">
              <span>{a.title}</span>
              {a.pair && <span className="pf-two__sub">{a.pair}</span>}
              <span className="pf-two__sub">
                {a.date} ・{a.time}
              </span>
            </span>
            <span className="st-received">{a.amount}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function YieldFarming() {
  return (
    <main className="content markets yield">
      <section className="main-col mk-col">
        <div className="pf-header">
          <div className="pf-header__text">
            <h1 className="pf-header__title">Yielding Farming</h1>
            <p className="pf-header__sub">
              <span className="pf-desktop-only">Provide liquidity, earn trading fees, and maximize your Defi yield.</span>
              <span className="pf-mobile-only">Earn fees and maximize your Defi yield.</span>
            </p>
          </div>
        </div>
        <div className="yf-main">
          <div className="card mk-main yf-card">
            <Stats items={yieldStats} />
            <Positions />
          </div>
          <FeaturedPools />
        </div>
      </section>
      <aside className="right-col pf-side yf-side">
        <YourYield />
        <PendingRewards />
        <ActivityCard title="Farming Activity" items={farmingActivity} />
      </aside>
    </main>
  );
}
