import React, { useEffect, useRef } from "react";
import { obicons, SETUP_STEPS, readProgress, readEmail, go } from "../onboardingData";

// 05 · Home · Finish setup panel: a right-hand drawer on desktop, a bottom sheet on phones.
export default function FinishSetup({ onClose }) {
  const progress = readProgress();
  const email = readEmail();
  const done = SETUP_STEPS.filter((s) => progress[s.key]).length;
  const current = SETUP_STEPS.find((s) => !progress[s.key]);
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const desc = (s) => {
    if (s.key === "email") return progress.email ? `${email || "Your email"} is verified` : "Confirm the code we sent you";
    return s.desc;
  };

  return (
    <div className="fs-layer">
      <div className="fs-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="fs-drawer" role="dialog" aria-modal="true" aria-labelledby="fs-title" tabIndex={-1} ref={panel}>
        <span className="fs-grabber" aria-hidden="true" />
        <div className="fs-stack">
          <div className="fs-head">
            <div className="fs-head__text">
              <h2 className="fs-title" id="fs-title">
                Finish setup
              </h2>
              <p className="fs-sub">Complete these steps to unlock trading, deposits and withdrawals.</p>
            </div>
            <button type="button" className="ob-close" aria-label="Close" onClick={onClose}>
              <img className="mono" src={obicons.close} alt="" width="16" height="16" />
            </button>
          </div>
          <div className="fs-progress">
            <p className="fs-progress__label">
              <span>{done} of 4 complete</span>
              <span className="fs-progress__pct">{(done / 4) * 100}%</span>
            </p>
            <span className="fs-progress__track">
              <span style={{ width: `${(done / 4) * 100}%` }} />
            </span>
          </div>
          <div className="fs-reward">
            <img src={obicons.gift} alt="" width="52" height="55" />
            <span className="fs-reward__text">
              <span className="fs-reward__title">{done === 4 ? "0 fees unlocked on your first trade" : "Unlock 0 fees on your first trade"}</span>
              <span className="fs-reward__sub">{done === 4 ? "Your reward is ready to use." : "Finish all 4 steps to claim your reward."}</span>
            </span>
          </div>
          <ol className="fs-list">
            {SETUP_STEPS.map((s, i) => {
              const state = progress[s.key] ? "done" : s === current ? "current" : "locked";
              return (
                <li key={s.key} className={`fs-item is-${state}`}>
                  <span className="fs-item__status">
                    {state === "done" && <img src={obicons.doneCheck} alt="Done" width="22" height="22" />}
                    {state === "current" && i + 1}
                    {state === "locked" && <img className="mono" src={obicons.lock} alt="Locked" width="16" height="16" />}
                  </span>
                  <span className="fs-item__text">
                    <span className="fs-item__title">{s.title}</span>
                    <span className="fs-item__desc">{desc(s)}</span>
                  </span>
                  {state === "done" && <span className="fs-chip">Done</span>}
                  {state === "current" && (
                    <button type="button" className="btn-primary fs-start" onClick={() => go(s.route)}>
                      Start
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="fs-footer">
          <p className="fs-note">
            <img className="mono" src={obicons.schedule} alt="" width="16" height="16" />
            <span>Your progress is saved. Pick up where you left off from the sidebar card.</span>
          </p>
          <button type="button" className="ob-btn ob-btn--secondary" onClick={onClose}>
            Do it later
          </button>
        </div>
      </aside>
    </div>
  );
}
