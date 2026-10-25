import React, { useEffect, useRef } from "react";
import "../styles/modal.css";

function useDialog(onClose, panel) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.activeElement;
    panel.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose, panel]);
}

// A centred dialog over a blurred page; on phones it becomes a bottom sheet.
// Escape, the close button or a click on the backdrop call onClose.
export default function Modal({ onClose, labelledBy, width = 472, className = "", children }) {
  const panel = useRef(null);
  useDialog(onClose, panel);

  return (
    <div className="md-layer">
      <div className="md-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`md-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={panel}
        style={{ "--md-w": `${width}px` }}
      >
        <span className="md-grabber" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

// A full-height panel that slides in from the right (or the left, beside the sidebar); a tall sheet on phones.
export function Drawer({ onClose, labelledBy, side = "right", width = 460, className = "", children }) {
  const panel = useRef(null);
  useDialog(onClose, panel);
  return (
    <div className={`md-layer md-layer--drawer is-${side}`}>
      <div className="md-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`md-drawer ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        ref={panel}
        style={{ "--md-w": `${width}px` }}
      >
        <span className="md-grabber" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

// A card dropped from a top-bar control (balances, account menu, search); a bottom sheet on phones.
export function Popover({ onClose, label, top = 66, right = 16, left, width = 400, className = "", children }) {
  const panel = useRef(null);
  useDialog(onClose, panel);
  return (
    <div className="md-layer md-layer--pop">
      <div className="md-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`md-pop ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={panel}
        style={{ "--md-w": `${width}px`, top, right: left == null ? right : "auto", left: left ?? "auto" }}
      >
        <span className="md-grabber" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick }) {
  return (
    <button type="button" className="md-close" aria-label="Close" onClick={onClick}>
      <img className="mono" src="/assets/hp-close.svg" alt="" width="24" height="24" />
    </button>
  );
}
