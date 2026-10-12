import React, { useState } from "react";
import { icons, watchlist, convertTabs } from "../data";

const RATE = 25.938; // ETH per BTC, matches "0.1 → ~2.5938" in the design

function CurrencyPill({ icon, code }) {
  return (
    <button type="button" className="currency">
      <img src={icon} alt="" width="18" height="18" />
      <span>{code}</span>
      <img className="mono" src={icons.arrowDown} alt="" width="18" height="18" />
    </button>
  );
}

export function ConvertCard() {
  const [tab, setTab] = useState("Convert");
  const [swapped, setSwapped] = useState(false);
  const [amount, setAmount] = useState("0.1");

  const from = swapped ? { icon: icons.eth, code: "ETH" } : { icon: icons.btc, code: "BTC" };
  const to = swapped ? { icon: icons.btc, code: "BTC" } : { icon: icons.eth, code: "ETH" };
  const n = parseFloat(amount) || 0;
  const received = (swapped ? n / RATE : n * RATE).toFixed(4);

  return (
    <div className="convert" style={{ backgroundImage: `url(${icons.convertBg})` }}>
      <div className="convert__inner">
        <div className="tabs" role="tablist">
          {convertTabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`tabs__tab${tab === t ? " is-active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="convert__box">
          <div className="convert__fields">
            <div className="field">
              <div className="field__text">
                <label className="field__label" htmlFor="send-amount">
                  Your send
                </label>
                <input
                  id="send-amount"
                  className="field__value"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <CurrencyPill {...from} />
            </div>
            <div className="field field--receive">
              <div className="field__text">
                <span className="field__label">Your receive</span>
                <span className="field__value">~{received}</span>
              </div>
              <CurrencyPill {...to} />
            </div>
            <button type="button" className="swap-btn" aria-label="Swap currencies" onClick={() => setSwapped((s) => !s)}>
              <img className="mono" src={icons.swapVert} alt="" width="18" height="18" />
            </button>
          </div>
          <button type="button" className="btn-primary btn-block">
            {tab}
          </button>
        </div>
      </div>
    </div>
  );
}

const tone = (v) => (v.startsWith("-") ? "down" : "up");

export function Watchlist() {
  const last = watchlist.length - 1;
  return (
    <div className="card watchlist">
      <div className="watchlist__header">
        <h2 className="card-title">Watchlist</h2>
        <div className="watchlist__actions">
          <button type="button" className="icon-btn" aria-label="Add symbol">
            <img className="mono" src={icons.add} alt="" width="18" height="18" />
          </button>
          <button type="button" className="icon-btn" aria-label="Pop out">
            <img className="mono" src={icons.pip} alt="" width="18" height="18" />
          </button>
          <button type="button" className="icon-btn" aria-label="Watchlist settings">
            <img className="mono" src={icons.settings} alt="" width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="wl">
        <div className="wl-col wl-col--symbol">
          <div className="wl-head">Symbol</div>
          <div className="wl-list">
            {watchlist.map((w, i) => (
              <div key={w.symbol} className={`wl-cell${i === last ? " is-last" : ""}`}>
                <img src={w.icon} alt="" width="18" height="18" />
                <span>{w.symbol}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="wl-col wl-col--last">
          <div className="wl-head">Last</div>
          <div className="wl-list">
            {watchlist.map((w, i) => (
              <div key={w.symbol} className={`wl-cell${i === last ? " is-last" : ""}`}>
                {w.last}
              </div>
            ))}
          </div>
        </div>
        <div className="wl-col wl-col--change">
          <div className="wl-head">Change</div>
          <div className="wl-list">
            {watchlist.map((w, i) => (
              <div key={w.symbol} className={`wl-cell ${tone(w.change)}${i === last ? " is-last" : ""}`}>
                {w.change}
              </div>
            ))}
          </div>
        </div>
        <div className="wl-col wl-col--pct">
          <div className="wl-head">Change %</div>
          <div className="wl-list">
            {watchlist.map((w, i) => (
              <div key={w.symbol} className={`wl-cell ${tone(w.changePct)}${i === last ? " is-last" : ""}`}>
                {w.changePct}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Registration() {
  return (
    <div className="card registration">
      <div className="registration__text">
        <h2 className="card-title">Registration with Zentra</h2>
        <p>Open your crypto wallet app and scan the QR code to register with Zentra.</p>
      </div>
      <div className="registration__qr">
        <img src={icons.qr} alt="Wallet registration QR code" width="158" height="137" />
        <button type="button" className="btn-primary btn-block">
          Activate QR
        </button>
      </div>
      <p className="registration__note">If an error occurs scanning the QR code, check your wallet app and try again.</p>
    </div>
  );
}
