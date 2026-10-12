import React, { useState } from "react";
import { icons } from "../data";

function PriceSummary({ value, pct, label, width }) {
  return (
    <div className="price" style={{ width }}>
      <div className="price__row">
        <span className="price__value">{value}</span>
        <span className="pill-success">{pct}</span>
      </div>
      <span className="price__label">{label}</span>
    </div>
  );
}

export default function Navbar({ onMenu }) {
  const [query, setQuery] = useState("");

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

      <label className="search">
        <span className="search__input">
          <img className="mono search__icon" src={icons.search} alt="" width="18" height="18" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search coins, pairs & wallets..." />
        </span>
        <img className="mono" src={icons.filterList} alt="" width="18" height="18" />
      </label>

      <div className="navbar__right">
        <PriceSummary value="$39,551.76" pct="5.33%" label="Unified Trading, USD" width={114} />
        <PriceSummary value="$7,960.11" pct="1.98%" label="Funding, USD" width={99} />
        <button type="button" className="profile" aria-label="Account menu">
          <img src={icons.avatar} alt="" width="30" height="30" />
          <img src={icons.dehaze} alt="" width="16" height="16" />
        </button>
      </div>
    </header>
  );
}

export function MobileTopbar({ onMenu }) {
  return (
    <header className="m-topbar">
      <button type="button" className="m-pill" onClick={onMenu}>
        <img className="mono" src={icons.mMenu} alt="" width="18" height="18" />
        <span>Zentra</span>
      </button>
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
