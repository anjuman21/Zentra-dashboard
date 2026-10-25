import React, { useEffect, useMemo, useState } from "react";
import Modal, { Popover, CloseButton } from "../Modal";
import { Toggle, Segmented } from "../Settings";
import { Row } from "./HomeFlows";
import { openFlow, closeFlow } from "../../flows";
import { BTC_PRICE } from "../../tradeData";
import {
  tficons,
  PAIRS,
  PAIR_TABS,
  ORDER_TYPES,
  CHART_TYPES,
  INTERVALS,
  INDICATORS,
  DEFAULT_CHART,
  tradeStore,
  pairKey,
  pairOf,
  fmt,
  num,
} from "../../tradeFlowData";

const set = (patch) => tradeStore.set((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

/* ───────────── 01A · Pair · Switch trading pair ───────────── */

export function PairPicker({ anchor }) {
  const st = tradeStore.use();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("Favorites");
  const [active, setActive] = useState(0);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PAIRS.filter((p) => (tab === "Favorites" ? st.favorites.includes(pairKey(p)) : p.quote === tab || (tab === "BTC" && p.quote === "BTC")))
      .filter((p) => !needle || `${p.base} ${p.name} ${pairKey(p)}`.toLowerCase().includes(needle));
  }, [q, tab, st.favorites]);
  useEffect(() => setActive(0), [q, tab]);

  const pick = (p) => {
    set({ pair: pairKey(p), fillPrice: null });
    closeFlow();
  };
  const fav = (p) => set((s) => ({ favorites: s.favorites.includes(pairKey(p)) ? s.favorites.filter((x) => x !== pairKey(p)) : [...s.favorites, pairKey(p)] }));
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(list.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && list[active]) pick(list[active]);
    else if (e.key === "*" && list[active]) fav(list[active]);
  };

  return (
    <Popover onClose={closeFlow} label="Switch trading pair" anchor={anchor} align="left" width={420}>
      <div className="tf-pairs">
        <label className="tf-pairs__search">
          <img className="mono" src={tficons.search} alt="" width="18" height="18" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search pair, e.g. SOL" aria-label="Search pair" autoFocus />
        </label>
        <Segmented options={PAIR_TABS} value={tab} onChange={setTab} label="Quote" className="tf-pairs__tabs" />
        <div className="tf-pairs__head">
          <span>Pair</span>
          <span>Last price</span>
          <span>24h</span>
        </div>
        <ul className="tf-pairs__list" role="listbox">
          {list.map((p, i) => {
            const key = pairKey(p);
            const current = key === st.pair;
            return (
              <li key={key}>
                <div className={`tf-pair${i === active ? " is-active" : ""}`} onMouseEnter={() => setActive(i)}>
                  <button type="button" className={`tf-star${st.favorites.includes(key) ? " is-on" : ""}`} aria-label={`Favorite ${key}`} aria-pressed={st.favorites.includes(key)} onClick={() => fav(p)}>
                    ☆
                  </button>
                  <button type="button" role="option" aria-selected={current} className="tf-pair__main" onClick={() => pick(p)}>
                    <img src={p.icon} alt="" width="22" height="22" />
                    <span className="fl-strong fl-strong--13">{key}</span>
                    {current && <span className="tf-current">Current</span>}
                    <span className="tf-pair__price">{fmt(p.price, p.price < 1 ? 5 : 2)}</span>
                    <span className={`tf-pair__chg${p.change < 0 ? " is-down" : ""}`}>
                      {p.change < 0 ? "−" : "+"}
                      {Math.abs(p.change).toFixed(2)}%
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
          {list.length === 0 && <li className="nv-empty">No pairs match “{q}”.</li>}
        </ul>
        <p className="tf-pairs__hint">↑↓ navigate · ↵ switch · ☆ add to favorites</p>
      </div>
    </Popover>
  );
}

/* ───────────── 02A · Order type ───────────── */

export function OrderTypeMenu({ anchor }) {
  const st = tradeStore.use();
  return (
    <Popover onClose={closeFlow} label="Order type" anchor={anchor} width={208}>
      <div className="fl-menu tf-types" role="radiogroup" aria-label="Order type">
        {ORDER_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={st.orderType === t.key}
            className={`tf-type${st.orderType === t.key ? " is-on" : ""}`}
            onClick={() => {
              set({ orderType: t.key });
              closeFlow();
            }}
          >
            <span className="tf-radio" />
            <span className="fl-coin__name">
              <span className="fl-strong fl-strong--13">{t.key}</span>
              <span className="fl-sub fl-sub--11">{t.sub}</span>
            </span>
          </button>
        ))}
        <button
          type="button"
          className="tf-learn"
          onClick={() => {
            closeFlow();
            window.location.hash = "#/help/topic/trading";
          }}
        >
          <img src={tficons.info} alt="" width="14" height="14" className="fl-purple-icon" />
          Learn order types in 2 min
        </button>
      </div>
    </Popover>
  );
}

/* ───────────── 02B / 02C · Review order and placed ───────────── */

export function ReviewOrder({ side = "Buy", type = "Limit", price = 95800, amount = 0.125 }) {
  const st = tradeStore.use();
  const p = pairOf(st.pair);
  const [skip, setSkip] = useState(st.skipReview);
  const value = price * amount;
  const fee = value * 0.001;
  const total = side === "Buy" ? value + fee : value - fee;
  const balanceAfter = 12456.21 - total;
  const vsMarket = ((price - p.price) / p.price) * 100;
  const place = () => {
    const order = {
      id: `o${Date.now()}`,
      name: p.name,
      symbol: p.base,
      icon: p.icon,
      type,
      side,
      price: fmt(price),
      amount: `${amount} ${p.base}`,
      filled: `0.00 ${p.base} (0%)`,
      total: `${fmt(value)} ${p.quote}`,
    };
    set((s) => ({ skipReview: skip, orders: [order, ...s.orders], toast: { side, text: `${amount} ${p.base} at ${fmt(price)} ${p.quote} · ${type}`, id: order.id } }));
    closeFlow();
  };
  return (
    <Modal onClose={closeFlow} labelledBy="tf-review-title" width={292}>
      <div className="fl-dialog tf-review">
        <div className="fl-head">
          <div className="fl-head__text">
            <h2 id="tf-review-title" className="fl-head__title fl-head__title--18">
              Review {side.toLowerCase()} order
            </h2>
            <p className="fl-sub fl-muted">
              {st.pair} · {type}
            </p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="tf-review__hero">
          <img src={p.icon} alt="" width="40" height="40" />
          <span className="tf-review__amount">
            {amount} {p.base}
          </span>
          <span className="fl-sub fl-sub--13">
            at {fmt(price, p.price < 1 ? 5 : 2)} {p.quote} · {type} {side.toLowerCase()}
          </span>
        </div>
        <div className="fl-summary tf-review__sum">
          <Row label="Order value" value={`${fmt(value)} ${p.quote}`} />
          <Row label={`Fee (${type === "Market" ? "taker" : "maker"} 0.10%)`} value={`${fmt(fee)} ${p.quote}`} />
          <Row label="Balance after" value={`${fmt(Math.max(0, balanceAfter))} ${p.quote}`} />
          <hr className="fl-hr" />
          <Row strong label={side === "Buy" ? "Total cost" : "You receive"} value={`${fmt(total)} ${p.quote}`} />
        </div>
        {type !== "Market" && (
          <p className="tf-info">
            <img src={tficons.info} alt="" width="16" height="16" className="tf-blue-icon" />
            <span>
              Your price is {Math.abs(vsMarket).toFixed(2)}% {vsMarket < 0 ? "below" : "above"} market ({fmt(p.price)}). The order waits in the book until it fills or you cancel it.
            </span>
          </p>
        )}
        <label className="fl-check tf-skip">
          <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} />
          <span className={`tf-box${skip ? " is-on" : ""}`}>{skip && <img src={tficons.check} alt="" width="12" height="12" />}</span>
          <span className="fl-sub fl-sub--13">Don’t show review for limit orders under $1,000</span>
        </label>
        <div className="fl-actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Back to edit
          </button>
          <button type="button" className="btn-primary ob-btn" onClick={place}>
            Place {side.toLowerCase()} order
          </button>
        </div>
      </div>
    </Modal>
  );
}

// 02C · shows above the page for a few seconds; rendered by the Trade page itself.
export function OrderToast() {
  const st = tradeStore.use();
  const t = st.toast;
  useEffect(() => {
    if (!t) return undefined;
    const id = setTimeout(() => set({ toast: null }), 6000);
    return () => clearTimeout(id);
  }, [t]);
  if (!t) return null;
  return (
    <div className="tf-toast" role="status">
      <span className="tf-toast__check">
        <img src={tficons.check} alt="" width="14" height="14" />
      </span>
      <span className="fl-coin__name">
        <span className="fl-strong">{t.side} order placed</span>
        <span className="fl-sub">{t.text}</span>
        <span className="tf-toast__links">
          <button
            type="button"
            className="hp-link"
            onClick={() => {
              set({ toast: null });
              document.querySelector(".tr-orders")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            View order
          </button>
          <button type="button" className="tf-red-link" onClick={() => set((s) => ({ toast: null, orders: s.orders.filter((o) => o.id !== t.id) }))}>
            Cancel
          </button>
        </span>
      </span>
      <button type="button" className="fl-icon-btn" aria-label="Dismiss" onClick={() => set({ toast: null })}>
        <img className="mono" src={tficons.close} alt="" width="18" height="18" />
      </button>
    </div>
  );
}

/* ───────────── 04A · Open order ⋮ · Manage ───────────── */

export function OpenOrderMenu({ id, anchor }) {
  const st = tradeStore.use();
  const o = st.orders.find((x) => x.id === id) || st.orders[0];
  if (!o) return null;
  const pct = o.filled.match(/\((.*)\)/)?.[1] || "0%";
  const items = [
    { key: "edit", label: "Edit price or amount", icon: tficons.edit, run: () => openFlow("trade.edit", { id: o.id }) },
    {
      key: "dup",
      label: "Duplicate order",
      icon: tficons.copy,
      run: () => {
        set((s) => ({ orders: [{ ...o, id: `o${Date.now()}`, filled: `0.00 ${o.symbol} (0%)` }, ...s.orders] }));
        closeFlow();
      },
    },
    {
      key: "view",
      label: "View details",
      icon: tficons.open,
      run: () => {
        closeFlow();
        window.location.hash = "#/history";
      },
    },
    { sep: true },
    {
      key: "cancel",
      label: "Cancel order",
      danger: true,
      run: () => {
        set((s) => ({ orders: s.orders.filter((x) => x.id !== o.id) }));
        closeFlow();
      },
    },
    {
      key: "all",
      label: `Cancel all open orders (${st.orders.length})`,
      danger: true,
      run: () => {
        set({ orders: [] });
        closeFlow();
      },
    },
  ];
  return (
    <Popover onClose={closeFlow} label="Order actions" anchor={anchor} width={244}>
      <div className="fl-menu">
        <p className="fl-menu__title">
          <img src={o.icon} alt="" width="16" height="16" />
          {o.symbol}/USDT · {o.type} {o.side.toLowerCase()} · {pct} filled
        </p>
        {items.map((it, i) =>
          it.sep ? (
            <hr key={i} className="fl-hr fl-hr--menu" />
          ) : (
            <button key={it.key} type="button" className={`fl-menu__item fl-menu__item--sm${it.danger ? " is-danger" : ""}`} onClick={it.run}>
              {it.danger ? <span className="fl-x">×</span> : <img className="mono" src={it.icon} alt="" width="16" height="16" />}
              <span className="fl-menu__label fl-menu__label--reg">{it.label}</span>
            </button>
          ),
        )}
      </div>
    </Popover>
  );
}

/* ───────────── 04B · Open order · Edit ───────────── */

export function EditOrder({ id }) {
  const st = tradeStore.use();
  const o = st.orders.find((x) => x.id === id) || st.orders[0];
  const oldPrice = num(o.price);
  const oldAmount = num(o.amount);
  const filled = num(o.filled.split("(")[0]);
  const [price, setPrice] = useState(String(oldPrice === 95800 ? 95500 : oldPrice));
  const [amount, setAmount] = useState(String(oldAmount));
  const p = num(price);
  const a = num(amount);
  const tooSmall = a < filled;
  const oldTotal = oldPrice * oldAmount;
  const newTotal = p * a;
  const save = oldTotal - newTotal;
  const market = o.symbol === "BTC" ? BTC_PRICE : oldPrice * 1.01;
  const vs = ((p - market) / market) * 100;
  const pctFilled = oldAmount ? (filled / oldAmount) * 100 : 0;
  const unit = o.amount.split(" ")[1] || o.symbol;
  return (
    <Modal onClose={closeFlow} labelledBy="tf-edit-title" width={308}>
      <div className="fl-dialog tf-edit">
        <div className="fl-head">
          <img src={o.icon} alt="" width="28" height="28" />
          <div className="fl-head__text">
            <h2 id="tf-edit-title" className="fl-head__title fl-head__title--18">
              Edit order
            </h2>
            <p className="fl-sub fl-muted">
              {o.symbol}/USDT · {o.type} {o.side.toLowerCase()}
            </p>
          </div>
          <CloseButton onClick={closeFlow} />
        </div>
        <div className="tf-filled">
          <div className="fl-activity__head">
            <span className="fl-sub fl-sub--13">Filled</span>
            <span className="fl-strong fl-strong--13">
              {filled} of {oldAmount} {unit} · {Math.round(pctFilled)}%
            </span>
          </div>
          <span className="tf-filled__bar">
            <span style={{ width: `${pctFilled}%` }} />
          </span>
        </div>
        <div className="fl-grid2 tf-edit__fields">
          <label className="sg-field fl-field">
            <span className="fl-label fl-label--dark">Price</span>
            <span className="sg-input sg-input--sunk fl-input">
              <input value={price} inputMode="decimal" onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} />
              <span className="fl-sub">USDT</span>
            </span>
            <span className="fl-sub fl-sub--11">
              Was {fmt(oldPrice)} · {Math.abs(vs).toFixed(2)}% {vs < 0 ? "below" : "above"} market
            </span>
          </label>
          <label className="sg-field fl-field">
            <span className="fl-label fl-label--dark">Amount</span>
            <span className={`sg-input sg-input--sunk fl-input${tooSmall ? " is-error" : ""}`}>
              <input value={amount} inputMode="decimal" onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
              <span className="fl-sub">{unit}</span>
            </span>
            <span className={`fl-sub fl-sub--11${tooSmall ? " is-error" : ""}`}>
              Can’t go below {filled} {unit} (already filled)
            </span>
          </label>
        </div>
        <div className="fl-summary tf-diff">
          <div className="tf-diff__row">
            <span>Price</span>
            <s>{fmt(oldPrice)}</s>
            <span>→</span>
            <b>{fmt(p)} USDT</b>
          </div>
          <div className="tf-diff__row">
            <span>Total</span>
            <s>{fmt(oldTotal)}</s>
            <span>→</span>
            <b>{fmt(newTotal)} USDT</b>
          </div>
          <hr className="fl-hr" />
          <Row label={save >= 0 ? "You save" : "Extra cost"} value={`${fmt(Math.abs(save))} USDT`} tone={save >= 0 ? "up" : "down"} />
        </div>
        <p className="tf-warn">
          <img src={tficons.error} alt="" width="16" height="16" />
          <span>
            The unfilled {(a - filled).toFixed(3)} {unit} goes back into the book at the new price and loses its queue position.
          </span>
        </p>
        <div className="fl-actions">
          <button type="button" className="ob-btn ob-btn--secondary" onClick={closeFlow}>
            Keep order
          </button>
          <button
            type="button"
            className="btn-primary ob-btn"
            disabled={tooSmall || !p || !a}
            onClick={() => {
              set((s) => ({
                orders: s.orders.map((x) => (x.id === o.id ? { ...x, price: fmt(p), amount: `${a} ${unit}`, total: `${fmt(newTotal)} USDT` } : x)),
              }));
              closeFlow();
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── 05A · Chart · Type, timeframe & indicators ───────────── */

const TYPE_ICONS = {
  Line: "M2 13l4-4 3 3 6-7",
  Candles: "M4 3v12M4 6h0M9 2v14M14 4v10",
  Area: "M2 14l4-5 3 2 6-6v9z",
};

export function ChartSettings({ anchor }) {
  const st = tradeStore.use();
  const c = st.chart;
  const setC = (patch) => set((s) => ({ chart: { ...s.chart, ...patch } }));
  return (
    <Popover onClose={closeFlow} label="Chart settings" anchor={anchor} align="left" width={256}>
      <div className="tf-chart">
        <div className="mf-filters__head">
          <h2 className="fl-strong fl-strong--15">Chart settings</h2>
          <button type="button" className="hp-link" onClick={() => setC(DEFAULT_CHART)}>
            Reset
          </button>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub">Chart type</span>
          <div className="tf-ctypes">
            {CHART_TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={c.type === t} className={`tf-ctype${c.type === t ? " is-on" : ""}`} onClick={() => setC({ type: t })}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d={TYPE_ICONS[t]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={t === "Area" ? "currentColor" : "none"} fillOpacity="0.25" />
                </svg>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub">Candle interval</span>
          <Segmented options={INTERVALS} value={c.interval} onChange={(interval) => setC({ interval })} label="Candle interval" className="tf-intervals" />
        </div>
        <div className="fl-stack-8">
          <span className="fl-sub">Indicators</span>
          <div className="tf-inds">
            {INDICATORS.map((i) => (
              <div key={i.key} className="tf-ind">
                <span className="fl-dot" style={{ background: i.color }} />
                <span className="fl-sub--13r tf-ind__label">{i.key}</span>
                <Toggle on={c.indicators[i.key]} onChange={(v) => setC({ indicators: { ...c.indicators, [i.key]: v } })} label={i.key} />
              </div>
            ))}
          </div>
        </div>
        <div className="fl-email">
          <span className="fl-coin__name">
            <span className="fl-strong fl-strong--13">Log scale</span>
            <span className="fl-sub fl-sub--11">Price axis in USDT</span>
          </span>
          <Toggle on={c.log} onChange={(log) => setC({ log })} label="Log scale" />
        </div>
      </div>
    </Popover>
  );
}
