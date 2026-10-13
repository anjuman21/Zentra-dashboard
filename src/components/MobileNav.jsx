import React from "react";
import { icons, mobileNav } from "../data";

export default function MobileNav({ page, onNavigate }) {
  return (
    <div className="m-dock">
      <button type="button" className="ask-noa" onClick={() => onNavigate("ai")}>
        <img src={icons.noaOrb} alt="" width="32" height="32" />
        <span>Ask Noa</span>
      </button>
      <nav className="m-nav">
        {mobileNav.map((item) => {
          if (item.label === "swap") {
            return (
              <button key="swap" type="button" className="m-nav__swap" aria-label="Swap">
                <img src={item.icon} alt="" width="18" height="18" />
              </button>
            );
          }
          const active = item.route === page;
          return (
            <button
              key={item.label}
              type="button"
              className={`m-nav__item${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.route)}
            >
              <img src={active && item.activeIcon ? item.activeIcon : item.icon} alt="" width="18" height="18" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
