import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Toggle, Segmented } from "../Settings";
import { Row } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { stakingAssets, activity } from "../../stakeData";

const a = (name) => `/assets/${name}`;

/* ───────────── Shared state ───────────── */

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = new Date(2026, 9, 16);
const addDays = (n) => new Date(TODAY.getTime() + n * 864e5);
export const fmtDate = (d) => `${SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
const fmtShort = (d) => `${SHORT[d.getMonth()]} ${d.getDate()}`;

export const coinOf = (sym) => stakingAssets.find((c) => c.symbol === sym);
export const lockDays = (lock) => (lock === "Flexible" ? 0 : lock === "1 Year" ? 365 : lock === "Lifetime" ? Infinity : parseInt(lock, 10));
export const usd = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Coin amounts keep enough digits to stay meaningful (0.00216 BTC, 55.93 ADA).
export const amt = (n) => {
  const d = n >= 100 ? 2 : n >= 1 ? 3 : n >= 0.01 ? 4 : 5;
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
};

// What you hold: amount, lock and how many days into it you are.
export const stakeStore = createStore({
  positions: {
    BTC: { amount: 0.04999, lock: "Flexible", elapsed: 75, auto: true },
    ETH: { amount: 3.9, lock: "Flexible", elapsed: 59, auto: true },
    BNB: { amount: 11.976, lock: "1 Year", elapsed: 120, auto: false },
    ADA: { amount: 972.65, lock: "90 Days", elapsed: 62, auto: true },
    DOT: { amount: 280, lock: "30 Days", elapsed: 12, auto: false },
  },
  filter: { show: "Staked", locks: ["Flexible", "Fixed"], sort: "APY" },
  filtered: false,
  activity,
  claimed: false,
});

export const valueOf = (sym, p) => p.amount * coinOf(sym).price;

export function portfolio(st) {
  const list = Object.entries(st.positions).map(([sym, p]) => ({ sym, p, coin: coinOf(sym), value: valueOf(sym, p) }));
  const total = list.reduce((n, x) => n + x.value, 0);
  const apy = total ? list.reduce((n, x) => n + x.value * x.coin.apy, 0) / total : 0;
  return { list: list.sort((x, y) => y.value - x.value), total, apy };
}

export const LOCK_GROUPS = [
  { key: "Flexible", label: "Flexible", test: (d) => d === 0 },
  { key: "Fixed", label: "Fixed (7–90 days)", test: (d) => d > 0 && d <= 90 },
  { key: "Long", label: "Long (180 days+)", test: (d) => d > 90 },
];

export function filterAssets(st, query, f = st.filtered ? st.filter : null) {
  const q = query.trim().toLowerCase();
  let rows = stakingAssets.filter((c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  if (!f) return rows;
  rows = rows.filter((c) => {
    const held = !!st.positions[c.symbol];
    if (f.show === "Staked" && !held) return false;
    if (f.show === "Not staked" && held) return false;
    return LOCK_GROUPS.some((g) => f.locks.includes(g.key) && g.test(lockDays(c.lock)));
  });
  const by = {
    APY: (x, y) => y.apy - x.apy,
    "Your stake": (x, y) => (st.positions[y.symbol] ? valueOf(y.symbol, st.positions[y.symbol]) : 0) - (st.positions[x.symbol] ? valueOf(x.symbol, st.positions[x.symbol]) : 0),
    Name: (x, y) => x.name.localeCompare(y.name),
  };
  return [...rows].sort(by[f.sort]);
}

function CoinHead({ coin, title, sub, onClose, id }) {
  return (
    <div className="fl-head sf-head">
      <img src={coin.icon} alt="" width="40" height="40" />
      <div className="fl-head__text">
        <h2 id={id} className="fl-head__title">
          {title}
        </h2>
        <p className="fl-head__sub">{sub}</p>
      </div>
      <CloseButton onClick={onClose} />
    </div>
  );
}

/* ───────────── 01A · Stake · Choose amount & lock ───────────── */

const AVAILABLE = { BTC: 0.125, ETH: 2.15, SOL: 42.5, BNB: 3.2, XRP: 1250, ADA: 1500, DOT: 120, DOGE: 8000, AVAX: 25, LINK: 60 };
const LOCK_OPTIONS = [
  { key: "Flexible", days: 0, boost: 0 },
  { key: "30 days", days: 30, boost: 0.65 },
  { key: "90 days", days: 90, boost: 1.35 },
  { key: "180 days", days: 180, boost: 2.15 },
];

function Projection({ amount, apy, sym }) {
  const pts = Array.from({ length: 13 }, (_, i) => amount * (1 + (apy / 100) * (i / 12)) ** 1.0);
  const lo = amount;
  const hi = pts[12];
  const span = hi - lo || 1;
  const W = 332;
  const H = 76;
  const xy = pts.map((v, i) => [(i / 12) * W, H - 6 - ((v - lo) / span) * (H - 16) * (0.35 + (i / 12) * 0.65)]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <div className="sf-proj">
      <div className="sf-proj__top">
        <span className="fl-sub fl-sub--11">Projected balance · 12 months</span>
        <span className="sf-up fl-sub--11">
          +{amt(hi - lo)} {sym}
        </span>
      </div>
      <div className="sf-proj__plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={`${line} L${W},${H} L0,${H} Z`} fill="rgba(87,32,245,0.14)" />
          <path d={line} fill="none" stroke="#5720f5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="sf-proj__tip">
          {amt(hi)} {sym}
        </span>
      </div>
      <div className="sf-proj__x">
        {["Now", "3M", "6M", "9M", "12M"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

export function StakeAmount({ symbol = "ETH" }) {
  const coin = coinOf(symbol);
  const held = stakeStore.get().positions[symbol];
  const avail = AVAILABLE[symbol];
  const [value, setValue] = useState(String(Math.min(1, avail)));
  const fixed = coin.lock !== "Flexible";
  const [lock, setLock] = useState(held ? (held.lock === "Flexible" ? "Flexible" : "90 days") : fixed ? "90 days" : "90 days");
  const [auto, setAuto] = useState(true);
  const [ok, setOk] = useState(false);
  const opt = LOCK_OPTIONS.find((o) => o.key === lock);
  const apy = +(coin.apy + opt.boost).toFixed(2);
  const n = Math.max(0, parseFloat(value) || 0);
  const over = n > avail;
  const reward = (n * apy) / 100;
  const unlock = opt.days ? fmtDate(addDays(opt.days)) : null;
  const valid = n > 0 && !over && (!opt.days || ok);

  const stake = () => {
    stakeStore.set((s) => {
      const prev = s.positions[symbol];
      const position = prev
        ? { ...prev, amount: prev.amount + n }
        : { amount: n, lock: opt.days ? `${opt.days} Days` : "Flexible", elapsed: 0, auto };
      return {
        ...s,
        positions: { ...s.positions, [symbol]: position },
        activity: [{ title: `Staked ${amt(n)} ${symbol}`, date: fmtDate(TODAY), time: "10:41 AM" }, ...s.activity].slice(0, 4),
      };
    });
    openFlow("stake.done", { symbol, amount: n, apy, days: opt.days });
  };

  return (
    <Modal onClose={closeFlow} labelledBy="sf-stake-title" width={432}>
      <div className="fl-dialog sf-stake">
        <CoinHead id="sf-stake-title" coin={coin} title={`Stake ${coin.name}`} sub={`Available ${amt(avail)} ${symbol} in Funding`} onClose={closeFlow} />
        <div className={`sf-amount${over ? " is-error" : ""}`}>
          <span className="sf-amount__row">
            <input
              value={value}
              inputMode="decimal"
              aria-label={`Amount of ${symbol}`}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
              style={{ width: `${Math.max(1, value.length) * 0.62 + 0.2}em` }}
            />
            <span className="sf-amount__sym">{symbol}</span>
            <button type="button" className="sf-max" onClick={() => setValue(String(avail))}>
              Max
            </button>
          </span>
          <span className="fl-sub fl-sub--13">{over ? `You only have ${amt(avail)} ${symbol} available` : `≈ ${usd(n * coin.price)}`}</span>
        </div>
        <div className="fl-stack-8">
          <span className="fl-label fl-label--dark">Lock period</span>
          <div className="sf-locks" role="radiogroup" aria-label="Lock period">
            {LOCK_OPTIONS.map((o) => (
              <button key={o.key} type="button" role="radio" aria-checked={lock === o.key} className={`sf-lock${lock === o.key ? " is-on" : ""}`} onClick={() => setLock(o.key)}>
                <span>{o.key}</span>
                <span className="sf-lock__apy">{(coin.apy + o.boost).toFixed(2)}% APY</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sf-summary">
          <Projection amount={n || 1} apy={apy} sym={symbol} />
          <div className="sf-summary__rows">
            <Row label="Est. yearly reward">
              <span className="sf-up">
                {amt(reward)} {symbol} ≈ {usd(reward * coin.price)}
              </span>
            </Row>
            <Row label="First reward" value="Tomorrow, 00:00 UTC" />
            <Row label="Unlocks on" value={unlock || "Anytime"} />
            <Row label="Unstake early" value={opt.days ? "Not available while locked" : "Anytime · 1–2 day cooldown"} />
          </div>
        </div>
        <div className="sf-auto">
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">Auto-compound rewards</span>
            <span className="fl-sub fl-sub--11">Restake rewards daily to earn more</span>
          </span>
          <Toggle on={auto} onChange={setAuto} label="Auto-compound rewards" />
        </div>
        {opt.days > 0 && (
          <label className="sf-ack">
            <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
            <span className={`hf-box${ok ? " is-on" : ""}`}>{ok && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
            I understand this {symbol} is locked until {unlock}
          </label>
        )}
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className="btn-primary ob-btn" disabled={!valid} onClick={stake}>
            Stake {n ? amt(n) : ""} {symbol}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 01B · Stake · You’re earning ───────────── */

export function StakeDone({ symbol = "ETH", amount = 1, apy = 4.8, days = 90 }) {
  const coin = coinOf(symbol);
  const reward = (amount * apy) / 100;
  return (
    <Modal onClose={closeFlow} labelledBy="sf-done-title" width={400}>
      <div className="fl-dialog sf-done">
        <span className="sf-done__icon" aria-hidden="true">
          <span>
            <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
          </span>
        </span>
        <div className="sf-done__text">
          <h2 id="sf-done-title">
            You’re staking {amt(amount)} {symbol}
          </h2>
          <p>Rewards start tomorrow and are restaked automatically.</p>
        </div>
        <div className="sf-card">
          <Row label="Position ID">
            <span className="hf-brand">
              STK-{symbol}-0{291 + Math.round(amount * 7) % 50}
            </span>
          </Row>
          <hr className="fl-hr" />
          <Row label="APY" value={`${apy.toFixed(2)}% · ${days ? `${days}-day lock` : "Flexible"}`} />
          <Row label="Est. yearly reward">
            <span className="sf-up">
              {amt(reward)} {symbol} ≈ {usd(reward * coin.price)}
            </span>
          </Row>
          <Row label="First reward" value={`${fmtShort(addDays(1))}, 00:00 UTC`} />
          <Row label="Unlocks on" value={days ? fmtDate(addDays(days)) : "Anytime"} />
        </div>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("stake.manage", { symbol })}>
            View position
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 02A · Position · Manage your stake ───────────── */

const WEEKS = [0.62, 0.68, 0.64, 0.7, 0.72, 0.68, 0.74, 0.88];

export function ManageStake({ symbol = "ETH" }) {
  const st = stakeStore.use();
  const p = st.positions[symbol];
  const coin = coinOf(symbol);
  if (!p) {
    return (
      <Drawer onClose={closeFlow} labelledBy="sf-manage-title">
        <div className="fl-drawer fl-drawer--20">
          <CoinHead id="sf-manage-title" coin={coin} title={`${coin.name} stake`} sub="No active position" onClose={closeFlow} />
          <p className="fl-sub fl-sub--13">You’ve fully unstaked this asset. Stake again any time.</p>
          <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("stake.amount", { symbol })}>
            Stake {symbol}
          </button>
        </div>
      </Drawer>
    );
  }
  const days = lockDays(p.lock);
  const earned = (p.amount * coin.apy * Math.max(p.elapsed, 1)) / 36500;
  const since = fmtDate(addDays(-p.elapsed));
  const locked = days > p.elapsed;
  const setAuto = (auto) => stakeStore.set((s) => ({ ...s, positions: { ...s.positions, [symbol]: { ...p, auto } } }));
  return (
    <Drawer onClose={closeFlow} labelledBy="sf-manage-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <CoinHead id="sf-manage-title" coin={coin} title={`${coin.name} stake`} sub={`${p.lock === "Flexible" ? "Flexible" : `${p.lock} lock`} · since ${since}`} onClose={closeFlow} />
          <div className="sf-pos">
            <span className="sf-pos__amount">
              {amt(p.amount)} {symbol}
            </span>
            <span className="sf-pos__sub">
              {usd(valueOf(symbol, p))}
              <span className="sf-apy-pill">{coin.apy.toFixed(2)}% APY</span>
            </span>
            <hr className="fl-hr" />
            <div className="sf-pos__stats">
              <span>
                <span className="fl-sub fl-sub--11">Earned</span>
                <span className="sf-up fl-strong--13">
                  +{amt(earned)} {symbol}
                </span>
              </span>
              <span>
                <span className="fl-sub fl-sub--11">Value</span>
                <span className="fl-strong fl-strong--13">{usd(earned * coin.price)}</span>
              </span>
              <span>
                <span className="fl-sub fl-sub--11">Next reward</span>
                <span className="fl-strong fl-strong--13">in 6h 12m</span>
              </span>
            </div>
          </div>
          <div className="fl-stack-8">
            <div className="fl-activity__head">
              <span className="fl-strong fl-strong--13">Rewards per week</span>
              <span className="fl-sub fl-sub--11">Last 8 weeks</span>
            </div>
            <div className="sf-weeks">
              {WEEKS.map((h, i) => (
                <span key={i} className={`sf-week${i === 7 ? " is-now" : ""}`}>
                  <span className="sf-week__bar" style={{ height: `${h * 64}px` }} title={`W${i + 1}: +${amt((earned / 8) * h * 1.4)} ${symbol}`} />
                  <span className="sf-week__label">W{i + 1}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="sf-card">
            <Row label="Lock type" value={p.lock === "Flexible" ? "Flexible" : `${p.lock} lock`} />
            <Row label={locked ? "Unlocks on" : "Unstake time"} value={locked ? fmtDate(addDays(days - p.elapsed)) : "1–2 days cooldown"} />
            <Row label="Early-unstake fee">
              <span className={locked ? "sf-down" : "sf-up"}>{locked ? "Forfeit lock rewards" : "None"}</span>
            </Row>
            <hr className="fl-hr" />
            <div className="fl-row is-strong">
              <span className="fl-row__label">Auto-compound rewards</span>
              <Toggle on={p.auto} onChange={setAuto} label="Auto-compound rewards" />
            </div>
          </div>
        </div>
        <div className="sf-foot sf-foot--drawer">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("stake.unstake", { symbol })}>
            Unstake
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("stake.amount", { symbol })}>
            Stake more
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 02B · Unstake · Know the cost before you leave ───────────── */

export function Unstake({ symbol = "ADA" }) {
  const st = stakeStore.get();
  const p = st.positions[symbol];
  const coin = coinOf(symbol);
  const days = lockDays(p.lock);
  const locked = days > p.elapsed;
  const left = locked ? days - p.elapsed : 0;
  const [mode, setMode] = useState(locked ? "Unstake now" : "Unstake now");
  const [done, setDone] = useState(false);
  const forfeit = locked ? (p.amount * coin.apy * p.elapsed) / 36500 : 0;
  const now = mode === "Unstake now";
  const waitLabel = `Wait ${left} days · no fee`;
  const receiveOn = now ? addDays(2) : addDays(left + 2);

  const confirm = () => {
    if (now) {
      stakeStore.set((s) => {
        const positions = { ...s.positions };
        delete positions[symbol];
        return {
          ...s,
          positions,
          activity: [{ title: `Unstaked ${amt(p.amount)} ${symbol}`, date: fmtDate(TODAY), time: "10:41 AM" }, ...s.activity].slice(0, 4),
        };
      });
    }
    setDone(true);
  };

  if (done) {
    return (
      <Modal onClose={closeFlow} labelledBy="sf-unstaked-title" width={400}>
        <div className="fl-dialog sf-done">
          <span className="sf-done__icon" aria-hidden="true">
            <span>
              <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="sf-unstaked-title">{now ? `Unstaking ${amt(p.amount)} ${symbol}` : "Reminder set"}</h2>
            <p>
              {now
                ? `It lands in your Funding wallet on ${fmtShort(receiveOn)}.`
                : `We’ll remind you on ${fmtShort(addDays(left))}, when this ${symbol} unlocks with no fee.`}
            </p>
          </div>
          <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="sf-unstake-title" width={400}>
      <div className="fl-dialog sf-unstake">
        <CoinHead id="sf-unstake-title" coin={coin} title={`Unstake ${coin.name}`} sub={`${amt(p.amount)} ${symbol} · ${p.lock === "Flexible" ? "Flexible" : `${days}-day lock`}`} onClose={closeFlow} />
        {locked && (
          <>
            <div className="sf-locked">
              <div className="sf-locked__top">
                <span className="fl-strong fl-strong--13">
                  {p.elapsed} of {days} days locked
                </span>
                <span className="fl-sub fl-sub--11">Unlocks {fmtDate(addDays(left))}</span>
              </div>
              <span className="sf-locked__bar">
                <span style={{ width: `${(p.elapsed / days) * 100}%` }} />
              </span>
            </div>
            <Segmented options={[waitLabel, "Unstake now"]} value={now ? "Unstake now" : waitLabel} onChange={(v) => setMode(v === "Unstake now" ? v : "wait")} label="When" className="hf-seg" />
            {now && (
              <p className="sf-warn">
                <img className="mono" src={a("hp-error.svg")} alt="" width="16" height="16" />
                Unstaking early forfeits the rewards earned this lock and adds a 2-day cooldown.
              </p>
            )}
          </>
        )}
        <div className="sf-card">
          <Row label="You unstake" value={`${amt(p.amount)} ${symbol}`} />
          {locked && now && (
            <Row label="Forfeited rewards">
              <span className="sf-down">
                −{amt(forfeit)} {symbol}
              </span>
            </Row>
          )}
          <Row label="Cooldown" value={now ? "2 days" : `${left} days + 2 days`} />
          <hr className="fl-hr" />
          <Row strong label="You receive" value={`${amt(p.amount)} ${symbol} on ${fmtShort(receiveOn)}`} />
        </div>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Keep staking
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={confirm}>
            {now ? "Unstake now" : "Remind me"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 03A · Filter · Find the right stake ───────────── */

export function StakeFilter({ anchor }) {
  const st = stakeStore.get();
  const [f, setF] = useState(st.filter);
  const count = filterAssets(st, "", f).length;
  const groupCount = (g) => stakingAssets.filter((c) => g.test(lockDays(c.lock))).length;
  const toggle = (k) => setF({ ...f, locks: f.locks.includes(k) ? f.locks.filter((x) => x !== k) : [...f.locks, k] });
  return (
    <Popover onClose={closeFlow} label="Filter staking assets" anchor={anchor} width={300}>
      <div className="sf-filter">
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--11">Show</span>
          <div className="sf-tabs" role="tablist">
            {["All", "Staked", "Not staked"].map((s) => (
              <button key={s} type="button" role="tab" aria-selected={f.show === s} className={`sf-tab${f.show === s ? " is-on" : ""}`} onClick={() => setF({ ...f, show: s })}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--11">Lock type</span>
          {LOCK_GROUPS.map((g) => (
            <label key={g.key} className="hf-opt sf-opt">
              <input type="checkbox" checked={f.locks.includes(g.key)} onChange={() => toggle(g.key)} />
              <span className={`hf-box${f.locks.includes(g.key) ? " is-on" : ""}`}>{f.locks.includes(g.key) && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
              <span className="sf-opt__name">{g.label}</span>
              <span className="hf-type__count">{groupCount(g)}</span>
            </label>
          ))}
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--11">Sort by</span>
          <Segmented options={["APY", "Your stake", "Name"]} value={f.sort} onChange={(sort) => setF({ ...f, sort })} label="Sort by" className="hf-seg sf-sort" />
        </div>
        <div className="hf-pop__foot">
          <button
            type="button"
            className="ob-btn ob-btn--ghost"
            onClick={() => {
              stakeStore.set((s) => ({ ...s, filtered: false, filter: { show: "All", locks: ["Flexible", "Fixed", "Long"], sort: "APY" } }));
              closeFlow();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn-primary ob-btn"
            disabled={!count}
            onClick={() => {
              stakeStore.set((s) => ({ ...s, filter: f, filtered: true }));
              closeFlow();
            }}
          >
            {count ? `Show ${count}` : "No matches"}
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── 04A · Rewards · Claim or restake ───────────── */

const UNCLAIMED = [
  { sym: "ETH", amount: 0.0219, usd: 70.49, color: "#627eea" },
  { sym: "BNB", amount: 0.0828, usd: 50.7, color: "#f3ba2f" },
  { sym: "DOT", amount: 4.312, usd: 33.81, color: "#e6007a" },
  { sym: "BTC", amount: 0.00021, usd: 20.2, color: "#f7931a" },
  { sym: "ADA", amount: 9.81, usd: 12.22, color: "#d9d9d9" },
];

export function ClaimRewards() {
  const st = stakeStore.use();
  const [picked, setPicked] = useState(["ETH", "BNB", "DOT", "BTC"]);
  const [mode, setMode] = useState("Restake (+0.4% APY boost)");
  const [done, setDone] = useState(false);
  const total = UNCLAIMED.reduce((n, r) => n + r.usd, 0);
  const sum = UNCLAIMED.filter((r) => picked.includes(r.sym)).reduce((n, r) => n + r.usd, 0);
  const restake = mode.startsWith("Restake");
  const run = () => {
    stakeStore.set((s) => ({
      ...s,
      claimed: true,
      activity: [{ title: restake ? `Restaked ${usd(sum)} rewards` : `Claimed ${usd(sum)} rewards`, date: fmtDate(TODAY), time: "10:41 AM" }, ...s.activity].slice(0, 4),
    }));
    setDone(true);
  };

  if (done || st.claimed) {
    return (
      <Modal onClose={closeFlow} labelledBy="sf-claimed-title" width={400}>
        <div className="fl-dialog sf-done">
          <span className="sf-done__icon" aria-hidden="true">
            <span>
              <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="sf-claimed-title">{done ? (restake ? `Restaked ${usd(sum)}` : `Claimed ${usd(sum)}`) : "All caught up"}</h2>
            <p>{done ? (restake ? "Added to your positions. Your APY boost starts tomorrow." : "Sent to your Funding wallet.") : "New rewards arrive daily at 00:00 UTC."}</p>
          </div>
          <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="sf-rewards-title" width={400}>
      <div className="fl-dialog sf-rewards">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="sf-rewards-title" className="fl-head__title">
              Your rewards
            </h2>
            <p className="fl-head__sub">Unclaimed since Oct 01</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="sf-total">
          <span className="sf-total__value">{usd(total)}</span>
          <span className="fl-sub fl-sub--13">from {UNCLAIMED.length} active stakes</span>
          <span className="sf-split" aria-hidden="true">
            {UNCLAIMED.map((r) => (
              <span key={r.sym} style={{ flex: r.usd, background: r.color }} />
            ))}
          </span>
        </div>
        <div className="sf-claim-list">
          {UNCLAIMED.map((r) => {
            const on = picked.includes(r.sym);
            return (
              <label key={r.sym} className={`sf-claim${on ? "" : " is-off"}`}>
                <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== r.sym) : [...p, r.sym]))} />
                <span className={`sf-radio${on ? " is-on" : ""}`} />
                <img src={`/assets/w-${r.sym.toLowerCase()}.svg`} alt="" width="20" height="20" />
                <span className="sf-claim__amt">
                  {r.amount} {r.sym}
                </span>
                <span className="sf-claim__usd">{usd(r.usd)}</span>
              </label>
            );
          })}
        </div>
        <Segmented options={["Restake (+0.4% APY boost)", "Claim to Funding"]} value={mode} onChange={setMode} label="What to do" className="hf-seg" />
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className="btn-primary ob-btn" disabled={!picked.length} onClick={run}>
            {restake ? "Restake" : "Claim"} {usd(sum)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 05A · APY · What you actually earn ───────────── */

export function ApyExplainer({ anchor, symbol = "BTC" }) {
  const coin = coinOf(symbol);
  const boost = 0.52;
  const base = coin.apy - boost;
  const tiers = LOCK_OPTIONS.map((o) => ({ label: o.key, apy: coin.apy + o.boost }));
  const max = tiers[tiers.length - 1].apy;
  return (
    <Popover onClose={closeFlow} label={`${coin.name} APY`} anchor={anchor} align="left" width={368}>
      <div className="sf-apy">
        <CoinHead coin={coin} title={coin.name} sub="Variable · updated daily" onClose={closeFlow} />
        <span className="sf-apy__value">{coin.apy.toFixed(2)}% APY</span>
        <div className="sf-card">
          <Row label="Base network reward" value={`${base.toFixed(2)}%`} />
          <Row label="Zentra boost">
            <span className="sf-up">+{boost.toFixed(2)}%</span>
          </Row>
          <hr className="fl-hr" />
          <Row label="Service fee" value="included" />
        </div>
        <div className="fl-stack-16">
          <span className="fl-strong fl-strong--13">APY by lock period</span>
          <div className="sf-tiers">
            {tiers.map((t, i) => (
              <span key={t.label} className={`sf-tier${i === 0 ? " is-now" : ""}`}>
                <span className="sf-tier__value">{t.apy.toFixed(2)}%</span>
                <span className="sf-tier__bar" style={{ height: `${(t.apy / max) * 80}px` }} />
                <span className="sf-tier__label">{t.label}</span>
              </span>
            ))}
          </div>
        </div>
        <p className="sf-note">
          <span className="fl-strong fl-strong--13">
            $1,000 for a year ≈ ${(coin.apy * 10).toFixed(2)} in {symbol}
          </span>
          <span className="fl-sub fl-sub--11">Rates can change; past rewards aren’t guaranteed.</span>
        </p>
        <button type="button" className="btn-primary ob-btn sf-apy__cta" onClick={() => openFlow("stake.amount", { symbol })}>
          Stake {symbol}
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Stake Portfolio · Breakdown ───────────── */

const MONTHS = [
  ["May", 0.38],
  ["Jun", 0.46],
  ["Jul", 0.5],
  ["Aug", 0.56],
  ["Sep", 0.66],
  ["Oct", 1],
];

export function StakeBreakdown({ anchor }) {
  const st = stakeStore.use();
  const { list, total, apy } = portfolio(st);
  return (
    <Popover onClose={closeFlow} label="Staking breakdown" anchor={anchor} width={316}>
      <div className="sf-break">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 className="fl-head__title">{usd(total)} staked</h2>
            <p className="fl-head__sub">
              {list.length} positions · avg. {apy.toFixed(2)}% APY
            </p>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={a("hp-close.svg")} alt="" width="18" height="18" />
          </button>
        </div>
        <span className="sf-split" aria-hidden="true">
          {list.map((x) => (
            <span key={x.sym} style={{ flex: x.value, background: x.coin.color }} />
          ))}
        </span>
        <div className="sf-break__list">
          {list.map((x) => (
            <button key={x.sym} type="button" className="sf-break__row" onClick={() => openFlow("stake.manage", { symbol: x.sym })}>
              <span className="hf-dot" style={{ background: x.coin.color }} />
              <span className="sf-break__name">{x.coin.name}</span>
              <span className="fl-strong fl-strong--13">{usd(x.value)}</span>
              <span className="sf-break__pct">{Math.round((x.value / total) * 100)}%</span>
            </button>
          ))}
        </div>
        <div className="fl-stack-8">
          <div className="fl-activity__head">
            <span className="fl-strong fl-strong--13">Rewards per month</span>
            <span className="sf-up fl-sub--11">+$99.10 this month</span>
          </div>
          <div className="sf-months">
            {MONTHS.map(([m, h], i) => (
              <span key={m} className={`sf-month${i === MONTHS.length - 1 ? " is-now" : ""}`}>
                <span className="sf-month__bar" style={{ height: `${h * 66}px` }} title={`${m}: ${usd(99.1 * h)}`} />
                <span className="sf-month__label">{m}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Popover>
  );
}
