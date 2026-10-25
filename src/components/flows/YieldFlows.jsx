import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Segmented } from "../Settings";
import { Row } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { positions, pools, farmingActivity, yieldCoins, PRICES } from "../../yieldData";

const a = (name) => `/assets/${name}`;
export const usd = (n, d = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
const tok = (n) => n.toLocaleString("en-US", { maximumFractionDigits: n >= 1000 ? 0 : n >= 1 ? 2 : 4, minimumFractionDigits: n >= 1000 ? 0 : n >= 1 ? 2 : 4 });
const px = (n) => (n >= 1000 ? Math.round(n).toLocaleString("en-US") : n >= 1 ? n.toFixed(2) : n.toPrecision(3));
const k = (n) => (n >= 1000 ? `${(n / 1000).toFixed(2)}k` : px(n));

/* ───────────── Shared state ───────────── */

export const yieldStore = createStore({
  positions,
  activity: farmingActivity,
  range: "30D",
});

const log = (s, title, pair, amount) => ({ ...s, activity: [{ title, pair, date: "Oct 19, 2026", time: "10:41 AM", amount }, ...s.activity].slice(0, 3) });
export const posOf = (pair, st = yieldStore.get()) => st.positions.find((p) => p.pair === pair);
export const pairPrice = (base, quote) => PRICES[base] / PRICES[quote];

export function summary(st) {
  const list = st.positions;
  const deposited = list.reduce((n, p) => n + p.deposited, 0);
  const apy = deposited ? list.reduce((n, p) => n + p.apy * p.deposited, 0) / deposited : 0;
  const rewards = list.reduce((n, p) => n + p.rewards, 0);
  return { deposited, apy, rewards, count: list.length };
}

function PairIcons({ base, quote, size = 28 }) {
  return (
    <span className="yf-pair-icons yfl-pair">
      <img src={yieldCoins[base]} alt="" width={size} height={size} />
      <img src={yieldCoins[quote]} alt="" width={size} height={size} />
    </span>
  );
}

function PairHead({ base, quote, title, sub, id }) {
  return (
    <div className="fl-head sf-head">
      <PairIcons base={base} quote={quote} />
      <div className="fl-head__text">
        <h2 id={id} className="fl-head__title">
          {title}
        </h2>
        <p className="fl-head__sub">{sub}</p>
      </div>
      <CloseButton onClick={closeFlow} />
    </div>
  );
}

function Done({ id, title, sub }) {
  return (
    <div className="fl-dialog sf-done">
      <span className="sf-done__icon" aria-hidden="true">
        <span>
          <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
        </span>
      </span>
      <div className="sf-done__text">
        <h2 id={id}>{title}</h2>
        <p>{sub}</p>
      </div>
      <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
        Done
      </button>
    </div>
  );
}

// The price over 30 days inside the band where the position earns fees.
const WAVE = [0.3, 0.32, 0.3, 0.35, 0.37, 0.34, 0.38, 0.4, 0.37, 0.41, 0.43, 0.4, 0.42, 0.45, 0.44, 0.47];

function RangeChart({ lo, hi, price, rising = false, height = 96, label = true }) {
  const W = 340;
  const H = height;
  const pad = 14;
  const band = [pad, H - pad];
  const pts = rising
    ? WAVE.map((_, i) => 0.25 + (i / 15) * 0.95 + Math.sin(i) * 0.03)
    : WAVE.map((v) => v + 0.12);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * (W - 52), band[1] - v * (band[1] - band[0])]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${Math.max(4, y).toFixed(1)}`).join(" ");
  const last = xy[xy.length - 1];
  return (
    <div className="yfl-range">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y={band[0]} width={W - 52} height={band[1] - band[0]} fill="rgba(72,177,135,0.14)" />
        <line x1="0" x2={W - 52} y1={band[0]} y2={band[0]} stroke="#48b187" strokeDasharray="4 3" />
        <line x1="0" x2={W - 52} y1={band[1]} y2={band[1]} stroke="#48b187" strokeDasharray="4 3" />
        <path d={d} fill="none" stroke={rising ? "#fe7701" : "#5720f5"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="yfl-range__hi" style={{ top: band[0] - 7 }}>
        {k(hi)}
      </span>
      <span className="yfl-range__lo" style={{ top: band[1] - 7 }}>
        {k(lo)}
      </span>
      <span className={`yfl-range__dot${rising ? " is-out" : ""}`} style={{ left: `${(last[0] / W) * 100}%`, top: Math.max(4, last[1]) }} />
      {label && (
        <span className="yfl-range__tip" style={{ left: `${(last[0] / W) * 100}%`, top: Math.max(4, last[1]) - 26 }}>
          {px(price)}
        </span>
      )}
    </div>
  );
}

/* ───────────── 01A · Add liquidity · Deposit & choose range ───────────── */

const BALANCES = { ETH: 2.15, USDC: 7960.11, USDT: 7960.11, SOL: 42.5, BTC: 0.125, ARB: 5200, LINK: 120, AVAX: 85, DOT: 640 };
const WIDTHS = [
  { key: "Narrow ±10%", w: 0.1, boost: 1.5 },
  { key: "Balanced ±25%", w: 0.25, boost: 1 },
  { key: "Full range", w: 0.9, boost: 0.42 },
];
const TVL = { "ETH/USDC": 24.8e6, "SOL/USDC": 18.7e6, "BTC/USDT": 32.4e6, "ARB/ETH": 10.6e6, "USDC/USDT": 58.3e6, "LINK/ETH": 21.6e6, "AVAX/USDC": 16.1e6, "DOT/USDT": 8.7e6 };

function poolInfo(pair) {
  const pos = posOf(pair);
  if (pos) return { base: pos.base, quote: pos.quote, apy: pos.apy + 2.4, fee: "0.3%" };
  const pool = pools.find((p) => p.pair === pair);
  return { base: pool.coins[0], quote: pool.coins[1], apy: parseFloat(pool.apy), fee: pool.fee };
}

export function AddLiquidity({ pair = "ETH/USDC" }) {
  const { base, quote, apy: baseApy, fee } = poolInfo(pair);
  const price = pairPrice(base, quote);
  const [qAmt, setQAmt] = useState(Math.min(2500 / PRICES[quote], BALANCES[quote]));
  const [width, setWidth] = useState(WIDTHS[1].key);
  const [step, setStep] = useState("edit");
  const bAmt = (qAmt * PRICES[quote]) / PRICES[base];
  const total = qAmt * PRICES[quote] * 2;
  const w = WIDTHS.find((x) => x.key === width);
  const stable = base.startsWith("USD") && quote.startsWith("USD");
  const apy = baseApy * w.boost;
  const lo = price * (1 - w.w);
  const hi = price * (1 + w.w * (w.w < 0.5 ? 1.0 : 3));
  const over = bAmt > BALANCES[base] || qAmt > BALANCES[quote];
  const setBase = (v) => setQAmt(((parseFloat(v) || 0) * PRICES[base]) / PRICES[quote]);
  const maxBoth = () => setQAmt(Math.min(BALANCES[quote], (BALANCES[base] * PRICES[base]) / PRICES[quote]));

  const confirm = () => {
    yieldStore.set((s) => {
      const has = s.positions.find((p) => p.pair === pair);
      const positions = has
        ? s.positions.map((p) => (p.pair === pair ? { ...p, deposited: p.deposited + total, value: p.value + total, baseAmt: p.baseAmt + bAmt, quoteAmt: p.quoteAmt + qAmt } : p))
        : [
            ...s.positions,
            { pair, label: pair, base, quote, deposited: total, baseAmt: bAmt, quoteAmt: qAmt, value: total, valueChange: 0, rewards: 0, rewardToken: quote.startsWith("USD") ? quote : "USDC", apy: +apy.toFixed(1), apyChange: 0, since: "Oct 19, 2026", range: [lo, hi], icons: [yieldCoins[base], yieldCoins[quote]] },
          ];
      return log({ ...s, positions }, "Liquidity Added", pair, `+${usd(total)}`);
    });
    setStep("done");
  };

  if (step === "done") {
    return (
      <Modal onClose={closeFlow} labelledBy="yfl-added" width={400}>
        <Done id="yfl-added" title={`You added ${usd(total)}`} sub={`Your ${pair} position is earning fees while the price stays between ${k(lo)} and ${k(hi)}.`} />
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="yfl-add-title" width={452}>
      <div className="fl-dialog yfl-add">
        <PairHead id="yfl-add-title" base={base} quote={quote} title={step === "review" ? "Review deposit" : "Add liquidity"} sub={`${pair} · ${fee} fee tier`} />
        {step === "edit" ? (
          <>
            <div className="fl-stack-8">
              <div className="fl-activity__head">
                <span className="fl-strong fl-strong--13">You deposit</span>
                <span className="fl-strong fl-strong--13">Total {usd(total)}</span>
              </div>
              <div className="yfl-tokens">
                {[
                  [base, bAmt, setBase],
                  [quote, qAmt, (v) => setQAmt(parseFloat(v) || 0)],
                ].map(([sym, n, set]) => (
                  <label key={sym} className={`yfl-token${n > BALANCES[sym] ? " is-error" : ""}`}>
                    <span className="yfl-token__top">
                      <img src={yieldCoins[sym]} alt="" width="28" height="28" />
                      <button type="button" className="sf-max" onClick={maxBoth}>
                        Max
                      </button>
                    </span>
                    <span className="yfl-token__amt">
                      <input key={`${sym}${n.toFixed(6)}`} defaultValue={tok(n).replace(/,/g, "")} inputMode="decimal" aria-label={`${sym} amount`} onBlur={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && set(e.target.value)} />
                      <span>{sym}</span>
                    </span>
                    <span className="fl-sub fl-sub--11">≈ {usd(n * PRICES[sym])}</span>
                    <span className="fl-sub fl-sub--11 yfl-token__bal">
                      Balance {tok(BALANCES[sym])} {sym}
                    </span>
                  </label>
                ))}
              </div>
              <div className="yfl-balance">
                <span className="yfl-balance__bar">
                  <span />
                  <span />
                </span>
                <span className="yfl-balance__labels">
                  <span>{base} 50%</span>
                  <span className="yfl-auto">⟳ Auto-balanced</span>
                  <span>{quote} 50%</span>
                </span>
              </div>
            </div>
            <div className="fl-stack-8">
              <span className="fl-label fl-label--dark">Price range</span>
              <Segmented options={WIDTHS.map((x) => x.key)} value={width} onChange={setWidth} label="Price range" className="hf-seg" />
              <RangeChart lo={lo} hi={hi} price={price} />
              <div className="yfl-range__x">
                {["30d ago", "20d", "10d", "Now"].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
            </div>
            <div className="fl-stack-8 yfl-rows">
              <Row label="Est. APY">
                <span className="sf-up">{apy.toFixed(1)}%</span>
              </Row>
              <Row label="Est. fees per month" value={usd((total * apy) / 1200)} />
              <Row label="Your pool share" value={`${((total / TVL[pair]) * 100).toFixed(3)}%`} />
            </div>
            {!stable && (
              <p className="sf-warn yfl-warn">
                <img className="mono" src={a("hp-error.svg")} alt="" width="16" height="16" />
                If {base} moves outside {px(lo)} – {px(hi)} {quote} you stop earning fees, and you may end up with more of the falling token (impermanent loss).
              </p>
            )}
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
                Cancel
              </button>
              <button type="button" className="btn-primary ob-btn" disabled={!total || over} onClick={() => setStep("review")}>
                {over ? "Not enough balance" : `Review deposit · ${usd(total, 0)}`}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sf-card">
              <Row label={`${base} in`} value={`${tok(bAmt)} ${base}`} />
              <Row label={`${quote} in`} value={`${tok(qAmt)} ${quote}`} />
              <Row label="Price range" value={`${px(lo)} – ${px(hi)}`} />
              <Row label="Est. APY">
                <span className="sf-up">{apy.toFixed(1)}%</span>
              </Row>
              <Row label="Network fee" value="≈ $0.86" />
              <hr className="fl-hr" />
              <Row strong label="Total deposit" value={usd(total)} />
            </div>
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setStep("edit")}>
                Back
              </button>
              <button type="button" className="btn-primary ob-btn" onClick={confirm}>
                Confirm deposit
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ───────────── 02A · Position · What you’ve really earned ───────────── */

export function PositionDetail({ pair = "ETH/USDC" }) {
  const st = yieldStore.use();
  const p = posOf(pair, st);
  if (!p) {
    return (
      <Drawer onClose={closeFlow} labelledBy="yfl-pos-title">
        <div className="fl-drawer fl-drawer--20">
          <div className="fl-head">
            <div className="fl-head__text">
              <h2 id="yfl-pos-title" className="fl-head__title">
                Position closed
              </h2>
            </div>
            <CloseButton onClick={closeFlow} />
          </div>
          <p className="fl-sub fl-sub--13">This position moved to History. Open a new one any time from Featured Pools.</p>
        </div>
      </Drawer>
    );
  }
  const gain = p.value - p.deposited;
  const fees = gain * 0.711;
  const il = -gain * 0.156;
  const move = gain - fees - il;
  const price = pairPrice(p.base, p.quote);
  const out = !!p.outOfRange;
  const parts = [
    ["Trading fees earned", fees],
    ["Price change", move],
  ];
  return (
    <Drawer onClose={closeFlow} labelledBy="yfl-pos-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <PairHead id="yfl-pos-title" base={p.base} quote={p.quote} title={p.pair} sub={`0.3% fee · since ${p.since}`} />
          <div className="yfl-hero">
            <span className="yfl-hero__value">{usd(p.value)}</span>
            <span className="yfl-hero__sub">
              deposited {usd(p.deposited)}
              <span className="yfl-chip">{gain >= 0 ? "+" : "−"}{((Math.abs(gain) / p.deposited) * 100).toFixed(2)}%</span>
              <span className="yfl-chip">{out ? "Out of range" : "In range"}</span>
            </span>
          </div>
          <div className="sf-card">
            <span className="fl-strong fl-strong--13">
              Where the {gain >= 0 ? "+" : "−"}
              {usd(Math.abs(gain))} came from
            </span>
            <span className="yfl-split" aria-hidden="true">
              <span style={{ flex: Math.max(fees, 0), background: "#48b187" }} />
              <span style={{ flex: Math.max(move, 0), background: "#0379df" }} />
            </span>
            {parts.map(([l, v]) => (
              <Row key={l} label={l}>
                <span className={v >= 0 ? "sf-up" : "sf-down"}>
                  {v >= 0 ? "+" : "−"}
                  {usd(Math.abs(v))}
                </span>
              </Row>
            ))}
            <Row label="Impermanent loss vs holding">
              <span className="sf-down">−{usd(Math.abs(il))}</span>
            </Row>
          </div>
          <div className="fl-stack-8">
            <span className="fl-strong fl-strong--13">Your tokens in the pool now</span>
            <div className="hf-tiles">
              <div className="hf-tile">
                <span className="fl-sub fl-sub--11">{p.base}</span>
                <span className="fl-strong fl-strong--13">
                  {tok(p.value / 2 / PRICES[p.base])} {p.base} · {usd(p.value / 2)}
                </span>
              </div>
              <div className="hf-tile">
                <span className="fl-sub fl-sub--11">{p.quote}</span>
                <span className="fl-strong fl-strong--13">
                  {tok(p.value / 2 / PRICES[p.quote])} {p.quote}
                </span>
              </div>
            </div>
          </div>
          <div className="fl-stack-8">
            <div className="fl-activity__head">
              <span className="fl-strong fl-strong--13">Price vs your range</span>
              <span className={`yfl-earning${out ? " is-out" : ""}`}>{out ? "Not earning" : "Earning"}</span>
            </div>
            <RangeChart lo={p.range[0]} hi={p.range[1]} price={out ? p.range[1] * 1.08 : price} rising={out} />
            <div className="yfl-range__x">
              {["30d ago", "20d", "10d", "Now"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="yfl-actions">
          <button type="button" className="btn-primary ob-btn" disabled={!p.rewards} onClick={() => openFlow("yield.claim", { only: p.pair })}>
            {p.rewards ? `Claim ${usd(p.rewards)}` : "No rewards to claim yet"}
          </button>
          <div className="sf-foot">
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("yield.add", { pair: p.pair })}>
              Add more
            </button>
            <button type="button" className="ob-btn ob-btn--ghost yfl-danger" onClick={() => openFlow("yield.remove", { pair: p.pair })}>
              Remove liquidity
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 02B / 02C · Remove liquidity · Partial, full ───────────── */

export function RemoveLiquidity({ pair = "SOL/USDC" }) {
  const p = posOf(pair);
  const [pct, setPct] = useState(50);
  const [done, setDone] = useState(false);
  const f = pct / 100;
  const full = pct === 100;
  const baseOut = (p.value / 2 / PRICES[p.base]) * f;
  const quoteOut = (p.value / 2 / PRICES[p.quote]) * f;
  const rew = p.rewards * f;
  const total = p.value * f + rew;

  const confirm = () => {
    yieldStore.set((s) => {
      const positions = full
        ? s.positions.filter((x) => x.pair !== pair)
        : s.positions.map((x) => (x.pair === pair ? { ...x, value: x.value * (1 - f), deposited: x.deposited * (1 - f), baseAmt: x.baseAmt * (1 - f), quoteAmt: x.quoteAmt * (1 - f), rewards: x.rewards * (1 - f) } : x));
      return log({ ...s, positions }, full ? "Position Closed" : "Liquidity Removed", pair, `−${usd(p.value * f)}`);
    });
    setDone(true);
  };

  if (done) {
    return (
      <Modal onClose={closeFlow} labelledBy="yfl-removed" width={400}>
        <Done id="yfl-removed" title={full ? `${pair} closed` : `Removed ${pct}%`} sub={`${usd(total)} is on its way to your Funding wallet (~1 min).`} />
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="yfl-remove-title" width={400}>
      <div className="fl-dialog yfl-remove">
        <PairHead id="yfl-remove-title" base={p.base} quote={p.quote} title="Remove liquidity" sub={`${pair} · Position ${usd(p.value)}`} />
        <div className={`yfl-amount${full ? " is-full" : ""}`}>
          <span className="yfl-amount__label">AMOUNT TO REMOVE</span>
          <span className="yfl-amount__top">
            <span className="yfl-amount__pct">{pct}%</span>
            <span className="fl-sub fl-sub--13">≈ {usd(p.value * f)}</span>
          </span>
          <input type="range" min="1" max="100" value={pct} onChange={(e) => setPct(+e.target.value)} aria-label="Percent to remove" style={{ "--p": `${pct}%` }} />
          <span className="yfl-presets">
            {[25, 50, 75, 100].map((v) => (
              <button key={v} type="button" className={pct === v ? "is-on" : ""} onClick={() => setPct(v)}>
                {v === 100 ? "Max" : `${v}%`}
              </button>
            ))}
          </span>
        </div>
        {full && (
          <p className="yfl-close-warn">
            <img src={a("st-error-red.svg")} alt="" width="16" height="16" />
            <span>
              <strong>This closes your {pair} position</strong>
              It stops earning fees and moves to History. You can open a new position any time.
            </span>
          </p>
        )}
        <div className="fl-stack-8">
          <span className="fl-strong fl-strong--13">You’ll receive</span>
          <div className="sf-claim-list yfl-receive">
            {[
              [p.base, `${tok(baseOut)} ${p.base}`, usd(baseOut * PRICES[p.base])],
              [p.quote, `${tok(quoteOut)} ${p.quote}`, usd(quoteOut * PRICES[p.quote])],
            ].map(([sym, l, v]) => (
              <div key={sym} className="sf-claim">
                <img src={yieldCoins[sym]} alt="" width="22" height="22" />
                <span className="sf-claim__amt">{l}</span>
                <span className="sf-claim__usd">{v}</span>
              </div>
            ))}
            {p.rewards > 0 && (
              <div className="sf-claim">
                <img src={yieldCoins[p.rewardToken] || yieldCoins.USDC} alt="" width="22" height="22" />
                <span className="sf-claim__amt fl-coin__name">
                  <span>
                    +{tok(rew)} {p.rewardToken}
                  </span>
                  <span className="fl-sub fl-sub--11">Unclaimed rewards · included</span>
                </span>
                <span className="sf-up">{usd(rew)}</span>
              </div>
            )}
            <div className="sf-claim">
              <span className="sf-claim__amt yfl-muted">Total value</span>
              <span className="fl-strong fl-strong--13">≈ {usd(total)}</span>
            </div>
          </div>
        </div>
        <div className="fl-stack-8 yfl-rows">
          {!full && <Row label="Stays in pool" value={`${usd(p.value * (1 - f))} · keeps earning`} />}
          <Row label="Network fee" value="≈ $0.42" />
          <Row label="Arrives in" value="Funding wallet · ~1 min" />
        </div>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className={`btn-primary ob-btn${full ? " yfl-btn-danger" : ""}`} onClick={confirm}>
            {full ? "Close position" : `Remove ${pct}%`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 03A · Rewards · Claim or compound ───────────── */

export function ClaimYield({ only }) {
  const st = yieldStore.get();
  const list = st.positions.filter((p) => p.rewards > 0);
  const [picked, setPicked] = useState(only ? [only] : list.map((p) => p.pair));
  const [dest, setDest] = useState("Funding wallet");
  const [done, setDone] = useState(null);
  const chosen = list.filter((p) => picked.includes(p.pair));
  const sum = chosen.reduce((n, p) => n + p.rewards, 0);
  const byToken = {};
  list.forEach((p) => (byToken[p.rewardToken] = (byToken[p.rewardToken] || 0) + p.rewards));
  const fee = chosen.length ? 0.86 : 0;
  const compound = dest !== "Funding wallet";
  const run = () => {
    yieldStore.set((s) => {
      const positions = s.positions.map((p) => (picked.includes(p.pair) ? { ...p, rewards: 0, value: compound ? p.value + p.rewards : p.value } : p));
      return log({ ...s, positions }, compound ? "Rewards Compounded" : "Reward Claimed", chosen.length === 1 ? chosen[0].pair : `${chosen.length} pools`, `+${usd(sum)}`);
    });
    setDone({ sum, compound });
  };

  if (done || !list.length) {
    return (
      <Modal onClose={closeFlow} labelledBy="yfl-claimed" width={400}>
        <Done
          id="yfl-claimed"
          title={done ? (done.compound ? `Compounded ${usd(done.sum)}` : `Claimed ${usd(done.sum - 0.86)}`) : "Nothing to claim"}
          sub={done ? (done.compound ? "Each reward went back into the pool it came from." : "It arrives in your Funding wallet in about a minute.") : "Rewards build up as your positions earn fees."}
        />
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="yfl-claim-title" width={400}>
      <div className="fl-dialog yfl-claim">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="yfl-claim-title" className="fl-head__title">
              Claim rewards
            </h2>
            <p className="fl-head__sub">{list.length} positions · last claimed Oct 01</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="yfl-total">
          <span className="yfl-total__value">{usd(sum)}</span>
          <span className="fl-sub fl-sub--11">
            {Object.entries(byToken)
              .map(([t, v]) => `${v.toFixed(2)} ${t}`)
              .join(" + ")}{" "}
            · paid in stablecoins
          </span>
        </div>
        <div className="sf-claim-list">
          {list.map((p) => {
            const on = picked.includes(p.pair);
            return (
              <label key={p.pair} className={`sf-claim${on ? "" : " is-off"}`}>
                <input type="checkbox" checked={on} onChange={() => setPicked((x) => (on ? x.filter((y) => y !== p.pair) : [...x, p.pair]))} />
                <span className={`sf-radio${on ? " is-on" : ""}`} />
                <PairIcons base={p.base} quote={p.quote} size={20} />
                <span className="sf-claim__amt">{p.pair}</span>
                <span className="sf-claim__usd">
                  {p.rewards.toFixed(2)} {p.rewardToken}
                </span>
              </label>
            );
          })}
        </div>
        <div className="fl-stack-8">
          <span className="fl-strong fl-strong--13">Send rewards to</span>
          <Segmented options={["Funding wallet", "Compound into pools"]} value={dest} onChange={setDest} label="Send rewards to" className="hf-seg" />
          <p className="fl-sub fl-sub--11 yfl-explain">
            {compound ? "Compounding re-adds each reward to the pool it came from, so it starts earning fees too." : "Arrives as USDC and USDT in your Funding wallet, ready to withdraw."}
          </p>
        </div>
        <div className="fl-stack-8 yfl-rows">
          <Row label="Rewards selected" value={usd(sum)} />
          <Row label="Network fee" value={`≈ ${usd(fee)}`} />
          <hr className="fl-hr" />
          <Row label="You get" value={`≈ ${usd(Math.max(0, sum - fee))}`} />
        </div>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className="btn-primary ob-btn" disabled={!chosen.length} onClick={run}>
            {compound ? "Compound" : "Claim"} {usd(Math.max(0, sum - fee))}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 04A · Status · Out of range ───────────── */

export function OutOfRange({ anchor, pair = "ARB/ETH" }) {
  const p = posOf(pair);
  const [done, setDone] = useState(false);
  const [lo, hi] = p.range;
  const now = hi * 1.08;
  const missed = (p.value * p.apy) / 100 / 365 * 7 * 0.92;
  const rebalance = () => {
    const nlo = Math.round(now * 0.9 / 10) * 10;
    const nhi = Math.round(now * 1.12 / 10) * 10;
    yieldStore.set((s) => log({ ...s, positions: s.positions.map((x) => (x.pair === pair ? { ...x, outOfRange: false, range: [nlo, nhi] } : x)) }, "Range Updated", pair, `${k(nlo)} – ${k(nhi)}`));
    setDone([nlo, nhi]);
  };
  return (
    <Popover onClose={closeFlow} label={`${pair} out of range`} anchor={anchor} width={336}>
      <div className="yfl-oor">
        <div className="hf-status__head">
          <span className="hf-status__icon is-orange">
            <img className="mono" src={a("hp-error.svg")} alt="" width="18" height="18" />
          </span>
          <span className="fl-coin__name">
            <span className="fl-strong">{done ? `${pair} is back in range` : `${pair} is out of range`}</span>
            <span className="fl-sub fl-sub--11">{done ? `New range ${k(done[0])} – ${k(done[1])}` : "Not earning fees for 7 days · since Oct 14"}</span>
          </span>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={a("hp-close.svg")} alt="" width="18" height="18" />
          </button>
        </div>
        {done ? (
          <>
            <p className="hf-status__note is-green">
              <img src={a("st-check.svg")} alt="" width="12" height="12" />
              Your position is earning fees again. We’ll tell you if it drifts out.
            </p>
            <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
              Done
            </button>
          </>
        ) : (
          <>
            <div className="yfl-legend">
              <span>
                <span className="hf-dot" style={{ background: "#fe7701" }} /> ETH price
              </span>
              <span>
                <span className="hf-dot" style={{ background: "rgba(72,177,135,0.4)" }} /> Your range
              </span>
            </div>
            <RangeChart lo={lo} hi={hi} price={now} rising height={86} label={false} />
            <div className="yfl-range__x">
              {["Oct 7", "Oct 14", "Today"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <p className="hf-status__text">
              ETH rose above your range of {lo.toLocaleString()} – {hi.toLocaleString()} ARB per ETH. Your position is now 100% ARB and earns nothing until the price comes back — or you move the range.
            </p>
            <div className="hf-tiles">
              <div className="hf-tile">
                <span className="fl-sub fl-sub--11">Missed fees so far</span>
                <span className="fl-strong fl-strong--15 yfl-orange">≈ {usd(missed)}</span>
              </div>
              <div className="hf-tile">
                <span className="fl-sub fl-sub--11">Position now</span>
                <span className="fl-strong fl-strong--15">100% ARB</span>
              </div>
            </div>
            <div className="hf-status__actions">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
                Keep waiting
              </button>
              <button type="button" className="btn-primary ob-btn" onClick={rebalance}>
                Rebalance range
              </button>
            </div>
          </>
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 05A · Risk · What could go wrong ───────────── */

const LEVELS = ["Low", "Medium", "High"];
const il = (x) => (2 * Math.sqrt(1 + x)) / (2 + x) - 1;

export function PoolRisk({ anchor, pair = "DOT/USDT" }) {
  const pool = pools.find((p) => p.pair === pair);
  const [move, setMove] = useState(0.4);
  const W = 260;
  const H = 96;
  const xs = Array.from({ length: 41 }, (_, i) => -0.8 + i * 0.04);
  const y = (v) => 6 + (-v / 0.12) * (H - 12);
  const xpx = (x) => ((x + 0.8) / 1.6) * W;
  const d = xs.map((x, i) => `${i ? "L" : "M"}${xpx(x).toFixed(1)},${Math.min(H, y(il(x))).toFixed(1)}`).join(" ");
  const loss = il(move);
  const apy = parseFloat(pool.apy);
  const weeks = Math.max(1, Math.round((Math.abs(il(0.4)) / (apy / 100)) * 52));
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1.6 - 0.8;
    setMove(Math.max(-0.8, Math.min(0.8, Math.round(x * 20) / 20)));
  };
  return (
    <Popover onClose={closeFlow} label={`${pair} risk`} anchor={anchor} align="left" width={340}>
      <div className="yfl-risk">
        <div className="hf-status__head">
          <PairIcons base={pool.coins[0]} quote={pool.coins[1]} size={22} />
          <span className="fl-coin__name">
            <span className="fl-strong">
              {pair} · <span className={`yfl-risk__lvl is-${pool.level}`}>{LEVELS[pool.level]} risk</span>
            </span>
            <span className="fl-sub fl-sub--11">
              {pool.sub} · {pool.apy} APY
            </span>
          </span>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={a("hp-close.svg")} alt="" width="18" height="18" />
          </button>
        </div>
        <div className="yfl-meter">
          {LEVELS.map((l, i) => (
            <span key={l} className={`yfl-meter__seg is-${i}${i === pool.level ? " is-on" : ""}`}>
              <span />
              {l}
            </span>
          ))}
        </div>
        <span className="fl-strong fl-strong--13">Impermanent loss if {pool.coins[0]} price changes</span>
        <div className="yfl-il" onPointerMove={pick} onClick={pick} role="img" aria-label={`A ${Math.round(move * 100)}% move costs ${(loss * 100).toFixed(1)}% vs holding`}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <path d={`${d} L${W},0 L0,0 Z`} fill="rgba(248,42,81,0.08)" />
            <path d={d} fill="none" stroke="#f82a51" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="yfl-il__dot" style={{ left: `${(xpx(move) / W) * 100}%`, top: Math.min(H, y(loss)) }} />
          <span className="yfl-il__tip" style={{ left: `${(xpx(move) / W) * 100}%`, top: Math.min(H, y(loss)) + 8 }}>
            {move >= 0 ? "+" : ""}
            {Math.round(move * 100)}% → {(loss * 100).toFixed(1)}%
          </span>
          <span className="yfl-il__y">
            <span>0%</span>
            <span>−5%</span>
            <span>−10%</span>
          </span>
        </div>
        <div className="yfl-range__x yfl-il__x">
          {["−80%", "−40%", "0", "+40%", "+80%"].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="sf-card">
          <Row label="Break-even (fees cover IL)" value={`~${weeks} week${weeks === 1 ? "" : "s"} at current APY`} />
          <Row label="Smart-contract audits" value={pool.audits} />
          <Row label="Pool age" value={`${pool.age} days`} />
        </div>
        <button type="button" className="btn-primary ob-btn sf-apy__cta" onClick={() => openFlow("yield.add", { pair })}>
          Add liquidity
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Your Yield · Range & breakdown ───────────── */

export const YIELD_RANGES = {
  "7D": { value: 118.4, change: "+9.6%", from: "Oct 12 – Oct 19", prev: "previous 7 days" },
  "30D": { value: 482.16, change: "+28.4%", from: "Sep 19 – Oct 19", prev: "previous 30 days" },
  "90D": { value: 1296.8, change: "+41.2%", from: "Jul 21 – Oct 19", prev: "previous 90 days" },
  "1Y": { value: 2184.62, change: "+24.8%", from: "Oct 19, 2025 – Oct 19, 2026", prev: "previous year" },
  All: { value: 2184.62, change: "since Jun 14", from: "Jun 14 – Oct 19, 2026", prev: "" },
};
const SHARE = [
  ["BTC/USDT", 0.36, "#f7931a"],
  ["ETH/USDC", 0.31, "#627eea"],
  ["SOL/USDC", 0.21, "#5720f5"],
  ["ARB/ETH", 0.12, "#0379df"],
];

export function YieldRange({ anchor }) {
  const st = yieldStore.use();
  const r = YIELD_RANGES[st.range];
  return (
    <Popover onClose={closeFlow} label="Yield range" anchor={anchor} width={300}>
      <div className="yfl-yield">
        <Segmented options={Object.keys(YIELD_RANGES)} value={st.range} onChange={(range) => yieldStore.set((s) => ({ ...s, range }))} label="Range" className="hf-seg" />
        <div className="yfl-yield__total">
          <span className="yfl-total__value">{usd(r.value)}</span>
          <span className="fl-strong fl-strong--13">earned · {r.from}</span>
          <span className="sf-apy-pill">{r.prev ? `${r.change} vs ${r.prev}` : r.change}</span>
        </div>
        <span className="sf-split" aria-hidden="true">
          {SHARE.map(([p, f, c]) => (
            <span key={p} style={{ flex: f, background: c }} />
          ))}
        </span>
        <div className="fl-stack-8">
          {SHARE.map(([p, f, c]) => (
            <button key={p} type="button" className="sf-break__row yfl-share" onClick={() => posOf(p) && openFlow("yield.position", { pair: p })}>
              <span className="hf-dot" style={{ background: c }} />
              <span className="sf-break__name">{p}</span>
              <span className="fl-strong fl-strong--13">{usd(r.value * f)}</span>
              <span className="sf-break__pct">{Math.round(f * 100)}%</span>
            </button>
          ))}
        </div>
        <p className="yfl-note">
          <img className="mono" src={a("ob-help.svg")} alt="" width="14" height="14" />
          Earnings are trading fees + rewards. Price changes of your tokens aren’t counted here.
        </p>
      </div>
    </Popover>
  );
}

/* ───────────── Row menu (⋮) ───────────── */

export function PositionMenu({ anchor, pair }) {
  const p = posOf(pair);
  const items = [
    ["View position", () => openFlow("yield.position", { pair }), "insert-chart.svg"],
    ["Add more", () => openFlow("yield.add", { pair }), "add.svg"],
    ["Claim rewards", () => openFlow("yield.claim", { only: pair }), "stars.svg", !p.rewards],
    ["Remove liquidity", () => openFlow("yield.remove", { pair }), "swap-vert.svg"],
  ];
  return (
    <Popover onClose={closeFlow} label={`${pair} actions`} anchor={anchor} width={208}>
      <div className="fl-menu">
        {items.map(([l, fn, icon, off]) => (
          <button key={l} type="button" className={`fl-menu__item fl-menu__item--sm${l.startsWith("Remove") ? " yfl-danger" : ""}`} disabled={off} onClick={fn}>
            <img className="mono" src={a(icon)} alt="" width="16" height="16" />
            <span>{l}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
