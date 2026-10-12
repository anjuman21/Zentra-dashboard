// Content and chart geometry for the Portfolio page (Figma frame 53:2964).
const a = (name) => `/assets/${name}`;

export const picons = {
  add: a("p-add.svg"),
  upload: a("p-upload.svg"),
  callMade: a("call-made.svg"),
  chartBars: a("chart-bars.svg"),
  lineBefore: a("chart-line-1.svg"),
  lineActive: a("chart-line-2.svg"),
  lineAfter: a("chart-line-3.svg"),
  marker: a("chart-marker.svg"),
  gauge: a("gauge.svg"),
  gaugeRing: a("gauge-ring.svg"),
};

// Desktop order. On phones the grid reorders to Profit, Best / Balance, 24h like the mobile frame.
export const stats = [
  { key: "balance", label: "Total Balance", value: "$124,458.94", change: "+5.35%", spark: a("spark-balance.svg") },
  { key: "change", label: "24h Change", value: "+$9,532.12", change: "+8.35%", spark: a("spark-change.svg") },
  { key: "profit", label: "Total Profit", value: "+$18,632.09", change: "+18.35%", spark: a("spark-profit.svg") },
  { key: "best", label: "Best Performance", value: "SQL", change: "+32.45%", spark: a("spark-best.svg") },
];

export const chartMonths = [
  { label: "Apr" },
  { label: "May" },
  { label: "Jun", active: true },
  { label: "Jul", active: true },
  { label: "Aug", active: true },
  { label: "Sep" },
  { label: "Oct" },
];

export const RULER_TICKS = 125;
export const rulerMajor = new Set([2, 22, 43, 62, 82, 102, 122]);
export const RULER_ACTIVE_FROM = 43;
export const RULER_ACTIVE_TO = 82;

// Plot coordinates (origin = top-left of the bars). x is the marker centre;
// tipCenter/tipWidth place the tooltip as in Figma at 840px. On phones the first
// tooltip drops below its marker so the two don't overlap (mobile frame).
export const chartCallouts = [
  { x: 283, markerTop: 59.5, tipCenter: 288, tipWidth: 192, tipTop: 23, tipTopMobile: 68, actual: "$12.8k", potential: "$18.9k" },
  { x: 556, markerTop: 42.5, tipCenter: 562, tipWidth: 194, tipTop: 7, tipTopMobile: 3, actual: "$12.4k", potential: "$20.9k" },
];

export const assets = [
  { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), holding: "5.31415 BTC", holdingValue: "$50,267.79", value: "$50,267.79", share: "40.42%", change: "+2.35%", pnl: "+$7,258.32", pnlPct: "+16.87%" },
  { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), holding: "3.14159 ETH", holdingValue: "$7,901.64", value: "$7,901.64", share: "25.52%", change: "-1.25%", pnl: "+$1,203.45", pnlPct: "+13.21%" },
  { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), holding: "2.71828 SOL", holdingValue: "$3,033.60", value: "$3,033.60", share: "15.78%", change: "+5.32%", pnl: "+$1,258.32", pnlPct: "+28.12%" },
  { name: "BNB", symbol: "BNB", icon: a("t-ada.svg"), holding: "0.57721 BNB", holdingValue: "$2,602.73", value: "$2,602.73", share: "8.70%", change: "+0.85%", pnl: "+$298.45", pnlPct: "+12.98%" },
  { name: "XRP", symbol: "XRP", icon: a("t-xrp.svg"), holding: "1.61803 XRP", holdingValue: "$1,317.65", value: "$1,317.65", share: "5.58%", change: "-0.12%", pnl: "-$156.32", pnlPct: "-4.23%" },
];

export const allocation = [
  [
    { label: "BTC", value: "40.2%", color: "#fc8123", dot: a("dot-btc.svg") },
    { label: "ETH", value: "25.5%", color: "#7944f9", dot: a("dot-eth.svg") },
    { label: "BNB", value: "8.7%", color: "#fdc211", dot: a("dot-bnb.svg") },
  ],
  [
    { label: "SOL", value: "15.8%", color: "#577ef5", dot: a("dot-sol.svg") },
    { label: "Others", value: "9.8%", color: "var(--text-1)", dot: a("dot-others.svg") },
  ],
];

export const topHoldings = [
  { symbol: "BTC", icon: a("w-btc.svg"), value: "$96,183.23", change: "+12%" },
  { symbol: "ETH", icon: a("w-eth.svg"), value: "$3,218.73", change: "-8%" },
  { symbol: "SOL", icon: a("w-ltc.svg"), value: "$3,218.73", change: "-8%" },
  { symbol: "BNB", icon: a("w-bnb.svg"), value: "$236.21", change: "+20%" },
  { symbol: "XRP", icon: a("w-xrp.svg"), value: "$627.18", change: "+12%" },
  { symbol: "ADA", icon: a("w-ada.svg"), value: "$1.12", change: "+5%" },
];

export const performance = [
  { label: "Win Rate", value: "68.4%", color: "#1eab72", icon: a("i-moving.svg") },
  { label: "Total Trades", value: "68.4%", color: "#7944f9", icon: a("i-autorenew.svg") },
  { label: "Hold time", value: "12d 4h", color: "#fb912f", icon: a("i-schedule.svg") },
  { label: "Diversity", value: "High", color: "#6790e0", icon: a("i-donut.svg"), positive: true },
];
