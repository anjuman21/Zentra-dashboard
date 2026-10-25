import React, { useEffect, useState } from "react";
import { icons, mainMenu, financeOps, footerLinks } from "../data";
import { readProgress } from "../onboardingData";

export function NavLink({ item, active, onClick, small }) {
  // Items without a dedicated white glyph get their grey icon turned white on the purple pill.
  const iconClass = active ? (item.activeIcon ? "" : "on-accent") : "mono";
  return (
    <button type="button" className={`nav-link${active ? " is-active" : ""}${small ? " is-small" : ""}`} onClick={onClick}>
      <span className="nav-link__inner">
        <img className={iconClass} src={active && item.activeIcon ? item.activeIcon : item.icon} alt="" width="18" height="18" />
        <span>{item.label}</span>
      </span>
      {active && <img src={icons.activeDot} alt="" width="6" height="6" />}
    </button>
  );
}

function SetupCard({ onOpen }) {
  const [hidden, setHidden] = useState(false);
  // The step the user is on, shown as "n of 4"; the card goes once all four are done.
  const progress = readProgress();
  const done = ["email", "identity", "wallet", "deposit"].filter((k) => progress[k]).length;
  const step = Math.min(4, done + 1);
  if (hidden || done === 4) return null;

  return (
    <div className="setup-card">
      <img className="setup-card__bg" src={icons.setupBg} alt="" />
      <div className="setup-card__body">
        <div className="setup-card__text">
          <p className="setup-card__title">Finish Setup</p>
          <p className="setup-card__desc">Connect your wallet to start tracking portfolio and earn rewards</p>
        </div>
        <div className="setup-card__footer">
          <div className="setup-card__progress">
            <img src={icons.progressDots} alt="" width="44" height="8" />
            <span>{step} of 4</span>
          </div>
          <div className="setup-card__actions">
            <button type="button" className="btn-skip" onClick={() => setHidden(true)}>
              Skip
            </button>
            <button type="button" className="btn-primary btn-small" onClick={onOpen}>
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="setup-card__gift">
        <img className="gift gift--blur" src={icons.gift} alt="" />
        <img className="gift" src={icons.gift} alt="" />
      </div>
    </div>
  );
}

export default function Sidebar({ page, onNavigate, open, onClose, theme, onToggleTheme }) {
  const routed = [...mainMenu, ...financeOps].find((m) => m.route === page);
  const [active, setActive] = useState(routed ? routed.label : page === "ai" ? null : "Overview");
  const dark = theme === "dark";

  // Routed items follow the URL; the rest only highlight locally.
  useEffect(() => {
    if (routed) setActive(routed.label);
    else if (page === "ai") setActive(null);
  }, [routed, page]);

  const select = (label) => {
    const item = [...mainMenu, ...financeOps].find((m) => m.label === label);
    setActive(label);
    if (item && item.route) onNavigate(item.route);
    else onClose();
  };

  return (
    <aside className={`sidebar${open ? " is-open" : ""}`}>
      <div className="sidebar__header">
        <div className="brand">
          <img className="brand__logo" src={icons.logo} alt="" />
          <span className="brand__name">Zentra</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Collapse menu" onClick={onClose}>
          <img className="mono" src={icons.menuOpen} alt="" width="24" height="24" />
        </button>
      </div>

      <div className="sidebar__content">
        <div className="ask-ai-wrap">
          <div className="ask-ai">
            <img className="ask-ai__glow" src={icons.askAiGlow} alt="" />
            <button
              type="button"
              className={`ask-ai__bar${page === "ai" ? " is-active" : ""}`}
              aria-current={page === "ai" ? "page" : undefined}
              onClick={() => onNavigate("ai")}
            >
              <span className="ask-ai__label">
                <img className="mono" src={icons.stars} alt="" width="18" height="18" />
                <span>Ask AI</span>
              </span>
              <span className="shortcut">
                <img className="mono" src={icons.cmd} alt="" width="14" height="14" />
                <span>D</span>
              </span>
            </button>
          </div>
          <div className="divider" />
        </div>

        <nav className="menu">
          <div className="menu__groups">
            <div className="menu__group">
              <p className="menu__label">MAIN MENU</p>
              <div className="menu__links">
                {mainMenu.map((item) => (
                  <NavLink key={item.label} item={item} active={active === item.label} onClick={() => select(item.label)} />
                ))}
              </div>
            </div>
            <div className="menu__group">
              <p className="menu__label">FINANCE OPS</p>
              <div className="menu__links">
                {financeOps.map((item) => (
                  <NavLink key={item.label} item={item} active={active === item.label} onClick={() => select(item.label)} />
                ))}
              </div>
            </div>
          </div>

          <div className="menu__bottom">
            <SetupCard onOpen={() => onNavigate("setup")} />
            <div className="menu__links">
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
          </div>
        </nav>
      </div>
    </aside>
  );
}
