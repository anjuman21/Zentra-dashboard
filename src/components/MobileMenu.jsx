import React, { useEffect, useState } from "react";
import { icons, mainMenu, financeOps, footerLinks } from "../data";
import { NavLink } from "./Sidebar";

// Phone side menu (Figma 184:7614): blurred overlay, round close button and a
// floating glass panel. Home, Portfolio, Markets and Trade live in the bottom
// nav, so the panel lists the remaining sections.
const ITEMS = [
  ...mainMenu.filter((m) => m.label === "Analytics" || m.label === "History"),
  ...financeOps,
];

export default function MobileMenu({ page, onNavigate, open, onClose, theme, onToggleTheme }) {
  const routed = ITEMS.find((m) => m.route === page);
  const [picked, setPicked] = useState(null);
  // Routed sections follow the URL; the others only highlight locally.
  const active = routed ? routed.label : picked;
  const dark = theme === "dark";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("is-locked");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [open, onClose]);

  const select = (label) => {
    const item = ITEMS.find((m) => m.label === label);
    if (item && item.route) {
      setPicked(null);
      onNavigate(item.route);
    } else {
      setPicked(label);
      onClose();
    }
  };

  return (
    <div
      className={`m-menu${open ? " is-open" : ""}`}
      aria-hidden={!open}
      inert={!open}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="m-menu__close" aria-label="Close menu" onClick={onClose}>
        <img className="mono" src={icons.close} alt="" width="24" height="24" />
      </button>

      <nav className="m-menu__panel" aria-label="Menu">
        <div className="m-menu__top">
          <div className="m-menu__user">
            <img className="m-menu__avatar" src={icons.profile} alt="" width="56" height="56" />
            <div className="m-menu__user-row">
              <div className="m-menu__user-text">
                <p className="m-menu__name">Eren Yeager</p>
                <p className="m-menu__since">Member Since 2024</p>
              </div>
              <button type="button" className="m-menu__profile" onClick={onClose}>
                View Profile
              </button>
            </div>
          </div>
          <div className="m-menu__divider" />
          <div className="m-menu__links">
            {ITEMS.map((item) => (
              <NavLink key={item.label} item={item} active={active === item.label} onClick={() => select(item.label)} />
            ))}
          </div>
        </div>

        <div className="m-menu__divider" />

        <div className="m-menu__links m-menu__links--small">
          {footerLinks.map((item) => (
            <NavLink key={item.label} item={item} small active={false} onClick={() => select(item.label)} />
          ))}
          <button type="button" className="nav-link is-small theme-toggle" onClick={onToggleTheme} aria-pressed={dark}>
            <span className="nav-link__inner">
              <img src={dark ? icons.darkMode : icons.clearDay} alt="" width="18" height="18" />
              <span className="theme-toggle__label">{dark ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className={`switch${dark ? " is-on" : ""}`}>
              <span className="switch__knob" />
            </span>
          </button>
        </div>

        <div className="m-menu__logout-wrap">
          <button type="button" className="m-menu__logout" onClick={onClose}>
            <img src={icons.logout} alt="" width="18" height="18" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
