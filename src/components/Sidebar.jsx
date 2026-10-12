import React, { useState } from "react";
import { icons, mainMenu, financeOps, footerLinks } from "../data";

function NavLink({ item, active, onClick, small }) {
  return (
    <button type="button" className={`nav-link${active ? " is-active" : ""}${small ? " is-small" : ""}`} onClick={onClick}>
      <span className="nav-link__inner">
        <img className={active ? "" : "mono"} src={item.icon} alt="" width="18" height="18" />
        <span>{item.label}</span>
      </span>
      {active && <img src={icons.activeDot} alt="" width="6" height="6" />}
    </button>
  );
}

function SetupCard() {
  const [step, setStep] = useState(2);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

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
            <button type="button" className="btn-primary btn-small" onClick={() => setStep((s) => (s < 4 ? s + 1 : s))}>
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

export default function Sidebar({ open, onClose, theme, onToggleTheme }) {
  const [active, setActive] = useState("Overview");
  const dark = theme === "dark";

  const select = (label) => {
    setActive(label);
    onClose();
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
            <button type="button" className="ask-ai__bar">
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
            <SetupCard />
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
