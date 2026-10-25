import React from "react";
import ChartHover, { dateAt } from "./ChartHover";

// "$124,458.94" → the same style at another value. Labels that aren't a plain
// number ("5/8", "in 6h 12m") show only the date.
function rescale(label, ratio) {
  const m = /^([+\-−]?[^0-9+\-−]*)([\d,]+(?:\.\d+)?)([kKMBT%]?)$/.exec(String(label).trim());
  if (!m) return null;
  let n = parseFloat(m[2].replace(/,/g, "")) * ratio;
  if (m[3] === "%" && !m[1].includes("+") && !m[1].includes("-") && !m[1].includes("−")) n = Math.min(100, n);
  const dec = (m[2].split(".")[1] || "").length;
  return `${m[1]}${n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}${m[3]}`;
}

// A stat card's sparkline: hovering shows the date and value under the pointer.
// The line covers the last 30 days and ends at the card's headline number.
export default function StatSpark({ src, value }) {
  return (
    <>
      <img className="pf-stat__spark" src={src} alt="" width="183" height="36" />
      <ChartHover
        images=".pf-stat__spark"
        colors={["#48B187", "#F82A51"]}
        merge
        plot=".pf-stat__spark"
        range={[1, 0]}
        compact
        render={(h) => {
          const v = h.v[0];
          const end = h.ends[0];
          // The sparkline's full height stands for about 10% of the headline number.
          const ratio = v == null || end == null ? 1 : 1 + (v - end) * 0.1;
          return {
            date: dateAt(h.frac, new Date(2026, 8, 19), new Date(2026, 9, 19)).replace(/^\w+, /, "").replace(/ ‘\d+$/, ""),
            rows: [{ value: rescale(value, ratio) ?? "" }],
          };
        }}
      />
    </>
  );
}
