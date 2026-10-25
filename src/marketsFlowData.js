// Content for the Markets UX flows (Figma section 433:23967).
import { createStore } from "./flows";
import { coins } from "./marketsData";

const a = (name) => `/assets/${name}`;

export const mficons = {
  empty: a("fl-watch-empty.svg"),
  star: a("stars.svg"),
  swap: a("swap-vert.svg"),
  trade: a("repeat.svg"),
  bell: a("notifications.svg"),
  chart: a("insert-chart.svg"),
  copy: a("st-copy.svg"),
  open: a("call-made.svg"),
  add: a("add.svg"),
  search: a("search.svg"),
  close: a("hp-close.svg"),
  chevron: a("i-chevron-right-16.svg"),
  arrowDown: a("arrow-down.svg"),
  info: a("ob-help.svg"),
};

// The Markets "Watchlists" tab starts empty (first visit, 02A).
export const marketWatch = createStore([]);
export const currencyStore = createStore("USD");
export const DEFAULT_FILTERS = {
  categories: ["Layer 1", "DeFi"],
  cap: "> $10B",
  min: -5,
  max: 30,
  volume: "$500M",
  hideStable: true,
  tradable: true,
};
// Filters are only applied once "Show N coins" is pressed.
export const filterStore = createStore(null);

export const CATEGORIES = ["Layer 1", "DeFi", "AI", "Meme", "Gaming", "Stablecoins", "RWA"];
export const CAPS = ["Any", "> $10B", "$1B–10B", "< $1B"];
export const VOLUMES = ["Any", "$100M", "$500M", "$1B"];

// Category and size per coin, used by the filter.
export const COIN_META = {
  BTC: { cats: ["Layer 1"], cap: 2830 },
  ETH: { cats: ["Layer 1", "DeFi"], cap: 5450 },
  SOL: { cats: ["Layer 1", "DeFi"], cap: 3670 },
  BNB: { cats: ["Layer 1"], cap: 8120 },
  XRP: { cats: ["Layer 1"], cap: 1890 },
  ADA: { cats: ["Layer 1"], cap: 6300 },
  DOT: { cats: ["Layer 1"], cap: 4750 },
  DOGE: { cats: ["Meme"], cap: 4120 },
  AVAX: { cats: ["Layer 1", "DeFi", "Gaming"], cap: 2330 },
  LINK: { cats: ["DeFi", "AI", "RWA"], cap: 3210 },
};

const CAP_TEST = {
  "> $10B": (m) => m >= 4000,
  "$1B–10B": (m) => m >= 2000 && m < 4000,
  "< $1B": (m) => m < 2000,
};

// Applied filters narrow every Markets tab.
export function applyFilters(list, f) {
  if (!f) return list;
  return list.filter((c) => {
    const meta = COIN_META[c.symbol] || { cats: [], cap: 0 };
    if (f.categories.length && !meta.cats.some((x) => f.categories.includes(x))) return false;
    if (f.cap !== "Any" && !CAP_TEST[f.cap](meta.cap)) return false;
    return c.change24h >= f.min && c.change24h <= f.max;
  });
}

// How many listed coins a filter set would show, for the button label.
export const matchCount = (f) => applyFilters(coins, f).length;

export const CURRENCY_GROUPS = [
  { title: "RECENT", items: [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1 },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", rate: 119.5 },
  ] },
  { title: "FIAT", items: [
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 151.2 },
  ] },
  { title: "CRYPTO", items: [
    { code: "BTC", name: "Bitcoin", symbol: "₿", rate: 1 / 96183.23 },
    { code: "ETH", name: "Ethereum", symbol: "Ξ", rate: 1 / 3218.73 },
  ] },
];
export const CURRENCY = Object.fromEntries(CURRENCY_GROUPS.flatMap((g) => g.items).map((c) => [c.code, c]));

// "$1.23B" → "€1.13B" for the selected quote currency.
export function convertPrice(text, code) {
  const c = CURRENCY[code] || CURRENCY.USD;
  if (code === "USD") return text;
  const m = text.match(/^\$([\d,.]+)([KMBT]?)$/);
  if (!m) return text;
  const v = parseFloat(m[1].replace(/,/g, "")) * c.rate;
  const digits = v < 1 ? 6 : 2;
  return `${c.symbol}${v.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: m[2] ? 2 : Math.min(2, digits) })}${m[2]}`;
}

export const POPULAR_WATCH = [
  { coin: "BTC", price: "$96,183.23", change: "+12.3% 24h", up: true },
  { coin: "ETH", price: "$3,218.73", change: "−3.2% 24h" },
  { coin: "SOL", price: "$187.40", change: "+0.1% 24h", up: true },
  { coin: "LINK", price: "$22.19", change: "+12.1% 24h", up: true },
];

export const DETAIL_STATS = [
  ["Market cap", "$1.90T"],
  ["24h volume", "$38.2B"],
  ["7D", "+0.02%", "up"],
  ["Supply", "19.8M BTC"],
  ["All-time high", "$108,268"],
  ["From ATH", "−11.2%", "down"],
];

export const ALERT_KINDS = ["Price rises above", "Price drops below", "% change"];
export const REPEAT = ["Once", "Every time", "Daily"];
export const CHANNELS = ["Push, Email", "Push", "Email", "SMS"];

export const COMPARE_ROWS = [
  { label: "Price", values: { BTC: "$96,183.23", ETH: "$3,218.73", SOL: "$187.40", BNB: "$236.21" } },
  { label: "24h change", values: { BTC: "+12.34%", ETH: "−3.21%", SOL: "+0.13%", BNB: "+22.10%" } },
  { label: "7D change", values: { BTC: "+0.02%", ETH: "+3.78%", SOL: "+15.42%", BNB: "+22.15%" } },
  { label: "Market cap", values: { BTC: "$1.90T", ETH: "$387.4B", SOL: "$87.1B", BNB: "$34.2B" } },
  { label: "24h volume", values: { BTC: "$38.2B", ETH: "$14.9B", SOL: "$2.3B", BNB: "$560M" } },
  { label: "From all-time high", values: { BTC: "−11.2%", ETH: "−34.1%", SOL: "−28.4%", BNB: "−9.6%" } },
];
export const COMPARE_SERIES = {
  BTC: [0.06, 0.08, 0.07, 0.12, 0.15, 0.13, 0.2, 0.24, 0.28, 0.35, 0.33, 0.42, 0.5, 0.58, 0.72],
  ETH: [0.06, 0.07, 0.09, 0.08, 0.1, 0.12, 0.11, 0.14, 0.16, 0.18, 0.2, 0.19, 0.22, 0.24, 0.26],
  SOL: [0.06, 0.04, 0.05, 0.03, 0.02, 0.04, 0.06, 0.05, 0.07, 0.06, 0.05, 0.07, 0.06, 0.07, 0.07],
  BNB: [0.06, 0.1, 0.14, 0.18, 0.22, 0.25, 0.3, 0.34, 0.4, 0.44, 0.5, 0.55, 0.6, 0.66, 0.74],
};

export const FG_DRIVERS = [
  { label: "Momentum & volume", value: "Greed", tone: "green" },
  { label: "Volatility", value: "Neutral", tone: "neutral" },
  { label: "Social sentiment", value: "Extreme greed", tone: "green" },
  { label: "BTC dominance", value: "Fear", tone: "orange" },
];
export const FG_WEEK = [
  { d: "Fri", v: 48 },
  { d: "Sat", v: 52 },
  { d: "Sun", v: 55 },
  { d: "Mon", v: 61 },
  { d: "Tue", v: 58 },
  { d: "Wed", v: 62 },
  { d: "Thu", v: 68 },
];

export const MARKET_ROW_ACTIONS = [
  { key: "watch", label: "Add to watchlist", hint: "W", icon: a("stars.svg") },
  { key: "trade", label: "Trade", hint: "T", icon: a("repeat.svg") },
  { key: "convert", label: "Convert", icon: a("swap-vert.svg") },
  { sep: true },
  { key: "alert", label: "Set price alert", hint: "A", icon: a("notifications.svg") },
  { key: "compare", label: "Compare with…", icon: a("insert-chart.svg") },
  { sep: true },
  { key: "copy", label: "Copy contract address", icon: a("st-copy.svg") },
  { key: "explorer", label: "View on explorer", icon: a("call-made.svg") },
];
