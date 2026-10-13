// Content for the Analytics page (Figma frame 102:2116, mobile 165:1500).
const a = (name) => `/assets/${name}`;

export const aicons = {
  calendar: a("i-calendar.svg"),
  download: a("i-download.svg"),
  line: a("an-line.svg"),
  dot: a("chart-dot.svg"),
};

export const kpis = [
  { label: "Total Profit", value: "$2,450.45", tone: "up", spark: a("m-spark-cap.svg") },
  { label: "Total Return", value: "+18.73%", tone: "up", spark: a("m-spark-vol.svg") },
  { label: "Win Rate", value: "62.45%", tone: "down", spark: a("m-spark-dom.svg") },
  { label: "Total Trade", value: "128", tone: "", spark: a("m-spark-active.svg") },
];

export const yAxis = ["$42k", "$40k", "$38k", "$36k", "$34k"];
export const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const ACTIVE_MONTH = "Sep";
export const RULER_ACTIVE_TICK = 102;

// Volume bars under the line (Figma "Data Points", 3px bars every 5px).
export const volume = [19, 15, 11, 12, 16, 25, 21, 27, 28, 38, 32, 20, 25, 22, 18, 14, 11, 9, 13, 14, 12, 15, 20, 24, 19, 15, 12, 16, 21, 28, 34, 28, 20, 22, 26, 21, 16, 12, 10, 9, 12, 17, 25, 22, 29, 35, 29, 23, 20, 25, 28, 21, 14, 17, 13, 11, 12, 15, 17, 21, 25, 22, 30, 34, 29, 22, 16, 17, 13, 9, 10, 14, 17, 21, 24, 22, 19, 15, 16, 11, 8, 13, 16, 22, 17, 21, 28, 30, 26, 19, 15, 19, 15, 11, 12, 9, 7, 10, 13, 17, 20, 23, 20, 17, 13, 9, 7, 5, 15, 24, 19, 13, 16, 17, 12, 10, 15, 23, 20, 25, 30, 25, 19, 23, 20, 16, 14, 11, 8, 10, 14, 11, 14, 19, 24, 17, 13, 11, 13, 16, 21, 27, 33, 27, 20, 22, 25, 20, 15, 10, 11, 7, 9, 12, 17, 21, 25, 19, 13, 9, 3];

export const pnlAxis = ["$1.5k", "$1k", "$500", "$0", "-$500", "-1k", "-$1.5k"];
// [gain height, gain tone, loss height, loss tone] per column, in px of the 189px plot.
export const pnl = [[11, "gain", 24, "none"], [32, "none", 21, "loss"], [83, "gain", 24, "none"], [61, "gain", 18, "none"], [32, "gain", 24, "none"], [32, "gain", 55, "loss"], [59, "gain", 81, "loss"], [43, "gain", 49, "loss"], [8, "gain", 24, "none"], [46, "gain", 15, "loss"], [40, "gain", 24, "none"], [61, "none", 34, "loss"], [74, "gain", 24, "none"], [93, "gain", 24, "none"], [80, "gain", 77, "loss"], [61, "none", 53, "loss"], [18, "gain", 24, "none"], [50, "gain", 24, "none"], [38, "gain", 24, "none"], [45, "gain", 23, "loss"], [93, "gain", 24, "none"], [11, "gain", 24, "none"], [32, "gain-strong", 24, "none"], [61, "gain-strong", 60, "none"], [61, "gain-strong", 37, "none"], [61, "gain-strong", 44, "none"], [61, "none", 79, "loss-strong"], [71, "none", 63, "loss-strong"], [71, "gain-strong", 20, "none"]];

export const heatDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const heatTimes = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
// 0 (low) to 5 (high), 11 two-hour slots per day.
export const heat = [[0, 5, 5, 0, 4, 1, 2, 3, 5, 5, 2], [5, 0, 5, 3, 5, 0, 5, 3, 3, 4, 4], [2, 0, 3, 3, 5, 2, 5, 2, 5, 3, 5], [5, 3, 3, 5, 2, 4, 5, 4, 4, 2, 5], [5, 4, 2, 0, 3, 2, 1, 2, 4, 4, 5], [4, 4, 4, 5, 3, 5, 5, 5, 2, 4, 2], [0, 5, 5, 3, 1, 5, 2, 5, 4, 4, 5]];

export const performance = [
  { asset: "BTC", dot: a("dot-btc.svg"), profit: "$1,230.45", ret: "+15.34%" },
  { asset: "ETH", dot: a("dot-eth.svg"), profit: "$680.21", ret: "+12.21%" },
  { asset: "SOL", dot: a("dot-bnb.svg"), profit: "$320.14", ret: "+9.11%" },
  { asset: "USDT", dot: a("dot-sol.svg"), profit: "$120.33", ret: "+4.21%" },
  { asset: "Other", dot: a("dot-others.svg"), profit: "$99.32", ret: "+3.45%" },
];
export const performanceTotal = { profit: "$432.50", ret: "+12.45%" };

export const topAssets = [
  { asset: "BTC", icon: a("w-btc.svg"), ret: "+15.34%", profit: "$1,230.45" },
  { asset: "ETH", icon: a("w-eth.svg"), ret: "+12.21%", profit: "$680.21" },
  { asset: "SOL", icon: a("w-sol.svg"), ret: "+9.11%", profit: "$320.14" },
  { asset: "AVAX", icon: a("w-avax.svg"), ret: "+4.21%", profit: "$120.33" },
  { asset: "MATIC", icon: a("w-matic.svg"), ret: "+3.45%", profit: "$99.32" },
];
