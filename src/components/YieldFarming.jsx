import React, { useLayoutEffect, useRef, useState } from "react";
import ChartHover, { dateAt } from "./ChartHover";
import { icons } from "../data";
import { picons } from "../portfolioData";
import { sicons } from "../stakeData";
import { CardTitle } from "./Portfolio";
import { Stats } from "./Markets";
import { anchorOf } from "./Modal";
import { openFlow } from "../flows";
import { yicons, yieldStats, pools, yieldMonths } from "../yieldData";
import { yieldStore, summary, usd, YIELD_RANGES } from "./flows/YieldFlows";

const pop = (name, props) => (e) => {
  e.stopPropagation();
  openFlow(name, { anchor: anchorOf(e.currentTarget), ...props });
};

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
  const { positions } = yieldStore.use();
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
        <ViewAll onClick={() => (window.location.hash = "#/history")} />
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
              <div key={p.pair} className={`mk-row yf-row is-clickable${i === last ? " is-last" : ""}`} role="row" onClick={() => openFlow("yield.position", { pair: p.pair })}>
                <div className="mk-cell mk-cell--coin" role="cell">
                  <PairIcons icons={p.icons} />
                  <span className="pf-two">
                    <span>{p.label}</span>
                    <span className="pf-two__sub">0.3% Fee</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{usd(p.deposited)}</span>
                    <span className="pf-two__sub">
                      {fmtTok(p.baseAmt)} {p.base} + {fmtTok(p.quoteAmt)} {p.quote}
                    </span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{usd(p.value)}</span>
                    <span className="pf-two__sub yf-up">+{p.valueChange.toFixed(2)}%</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{usd(p.rewards)}</span>
                    <span className="pf-two__sub">{p.rewardToken}</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  <span className="pf-two">
                    <span>{p.apy}%</span>
                    <span className="pf-two__sub yf-up">+{p.apyChange}%</span>
                  </span>
                </div>
                <div className="mk-cell" role="cell">
                  {p.outOfRange ? (
                    <button type="button" className="yf-oor" aria-haspopup="dialog" onClick={pop("yield.oor", { pair: p.pair })}>
                      Out of range
                    </button>
                  ) : (
                    <span className="yf-active">Active</span>
                  )}
                </div>
                <div className="mk-cell mk-cell--action" role="cell">
                  <button type="button" className="icon-btn" aria-haspopup="dialog" aria-label={`More actions for ${p.pair}`} onClick={pop("yield.menu", { pair: p.pair })}>
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

const fmtTok = (n) =>
  n >= 1000 ? Math.round(n).toLocaleString("en-US") : n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 3 }) : n.toFixed(n < 0.1 ? 4 : 3);

function FeaturedPools() {
  return (
    <div className="card yf-pools">
      <SectionHead title="Featured Pools" sub="New pools you’re not in yet — sorted by 7-day volume">
        <ViewAll onClick={() => (window.location.hash = "#/markets")} />
      </SectionHead>
      <div className="yf-pools__grid">
        {pools.map((p) => (
          <div key={p.pair} className="yf-pool">
            <div className="yf-pool__info">
              <PairIcons icons={p.icons} size={30} />
              <span className="yf-pool__name">
                <span>{p.pair}</span>
                <button type="button" className={`yf-risk is-${["low", "mid", "high"][p.level]}`} aria-haspopup="dialog" onClick={pop("yield.risk", { pair: p.pair })}>
                  {p.risk}
                </button>
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
            <button type="button" className="btn-primary yf-add" aria-haspopup="dialog" onClick={() => openFlow("yield.add", { pair: p.pair })}>
              <span>Add Liquidity</span>
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
  const { range } = yieldStore.use();
  const r = YIELD_RANGES[range];
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
        <button type="button" className="chip dropdown" aria-haspopup="dialog" onClick={pop("yield.range")}>
          <span>{range}</span>
          <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
        </button>
      </div>
      <div className="yf-yield__stat">
        <span className="pf-chart__label">{range === "30D" ? "Earned this month" : `Earned · ${r.from}`}</span>
        <span className="pf-chart__amount">
          <span className="yf-yield__value">{usd(r.value)}</span>
          <span className="up yf-yield__change">{r.change}</span>
        </span>
      </div>
      <div className="yf-yield__graph" ref={graphRef} style={{ "--sx": sx }} aria-hidden="true">
        <img className="yf-yield__chart" src={yicons.chart} alt="" width="225" height="130" />
        <span className="yf-yield__cursor" />
        <img className="yf-yield__dot" src="/assets/chart-dot.svg" alt="" width="10" height="10" />
        <ChartHover
          images=".yf-yield__chart"
          colors={["#FE7701"]}
          plot=".yf-yield__chart"
          range={[500, 0]}
          span=".yf-yield__chart"
          pill={false}
          tipWidth={128}
          render={(h) => ({
            date: dateAt(h.frac, new Date(2026, 8, 19), new Date(2026, 9, 19)),
            rows: [{ label: "Earned", color: "#FE7701", value: h.v[0] == null ? "—" : `$${h.v[0].toFixed(2)}`, tone: "up" }],
          })}
        />
        <div className="yf-yield__months">
          {yieldMonths.map((m) => (
            <span key={m} className={m === "Oct 14" ? "is-active" : ""}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PendingRewards() {
  const st = yieldStore.use();
  const list = st.positions;
  const { rewards } = summary(st);
  const last = list.length - 1;
  return (
    <div className="card yf-pending">
      <CardTitle title="Pending Rewards" onOpen={() => openFlow("yield.claim")} />
      <div className="st-list">
        {list.map((p, i) => (
          <div key={p.pair} className={`st-list__row yf-pending__row${i === last ? " is-last" : ""}`}>
            <span className="st-reward__coin">
              <img src={p.rewardToken === "USDT" ? "/assets/t-usdt.svg" : "/assets/t-usdc.svg"} alt="" width="26" height="26" />
              <span className="pf-two">
                <span>{p.rewardToken}</span>
                <span className="pf-two__sub">{p.pair}</span>
              </span>
            </span>
            <span className="pf-two yf-pending__amount">
              <span>{usd(p.rewards)}</span>
              <span className="pf-two__sub">
                = {p.rewards.toFixed(2)} {p.rewardToken}
              </span>
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="btn-primary yf-claim" aria-haspopup="dialog" onClick={() => openFlow("yield.claim")} disabled={!rewards}>
        <span>{rewards ? `Claim ${usd(rewards)}` : "All claimed"}</span>
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
          <li key={a.title + a.pair + a.amount} className="st-timeline__item yf-activity__item">
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
  const st = yieldStore.use();
  const sm = summary(st);
  const stats = yieldStats.map((s) =>
    s.key === "deposited" ? { ...s, value: usd(sm.deposited) } : s.key === "positions" ? { ...s, value: String(sm.count) } : s.key === "apy" ? { ...s, value: `${sm.apy.toFixed(1)}%` } : s,
  );
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
            <Stats items={stats} />
            <Positions />
          </div>
          <FeaturedPools />
        </div>
      </section>
      <aside className="right-col pf-side yf-side">
        <YourYield />
        <PendingRewards />
        <ActivityCard title="Farming Activity" items={st.activity} />
      </aside>
    </main>
  );
}
