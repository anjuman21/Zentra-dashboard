import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Toggle, Segmented } from "../Settings";
import { Row } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { alerts, alertRules, alertTypes, alertAssets } from "../../alertData";

const a = (name) => `/assets/${name}`;
const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};

/* ───────────── Shared state ───────────── */

const CHANNELS = ["In-app", "Push", "Email", "SMS"];
export const DATES = ["Today", "Last 7 days", "Last 30 days", "This month", "Custom…"];
const DATE_LABEL = { Today: "Aug 18, 2026", "Last 7 days": "Aug 12, 2026 - Aug 18, 2026", "Last 30 days": "Jul 20, 2026 - Aug 18, 2026", "This month": "Aug 01, 2026 - Aug 18, 2026", "Custom…": "Aug 12, 2026 - Aug 18, 2026" };
export const dateLabel = (d) => DATE_LABEL[d];

export const alertStore = createStore({
  alerts,
  rules: alertRules,
  filter: { date: "Last 7 days", types: [], status: null, asset: null },
  settings: {
    Price: { "In-app": true, Push: true, Email: false, SMS: false },
    Account: { "In-app": true, Push: true, Email: true, SMS: false },
    System: { "In-app": true, Push: false, Email: true, SMS: false },
  },
  quiet: true,
  digest: false,
  locked: false,
});

const patchAlert = (id, patch) => alertStore.set((s) => ({ ...s, alerts: s.alerts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
export const markRead = (id, unread = false) => patchAlert(id, { unread });

const DAY = { "Aug 18": 0, "Aug 17": 1, "Aug 16": 2, "Aug 15": 3, "Aug 14": 4, "Aug 13": 5 };
export function filterAlerts(list, f, tab = "All") {
  return list.filter((x) => {
    if (x.deleted) return false;
    if (tab === "Unread" && !x.unread) return false;
    if (tab === "Price" && x.type !== "Price") return false;
    if (tab === "Account" && !["Account", "Security"].includes(x.type)) return false;
    if (tab === "System" && x.type !== "System") return false;
    if (f.date === "Today" && DAY[x.time.slice(0, 6)] !== 0) return false;
    if (f.types.length && !f.types.includes(x.type)) return false;
    if (f.status && (f.status === "Unread") !== !!x.unread) return false;
    if (f.asset && x.asset !== f.asset) return false;
    return true;
  });
}

/* ───────────── 01A · Create · Price alert ───────────── */

const PRICES = { BTC: 96183.23, ETH: 3218.73, SOL: 187.4, BNB: 612.35, XRP: 2.41 };

export function CreateAlert({ coin: coin0 = "BTC" }) {
  const [coin, setCoin] = useState(coin0);
  const now = PRICES[coin];
  const [kind, setKind] = useState("Price goes above");
  const [target, setTarget] = useState(coin === "BTC" ? 100000 : Math.round(now * 1.04 * 100) / 100);
  const [pct, setPct] = useState(4);
  const [often, setOften] = useState("Once");
  const [ch, setCh] = useState({ "In-app": true, Push: true, Email: false, SMS: false });
  const [done, setDone] = useState(false);
  const move = kind === "Moves by %";
  const diff = ((target - now) / now) * 100;
  const wrong = !move && ((kind === "Price goes above" && target <= now) || (kind === "Price goes below" && target >= now));
  const chans = CHANNELS.filter((c) => ch[c]);
  const chText = chans.length ? chans.map((c) => c.toLowerCase()).join(" and ").replace(/^in-app/, "in-app") : "no";
  const oftenText = { Once: "once", "Every time": "every time", "Once a day": "at most once a day" }[often];
  const cond = move ? `${coin} moves ${pct}% either way within 1 hour` : `${coin} goes ${kind === "Price goes above" ? "above" : "below"} $${fmt(target)}`;
  const swap = () => {
    const keys = Object.keys(PRICES);
    const next = keys[(keys.indexOf(coin) + 1) % keys.length];
    setCoin(next);
    setTarget(Math.round(PRICES[next] * (kind === "Price goes below" ? 0.96 : 1.04) * 100) / 100);
  };
  const quick = (f) => setTarget(Math.round(now * f * 100) / 100);
  const create = () => {
    const title = move ? `${coin} moves ±${pct}% in 1 hour` : `${coin} goes ${kind === "Price goes above" ? "above" : "below"} $${target.toLocaleString("en-US")}`;
    alertStore.set((s) => ({
      ...s,
      rules: [
        {
          id: `r${Date.now()}`,
          group: "Price",
          title,
          short: title.replace(" goes ", " ").replace(" moves ", " "),
          sub: `${often} · ${chans.join(" + ")}${move ? "" : ` · ${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)}% away`}`,
          side: `${often} · ${chans.slice(0, 2).join(", ").toLowerCase()}`,
          on: true,
          icon: a(`t-${coin.toLowerCase()}.svg`),
          coin,
        },
        ...s.rules,
      ],
    }));
    setDone(true);
  };

  if (done) {
    return (
      <Modal onClose={closeFlow} labelledBy="alf-done" width={400}>
        <div className="fl-dialog sf-done">
          <span className="sf-done__icon" aria-hidden="true">
            <span>
              <img src={a("st-check-white.svg")} alt="" width="18" height="18" />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="alf-done">Alert created</h2>
            <p>
              You’ll get {chText} alert {oftenText}, when {cond}.
            </p>
          </div>
          <div className="sf-foot">
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("alerts.rules")}>
              See my rules
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
    <Modal onClose={closeFlow} labelledBy="alf-create-title" width={468}>
      <div className="fl-dialog alf-create">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="alf-create-title" className="fl-head__title">
              Create price alert
            </h2>
            <p className="fl-head__sub">Get notified the moment a price moves</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Asset</span>
          <button type="button" className="alf-asset" onClick={swap} aria-label={`Asset ${coin}, change`}>
            <span className="alf-asset__icon">
              <img src={a(`t-${coin.toLowerCase()}.svg`)} alt="" width="22" height="22" />
            </span>
            <span className="fl-coin__name">
              <span className="fl-strong">{coin} / USDT</span>
              <span className="fl-sub fl-sub--11">Now ${fmt(now)}</span>
            </span>
            <span className="afl-chev">›</span>
          </button>
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Alert me when</span>
          <Segmented
            options={["Price goes above", "Price goes below", "Moves by %"]}
            value={kind}
            onChange={(k) => {
              setKind(k);
              if (k === "Price goes above") quick(1.04);
              if (k === "Price goes below") quick(0.96);
            }}
            label="Alert me when"
            className="hf-seg"
          />
        </div>
        {move ? (
          <div className="fl-stack-8">
            <span className="fl-label">Move size (within 1 hour)</span>
            <div className="mf-chips alf-quick">
              {[2, 3, 4, 5, 10].map((v) => (
                <button key={v} type="button" className={`mf-chip${pct === v ? " is-on" : ""}`} onClick={() => setPct(v)}>
                  ±{v}%
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="fl-stack-8">
            <label className="fl-label" htmlFor="alf-target">
              Target price
            </label>
            <span className={`alf-target${wrong ? " is-error" : ""}`}>
              <span>$</span>
              <input id="alf-target" inputMode="decimal" value={target} onChange={(e) => setTarget(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0)} />
              <span className={`alf-diff ${diff >= 0 ? "is-up" : "is-down"}`}>
                {diff >= 0 ? "+" : "−"}
                {Math.abs(diff).toFixed(2)}%
              </span>
            </span>
            <span className={`fl-sub fl-sub--11${wrong ? " is-error" : ""}`}>
              {wrong
                ? `That price is ${kind === "Price goes above" ? "below" : "above"} where ${coin} is now — the alert would fire right away.`
                : `${coin} needs to ${diff >= 0 ? "rise" : "fall"} $${fmt(Math.abs(target - now))} to reach this`}
            </span>
            <div className="mf-chips alf-quick">
              {(kind === "Price goes above" ? [1.02, 1.05, 1.1] : [0.98, 0.95, 0.9]).map((f) => (
                <button key={f} type="button" className="mf-chip" onClick={() => quick(f)}>
                  {f > 1 ? "+" : "−"}
                  {Math.round(Math.abs(f - 1) * 100)}%
                </button>
              ))}
              {coin === "BTC" && (
                <button type="button" className={`mf-chip${target === 100000 ? " is-on" : ""}`} onClick={() => setTarget(100000)}>
                  $100k
                </button>
              )}
            </div>
          </div>
        )}
        <div className="fl-stack-8">
          <span className="fl-label">How often</span>
          <Segmented options={["Once", "Every time", "Once a day"]} value={often} onChange={setOften} label="How often" className="hf-seg" />
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Notify me by</span>
          <div className="alf-channels">
            {CHANNELS.map((c) => (
              <label key={c} className={`alf-channel${ch[c] ? " is-on" : ""}`}>
                <input type="checkbox" checked={ch[c]} onChange={(e) => setCh({ ...ch, [c]: e.target.checked })} />
                <span className={`hf-box${ch[c] ? " is-on" : ""}`}>{ch[c] && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
                {c}
              </label>
            ))}
          </div>
        </div>
        <p className="alf-summary">{chans.length ? `You’ll get ${chText.replace("in-app", "an in-app")} alert ${oftenText}, when ${cond}.` : "Pick at least one way to be told."}</p>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className="btn-primary ob-btn" disabled={wrong || !chans.length || (!move && !target)} onClick={create}>
            Create alert
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 01B · My alert rules ───────────── */

export function AlertRules() {
  const st = alertStore.use();
  const groups = ["Price", "Account & security", "System"];
  const on = st.rules.filter((r) => r.on).length;
  const toggle = (id, v) => alertStore.set((s) => ({ ...s, rules: s.rules.map((r) => (r.id === id ? { ...r, on: v, fired: v ? false : r.fired } : r)) }));
  return (
    <Drawer onClose={closeFlow} labelledBy="alf-rules-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-head">
            <div className="fl-head__text">
              <h2 id="alf-rules-title" className="fl-head__title">
                My alert rules
              </h2>
              <p className="fl-head__sub">
                {st.rules.length} rules · {on} on
              </p>
            </div>
            <CloseButton onClick={closeFlow} />
          </div>
          {groups.map((g) => (
            <div key={g} className="fl-stack-8">
              <span className="fl-sub fl-sub--13">{g}</span>
              <div className="alf-rules">
                {st.rules
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <div key={r.id} className="alf-rule">
                      <span className="alf-asset__icon">
                        <img src={r.icon} alt="" width="20" height="20" />
                      </span>
                      <span className="fl-coin__name">
                        <span className="fl-strong fl-strong--13">{r.title}</span>
                        <span className="fl-sub fl-sub--11">{r.sub}</span>
                      </span>
                      {r.locked ? (
                        <span className="alf-lock">
                          <img className="mono" src={a("st-lock.svg")} alt="" width="12" height="12" />
                          Always on
                        </span>
                      ) : (
                        <Toggle on={r.on} onChange={(v) => toggle(r.id, v)} label={`${r.title} ${r.on ? "on" : "off"}`} />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="fl-sub fl-sub--11 alf-note">Security alerts can’t be turned off — they protect your funds.</p>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("alerts.settings")}>
            Notification settings
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("alerts.create")}>
            New alert
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 02A · Alert · What happened ───────────── */

const EARLIER = {
  ETH: [
    ["ETH down 4.08% in 1 hour", "Oct 12, 2026 · 03:40 PM", -4.08],
    ["ETH up 4.35% in 1 hour", "Sep 30, 2026 · 11:05 AM", 4.35],
  ],
  BTC: [["BTC fell below $98,500", "Sep 22, 2026 · 07:12 AM", -1.4]],
  SOL: [
    ["SOL up 5.40% in 3 hours", "Oct 04, 2026 · 09:30 PM", 5.4],
    ["SOL down 5.12% in 3 hours", "Sep 18, 2026 · 01:15 AM", -5.12],
  ],
};

function MoveChart({ up, label }) {
  const pts = up ? [0.2, 0.24, 0.22, 0.3, 0.33, 0.38, 0.43, 0.5, 0.62, 0.76, 0.82] : [0.8, 0.78, 0.8, 0.7, 0.66, 0.6, 0.52, 0.44, 0.36, 0.3, 0.26];
  const W = 320;
  const H = 96;
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - v * H]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const rule = up ? H - 0.78 * H : H - 0.3 * H;
  const hit = xy.findIndex(([, y]) => (up ? y <= rule : y >= rule));
  return (
    <div className="alf-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2={W} y1={rule} y2={rule} stroke="#5720f5" strokeDasharray="4 3" />
        <path d={d} fill="none" stroke={up ? "#48b187" : "#f82a51"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="alf-chart__rule" style={{ top: rule - 18 }}>
        {label}
      </span>
      {hit >= 0 && <span className="alf-chart__dot" style={{ left: `${(xy[hit][0] / W) * 100}%`, top: xy[hit][1], background: up ? "#48b187" : "#f82a51" }} />}
    </div>
  );
}

export function AlertDetail({ id = "eth-up" }) {
  const st = alertStore.use();
  const x = st.alerts.find((y) => y.id === id);
  const rule = st.rules.find((r) => r.id === x.rule);
  const up = x.change >= 0;
  const [date, time] = x.time.split(" • ");
  const [h, m] = time.split(" ")[0].split(":");
  const startH = `${String((+h - (x.window === "3h" ? 3 : 1) + 12) % 12 || 12).padStart(2, "0")}:${m}`;
  const snoozed = x.snoozed;
  return (
    <Drawer onClose={closeFlow} labelledBy="alf-detail-title" width={460}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-head sf-head">
            <span className="alf-asset__icon alf-asset__icon--lg">
              <img src={a(`t-${x.asset.toLowerCase()}.svg`)} alt="" width="26" height="26" />
            </span>
            <div className="fl-head__text">
              <h2 id="alf-detail-title" className="fl-head__title">
                {x.id === "btc-below" ? x.title : `${x.asset} ${up ? "up" : "down"} ${Math.abs(x.change).toFixed(2)}% in ${x.window === "3h" ? "3 hours" : "1 hour"}`}
              </h2>
              <p className="fl-head__sub">
                {date} · {time} · Price alert
              </p>
            </div>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="alf-price">
            <span className="alf-price__top">
              <span className="alf-price__now">${fmt(x.now)}</span>
              <span className={`alf-diff ${up ? "is-up" : "is-down"}`}>
                {up ? "+" : "−"}
                {Math.abs(x.change).toFixed(2)}% · {x.window}
              </span>
            </span>
            <span className="fl-sub fl-sub--11">
              From ${fmt(x.from)} at {startH} {time.split(" ")[1]}
            </span>
          </div>
          <MoveChart up={up} label={x.id === "btc-below" ? "$97,000 rule" : `${up ? "+" : "−"}${x.window === "3h" ? 5 : 4}% rule`} />
          <div className="fl-stack-8 yfl-rows">
            <Row label="Rule" value={rule ? rule.title.replace("goes ", "") : "—"} />
            <Row label="Repeats" value={x.id === "btc-below" ? "Once · now finished" : "Every time"} />
            <Row label="Sent to" value="In-app + push" />
            <Row label="Fired" value={x.id === "btc-below" ? "Once" : `${(EARLIER[x.asset] || []).length + 1} times in the last 30 days`} />
          </div>
          {(EARLIER[x.asset] || []).length > 0 && (
            <div className="fl-stack-8">
              <span className="fl-strong fl-strong--13">Earlier from this rule</span>
              <div className="sf-claim-list">
                {EARLIER[x.asset].map(([t, w, c]) => (
                  <div key={w} className="sf-claim">
                    <span className="fl-coin__name">
                      <span className="fl-strong fl-strong--13">{t}</span>
                      <span className="fl-sub fl-sub--11">{w}</span>
                    </span>
                    <span className={`alf-diff ${c >= 0 ? "is-up" : "is-down"}`}>
                      {c >= 0 ? "+" : "−"}
                      {Math.abs(c).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="yfl-actions">
          <button type="button" className="btn-primary ob-btn" onClick={() => go("trade")}>
            Trade {x.asset}
          </button>
          <div className="sf-foot">
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => patchAlert(id, { snoozed: !snoozed })}>
              {snoozed ? "Snoozed · undo" : "Snooze 24h"}
            </button>
            <button type="button" className="ob-btn ob-btn--secondary" onClick={() => openFlow("alerts.create", { coin: x.asset })}>
              Edit rule
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 03A · Security · Was this you? ───────────── */

export function SecurityCheck({ id = "eth-withdraw" }) {
  const st = alertStore.use();
  const [state, setState] = useState(st.locked ? "locked" : null);
  const answer = (v) => {
    if (v === "me") patchAlert(id, { unread: false, badge: "Confirmed", tone: "green" });
    else alertStore.set((s) => ({ ...s, locked: true, alerts: s.alerts.map((x) => (x.id === id ? { ...x, unread: false, badge: "Locked", tone: "red" } : x)) }));
    setState(v === "me" ? "me" : "locked");
  };
  if (state) {
    const locked = state === "locked";
    return (
      <Modal onClose={closeFlow} labelledBy="alf-sec-done" width={420}>
        <div className="fl-dialog sf-done">
          <span className={`sf-done__icon${locked ? " is-red" : ""}`} aria-hidden="true">
            <span>
              <img src={a(locked ? "hp-shield.svg" : "st-check-white.svg")} alt="" width="18" height="18" className={locked ? "alf-white" : undefined} />
            </span>
          </span>
          <div className="sf-done__text">
            <h2 id="alf-sec-done">{locked ? "Your account is locked" : "Thanks for confirming"}</h2>
            <p>
              {locked
                ? "Withdrawals are paused and every device is signed out. We emailed you a link to reset your password — our team will reach out within 15 minutes."
                : "We’ll remember this address. You can review trusted addresses in Settings → Security."}
            </p>
          </div>
          <div className="sf-foot">
            {locked && (
              <button type="button" className="ob-btn ob-btn--secondary" onClick={() => go("help/chat")}>
                Talk to support
              </button>
            )}
            <button type="button" className="btn-primary ob-btn" onClick={() => (locked ? go("settings/security") : closeFlow())}>
              {locked ? "Security settings" : "Done"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal onClose={closeFlow} labelledBy="alf-sec-title" width={432}>
      <div className="fl-dialog alf-sec">
        <span className="alf-sec__icon" aria-hidden="true">
          <img src={a("hp-shield.svg")} alt="" width="22" height="22" />
        </span>
        <div className="sf-done__text">
          <h2 id="alf-sec-title">Was this withdrawal you?</h2>
          <p>Aug 17, 2026 · 06:32 PM · to an address you haven’t used before</p>
        </div>
        <div className="afl-receipt">
          <span className="afl-receipt__amt alf-sec__amt">
            <img src={a("t-eth.svg")} alt="" width="22" height="22" />
            2.5 ETH
          </span>
          <span className="fl-sub fl-sub--13">≈ $8,046.83</span>
        </div>
        <div className="fl-stack-8 yfl-rows">
          <Row label="Sent to">
            <span className="yfl-orange">0x7a3f…c91e · new address</span>
          </Row>
          <Row label="Network" value="Ethereum" />
          <Row label="Approved from">
            <span className="yfl-orange">Chrome on Windows · new device</span>
          </Row>
          <Row label="Status" value="Confirmed on-chain" />
        </div>
        <p className="alf-sec__warn">If it wasn’t you, we’ll pause withdrawals, sign out every device and help you reset your password. Funds already confirmed on-chain can’t be reversed.</p>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={() => answer("me")}>
            Yes, it was me
          </button>
          <button type="button" className="btn-primary ob-btn yfl-btn-danger" onClick={() => answer("lock")}>
            No, lock my account
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 04A · Notification settings ───────────── */

const ROWS = [
  ["Price", "Price alerts", "Your price and % move rules"],
  ["Account", "Account", "Deposits, withdrawals, staking rewards"],
  ["Security", "Security", "New devices, large withdrawals, password changes"],
  ["System", "System & market", "Maintenance and market updates"],
];

export function NotificationSettings() {
  const st = alertStore.get();
  const [m, setM] = useState(st.settings);
  const [quiet, setQuiet] = useState(st.quiet);
  const [digest, setDigest] = useState(st.digest);
  const [saved, setSaved] = useState(false);
  const save = () => {
    alertStore.set((s) => ({ ...s, settings: m, quiet, digest }));
    setSaved(true);
    setTimeout(closeFlow, 700);
  };
  return (
    <Modal onClose={closeFlow} labelledBy="alf-set-title" width={540}>
      <div className="fl-dialog alf-settings">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="alf-set-title" className="fl-head__title">
              Notification settings
            </h2>
            <p className="fl-head__sub">Choose how each type of alert reaches you</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="alf-matrix" role="table" aria-label="Channels per alert type">
          <div className="alf-matrix__row is-head" role="row">
            <span role="columnheader">Alert type</span>
            {CHANNELS.map((c) => (
              <span key={c} role="columnheader">
                {c}
              </span>
            ))}
          </div>
          {ROWS.map(([k, title, sub]) => (
            <div key={k} className="alf-matrix__row" role="row">
              <span className="fl-coin__name" role="cell">
                <span className="fl-strong fl-strong--13">{title}</span>
                <span className="fl-sub fl-sub--11">{sub}</span>
              </span>
              {CHANNELS.map((c) =>
                k === "Security" ? (
                  <span key={c} role="cell" className="alf-matrix__lock" title="Security alerts always come through">
                    <img className="mono" src={a("st-lock.svg")} alt="Always on" width="16" height="16" />
                  </span>
                ) : (
                  <label key={c} role="cell" className="alf-matrix__cell">
                    <input type="checkbox" checked={m[k][c]} aria-label={`${title} by ${c}`} onChange={(e) => setM({ ...m, [k]: { ...m[k], [c]: e.target.checked } })} />
                    <span className={`hf-box${m[k][c] ? " is-on" : ""}`}>{m[k][c] && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
                  </label>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="alf-toggles">
          <div className="fl-row">
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">Quiet hours</span>
              <span className="fl-sub fl-sub--11">10:00 PM – 07:00 AM · security alerts still come through</span>
            </span>
            <Toggle on={quiet} onChange={setQuiet} label="Quiet hours" />
          </div>
          <hr className="fl-hr" />
          <div className="fl-row">
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">Daily digest</span>
              <span className="fl-sub fl-sub--11">Bundle system and market updates into one email at 08:00 AM</span>
            </span>
            <Toggle on={digest} onChange={setDigest} label="Daily digest" />
          </div>
        </div>
        <span className="fl-sub fl-sub--11">
          SMS goes to +1 ••• ••• 4821 ·{" "}
          <button type="button" className="hp-link" onClick={() => go("settings/security")}>
            Change
          </button>
        </span>
        <div className="sf-foot">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Cancel
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={save}>
            {saved ? "Saved" : "Save settings"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 05A · Row menu · Read, snooze or mute ───────────── */

export function AlertMenu({ anchor, id }) {
  const st = alertStore.use();
  const x = st.alerts.find((y) => y.id === id);
  const [snooze, setSnooze] = useState(false);
  const price = x.type === "Price";
  const kind = price ? `${x.asset} price` : x.type === "Security" ? "security" : x.type.toLowerCase();
  const act = (fn) => () => {
    fn();
    closeFlow();
  };
  return (
    <Popover onClose={closeFlow} label={`${x.title} actions`} anchor={anchor} width={232}>
      <div className="fl-menu">
        <button type="button" className="fl-menu__item fl-menu__item--sm" onClick={act(() => markRead(id, !x.unread))}>
          <img className="mono" src={a("st-check.svg")} alt="" width="14" height="14" />
          <span>{x.unread ? "Mark as read" : "Mark as unread"}</span>
        </button>
        {x.type !== "Security" && (
          <>
            <button type="button" className={`fl-menu__item fl-menu__item--sm${snooze ? " is-open" : ""}`} aria-expanded={snooze} onClick={() => setSnooze(!snooze)}>
              <img className="mono" src={a("ob-schedule.svg")} alt="" width="16" height="16" />
              <span>{x.snoozed ? `Snoozed · ${x.snoozed}` : "Snooze"}</span>
              <span className={`afl-chev alf-chev${snooze ? " is-open" : ""}`}>›</span>
            </button>
            {snooze && (
              <div className="alf-sub">
                <span className="fl-sub fl-sub--11">Snooze {x.asset || "these"} alerts for</span>
                {["1 hour", "Until tomorrow 09:00", "1 week"].map((o) => (
                  <button key={o} type="button" className={`fl-menu__item fl-menu__item--sm${x.snoozed === o ? " is-on" : ""}`} onClick={act(() => patchAlert(id, { snoozed: o, unread: false }))}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="fl-menu__item fl-menu__item--sm" onClick={act(() => alertStore.set((s) => ({ ...s, alerts: s.alerts.map((y) => (y.type === x.type && y.asset === x.asset ? { ...y, muted: !x.muted } : y)) })))}>
              <img className="mono" src={a("st-eye.svg")} alt="" width="16" height="16" />
              <span>
                {x.muted ? "Unmute" : "Mute"} {kind} alerts
              </span>
            </button>
          </>
        )}
        {price && (
          <button type="button" className="fl-menu__item fl-menu__item--sm" onClick={() => openFlow("alerts.create", { coin: x.asset })}>
            <img className="mono" src={a("settings.svg")} alt="" width="16" height="16" />
            <span>Edit rule</span>
          </button>
        )}
        <button type="button" className="fl-menu__item fl-menu__item--sm afl-delete" onClick={act(() => patchAlert(id, { deleted: true }))}>
          <img className="mono" src={a("hp-close.svg")} alt="" width="16" height="16" />
          <span>Delete</span>
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Filters · Find an alert fast ───────────── */

export function AlertFilters({ anchor }) {
  const st = alertStore.get();
  const [f, setF] = useState(st.filter);
  const live = st.alerts.filter((x) => !x.deleted);
  const count = filterAlerts(live, f).length;
  const typeCount = (t) => live.filter((x) => x.type === t).length;
  const toggleType = (t) => setF({ ...f, types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t] });
  const Chip = ({ on, onClick, children }) => (
    <button type="button" className={`mf-chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
  return (
    <Popover onClose={closeFlow} label="Filter alerts" anchor={anchor} align="left" width={400}>
      <div className="alf-filters">
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--13">Date</span>
          <div className="mf-chips">
            {DATES.map((d) => (
              <Chip key={d} on={f.date === d} onClick={() => setF({ ...f, date: d })}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--13">Type</span>
          <div className="mf-chips">
            {alertTypes.map((t) => (
              <Chip key={t} on={f.types.includes(t)} onClick={() => toggleType(t)}>
                {t} · {typeCount(t)}
              </Chip>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--13">Status</span>
          <div className="mf-chips">
            {["Unread", "Read"].map((t) => (
              <Chip key={t} on={f.status === t} onClick={() => setF({ ...f, status: f.status === t ? null : t })}>
                {t} · {live.filter((x) => (t === "Unread") === !!x.unread).length}
              </Chip>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub fl-sub--13">Asset</span>
          <div className="mf-chips">
            {[...alertAssets, null].map((t) => (
              <Chip key={t || "all"} on={f.asset === t} onClick={() => setF({ ...f, asset: t })}>
                {t || "All assets"}
              </Chip>
            ))}
          </div>
        </div>
        <hr className="fl-hr" />
        <div className="alf-filters__foot">
          <button type="button" className="hp-link" onClick={() => setF({ date: "Last 7 days", types: [], status: null, asset: null })}>
            Clear all
          </button>
          <button
            type="button"
            className="btn-primary ob-btn fl-btn-auto"
            disabled={!count}
            onClick={() => {
              alertStore.set((s) => ({ ...s, filter: f }));
              closeFlow();
            }}
          >
            {count ? `Show ${count} alert${count === 1 ? "" : "s"}` : "No alerts match"}
          </button>
        </div>
      </div>
    </Popover>
  );
}

/* ───────────── Header ⋯ menu ───────────── */

export function AlertsMore({ anchor }) {
  const items = [
    ["Mark all read", "st-check.svg", () => { alertStore.set((s) => ({ ...s, alerts: s.alerts.map((x) => ({ ...x, unread: false })) })); closeFlow(); }],
    ["My alert rules", "notifications.svg", () => openFlow("alerts.rules")],
    ["Notification settings", "settings.svg", () => openFlow("alerts.settings")],
    ["Create price alert", "add.svg", () => openFlow("alerts.create")],
  ];
  return (
    <Popover onClose={closeFlow} label="Alerts options" anchor={anchor} width={220}>
      <div className="fl-menu">
        {items.map(([l, icon, fn]) => (
          <button key={l} type="button" className="fl-menu__item fl-menu__item--sm" onClick={fn}>
            <img className="mono" src={a(icon)} alt="" width="16" height="16" />
            <span>{l}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
