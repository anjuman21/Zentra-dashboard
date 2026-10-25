// Content for the Home UX flows (Figma section 415:21883).
import { createStore } from "./flows";

const a = (name) => `/assets/${name}`;

export const ficons = {
  close: a("hp-close.svg"),
  arrowDown: a("arrow-down.svg"),
  arrowDownward: a("arrow-downward.svg"),
  schedule: a("ob-schedule.svg"),
  copy: a("st-copy.svg"),
  check: a("st-check.svg"),
  checkWhite: a("st-check-white.svg"),
  done: a("fl-convert-done.svg"),
  search: a("search.svg"),
  stars: a("stars.svg"),
  bell: a("notifications.svg"),
  wallet: a("ob-wallet.svg"),
  history: a("history.svg"),
  more: a("more-vert.svg"),
  chevron: a("i-chevron-right-16.svg"),
  eye: a("st-eye.svg"),
  download: a("i-download.svg"),
  upload: a("p-upload.svg"),
  swap: a("swap-vert.svg"),
  settings: a("settings.svg"),
  shield: a("st-encrypted.svg"),
  language: a("language.svg"),
  logout: a("logout.svg"),
  expand: a("open-in-full.svg"),
  add: a("add.svg"),
  mic: a("i-mic.svg"),
  send: a("i-north-east.svg"),
  copy16: a("ob-copy13.svg"),
  avatar: a("avatar.png"),
};

export const COINS = {
  BTC: { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), price: 96183.23, change: 12.0, rank: 1, color: "#f7931a" },
  ETH: { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), price: 3218.73, change: -8.0, rank: 2, color: "#627eea" },
  SOL: { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), price: 3218.73, change: -8.0, rank: 5, color: "#9945ff" },
  BNB: { name: "BNB", symbol: "BNB", icon: a("t-bnb.svg"), price: 236.21, change: 20.0, rank: 4, color: "#f3ba2f" },
  XRP: { name: "XRP", symbol: "XRP", icon: a("t-xrp.svg"), price: 627.18, change: 12.0, rank: 6, color: "#23292f" },
  ADA: { name: "Cardano", symbol: "ADA", icon: a("t-ada.svg"), price: 1.12, change: 5.0, rank: 9, color: "#0033ad" },
  DOGE: { name: "Dogecoin", symbol: "DOGE", icon: a("t-doge.svg"), price: 0.3812, change: 4.2, rank: 8, color: "#c2a633" },
  DOT: { name: "Polkadot", symbol: "DOT", icon: a("t-dot.svg"), price: 7.84, change: -1.8, rank: 14, color: "#e6007a" },
  AVAX: { name: "Avalanche", symbol: "AVAX", icon: a("t-avax.svg"), price: 41.27, change: 6.5, rank: 11, color: "#e84142" },
  LINK: { name: "Chainlink", symbol: "LINK", icon: a("t-link.svg"), price: 22.19, change: 2.1, rank: 12, color: "#2a5ada" },
  LTC: { name: "Litecoin", symbol: "LTC", icon: a("t-ltc.svg"), price: 104.62, change: -0.6, rank: 19, color: "#345d9d" },
  USDT: { name: "Tether", symbol: "USDT", icon: a("t-usdt.svg"), price: 1, change: 0, rank: 3, color: "#26a17b" },
  USDC: { name: "USD Coin", symbol: "USDC", icon: a("t-usdc.svg"), price: 1, change: 0, rank: 7, color: "#2775ca" },
};

export const ADDABLE = ["BTC", "DOGE", "DOT", "AVAX", "LINK", "LTC", "ADA", "USDT", "USDC"];
export const WATCH_TABS = {
  All: ADDABLE,
  "Top gainers": ["BTC", "AVAX", "DOGE", "LINK"],
  Trending: ["DOGE", "AVAX", "LINK", "DOT"],
  Stablecoins: ["USDT", "USDC"],
};

// Symbols shown in the Home watchlist card.
export const watchStore = createStore(["BTC", "ETH", "SOL", "BNB", "XRP", "ADA"]);
// "Hide balances on Home" masks the top-bar totals.
export const hideStore = createStore(false);

export const money = (n, d = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const pct = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}%`;

export const RATE = 25.938;

export const QUICK_VIEW = {
  BTC: {
    up: "+$10,307.41 today",
    stats: [
      ["Market cap", "$1.90T"],
      ["24h volume", "$38.2B"],
      ["24h high", "$97,420.10"],
      ["24h low", "$85,102.66"],
    ],
    holding: { amount: "0.4821 BTC", value: "≈ $46,369.95", avg: "$71,240.00", pnl: "+$12,025.13 · +35.0%" },
    activity: [
      { title: "Bought 0.12 BTC", sub: "Oct 12 · Unified Trading", value: "−$11,402.18" },
      { title: "Converted 0.05 BTC → ETH", sub: "Oct 09 · 1 BTC = 25.71 ETH", value: "+1.2855 ETH", up: true },
    ],
  },
};

// Points (0–1) per range; the quick-view chart draws them as a line.
export const SERIES = {
  "1H": [0.62, 0.6, 0.64, 0.61, 0.66, 0.68, 0.65, 0.7, 0.72, 0.71, 0.75, 0.78],
  "1D": [0.18, 0.12, 0.2, 0.26, 0.22, 0.34, 0.4, 0.33, 0.45, 0.42, 0.55, 0.5, 0.62, 0.58, 0.7, 0.66, 0.78, 0.75, 0.86, 0.84, 0.92],
  "1W": [0.3, 0.35, 0.28, 0.4, 0.46, 0.42, 0.55, 0.6, 0.57, 0.68, 0.74, 0.8],
  "1M": [0.5, 0.42, 0.38, 0.45, 0.36, 0.3, 0.4, 0.48, 0.55, 0.52, 0.64, 0.7, 0.76, 0.82],
  "1Y": [0.1, 0.18, 0.15, 0.25, 0.32, 0.28, 0.4, 0.5, 0.45, 0.6, 0.72, 0.68, 0.85],
  All: [0.02, 0.05, 0.04, 0.12, 0.3, 0.22, 0.18, 0.35, 0.5, 0.42, 0.6, 0.78, 0.9],
};
export const RANGE_AXIS = {
  "1H": ["10:00", "10:15", "10:30", "10:45", "Now"],
  "1D": ["00:00", "06:00", "12:00", "18:00", "Now"],
  "1W": ["Mon", "Wed", "Fri", "Sun", "Now"],
  "1M": ["Sep 20", "Sep 27", "Oct 4", "Oct 11", "Now"],
  "1Y": ["Nov", "Feb", "May", "Aug", "Now"],
  All: ["2018", "2020", "2022", "2024", "Now"],
};

// One receipt per transaction row; the step reached follows the row's status.
export const TX_STEPS = [
  { title: "Order placed", sub: "Market buy on Oct 15", time: "09:41" },
  { title: "Funds reserved", sub: "0.20491 BTC held in Unified Trading", time: "09:41" },
  { title: "Compliance review", sub: "A quick check for large orders", time: "09:45" },
  { title: "Settlement", sub: "ETH credited to your wallet", time: "~10 min" },
];
export const STATUS_STEP = {
  "Pending Review": 2,
  Completed: 4,
  "Not Started": 0,
  "On Hold": 2,
  Delayed: 2,
  "In Progress": 3,
};

export const SEARCH_PAIRS = [
  { base: "ETH", quote: "BTC", price: "0.03346 BTC" },
  { base: "ETH", quote: "USDT", price: "3,218.73 USDT" },
  { base: "BTC", quote: "USDT", price: "96,183.23 USDT" },
  { base: "SOL", quote: "USDT", price: "3,218.73 USDT" },
  { base: "DOGE", quote: "USDT", price: "0.3812 USDT" },
];

export const AI_MOVERS = [
  { coin: "ETH", sub: "28% of holdings · −8.0%", value: "−$1,083.12" },
  { coin: "SOL", sub: "9% of holdings · −4.6%", value: "−$212.64" },
  { coin: "BTC", sub: "41% of holdings · +12.0%", value: "+$127.36", up: true },
];
