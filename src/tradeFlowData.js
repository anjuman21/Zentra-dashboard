// State and content for the Trade UX flows (Figma section 453:35638).
import { createStore } from "./flows";
import { openOrders } from "./tradeData";

const a = (name) => `/assets/${name}`;

export const tficons = {
  search: a("search.svg"),
  star: a("stars.svg"),
  info: a("ob-help.svg"),
  close: a("hp-close.svg"),
  check: a("st-check-white.svg"),
  error: a("hp-error.svg"),
  edit: a("settings.svg"),
  copy: a("st-copy.svg"),
  open: a("call-made.svg"),
  cursor: a("tool-select.svg"),
};

export const PAIRS = [
  { base: "BTC", quote: "USDT", name: "Bitcoin", icon: a("t-btc.svg"), price: 96183.23, change: 1.35 },
  { base: "ETH", quote: "USDT", name: "Ethereum", icon: a("t-eth.svg"), price: 3218.73, change: -3.21 },
  { base: "SOL", quote: "USDT", name: "Solana", icon: a("t-sol.svg"), price: 187.4, change: 0.13 },
  { base: "BNB", quote: "USDT", name: "BNB", icon: a("t-bnb.svg"), price: 612.35, change: 22.1 },
  { base: "XRP", quote: "USDT", name: "XRP", icon: a("t-xrp.svg"), price: 2.41, change: -8.76 },
  { base: "LINK", quote: "USDT", name: "Chainlink", icon: a("t-link.svg"), price: 22.19, change: 12.08 },
  { base: "ETH", quote: "BTC", name: "Ethereum", icon: a("t-eth.svg"), price: 0.03346, change: -4.5 },
  { base: "SOL", quote: "USDC", name: "Solana", icon: a("t-sol.svg"), price: 187.38, change: 0.12 },
];
export const PAIR_TABS = ["Favorites", "USDT", "USDC", "BTC", "ETH"];

export const ORDER_TYPES = [
  { key: "Limit", sub: "Buy at your price or better. Waits in the order book." },
  { key: "Market", sub: "Buy now at the best available price." },
  { key: "Stop-limit", sub: "Places a limit order when the price hits your stop." },
  { key: "OCO", sub: "Pair a take-profit and a stop-loss; one cancels the other." },
];

export const CHART_TYPES = ["Line", "Candles", "Area"];
export const INTERVALS = ["1m", "15m", "1h", "4h", "1D", "1w"];
export const INDICATORS = [
  { key: "Volume", color: "#d9d9d9", on: true },
  { key: "MA (20)", color: "#fe7701", on: true },
  { key: "EMA (50)", color: "#0379df", on: false },
  { key: "RSI (14)", color: "#5720f5", on: false },
  { key: "Bollinger Bands", color: "#48b187", on: false },
];
export const DEFAULT_CHART = {
  type: "Line",
  interval: "1D",
  log: false,
  indicators: Object.fromEntries(INDICATORS.map((i) => [i.key, i.on])),
};

const pairKey = (p) => `${p.base}/${p.quote}`;
export { pairKey };

export const tradeStore = createStore({
  pair: "BTC/USDT",
  favorites: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT", "LINK/USDT"],
  orderType: "Limit",
  fillPrice: null,
  orders: openOrders.map((o, i) => ({ ...o, id: `o${i}` })),
  chart: DEFAULT_CHART,
  skipReview: false,
  toast: null,
});

export const pairOf = (key) => PAIRS.find((p) => pairKey(p) === key) || PAIRS[0];
export const fmt = (n, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
