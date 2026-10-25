import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Segmented } from "../Settings";
import { Row, CopyText } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { automations, executions } from "../../autoData";

const a = (name) => `/assets/${name}`;
const usd = (n, d = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

/* ───────────── Shared state ───────────── */

export const autoStore = createStore({
  rules: automations,
  executions,
  boosts: { limits: false, link: false },
});

export const ruleOf = (name, st = autoStore.get()) => st.rules.find((r) => r.name === name);
const setRule = (name, patch) => autoStore.set((s) => ({ ...s, rules: s.rules.map((r) => (r.name === name ? { ...r, ...patch } : r)) }));
export const pauseRule = (name) => setRule(name, { status: "Paused", next: "Paused", nextSub: "Since Oct 19" });
export const resumeRule = (name) => {
  const r = ruleOf(name);
  setRule(name, { status: "Active", next: r.kind === "Schedule" || r.kind === "Rewards" ? "Oct 20, 09:00 AM" : "When triggered", nextSub: r.kind === "Schedule" ? "Daily" : "Watching price" });
};

export function healthScore(st) {
  return 72 + (st.boosts.limits ? 12 : 0) + (st.boosts.link ? 1 : 0);
}

function IconHead({ icon, tone, title, sub, id }) {
  return (
    <div className="fl-head sf-head">
      <span className={`afl-ic${tone ? ` is-${tone}` : ""}`}>
        <img className={tone ? "mono" : undefined} src={icon} alt="" width={tone ? 20 : 28} height={tone ? 20 : 28} />
      </span>
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

/* ───────────── 01A · 01B · 01C · Create ───────────── */

const COINS = {
  BTC: 96183.23,
  ETH: 3218.73,
  SOL: 187.4,
  BNB: 612.35,
  ADA: 1.12,
  XRP: 2.42,
  LINK: 22.19,
};
const TEMPLATES = [
  { key: "dip", title: "Buy the dip", tag: "Price ≤", sub: "Buy when a price falls to your level", icon: "arrow-downward.svg", kind: "price", dir: -1, action: "Buy", move: 0.957 },
  { key: "dca", title: "DCA", tag: "Schedule", sub: "Buy a fixed amount on a schedule", icon: "repeat.svg", kind: "schedule", action: "Buy" },
  { key: "tp", title: "Take profit", tag: "Price ≥", sub: "Sell part when price rises to a target", icon: "tool-target.svg", kind: "price", dir: 1, action: "Sell", move: 1.15 },
  { key: "sl", title: "Stop loss", tag: "Price ≤", sub: "Sell to limit losses if price drops", icon: "au-shield.svg", kind: "price", dir: -1, action: "Sell", move: 0.95 },
  { key: "rebalance", title: "Rebalance", tag: "Schedule", sub: "Keep your portfolio at target weights", icon: "swap-vert.svg", kind: "schedule", action: "Rebalance" },
  { key: "compound", title: "Auto compound", tag: "Rewards", sub: "Restake rewards as they arrive", icon: "stars.svg", kind: "schedule", action: "Compound" },
];
const FREQS = ["Every day", "Every 3 days", "Every week"];
const STOPS = ["No limit", "1 run", "4 buys", "10 runs"];
const ENDS = ["Never", "In 30 days", "In 90 days", "On Dec 31"];
const nice = (n) => (n >= 1000 ? Math.round(n).toLocaleString("en-US") : n >= 10 ? n.toFixed(2) : n.toFixed(3));

function CycleField({ label, value, options, onChange }) {
  return (
    <div className="fl-stack-6 afl-field">
      <span className="fl-label">{label}</span>
      <button type="button" className="afl-input afl-input--btn" onClick={() => onChange(options[(options.indexOf(value) + 1) % options.length])} aria-label={`${label}: ${value}, change`}>
        <span>{value}</span>
        <span className="afl-chev">›</span>
      </button>
    </div>
  );
}

function plain(t, f) {
  const amt = t.action === "Sell" ? (t.key === "sl" ? "all your" : `${f.pct}% of your`) : `${nice(f.amount)} USDT of`;
  const lim = [f.week && t.action === "Buy" ? `Never spend more than ${nice(f.week)} USDT a week` : null, f.stop !== "No limit" ? `stop after ${f.stop}` : null].filter(Boolean).join(", and ");
  let s;
  if (t.kind === "price") s = `When ${f.coin} ${t.dir < 0 ? "falls" : "rises"} to $${nice(f.target)}, ${t.action.toLowerCase()} ${amt} ${f.coin} at ${f.order.toLowerCase()}.`;
  else if (t.action === "Rebalance") s = `${f.freq} at ${f.time} UTC, move your holdings back to target weights when any asset drifts more than 5%.`;
  else if (t.action === "Compound") s = `${f.freq} at ${f.time} UTC, restake your ${f.coin} staking rewards.`;
  else s = `${f.freq} at ${f.time} UTC, buy ${nice(f.amount)} USDT of ${f.coin} at ${f.order.toLowerCase()}.`;
  return lim ? `${s} ${lim.charAt(0).toUpperCase()}${lim.slice(1)}.` : s;
}

export function CreateAutomation({ template, edit }) {
  const editing = edit && ruleOf(edit);
  const startT = editing ? TEMPLATES.find((t) => t.tag === editing.kind || (editing.kind === "Price move" && t.key === "dip")) || TEMPLATES[0] : TEMPLATES.find((t) => t.key === template);
  const [step, setStep] = useState(startT ? 2 : 1);
  const [tk, setTk] = useState((startT || TEMPLATES[0]).key);
  const t = TEMPLATES.find((x) => x.key === tk);
  const coin0 = editing && COINS[editing.asset] ? editing.asset : "BTC";
  const [f, setF] = useState({
    coin: coin0,
    target: Math.round(COINS[coin0] * (t.move || 1)),
    freq: "Every 3 days",
    time: "08:00",
    amount: 500,
    pct: 25,
    order: "Market",
    week: 2000,
    stop: "4 buys",
    ends: "Never",
  });
  const [ok, setOk] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const price = COINS[f.coin];
  const diff = ((f.target - price) / price) * 100;
  const pick = (key) => {
    const nt = TEMPLATES.find((x) => x.key === key);
    setTk(key);
    setF((x) => ({ ...x, target: Math.round(COINS[x.coin] * (nt.move || 1)), stop: nt.action === "Buy" ? "4 buys" : "1 run" }));
  };
  const words = plain(t, f);
  const name = editing ? editing.name : `${t.title} · ${t.action === "Rebalance" ? "Portfolio" : f.coin}`;

  const turnOn = () => {
    const rule = {
      name,
      desc: t.sub,
      icon: a(`t-${f.coin.toLowerCase()}.svg`),
      trigger: t.kind === "price" ? `Price ${t.dir < 0 ? "≤" : "≥"} $${nice(f.target)}` : `${f.freq} at ${f.time}`,
      triggerSub: t.kind === "price" ? `(${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)}% from now)` : "(UTC)",
      action: t.action === "Buy" ? `Buy $${nice(f.amount)}` : t.action === "Sell" ? (t.key === "sl" ? "Sell all" : `Sell ${f.pct}%`) : t.action,
      asset: t.action === "Rebalance" ? "Portfolio" : f.coin,
      pair: t.action === "Rebalance" ? "6 assets" : t.action === "Compound" ? "Staking" : "/USDT",
      assetIcon: t.action === "Rebalance" ? a("i-donut.svg") : a(`t-${f.coin.toLowerCase()}.svg`),
      status: "Active",
      next: t.kind === "price" ? "When triggered" : "Oct 20, 08:00 AM",
      nextSub: t.kind === "price" ? `Now $${nice(price)}` : f.freq.replace("Every ", "Every "),
      order: 0,
      kind: t.tag,
      rule: words,
      limits: t.action === "Buy" ? `${nice(f.amount)} USDT per run · ${nice(f.week)} USDT a week` : f.stop,
      created: "Oct 19, 2026",
      stats: { value: 0, invested: 0, runs: 0, holding: "—", avg: "—" },
      runs: [],
    };
    autoStore.set((s) => ({ ...s, rules: editing ? s.rules.map((r) => (r.name === edit ? { ...r, ...rule, status: r.status === "Failed" ? "Active" : r.status, stats: r.stats, runs: r.runs, created: r.created } : r)) : [rule, ...s.rules] }));
    setDone(true);
  };

  if (done) {
    return (
      <Modal onClose={closeFlow} labelledBy="afl-done" width={400}>
        <div className="fl-dialog sf-done">
          <span className="sf-done__icon" aria-hidden="true">
            <span>
              <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="afl-done">{editing ? "Rule updated" : `${t.title} is on`}</h2>
            <p>{words}</p>
          </div>
          <div className="sf-foot">
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("auto.detail", { name })}>
              View rule
            </button>
            <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={closeFlow} labelledBy="afl-create-title" width={step === 3 ? 500 : 566}>
      <div className="fl-dialog afl-create">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="afl-create-title" className="fl-head__title">
              {step === 1 ? "Create automation" : step === 2 ? (editing ? `Edit · ${editing.name}` : t.title) : "Review & turn on"}
            </h2>
            <p className="fl-head__sub">
              Step {step} of 3 · {step === 1 ? "Pick a template, you can change everything next" : step === 2 ? "Set when it runs, what it does and its limits" : "Nothing runs until you confirm"}
            </p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>

        {step === 1 && (
          <>
            <div className="afl-templates" role="radiogroup" aria-label="Templates">
              {TEMPLATES.map((x) => (
                <button key={x.key} type="button" role="radio" aria-checked={tk === x.key} className={`afl-tpl${tk === x.key ? " is-on" : ""}`} onClick={() => pick(x.key)} onDoubleClick={() => setStep(2)}>
                  <span className="afl-tpl__top">
                    <span className="afl-tpl__icon">
                      <img className="mono" src={a(x.icon)} alt="" width="16" height="16" />
                    </span>
                    <span className="afl-tag">{x.tag}</span>
                  </span>
                  <span className="afl-tpl__title">{x.title}</span>
                  <span className="afl-tpl__sub">{x.sub}</span>
                </button>
              ))}
            </div>
            <button type="button" className="afl-scratch" onClick={() => { pick("dip"); setStep(2); }}>
              <img className="mono" src={a("add.svg")} alt="" width="18" height="18" />
              <span className="fl-coin__name">
                <span className="fl-strong fl-strong--13">Start from scratch</span>
                <span className="fl-sub fl-sub--11">Pick any trigger and action yourself</span>
              </span>
              <span className="afl-chev">›</span>
            </button>
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
                Cancel
              </button>
              <button type="button" className="btn-primary ob-btn" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <section className="afl-sec">
              <h3>When</h3>
              <div className="afl-grid">
                {t.action !== "Rebalance" && (
                  <div className="fl-stack-6 afl-field">
                    <span className="fl-label">Asset</span>
                    <button
                      type="button"
                      className="afl-input afl-input--btn"
                      onClick={() => {
                        const keys = Object.keys(COINS);
                        const next = keys[(keys.indexOf(f.coin) + 1) % keys.length];
                        setF((x) => ({ ...x, coin: next, target: Math.round(COINS[next] * (t.move || 1) * 100) / 100 }));
                      }}
                    >
                      <img src={a(`t-${f.coin.toLowerCase()}.svg`)} alt="" width="20" height="20" />
                      <span className="afl-input__main">{f.coin} / USDT</span>
                      <span className="fl-sub fl-sub--11">Now ${nice(price)}</span>
                      <span className="afl-chev">›</span>
                    </button>
                  </div>
                )}
                {t.kind === "price" ? (
                  <div className="fl-stack-6 afl-field">
                    <label className="fl-label" htmlFor="afl-target">
                      Price {t.dir < 0 ? "falls" : "rises"} to
                    </label>
                    <span className="afl-input">
                      <span>$</span>
                      <input id="afl-target" inputMode="decimal" value={f.target} onChange={(e) => set("target")(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0)} />
                      <span className={diff < 0 ? "sf-down" : "sf-up"}>
                        {diff >= 0 ? "+" : "−"}
                        {Math.abs(diff).toFixed(1)}%
                      </span>
                    </span>
                    <span className="fl-sub fl-sub--11">Fires once the price is at or {t.dir < 0 ? "below" : "above"} this level</span>
                  </div>
                ) : (
                  <CycleField label="How often" value={f.freq} options={FREQS} onChange={set("freq")} />
                )}
              </div>
            </section>
            <section className="afl-sec">
              <h3>Then</h3>
              <div className="afl-grid">
                {t.action === "Buy" && (
                  <div className="fl-stack-6 afl-field">
                    <label className="fl-label" htmlFor="afl-amount">
                      Buy
                    </label>
                    <span className="afl-input">
                      <input id="afl-amount" inputMode="decimal" value={f.amount} onChange={(e) => set("amount")(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0)} />
                      <span>USDT</span>
                      <span className="fl-sub fl-sub--11">
                        ≈ {(f.amount / (t.kind === "price" ? f.target || price : price)).toFixed(5)} {f.coin}
                      </span>
                    </span>
                    <span className="fl-sub fl-sub--11">Paid from Unified Trading · 4,812.40 USDT available</span>
                  </div>
                )}
                {t.action === "Sell" && (
                  <div className="fl-stack-6 afl-field">
                    <span className="fl-label">Sell</span>
                    {t.key === "sl" ? (
                      <span className="afl-input">All {f.coin}</span>
                    ) : (
                      <Segmented options={["25%", "50%", "100%"]} value={`${f.pct}%`} onChange={(v) => set("pct")(parseInt(v, 10))} label="Sell share" className="hf-seg" />
                    )}
                  </div>
                )}
                {(t.action === "Rebalance" || t.action === "Compound") && (
                  <div className="fl-stack-6 afl-field">
                    <span className="fl-label">Action</span>
                    <span className="afl-input">{t.action === "Rebalance" ? "Back to target weights" : "Restake rewards"}</span>
                  </div>
                )}
                <div className="fl-stack-6 afl-field">
                  <span className="fl-label">{t.kind === "price" || t.action === "Buy" ? "Order type" : "Time (UTC)"}</span>
                  {t.kind === "price" || t.action === "Buy" ? (
                    <>
                      <Segmented options={["Market", "Limit"]} value={f.order} onChange={set("order")} label="Order type" className="hf-seg afl-seg" />
                      <span className="fl-sub fl-sub--11">{f.order === "Market" ? "Market fills right away at the best price" : "Waits for your exact price, may not fill"}</span>
                    </>
                  ) : (
                    <Segmented options={["08:00", "09:00", "23:00"]} value={f.time} onChange={set("time")} label="Time" className="hf-seg afl-seg" />
                  )}
                </div>
              </div>
            </section>
            {t.action !== "Rebalance" && t.action !== "Compound" && (
              <section className="afl-sec">
                <h3>Limits</h3>
                <div className="afl-grid afl-grid--3">
                  {t.action === "Buy" ? (
                    <div className="fl-stack-6 afl-field">
                      <label className="fl-label" htmlFor="afl-week">
                        Max spend per week
                      </label>
                      <span className="afl-input">
                        <input id="afl-week" inputMode="decimal" value={f.week} onChange={(e) => set("week")(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0)} />
                        <span>USDT</span>
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <CycleField label="Stop after" value={f.stop} options={STOPS} onChange={set("stop")} />
                  <CycleField label="Ends" value={f.ends} options={ENDS} onChange={set("ends")} />
                </div>
              </section>
            )}
            <div className="afl-words">
              <span className="afl-words__title">
                <img className="mono" src={a("stars.svg")} alt="" width="14" height="14" />
                In plain words
              </span>
              <p>{words}</p>
            </div>
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={() => (editing ? closeFlow() : setStep(1))}>
                {editing ? "Cancel" : "Back"}
              </button>
              <button type="button" className="btn-primary ob-btn" disabled={(t.kind === "price" && !f.target) || (t.action === "Buy" && !f.amount)} onClick={() => setStep(3)}>
                Review
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="afl-summary">
              <span className="afl-summary__top">
                <img src={a(t.action === "Rebalance" ? "i-donut.svg" : `t-${f.coin.toLowerCase()}.svg`)} alt="" width="22" height="22" />
                <span className="fl-strong">
                  {t.title} · {t.action === "Rebalance" ? "Portfolio" : f.coin}
                </span>
                <span className="afl-tag is-brand">{t.tag}</span>
              </span>
              <p>{words}</p>
            </div>
            <div className="fl-stack-8 yfl-rows">
              <Row label="Pays from" value="Unified Trading · 4,812.40 USDT" />
              {t.action === "Buy" && <Row label="You get per buy" value={`≈ ${(f.amount / (t.kind === "price" ? f.target : price)).toFixed(5)} ${f.coin} at $${nice(t.kind === "price" ? f.target : price)}`} />}
              <Row label="Trading fee" value={t.action === "Buy" ? `≈ ${(f.amount * 0.001).toFixed(2)} USDT per buy (0.1%)` : "0.1% of each order"} />
              {t.action === "Buy" && <Row label="Most you can spend" value={f.stop === "No limit" ? `${nice(f.week)} USDT a week` : `${nice(Math.min(f.week, f.amount * (parseInt(f.stop, 10) || 1)))} USDT in total`} />}
              <Row label="Notifications" value="Push when it runs or fails" />
            </div>
            <div className="afl-backtest">
              <span className="afl-backtest__title">
                <img className="mono" src={a("history.svg")} alt="" width="14" height="14" />
                If this ran over the last 90 days
              </span>
              <div className="afl-backtest__grid">
                {[
                  ["Triggered", t.kind === "price" ? "3 times" : "30 times"],
                  [t.action === "Sell" ? "Sold" : "Bought", t.action === "Buy" ? `${((f.amount * 3) / (f.target || price)).toFixed(5)} ${f.coin}` : "—"],
                  ["Avg price", `$${nice((t.kind === "price" ? f.target : price) * 0.976)}`],
                  ["Worth today", t.action === "Buy" ? `${usd(f.amount * 3 * 1.071, 0)} (+7.1%)` : "—"],
                ].map(([l, v]) => (
                  <span key={l}>
                    <span className="fl-sub fl-sub--11">{l}</span>
                    <span className="fl-strong fl-strong--13">{v}</span>
                  </span>
                ))}
              </div>
              <span className="fl-sub fl-sub--11">Past results don’t guarantee future ones.</span>
            </div>
            <label className="sf-ack afl-ack">
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
              <span className={`hf-box${ok ? " is-on" : ""}`}>{ok && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
              I understand market orders can fill at a slightly different price, and I can pause this rule any time.
            </label>
            <div className="sf-foot">
              <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="btn-primary ob-btn" disabled={!ok} onClick={turnOn}>
                {editing ? "Save changes" : "Turn on automation"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ───────────── 02A · Automation · Detail & run history ───────────── */

const PILL = { Active: "is-active", Paused: "", Failed: "is-failed" };

export function AutomationDetail({ name }) {
  const st = autoStore.use();
  const r = ruleOf(name, st);
  if (!r) return null;
  const s = r.stats;
  const pnl = s.value - s.invested;
  return (
    <Drawer onClose={closeFlow} labelledBy="afl-detail-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-stack-8">
            <IconHead id="afl-detail-title" icon={r.icon} title={r.name} sub={`Created ${r.created} · ${r.trigger}`} />
            <span className="afl-chips">
              <span className={`au-pill au-pill--sm ${PILL[r.status]}`}>{r.status}</span>
              <span className="afl-chip">{r.status === "Active" ? `Next run ${r.next === "When triggered" ? "when triggered" : r.next}` : r.status === "Failed" ? "Last run failed" : r.nextSub}</span>
            </span>
          </div>
          {s.invested > 0 && (
            <div className="afl-value">
              <span className="fl-sub fl-sub--11">Value now</span>
              <span className="afl-value__top">
                <span className="afl-value__num">{usd(s.value)}</span>
                <span className="afl-value__chip">
                  {pnl >= 0 ? "+" : "−"}
                  {usd(Math.abs(pnl))} ({pnl >= 0 ? "+" : "−"}
                  {((Math.abs(pnl) / s.invested) * 100).toFixed(1)}%)
                </span>
              </span>
              <span className="afl-value__grid">
                <span>
                  <span>Invested</span>
                  <strong>{usd(s.invested)}</strong>
                  <span>Avg {s.avg}</span>
                </span>
                <span>
                  <span>Runs</span>
                  <strong>{s.runs}</strong>
                  <span>{r.runs.filter((x) => x[3] === "Failed").length} failed</span>
                </span>
                <span>
                  <span>Holding</span>
                  <strong>{s.holding}</strong>
                </span>
              </span>
            </div>
          )}
          <div className="afl-rule">
            <span className="fl-sub fl-sub--11">The rule</span>
            <p>{r.rule}</p>
          </div>
          <span className="afl-chips afl-chips--col">
            <span className="afl-chip">
              Limits <strong>{r.limits}</strong>
            </span>
            <span className="afl-chip">
              Pays from <strong>Unified Trading</strong>
            </span>
          </span>
          <div className="fl-stack-8">
            <div className="fl-activity__head">
              <span className="fl-strong fl-strong--13">Run history</span>
              {s.runs > 0 && (
                <button type="button" className="hp-link" onClick={() => { closeFlow(); window.location.hash = "#/history"; }}>
                  See all {s.runs}
                </button>
              )}
            </div>
            {r.runs.length ? (
              <ol className="afl-runs">
                {r.runs.map(([title, when, amt, sub], i) => (
                  <li key={when} className={`afl-run${sub === "Failed" ? " is-failed" : ""}${i === 0 ? " is-first" : ""}`}>
                    <span className="afl-run__dot" />
                    <span className="fl-coin__name">
                      <span className="fl-strong fl-strong--13">{title}</span>
                      <span className="fl-sub fl-sub--11">{when}</span>
                    </span>
                    <span className="afl-run__amt">
                      <span className={amt.startsWith("+") ? "sf-up" : sub === "Failed" ? "sf-down" : ""}>{amt}</span>
                      <span className="fl-sub fl-sub--11">{sub}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="fl-sub fl-sub--13">No runs yet — it fires the first time the condition is met.</p>
            )}
          </div>
        </div>
        <div className="sf-foot sf-foot--drawer">
          {r.status === "Failed" ? (
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("auto.failed", { name })}>
              Fix it
            </button>
          ) : (
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => (r.status === "Active" ? pauseRule(name) : resumeRule(name))}>
              {r.status === "Active" ? "Pause" : "Resume"}
            </button>
          )}
          <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("auto.create", { edit: name })}>
            Edit rule
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 03A · Row menu · 03B · Delete ───────────── */

export function AutomationMenu({ anchor, name }) {
  const r = ruleOf(name);
  const dup = () => {
    autoStore.set((s) => {
      const i = s.rules.findIndex((x) => x.name === name);
      const copy = { ...r, name: `${r.name} (copy)`, status: "Paused", next: "Paused", nextSub: "New copy", runs: [], stats: { ...r.stats, runs: 0 } };
      const rules = [...s.rules];
      rules.splice(i + 1, 0, copy);
      return { ...s, rules };
    });
    closeFlow();
  };
  const items = [
    ["View details", "insert-chart.svg", () => openFlow("auto.detail", { name })],
    ["Edit rule", "settings.svg", () => openFlow("auto.create", { edit: name })],
    ["Duplicate", "st-copy.svg", dup],
    r.status === "Failed"
      ? ["Fix failed run", "hp-error.svg", () => openFlow("auto.failed", { name })]
      : r.status === "Active"
        ? ["Pause", "ob-schedule.svg", () => { pauseRule(name); closeFlow(); }]
        : ["Resume", "ob-schedule.svg", () => { resumeRule(name); closeFlow(); }],
    ["Delete", "hp-close.svg", () => openFlow("auto.delete", { name })],
  ];
  return (
    <Popover onClose={closeFlow} label={`${name} actions`} anchor={anchor} width={196}>
      <div className="fl-menu">
        {items.map(([l, icon, fn]) => (
          <button key={l} type="button" className={`fl-menu__item fl-menu__item--sm${l === "Delete" ? " afl-delete" : ""}`} onClick={fn}>
            <img className="mono" src={a(icon)} alt="" width="16" height="16" />
            <span>{l}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}

export function DeleteAutomation({ name }) {
  const r = ruleOf(name);
  const coin = r.asset;
  const protective = r.action.startsWith("Sell");
  return (
    <Modal onClose={closeFlow} labelledBy="afl-del-title" width={400}>
      <div className="fl-dialog afl-del">
        <div className="fl-head sf-head">
          <span className="afl-ic is-red">
            <img className="mono" src={a("au-shield.svg")} alt="" width="20" height="20" />
          </span>
          <div className="fl-head__text">
            <h2 id="afl-del-title" className="fl-head__title">
              Delete “{r.name}”?
            </h2>
            <p className="fl-head__sub">
              {r.status === "Paused" ? `This rule is paused, but it still ${protective ? `guards your ${coin}` : "keeps its settings"} once resumed.` : "This rule is running right now."}
            </p>
          </div>
        </div>
        <div className="sf-card">
          {protective && <Row label="Protects" value={r.protects || `${r.stats.holding} · ${usd(r.stats.value)}`} />}
          <Row label="Trigger" value={r.trigger} />
          <Row label="Open orders cancelled" value="None" />
          <Row label="Run history" value="Kept in History" />
        </div>
        <p className="fl-sub fl-sub--13 afl-del__note">
          {protective ? `After deleting, nothing will sell your ${coin} if the price drops. ` : "After deleting, this rule stops for good. "}
          Pausing keeps the rule so you can turn it back on in one tap.
        </p>
        <div className="sf-foot">
          <button
            type="button"
            className="ob-btn ob-btn--secondary"
            onClick={() => {
              if (r.status !== "Paused") pauseRule(name);
              closeFlow();
            }}
          >
            {r.status === "Paused" ? "Keep it paused" : "Pause instead"}
          </button>
          <button
            type="button"
            className="btn-primary ob-btn yfl-btn-danger"
            onClick={() => {
              autoStore.set((s) => ({ ...s, rules: s.rules.filter((x) => x.name !== name) }));
              closeFlow();
            }}
          >
            Delete rule
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 04A · Status · A run failed — fix it ───────────── */

export function FailedRun({ name = "Link Volatility trade" }) {
  const r = ruleOf(name);
  const FIXES = [
    { key: "move", title: "Move 300 USDT from Funding and retry now", sub: "Funding has 7,960.11 USDT · retry runs at the current price", cta: "Move & retry" },
    { key: "lower", title: "Lower the amount to 180 USDT per run", sub: "Fits your current balance · applies to future runs", cta: "Lower & save" },
    { key: "pause", title: "Pause the rule", sub: "Keep it for later · no more failed runs", cta: "Pause rule" },
  ];
  const [fix, setFix] = useState("move");
  const [done, setDone] = useState(null);
  const chosen = FIXES.find((x) => x.key === fix);
  const apply = () => {
    autoStore.set((s) => {
      const rules = s.rules.map((x) => {
        if (x.name !== name) return x;
        if (fix === "pause") return { ...x, status: "Paused", next: "Paused", nextSub: "Since Oct 19" };
        const runs = fix === "move" ? [["Bought @ $22.19", "Oct 19, 2026 · 10:41 AM", "+13.52 LINK", "300.00 USDT"], ...x.runs] : x.runs;
        return { ...x, status: "Active", next: "When triggered", nextSub: "Watching volatility", action: fix === "lower" ? "Buy $180" : x.action, runs, stats: { ...x.stats, runs: x.stats.runs + (fix === "move" ? 1 : 0) } };
      });
      const exec = fix === "move" ? [{ title: "LINK volatility trade", pair: "Retried · bought @ $22.19", date: "Oct 19, 2026", time: "10:41 AM", amount: "+13.52 LINK", status: "Success", icon: a("t-link.svg"), auto: name, order: "Market buy · LINK/USDT", fill: "$22.19" }] : [];
      return { ...s, rules, executions: [...exec, ...s.executions].slice(0, 6), boosts: { ...s.boosts, link: fix !== "pause" } };
    });
    setDone(fix);
  };
  if (done) {
    return (
      <Modal onClose={closeFlow} labelledBy="afl-fixed" width={400}>
        <div className="fl-dialog sf-done">
          <span className="sf-done__icon" aria-hidden="true">
            <span>
              <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="afl-fixed">{done === "move" ? "Retried — it worked" : done === "lower" ? "Amount lowered" : "Rule paused"}</h2>
            <p>{done === "move" ? "Moved 300 USDT and bought 13.52 LINK at $22.19." : done === "lower" ? "Future runs buy 180 USDT of LINK." : "No more failed runs. Resume it whenever you like."}</p>
          </div>
          <button type="button" className="btn-primary ob-btn" onClick={closeFlow}>
            Done
          </button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal onClose={closeFlow} labelledBy="afl-failed-title" width={432}>
      <div className="fl-dialog afl-failed">
        <div className="fl-head sf-head">
          <span className="afl-ic is-red">
            <img className="mono" src={a("hp-error.svg")} alt="" width="20" height="20" />
          </span>
          <div className="fl-head__text">
            <h2 id="afl-failed-title" className="fl-head__title">
              {r ? r.name.replace("Link", "LINK") : "Rule"} didn’t run
            </h2>
            <p className="fl-head__sub">Oct 19, 2026 · 08:12 AM · Volatility hit 6.2% in 1h</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="afl-why">
          <strong>Not enough USDT</strong>
          The rule needed 300.00 USDT to buy LINK, but Unified Trading had 182.40 USDT. No order was placed and nothing was charged.
        </div>
        <div className="fl-stack-8">
          <span className="fl-strong fl-strong--13">How do you want to fix it?</span>
          <div className="afl-fixes" role="radiogroup" aria-label="Fix">
            {FIXES.map((x) => (
              <button key={x.key} type="button" role="radio" aria-checked={fix === x.key} className={`afl-fix${fix === x.key ? " is-on" : ""}`} onClick={() => setFix(x.key)}>
                <span className={`sf-radio${fix === x.key ? " is-on" : ""}`} />
                <span className="fl-coin__name">
                  <span className="fl-strong fl-strong--13">{x.title}</span>
                  <span className="fl-sub fl-sub--11">{x.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <span className="fl-sub fl-sub--11 afl-tip">
            <img className="mono" src={a("i-autorenew.svg")} alt="" width="12" height="12" />
            Tip: turn on auto-retry so a rule tries again 3 times before it fails.
          </span>
        </div>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("auto.create", { edit: name })}>
            Edit rule
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={apply}>
            {chosen.cta}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 05A · Health · What the score means ───────────── */

export function HealthBreakdown({ anchor }) {
  const st = autoStore.use();
  const score = healthScore(st);
  const parts = [
    ["Reliability", st.boosts.link ? 29 : 28, 30, st.boosts.link ? "138 of 142 runs succeeded" : "137 of 142 runs succeeded", "#48b187"],
    ["Coverage", 13, 20, "4 of 6 positions have a rule", "#fe7701"],
    ["Safety", st.boosts.limits ? 23 : 11, 30, st.boosts.limits ? "8 of 8 rules have a spend limit" : "3 of 8 rules have a spend limit", st.boosts.limits ? "#48b187" : "#f82a51"],
    ["Upkeep", 20, 20, "No rule paused for 30+ days", "#48b187"],
  ];
  const tips = [
    !st.boosts.limits && ["Add spend limits to 5 rules", "+12", () => autoStore.set((s) => ({ ...s, boosts: { ...s.boosts, limits: true } }))],
    ["Add a stop loss for SOL and BNB", "+5", () => openFlow("auto.create", { template: "sl" })],
    !st.boosts.link && ["Fix LINK volatility trade", "+1", () => openFlow("auto.failed", { name: "Link Volatility trade" })],
  ].filter(Boolean);
  const label = score >= 85 ? "Great" : score >= 70 ? "Good" : "Fair";
  return (
    <Popover onClose={closeFlow} label="Automation health" anchor={anchor} width={336}>
      <div className="afl-health">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 className="fl-head__title">Automation health</h2>
            <p className="fl-head__sub">
              {score} of 100 · {label} (70–84) · Great is 85+
            </p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        {parts.map(([l, v, max, sub, c]) => (
          <div key={l} className="afl-part">
            <span className="afl-part__top">
              <span className="fl-strong fl-strong--13">{l}</span>
              <span className="fl-strong fl-strong--13">
                {v} / {max}
              </span>
            </span>
            <span className="afl-part__bar">
              <span style={{ width: `${(v / max) * 100}%`, background: c }} />
            </span>
            <span className="fl-sub fl-sub--11">{sub}</span>
          </div>
        ))}
        <hr className="fl-hr" />
        <span className="fl-strong fl-strong--13">Raise your score</span>
        {tips.map(([l, pts, fn]) => (
          <button key={l} type="button" className="afl-tipbtn" onClick={fn}>
            <span>{l}</span>
            <span className="afl-tipbtn__pts">{pts}</span>
            <span className="afl-chev">›</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Execution · Receipt ───────────── */

export function ExecutionReceipt({ index = 0 }) {
  const st = autoStore.get();
  const e = st.executions[index];
  const pending = e.status === "Pending";
  const [amt, unit] = e.amount.split(" ");
  const spent = e.auto === "ETH DCA" ? 250 : e.title.includes("rebalance") ? parseFloat(e.amount.replace(/[$,]/g, "")) : null;
  return (
    <Drawer onClose={closeFlow} labelledBy="afl-rc-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-head sf-head">
            <span className={`afl-ic ${pending ? "is-orange" : "is-green-solid"}`}>
              <img className={pending ? "mono" : undefined} src={a(pending ? "ob-schedule.svg" : "st-check-white.svg")} alt="" width="20" height="20" />
            </span>
            <div className="fl-head__text">
              <h2 id="afl-rc-title" className="fl-head__title">
                {e.title.includes("rebalance") ? "Rebalanced" : e.title === "Auto compound" ? "Restaked rewards" : e.title === "ETH DCA" ? "Bought ETH" : e.title}
              </h2>
              <p className="fl-head__sub">
                {e.auto} · {e.date} · {e.time}
              </p>
            </div>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="afl-receipt">
            <span className={`au-pill au-pill--sm ${pending ? "is-pending" : "is-active"}`}>{e.status}</span>
            <span className="afl-receipt__amt">
              {amt} {unit}
            </span>
            <span className="fl-sub fl-sub--13">{spent ? `for ${spent.toFixed(2)} USDT` : e.pair}</span>
          </div>
          <div className="fl-stack-8 yfl-rows">
            <Row label="Automation">
              <button type="button" className="hp-link" onClick={() => openFlow("auto.detail", { name: e.auto })}>
                {e.auto} →
              </button>
            </Row>
            <Row label="Trigger" value={ruleOf(e.auto)?.trigger || "—"} />
            <Row label="Order" value={e.order || "Market"} />
            <Row label="Avg fill price" value={e.fill || "—"} />
            <Row label="Price when triggered" value={e.fill ? `${e.fill.replace(/\d+\.\d+$/, (m) => (parseFloat(m) - 0.83).toFixed(2))} · slippage 0.03%` : "—"} />
            <hr className="fl-hr" />
            {spent ? (
              <>
                <Row label="Spent" value={`${spent.toFixed(2)} USDT`} />
                <Row label="Trading fee (0.1%)" value={`${(spent * 0.001).toFixed(2)} USDT`} />
                <Row label="Total" value={`${(spent * 1.001).toFixed(2)} USDT`} />
              </>
            ) : (
              <Row label="Fee" value="None" />
            )}
            <Row label="Paid from" value="Unified Trading" />
            <hr className="fl-hr" />
            <Row label="Filled at" value={pending ? "Waiting for settlement" : `${e.date} · ${e.time.replace(" ", ":04 ")}`} />
            <Row label="Order ID">
              <CopyText text="ZX-58219034" />
            </Row>
            <Row label="Next run" value={ruleOf(e.auto)?.next || "—"} />
          </div>
        </div>
        <div className="sf-foot sf-foot--drawer">
          <DownloadBtn />
          <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("auto.detail", { name: e.auto })}>
            View automation
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function DownloadBtn() {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="ob-btn ob-btn--secondary" onClick={() => setDone(true)}>
      {done ? "Downloaded" : "Download receipt"}
    </button>
  );
}
