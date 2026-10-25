import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// Hover for the chart pictures: the cursor, dots and tooltip follow the pointer.
//
// The lines are pictures (SVG files from Figma), so the layer reads them: each
// picture is drawn once to a canvas, and for every pixel column we remember the
// top-most pixel of each line colour. On hover, the dot sits on that pixel and
// the value comes from where it lands on the chart's y-axis.

const zoomOf = () => parseFloat(document.documentElement.style.zoom) || 1;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// For each column of an image, the y (0–1) of the top-most pixel close to each colour.
function scan(img, colors) {
  const w = Math.max(1, Math.round(img.offsetWidth));
  const h = Math.max(1, Math.round(img.offsetHeight));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  let data;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  const targets = colors.map(hex);
  const cols = targets.map(() => new Float32Array(w).fill(-1));
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      // Faded parts of a line (e.g. a forecast at 30% opacity) still count.
      if (data[i + 3] < 45) continue;
      for (let c = 0; c < targets.length; c++) {
        if (cols[c][x] >= 0) continue;
        const [r, g, b] = targets[c];
        if (Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b) < 70) cols[c][x] = y / h;
      }
    }
  }
  return { img, w, cols };
}

// Nearest column that has the colour, within a few pixels (lines can have gaps).
function pick(col, x) {
  for (let d = 0; d < 8; d++) {
    if (col[x - d] >= 0) return col[x - d];
    if (col[x + d] >= 0) return col[x + d];
  }
  return -1;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Tue, Aug 18 ‘26" for a point between two dates.
export function dateAt(frac, start, end) {
  const d = new Date(start.getTime() + (end.getTime() - start.getTime()) * Math.min(1, Math.max(0, frac)));
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")} ‘${String(d.getFullYear()).slice(2)}`;
}

// Value at screen y, read between the y-axis labels (they need not be evenly spaced).
function readAxis(y, marks) {
  if (!marks.length) return null;
  if (marks.length === 1) return marks[0].v;
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i];
    const b = marks[i + 1];
    if (y <= b.y || i === marks.length - 2) return a.v + ((b.v - a.v) * (y - a.y)) / (b.y - a.y || 1);
  }
  return marks[marks.length - 1].v;
}

/**
 * Place inside a positioned chart container.
 *  images  – selector for the line pictures inside the container
 *  colors  – one hex colour per line to follow ("#FE7701")
 *  axis    – selector for the y-axis labels or gridlines, top to bottom…
 *  values  – …and the number each one stands for
 *  plot    – without an axis: selector for the box whose top/bottom are range[0]/range[1]
 *  span    – selector for the element that spans the time axis (defaults to the pictures)
 *  merge   – the colours are pieces of one line (e.g. before/after a highlighted period)
 *  render  – ({ frac, v: [value per line or null] }) => { date, rows: [{ label, value, tone, color }] }
 */
export default function ChartHover({ images, colors, axis, values = [], plot, range = [1, 0], span, render, merge = false, crosshair = false, pill = true, compact = false, tipWidth = 168 }) {
  const ref = useRef(null);
  const cache = useRef(null);
  const frame = useRef(0);
  const [hover, setHover] = useState(null);

  useLayoutEffect(() => {
    const area = ref.current?.parentElement;
    if (!area) return undefined;
    const reset = () => {
      cache.current = null;
    };
    const ro = new ResizeObserver(reset);
    ro.observe(area);
    area.querySelectorAll(images).forEach((img) => img.addEventListener("load", reset));

    const build = () => {
      const list = [...area.querySelectorAll(images)].filter((img) => img.complete && img.offsetWidth);
      cache.current = list.map((img) => scan(img, colors)).filter(Boolean);
    };

    const move = (e) => {
      const { clientX } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (!cache.current) build();
        const z = zoomOf();
        const a = area.getBoundingClientRect();
        const pics = cache.current;
        if (!pics.length) return;
        const rects = pics.map((p) => p.img.getBoundingClientRect());
        const spanEl = span && area.querySelector(span);
        const sr = spanEl ? spanEl.getBoundingClientRect() : { left: Math.min(...rects.map((r) => r.left)), right: Math.max(...rects.map((r) => r.right)) };
        // The cursor stays where there is line (some axes run past the line's end).
        const lineL = Math.min(...rects.map((r) => r.left));
        const lineR = Math.max(...rects.map((r) => r.right));
        const cx = Math.min(Math.max(clientX, Math.max(sr.left, lineL)), Math.min(sr.right, lineR - 1));
        const frac = (cx - sr.left) / (sr.right - sr.left || 1);
        const marks = axis
          ? [...area.querySelectorAll(axis)].map((el, i) => {
              const r = el.getBoundingClientRect();
              return { y: (r.top + r.bottom) / 2, v: values[i] };
            })
          : (() => {
              const r = (plot ? area.querySelector(plot) : area).getBoundingClientRect();
              return [
                { y: r.top, v: range[0] },
                { y: r.bottom, v: range[1] },
              ];
            })();
        let ys = colors.map((_, c) => {
          for (let i = 0; i < pics.length; i++) {
            const r = rects[i];
            if (cx < r.left - 1 || cx > r.right + 1) continue;
            const col = Math.min(pics[i].w - 1, Math.max(0, Math.round(((cx - r.left) / r.width) * (pics[i].w - 1))));
            const v = pick(pics[i].cols[c], col);
            if (v >= 0) return r.top + v * r.height;
          }
          return null;
        });
        // Each line's value at its last point, so a tooltip can scale from the headline number.
        const ends = colors.map((_, c) => {
          for (let i = pics.length - 1; i >= 0; i--) {
            const col = pics[i].cols[c];
            for (let x = col.length - 1; x >= 0; x--) if (col[x] >= 0) return readAxis(rects[i].top + col[x] * rects[i].height, marks);
          }
          return null;
        });
        let tones = colors;
        if (merge) {
          const i = ys.findIndex((y) => y != null);
          tones = [colors[Math.max(0, i)]];
          ys = [i < 0 ? null : ys[i]];
          ends.splice(0, ends.length, ends.find((e) => e != null) ?? null);
        }
        setHover({
          x: (cx - a.left) / z,
          w: a.width / z,
          h: a.height / z,
          frac,
          ys: ys.map((y) => (y == null ? null : (y - a.top) / z)),
          v: ys.map((y) => (y == null ? null : readAxis(y, marks))),
          tones,
          ends,
          top: (marks[0].y - a.top) / z,
          bottom: (marks[marks.length - 1].y - a.top) / z,
        });
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame.current);
      setHover(null);
    };
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerdown", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerdown", move);
      area.removeEventListener("pointerleave", leave);
      area.querySelectorAll(images).forEach((img) => img.removeEventListener("load", reset));
    };
  }, [images, colors.join(), axis, values.join(), plot, range.join(), span, merge]);

  // The chart's own design-state cursor and tooltip step aside while hovering.
  useEffect(() => {
    const area = ref.current?.parentElement;
    area?.classList.toggle("is-hovering", !!hover);
  }, [hover]);

  if (!hover) return <span ref={ref} className="ch-anchor" aria-hidden="true" />;
  const info = render(hover);
  const top = Math.min(hover.top, ...hover.ys.filter((y) => y != null));
  const flip = hover.x + 16 + tipWidth > hover.w;
  const tipLeft = flip ? Math.max(0, hover.x - 16 - tipWidth) : hover.x + 16;
  const anyY = hover.ys.filter((y) => y != null);
  const tipTop = Math.max(0, Math.min((anyY.length ? Math.min(...anyY) : hover.top) - 24, hover.h - 140));

  if (compact) {
    const y = anyY[0];
    return (
      <span ref={ref} className="ch-layer" aria-hidden="true">
        {y != null && <span className="ch-dot ch-dot--sm" style={{ left: hover.x, top: y, "--c": hover.tones[0] }} />}
        <span className="ch-mini" style={{ left: hover.x, top: Math.max(0, (y ?? 0) - 26), transform: `translateX(${hover.x > hover.w * 0.6 ? "-100%" : hover.x < hover.w * 0.25 ? "0" : "-50%"})` }}>
          {info.date && (
            <span className="ch-mini__date">
              {info.date}
              {info.rows[0]?.value ? " · " : ""}
            </span>
          )}
          {info.rows[0]?.value}
        </span>
      </span>
    );
  }

  return (
    <span ref={ref} className="ch-layer" aria-hidden="true">
      <span className="ch-cursor" style={{ left: hover.x, top: Math.max(0, top - 8), bottom: Math.max(0, hover.h - hover.bottom - 4) }} />
      {crosshair && anyY.length > 0 && <span className="ch-hline" style={{ top: anyY[0] }} />}
      {hover.ys.map((y, i) =>
        y == null ? null : <span key={i} className="ch-dot" style={{ left: hover.x, top: y, "--c": hover.tones[i] }} />,
      )}
      {pill && info.date && (
        <span className="ch-pill" style={{ left: hover.x, top: hover.bottom + 6 }}>
          {info.date}
        </span>
      )}
      <span className="ch-tip" style={{ left: tipLeft, top: tipTop, width: tipWidth }}>
        {info.date && <span className="ch-tip__date">{info.date}</span>}
        {info.rows.map((r) => (
          <span key={r.label} className="ch-tip__row">
            <span className="ch-tip__key">
              {r.color && <i style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className={`ch-tip__value${r.tone ? ` is-${r.tone}` : ""}`}>{r.value}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
