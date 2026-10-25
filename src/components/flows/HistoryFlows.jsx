import React, { useState } from "react";
import Modal, { Drawer, Popover, CloseButton } from "../Modal";
import { Segmented } from "../Settings";
import { Row, CopyText } from "./HomeFlows";
import { openFlow, closeFlow, createStore } from "../../flows";
import { TYPES, STATUSES, ASSETS, TYPE_COUNTS, COIN_NAMES, transactions } from "../../historyData";

const a = (name) => `/assets/${name}`;
const go = (route) => {
  closeFlow();
  window.location.hash = `#/${route}`;
};

// Filters, search, notes and status changes shared by the History page and its overlays.
export const historyStore = createStore({
  types: [],
  asset: null,
  status: null,
  query: "",
  notes: { 1: "0x8f3c refund" },
  status_: {},
});
export const historyDates = createStore({ from: [2026, 8, 1], to: [2026, 8, 7], preset: "Last 7 days" });

export const statusOf = (t, st = historyStore.get()) => st.status_[t.id] || t.status;
export const shortHash = (h) => `${h.slice(0, 6)}…${h.slice(-4)}`;
export const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
const usd = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function filterRows(st) {
  return transactions.filter(
    (t) =>
      (!st.types.length || st.types.includes(t.type)) &&
      (!st.asset || t.asset === st.asset) &&
      (!st.status || statusOf(t, st) === st.status),
  );
}

const typeCount = (types) => types.reduce((n, t) => n + TYPE_COUNTS[t], 0);

// How many results the filters give: the type counts cover the full history, the rest narrows the sample.
export function resultCount(st, rows) {
  if (st.asset || st.status) return rows.length;
  return st.types.length ? typeCount(st.types) : 100;
}

/* ───────────── 01A · Type filter · Multi-select with counts ───────────── */

function TypeList({ picked, onToggle }) {
  return (
    <div className="hf-types" role="group" aria-label="Transaction type">
      {TYPES.map((t) => {
        const on = picked.includes(t);
        return (
          <label key={t} className={`hf-type${on ? " is-on" : ""}`}>
            <input type="checkbox" checked={on} onChange={() => onToggle(t)} />
            <span className={`fl-check__box${on ? " is-on" : ""}`}>{on && <img src={a("st-check-white.svg")} alt="" width="12" height="12" />}</span>
            <span className={`hf-type__name${on ? ` hi-type--${t.toLowerCase()}` : ""}`}>{t}</span>
            <span className="hf-type__count">{TYPE_COUNTS[t]}</span>
          </label>
        );
      })}
    </div>
  );
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function TypeFilter({ anchor }) {
  const [picked, setPicked] = useState(historyStore.get().types.length ? historyStore.get().types : ["Buy", "Sell"]);
  const all = picked.length === TYPES.length;
  const apply = () => {
    historyStore.set((s) => ({ ...s, types: all ? [] : picked }));
    closeFlow();
  };
  return (
    <Popover onClose={closeFlow} label="Transaction type" anchor={anchor} align="left" width={276}>
      <div className="hf-pop">
        <div className="hf-pop__head">
          <span className="fl-sub fl-sub--13">Transaction type</span>
          <button type="button" className="hp-link hf-link" onClick={() => setPicked(all ? [] : TYPES)}>
            {all ? "Select none" : "Select all"}
          </button>
        </div>
        <TypeList picked={picked} onToggle={(t) => setPicked((p) => toggle(p, t))} />
        <div className="hf-pop__foot">
          <button type="button" className="ob-btn ob-btn--ghost" onClick={() => setPicked([])}>
            Clear
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={apply}>
            Show {picked.length ? typeCount(picked) : 128}
          </button>
        </div>
      </div>
    </Popover>
  );
}

// Assets and Status pick one value (or "All …").
export function PickMenu({ anchor, field, all, options }) {
  const st = historyStore.use();
  const pick = (v) => {
    historyStore.set((s) => ({ ...s, [field]: v }));
    closeFlow();
  };
  return (
    <Popover onClose={closeFlow} label={all} anchor={anchor} align="left" width={200}>
      <div className="fl-menu">
        {[null, ...options].map((o) => (
          <button key={o || "all"} type="button" className={`fl-menu__item fl-menu__item--sm hf-pick${st[field] === o ? " is-on" : ""}`} onClick={() => pick(o)}>
            <span>{o || all}</span>
            {st[field] === o && <img className="mono" src={a("st-check.svg")} alt="" width="16" height="16" />}
          </button>
        ))}
      </div>
    </Popover>
  );
}

/* ───────────── 02A · Transaction · Detail & receipt ───────────── */

const VERB = { Buy: "Bought", Sell: "Sold", Deposit: "Deposited", Withdraw: "Withdrew", Swap: "Swapped", Stake: "Staked", Unstake: "Unstaked" };
const STEPS = {
  Buy: ["Order placed", "Matched in order book", "Settled to Unified Trading"],
  Sell: ["Order placed", "Matched in order book", "Settled to Unified Trading"],
  Deposit: ["Detected on chain", "12 confirmations", "Credited to Funding"],
  Withdraw: ["Requested", "Broadcast to network", "Confirmed on chain"],
  Swap: ["Quote locked", "Routed via Zentra Swap", "Settled to Unified Trading"],
  Stake: ["Stake requested", "Validator assigned", "Earning rewards"],
  Unstake: ["Unstake requested", "Unbonding period", "Returned to Funding"],
};
const AGAIN = { Buy: "Buy again", Sell: "Sell again", Deposit: "Deposit again", Withdraw: "Withdraw again", Swap: "Swap again", Stake: "Stake more", Unstake: "Stake again" };
const INCOMING = ["Buy", "Deposit", "Unstake"];
const TONE = { Complete: "green", Pending: "orange", Failed: "red" };

function stamp(time, add) {
  const [hm, ap] = time.split(" ");
  const [h, m] = hm.split(":");
  return `${h}:${m}:${String(2 + add).padStart(2, "0")} ${ap}`;
}

export function TxReceipt({ id = 0 }) {
  const st = historyStore.use();
  const tx = transactions[id] || transactions[0];
  const status = statusOf(tx, st);
  const reached = status === "Complete" ? 3 : status === "Pending" ? 2 : 1;
  const failed = status === "Failed";
  const total = num(tx.total);
  const fee = +(total * 0.001).toFixed(2);
  const incoming = INCOMING.includes(tx.type);
  const [note, setNote] = useState(st.notes[tx.id] || "");
  const [editing, setEditing] = useState(false);
  const [pdf, setPdf] = useState(false);
  const saveNote = () => {
    historyStore.set((s) => ({ ...s, notes: { ...s.notes, [tx.id]: note.trim() } }));
    setEditing(false);
  };
  return (
    <Drawer onClose={closeFlow} labelledBy="hf-tx-title" width={456}>
      <div className="fl-drawer fl-drawer--20">
        <div className="fl-drawer__scroll">
          <div className="fl-head">
            <div className="fl-head__text">
              <h2 id="hf-tx-title" className="fl-head__title">
                {VERB[tx.type]} {COIN_NAMES[tx.asset]}
              </h2>
              <p className="fl-head__sub">
                {tx.date.replace(",", "").replace(/ (\d{4})$/, ", $1")} · {tx.time}
              </p>
            </div>
            <CloseButton onClick={closeFlow} />
          </div>
          <div className="hf-hero">
            <img src={tx.icon} alt="" width="48" height="48" />
            <span className="hf-hero__amount">
              {incoming ? "+" : "−"}
              {tx.amount}
            </span>
            <span className="hf-hero__sub">
              <span>for {tx.total}</span>
              <span className={`fl-pill is-${TONE[status]}`}>{status}</span>
            </span>
          </div>
          <ol className="hf-timeline" aria-label="Progress">
            {STEPS[tx.type].map((s, i) => {
              const state = i < reached ? "done" : failed && i === reached ? "fail" : "todo";
              return (
                <li key={s} className={`hf-tl is-${state}`}>
                  <span className="hf-tl__dot">
                    {state === "done" && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}
                    {state === "fail" && "!"}
                  </span>
                  <span className="hf-tl__title">{state === "fail" ? "Expired on network" : s}</span>
                  <span className="hf-tl__time">{state === "todo" ? (status === "Pending" ? "In progress" : "—") : stamp(tx.time, i)}</span>
                </li>
              );
            })}
          </ol>
          <div className="hf-card">
            <Row label="Price" value={tx.price} />
            <Row label="Amount" value={tx.amount} />
            <Row label="Fee (0.10%)" value={failed ? "$0.00" : usd(fee)} />
            <Row label="Wallet" value={tx.type === "Deposit" || tx.type === "Withdraw" || tx.type === "Unstake" ? "Funding" : "Unified Trading"} />
            <Row label="Order ID">
              <span className="hf-brand">ZN-2026-{tx.date.slice(0, 3) === "Aug" ? "08" : "09"}-{tx.date.slice(4, 6)}-04{12 + tx.id}</span>
            </Row>
            <Row label="Tx hash">
              <span className="hf-hash">
                <CopyText text={tx.hash} shown={shortHash(tx.hash)} />
                <a className="fl-icon-btn hf-ext" href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" aria-label="View on explorer">
                  <img className="mono" src={a("call-made.svg")} alt="" width="14" height="14" />
                </a>
              </span>
            </Row>
            <hr className="fl-hr" />
            <Row strong label={incoming ? "Total paid" : "You received"} value={failed ? "$0.00" : usd(incoming ? total + fee : total - fee)} />
          </div>
          {editing ? (
            <div className="hf-note is-editing">
              <input
                className="fl-input"
                autoFocus
                value={note}
                placeholder="e.g. refund, gift, tax-loss"
                aria-label="Note or tag"
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNote()}
              />
              <button type="button" className="btn-primary ob-btn fl-btn-auto" onClick={saveNote}>
                Save
              </button>
            </div>
          ) : (
            <button type="button" className="hf-note" onClick={() => setEditing(true)}>
              <img className="mono" src={a("add.svg")} alt="" width="16" height="16" />
              <span>{st.notes[tx.id] ? `Note: “${st.notes[tx.id]}”` : "Add a note or tag for taxes"}</span>
            </button>
          )}
        </div>
        <div className="hf-actions">
          <button type="button" className="ob-btn ob-btn--ghost fl-btn-auto" onClick={() => go("help/chat")}>
            Report issue
          </button>
          <button type="button" className="ob-btn ob-btn--secondary fl-btn-auto" onClick={() => setPdf(true)} disabled={failed}>
            {pdf ? "Downloaded" : "Receipt PDF"}
          </button>
          <button type="button" className="btn-primary ob-btn fl-btn-auto" onClick={() => go(tx.type === "Stake" || tx.type === "Unstake" ? "stake" : "trade")}>
            {AGAIN[tx.type]}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ───────────── 03A · Export · Statements & tax report ───────────── */

const FORMATS = ["CSV", "PDF statement", "Tax report"];
const RANGES = ["Jan 01 – Dec 31, 2026", "Sep 01 – Sep 07, 2026", "Last 90 days", "All time"];
const SUMMARY = {
  CSV: [
    ["Rows", "128"],
    ["Columns", "14"],
    ["File size", "~48 KB"],
    ["Opens in", "Excel, Sheets"],
  ],
  "PDF statement": [
    ["Pages", "6"],
    ["Account", "Unified Trading"],
    ["Opening balance", "$122,118.82"],
    ["Closing balance", "$124,458.94"],
  ],
  "Tax report": [
    ["Cost basis method", "FIFO"],
    ["Tax year", "2026"],
    ["Country", "Bangladesh"],
    ["Realized gains", "+$2,340.12"],
  ],
};

export function ExportHistory() {
  const st = historyStore.get();
  const [format, setFormat] = useState("Tax report");
  const [range, setRange] = useState(RANGES[0]);
  const [opts, setOpts] = useState({ fees: true, rewards: true, failed: false });
  const [state, setState] = useState("idle");
  const count = 128 - (opts.rewards ? 0 : 8) + (opts.failed ? 3 : 0);
  const filters = [st.types.length ? st.types.join(", ") : "All types", st.asset || "All assets"].join(" · ");
  const run = () => {
    setState("busy");
    setTimeout(() => setState("done"), 900);
  };
  const OPTS = [
    ["fees", "Include fees"],
    ["rewards", "Include staking rewards"],
    ["failed", "Include failed transactions"],
  ];
  return (
    <Modal onClose={closeFlow} labelledBy="hf-export-title" width={416}>
      <div className="fl-dialog hf-export">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="hf-export-title" className="fl-head__title">
              Export history
            </h2>
            <p className="fl-head__sub">Uses your current filters: {filters}</p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Format</span>
          <Segmented options={FORMATS} value={format} onChange={setFormat} label="Format" className="hf-seg" />
        </div>
        <div className="fl-stack-8">
          <span className="fl-label">Summary</span>
          <div className="hf-tiles">
            {SUMMARY[format].map(([k, v]) => (
              <div key={k} className="hf-tile">
                <span className="fl-sub fl-sub--13">{k}</span>
                <span className={`fl-strong fl-strong--15${v.startsWith("+") ? " up" : ""}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <label className="fl-label" htmlFor="hf-range">
            Date range
          </label>
          <span className="hf-select">
            <img className="mono" src={a("i-calendar.svg")} alt="" width="16" height="16" />
            <select id="hf-range" value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <img className="mono" src={a("arrow-down.svg")} alt="" width="16" height="16" />
          </span>
        </div>
        <div className="hf-opts">
          {OPTS.map(([k, label]) => (
            <label key={k} className="hf-opt">
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />
              <span className={`hf-box${opts[k] ? " is-on" : ""}`}>{opts[k] && <img src={a("st-check-white.svg")} alt="" width="10" height="10" />}</span>
              {label}
            </label>
          ))}
        </div>
        <div className="hf-export__foot">
          <span className="fl-muted fl-sub--13r">{state === "done" ? "Downloaded" : `${count} transactions`}</span>
          <button type="button" className="ob-btn ob-btn--secondary fl-btn-auto" onClick={closeFlow}>
            {state === "done" ? "Close" : "Cancel"}
          </button>
          <button type="button" className="btn-primary ob-btn fl-btn-auto" onClick={run} disabled={state === "busy"}>
            {state === "busy" ? "Preparing…" : state === "done" ? "Export again" : format === "Tax report" ? "Export report" : `Export ${format.split(" ")[0]}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 04A · Status · Pending & failed ───────────── */

const SHORT_ADDR = "7xKX…9fQ2";

export function StatusDetail({ anchor, id = 3 }) {
  const st = historyStore.use();
  const tx = transactions[id];
  const status = statusOf(tx, st);
  const [busy, setBusy] = useState(false);
  const set = (v) => historyStore.set((s) => ({ ...s, status_: { ...s.status_, [tx.id]: v } }));
  const when = `${tx.date.slice(0, 6)}, ${tx.time}`;
  const noun = { Withdraw: "Withdrawal", Swap: "Swap", Deposit: "Deposit" }[tx.type] || tx.type;
  const retry = () => {
    setBusy(true);
    setTimeout(() => {
      set("Pending");
      setBusy(false);
    }, 700);
  };
  const speed = () => {
    setBusy(true);
    setTimeout(() => {
      set("Complete");
      setBusy(false);
    }, 900);
  };

  return (
    <Popover onClose={closeFlow} label={`${noun} ${status.toLowerCase()}`} anchor={anchor} width={308}>
      <div className="hf-status">
        <div className="hf-status__head">
          <span className={`hf-status__icon is-${TONE[status]}`}>
            <img className="mono" src={status === "Failed" ? a("hp-error.svg") : status === "Pending" ? a("ob-schedule.svg") : a("st-check.svg")} alt="" width="18" height="18" />
          </span>
          <span className="fl-coin__name">
            <span className="fl-strong">
              {noun} {status === "Complete" ? "complete" : status.toLowerCase()}
            </span>
            <span className="fl-sub fl-sub--11">
              {tx.type === "Withdraw" ? `${tx.amount} → ${SHORT_ADDR}` : tx.type === "Swap" ? `${tx.amount} → ${tx.total.slice(1)} USDT` : tx.amount} · {when}
            </span>
          </span>
        </div>
        {status === "Failed" && (
          <>
            <p className="hf-status__text">The network was congested and the transaction expired before it was confirmed.</p>
            <p className="hf-status__note is-green">
              <img src={a("st-check.svg")} alt="" width="12" height="12" />
              Your {tx.amount} is back in your Funding wallet. No fee was charged.
            </p>
            <div className="hf-status__actions">
              <button type="button" className="ob-btn ob-btn--ghost" onClick={() => go("help/chat")}>
                Contact support
              </button>
              <button type="button" className="btn-primary ob-btn" onClick={retry} disabled={busy}>
                {busy ? "Retrying…" : `Retry ${noun.toLowerCase()}`}
              </button>
            </div>
          </>
        )}
        {status === "Pending" && (
          <>
            <p className="hf-status__text">Waiting for network confirmations. This usually takes about 2 minutes.</p>
            <div className="hf-progress">
              <div className="hf-progress__top">
                <span>{busy ? "Speeding up…" : "18 of 32 confirmations"}</span>
                <span>{busy ? "" : "~1 min left"}</span>
              </div>
              <span className="hf-progress__bar">
                <span style={{ width: busy ? "92%" : "56%" }} />
              </span>
            </div>
            <p className="hf-status__note is-orange">These funds can’t be used until the {noun.toLowerCase()} settles.</p>
            <div className="hf-status__actions">
              <a className="ob-btn ob-btn--ghost" href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                View on explorer
              </a>
              <button type="button" className="btn-primary ob-btn" onClick={speed} disabled={busy}>
                Speed up
              </button>
            </div>
          </>
        )}
        {status === "Complete" && (
          <>
            <p className="hf-status__note is-green">
              <img src={a("st-check.svg")} alt="" width="12" height="12" />
              Confirmed on chain. Funds are available in your wallet.
            </p>
            <div className="hf-status__actions">
              <button type="button" className="btn-primary ob-btn" onClick={() => openFlow("history.tx", { id: tx.id })}>
                View receipt
              </button>
            </div>
          </>
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 06A · Quick Stats · Fee breakdown ───────────── */

const FEES = [
  { label: "Trading fees", value: 86.2, color: "#5720f5" },
  { label: "Network fees", value: 29.1, color: "#0379df" },
  { label: "Withdrawal fees", value: 9.26, color: "#fe7701" },
];

export function FeeBreakdown({ anchor }) {
  const total = FEES.reduce((n, f) => n + f.value, 0);
  return (
    <Popover onClose={closeFlow} label="Fees" anchor={anchor} width={340}>
      <div className="hf-fees">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 className="fl-strong fl-strong--15">Fees · Aug 18 – 27</h2>
            <p className="fl-sub fl-sub--11 up">{usd(total)} total · −2.1% vs previous period</p>
          </div>
          <button type="button" className="fl-icon-btn" aria-label="Close" onClick={closeFlow}>
            <img className="mono" src={a("hp-close.svg")} alt="" width="18" height="18" />
          </button>
        </div>
        <span className="hf-fees__bar" aria-hidden="true">
          {FEES.map((f) => (
            <span key={f.label} style={{ flex: f.value, background: f.color }} />
          ))}
        </span>
        <div className="fl-stack-8">
          {FEES.map((f) => (
            <div key={f.label} className="fl-row hf-fees__row">
              <span className="fl-row__label">
                <span className="hf-dot" style={{ background: f.color }} />
                {f.label}
              </span>
              <span className="fl-row__value">{usd(f.value)}</span>
            </div>
          ))}
          <Row label="Your tier" value="VIP 1 · 0.10% / 0.12%" />
        </div>
        <p className="hf-fees__tip">
          <img src={a("stars.svg")} alt="" width="14" height="14" />
          Trade $15k more this month to reach VIP 2 and save about $18 a month.
        </p>
        <button type="button" className="hp-link hf-link" onClick={() => go("help")}>
          See all fee tiers ›
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 07A · Search · Find a transaction ───────────── */

export function searchTx(query, notes) {
  const q = query.trim().toLowerCase();
  if (!q) return { hash: [], notes: [], other: [] };
  const used = new Set();
  const take = (fn) =>
    transactions.filter((t) => {
      if (used.has(t.id) || !fn(t)) return false;
      used.add(t.id);
      return true;
    });
  const digits = q.replace(/[^0-9.]/g, "");
  return {
    hash: take((t) => t.hash.toLowerCase().startsWith(q) || (q.length > 3 && t.hash.toLowerCase().includes(q))),
    notes: take((t) => (notes[t.id] || "").toLowerCase().includes(q)),
    other: take(
      (t) =>
        t.asset.toLowerCase() === q ||
        COIN_NAMES[t.asset].toLowerCase().startsWith(q) ||
        t.type.toLowerCase().startsWith(q) ||
        (digits.length >= 2 && digits === q && (t.total.replace(/[$,]/g, "").includes(digits) || t.amount.includes(digits))),
    ),
  };
}

function Result({ t, sub, onPick }) {
  return (
    <button type="button" className="hf-result" onClick={() => onPick(t)}>
      <span className="hf-result__icon">
        <img src={t.icon} alt="" width="24" height="24" />
      </span>
      <span className="fl-coin__name">
        <span className="fl-strong">
          {t.type} · {t.amount}
        </span>
        <span className="fl-sub fl-sub--11">{sub}</span>
      </span>
      <span className="fl-strong">{t.total}</span>
    </button>
  );
}

export function SearchResults({ query, notes, onPick }) {
  const r = searchTx(query, notes);
  const groups = [
    ["Transaction hash", r.hash, (t) => (
      <>
        {t.date.slice(0, 6)}, {t.time} · <span className="hf-brand">{shortHash(t.hash)}</span>
      </>
    )],
    ["Notes & tags", r.notes, (t) => (
      <>
        Tagged “<span className="hf-brand">{notes[t.id]}</span>”
      </>
    )],
    ["Amount & asset", r.other, (t) => `${t.date.slice(0, 6)}, ${t.time} · ${statusOf(t)}`],
  ].filter(([, list]) => list.length);
  return (
    <div className="hf-results">
      {groups.map(([title, list, sub]) => (
        <div key={title} className="hf-results__group">
          <div className="hf-results__head">
            <span>{title}</span>
            <span>
              {list.length} result{list.length === 1 ? "" : "s"}
            </span>
          </div>
          {list.map((t) => (
            <Result key={t.id} t={t} sub={sub(t)} onPick={onPick} />
          ))}
        </div>
      ))}
      {!groups.length && <p className="hf-results__none">No transactions match “{query.trim()}”.</p>}
      <p className="hf-results__hint">Search by hash, amount (e.g. 1705), asset or note</p>
    </div>
  );
}

/* ───────────── Phone · Filters sheet (search, type, asset, status) ───────────── */

export function MobileFilters() {
  const st = historyStore.get();
  const [query, setQuery] = useState(st.query);
  const [types, setTypes] = useState(st.types);
  const [asset, setAsset] = useState(st.asset);
  const [status, setStatus] = useState(st.status);
  const apply = () => {
    historyStore.set((s) => ({ ...s, types, asset, status }));
    closeFlow();
  };
  const pickTx = (t) => openFlow("history.tx", { id: t.id });
  return (
    <Modal onClose={closeFlow} labelledBy="hf-filters-title" width={420}>
      <div className="fl-dialog hf-sheet">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="hf-filters-title" className="fl-head__title">
              Filters
            </h2>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <label className="fl-search">
          <img className="mono" src={a("search.svg")} alt="" width="18" height="18" />
          <input value={query} placeholder="Search by hash, amount or note" aria-label="Search transactions" onChange={(e) => setQuery(e.target.value)} />
        </label>
        {query.trim() ? (
          <SearchResults query={query} notes={st.notes} onPick={pickTx} />
        ) : (
          <>
            <div className="fl-stack-8">
              <div className="hf-pop__head">
                <span className="fl-label">Transaction type</span>
                <button type="button" className="hp-link hf-link" onClick={() => setTypes(types.length === TYPES.length ? [] : TYPES)}>
                  {types.length === TYPES.length ? "Select none" : "Select all"}
                </button>
              </div>
              <TypeList picked={types} onToggle={(t) => setTypes((p) => toggle(p, t))} />
            </div>
            {[
              ["Asset", ASSETS, asset, setAsset],
              ["Status", STATUSES, status, setStatus],
            ].map(([label, opts, value, set]) => (
              <div key={label} className="fl-stack-8">
                <span className="fl-label">{label}</span>
                <div className="fl-chips">
                  {[null, ...opts].map((o) => (
                    <button key={o || "all"} type="button" className={`fl-chip${value === o ? " is-on" : ""}`} aria-pressed={value === o} onClick={() => set(o)}>
                      {o || "All"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="hf-pop__foot">
              <button
                type="button"
                className="ob-btn ob-btn--ghost"
                onClick={() => {
                  setTypes([]);
                  setAsset(null);
                  setStatus(null);
                }}
              >
                Clear
              </button>
              <button type="button" className="btn-primary ob-btn" onClick={apply}>
                Show results
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
