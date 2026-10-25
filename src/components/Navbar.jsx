import React, { useEffect, useMemo, useState } from "react";
import { icons } from "../data";
import { openFlow } from "../flows";
import { COINS, SEARCH_PAIRS, hideStore, money } from "../homeFlowData";

function PriceSummary({ value, pct, label, width }) {
  const hidden = hideStore.use();
  return (
    <div className="price" style={{ width }}>
      <div className="price__row">
        <span className="price__value">{hidden ? "••••••" : value}</span>
        <span className="pill-success">{pct}</span>
      </div>
      <span className="price__label">{label}</span>
    </div>
  );
}

// 02A · results for coins, pairs, wallets and activity while typing in the top search.
function useResults(query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const coins = Object.values(COINS)
      .filter((c) => c.name.toLowerCase().startsWith(q) || c.symbol.toLowerCase().startsWith(q))
      .slice(0, 3)
      .map((c) => ({ group: "Coins", kind: "coin", coin: c }));
    const pairs = SEARCH_PAIRS.filter((p) => `${p.base}/${p.quote}`.toLowerCase().includes(q) || COINS[p.base].name.toLowerCase().includes(q))
      .slice(0, 2)
      .map((p) => ({ group: "Pairs", kind: "pair", pair: p }));
    const base = coins[0]?.coin;
    const wallets = base
      ? [
          { group: "Wallets & activity", kind: "wallet", coin: base },
          { group: "Wallets & activity", kind: "tx", coin: base },
        ]
      : [];
    return [...coins, ...pairs, ...wallets];
  }, [query]);
}

function SearchBox() {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(0);
  const results = useResults(query);
  const open = focus && query.trim().length > 0;

  useEffect(() => setActive(0), [query]);

  // "/" jumps to the search, as the flow's trigger promises.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName)) {
        e.preventDefault();
        document.getElementById("nv-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = (r) => {
    setFocus(false);
    setQuery("");
    document.activeElement?.blur();
    if (r.kind === "coin") openFlow("home.coin", { symbol: r.coin.symbol });
    else if (r.kind === "pair") window.location.hash = "#/trade";
    else if (r.kind === "wallet") window.location.hash = "#/portfolio";
    else openFlow("home.tx", { index: 0 });
  };

  const onKey = (e) => {
    if (e.key === "Escape") {
      setQuery("");
      e.currentTarget.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[active]) {
      pick(results[active]);
    }
  };

  let lastGroup = null;
  return (
    <>
      {open && <div className="nv-backdrop" onMouseDown={() => setFocus(false)} />}
      <div className="nv-search">
        <label className={`search${open ? " is-open" : ""}`}>
          <span className="search__input">
            <img className="mono search__icon" src={icons.search} alt="" width="18" height="18" />
            <input
              id="nv-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={onKey}
              placeholder="Search coins, pairs & wallets..."
              aria-expanded={open}
              aria-controls="nv-results"
              role="combobox"
              aria-autocomplete="list"
            />
          </span>
          {open ? <span className="nv-esc">esc</span> : <img className="mono" src={icons.filterList} alt="" width="18" height="18" />}
        </label>
        {open && (
          <div id="nv-results" className="nv-results" role="listbox">
            {results.length === 0 && <p className="nv-empty">Nothing matches “{query}”.</p>}
            {results.map((r, i) => {
              const head = r.group !== lastGroup ? <p className="nv-group">{r.group.toUpperCase()}</p> : null;
              lastGroup = r.group;
              return (
                <React.Fragment key={i}>
                  {head}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`nv-hit${i === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(r)}
                  >
                    {r.kind === "coin" && <img src={r.coin.icon} alt="" width="32" height="32" />}
                    {r.kind === "pair" && (
                      <span className="nv-pair">
                        <img src={COINS[r.pair.base].icon} alt="" width="26" height="26" />
                        <img src={COINS[r.pair.quote].icon} alt="" width="16" height="16" />
                      </span>
                    )}
                    {(r.kind === "wallet" || r.kind === "tx") && (
                      <span className="nv-tile">
                        <img className="mono" src={r.kind === "wallet" ? "/assets/ob-wallet.svg" : icons.history || "/assets/history.svg"} alt="" width="16" height="16" />
                      </span>
                    )}
                    <span className="fl-coin__name">
                      <span className="fl-strong">
                        {r.kind === "coin" && r.coin.name}
                        {r.kind === "pair" && `${r.pair.base} / ${r.pair.quote}`}
                        {r.kind === "wallet" && "Unified Trading wallet"}
                        {r.kind === "tx" && `5.31415 ${r.coin.symbol}/BTC`}
                      </span>
                      <span className="fl-sub">
                        {r.kind === "coin" && r.coin.symbol}
                        {r.kind === "pair" && `${COINS[r.pair.base].name} · ${COINS[r.pair.quote].name}`}
                        {r.kind === "wallet" && `4.2100 ${r.coin.symbol}`}
                        {r.kind === "tx" && "Conversion · Pending review"}
                      </span>
                    </span>
                    {r.kind === "coin" && (
                      <span className="fl-coin__price">
                        <span className="fl-strong">{money(r.coin.price, r.coin.price < 1 ? 4 : 2)}</span>
                        <span className={`fl-change${r.coin.change < 0 ? " is-down" : ""}`}>
                          {r.coin.change < 0 ? "−" : "+"}
                          {Math.abs(r.coin.change).toFixed(2)}%
                        </span>
                      </span>
                    )}
                    {r.kind === "coin" && i === active && <span className="nv-enter">↵</span>}
                    {r.kind === "pair" && (
                      <span className="fl-coin__price">
                        <span className="fl-strong">{r.pair.price}</span>
                        <span className="hp-meta">Spot</span>
                      </span>
                    )}
                    {r.kind === "wallet" && <span className="fl-strong">$13,550.85</span>}
                    {r.kind === "tx" && <span className="hp-meta">Today</span>}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function Navbar({ onMenu }) {
  return (
    <header className="navbar">
      <div className="navbar__left">
        <button type="button" className="icon-btn navbar__menu" aria-label="Open menu" onClick={onMenu}>
          <img className="mono" src={icons.mMenu} alt="" width="18" height="18" />
        </button>
        <button type="button" className="lang">
          <img className="mono" src={icons.language} alt="" width="18" height="18" />
          <span>English (United States)</span>
          <img className="mono" src={icons.arrowDownNav} alt="" width="18" height="18" />
        </button>
      </div>

      <SearchBox />

      <div className="navbar__right">
        <button type="button" className="price-btn" aria-label="Balances" onClick={() => openFlow("home.balances")}>
          <PriceSummary value="$39,551.76" pct="5.33%" label="Unified Trading, USD" width={114} />
          <PriceSummary value="$7,960.11" pct="1.98%" label="Funding, USD" width={99} />
        </button>
        <button type="button" className="profile" aria-label="Account menu" onClick={() => openFlow("home.profile")}>
          <img src={icons.avatar} alt="" width="30" height="30" />
          <img src={icons.dehaze} alt="" width="16" height="16" />
        </button>
      </div>
    </header>
  );
}

// Inner pages swap the menu pill for a back arrow and the parent page's name.
export function MobileTopbar({ onMenu, back, onBack }) {
  return (
    <header className="m-topbar">
      {back ? (
        <div className="m-back">
          <button type="button" className="m-circle" aria-label={`Back to ${back.label}`} onClick={onBack}>
            <img className="mono" src="/assets/hp-back.svg" alt="" width="20" height="20" />
          </button>
          <span className="m-back__label">{back.label}</span>
        </div>
      ) : (
        <button type="button" className="m-pill" onClick={onMenu}>
          <img className="mono" src={icons.mMenu} alt="" width="18" height="18" />
          <span>Zentra</span>
        </button>
      )}
      <div className="m-topbar__actions">
        <button type="button" className="m-circle" aria-label="Notifications">
          <img className="mono" src={icons.notifications} alt="" width="18" height="18" />
        </button>
        <button type="button" className="m-circle" aria-label="Search">
          <img className="mono" src={icons.search} alt="" width="18" height="18" />
        </button>
      </div>
    </header>
  );
}
