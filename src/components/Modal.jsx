import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// The root is CSS-zoomed on big screens; layout boxes come back in screen pixels.
const zoomOf = () => parseFloat(document.documentElement.style.zoom) || 1;

// Where a clicked control sits, in the page's own (unzoomed) pixels.
export function anchorOf(el) {
  const r = el.getBoundingClientRect();
  const z = zoomOf();
  return { top: r.top / z, bottom: r.bottom / z, left: r.left / z, right: r.right / z };
}

// A card dropped from a control (balances, account menu, a ⋮ or a range chip); a bottom sheet on phones.
// Pass `anchor` (from anchorOf) to open under that control, right-aligned unless align="left".
export function Popover({ onClose, label, top = 66, right = 16, left, anchor, align = "right", width = 400, className = "", children }) {
  const panel = useRef(null);
  useDialog(onClose, panel);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!anchor || !panel.current) return;
    const z = zoomOf();
    const vw = window.innerWidth / z;
    const vh = window.innerHeight / z;
    const h = panel.current.offsetHeight;
    const w = panel.current.offsetWidth;
    // Open below the control; flip above it when there isn't room.
    let y = anchor.bottom + 8;
    if (y + h > vh - 8 && anchor.top - 8 - h > 8) y = anchor.top - 8 - h;
    y = Math.max(8, Math.min(y, vh - h - 8));
    let x = align === "left" ? anchor.left : anchor.right - w;
    x = Math.max(8, Math.min(x, vw - w - 8));
    setPos({ top: y, left: x });
  }, [anchor, align]);

  const place = anchor
    ? { top: pos?.top ?? anchor.bottom + 8, left: pos?.left ?? 0, right: "auto", visibility: pos ? "visible" : "hidden" }
    : { top, right: left == null ? right : "auto", left: left ?? "auto" };

  return (
    <div className={`md-layer md-layer--pop${anchor ? " is-anchored" : ""}`}>
      <div className="md-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className={`md-pop ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={panel}
        style={{ "--md-w": `${width}px`, ...place }}
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
