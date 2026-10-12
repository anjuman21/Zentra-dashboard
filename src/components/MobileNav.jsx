import React from "react";
import { icons, mobileNav } from "../data";

export default function MobileNav() {
  return (
    <div className="m-dock">
      <button type="button" className="ask-noa">
        <img src={icons.noaOrb} alt="" width="32" height="32" />
        <span>Ask Noa</span>
      </button>
      <nav className="m-nav">
        {mobileNav.map((item, i) =>
          item.label === "swap" ? (
            <button key="swap" type="button" className="m-nav__swap" aria-label="Swap">
              <img src={item.icon} alt="" width="18" height="18" />
            </button>
          ) : (
            <button key={item.label} type="button" className={`m-nav__item${i === 0 ? " is-active" : ""}`}>
              <img src={item.icon} alt="" width="18" height="18" />
              <span>{item.label}</span>
            </button>
          ),
        )}
      </nav>
    </div>
  );
}
