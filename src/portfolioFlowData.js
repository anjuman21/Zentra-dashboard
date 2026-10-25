// Content for the Portfolio UX flows (Figma section 433:9563).
import { createStore } from "./flows";

const a = (name) => `/assets/${name}`;

export const pficons = {
  wallet: a("ob-wallet.svg"),
  download: a("i-download.svg"),
  upload: a("p-upload.svg"),
  swap: a("swap-vert.svg"),
  add: a("add.svg"),
  chevron: a("i-chevron-right-16.svg"),
  shield: a("st-encrypted.svg"),
  calendar: a("i-calendar.svg"),
  arrowDown: a("arrow-down.svg"),
  filter: a("filter-list.svg"),
  menu: a("m-menu.svg"),
  check: a("st-check-white.svg"),
  more: a("more-vert.svg"),
  bell: a("notifications.svg"),
  history: a("history.svg"),
  callMade: a("call-made.svg"),
  close: a("hp-close.svg"),
  stars: a("stars.svg"),
};

// Range chip, potential line and overlays shared by the chart and its menus.
export const chartStore = createStore({ range: "1Y", potential: true, compare: false, volume: true });
// Assets hidden from the portfolio from the row menu.
export const hiddenAssets = createStore([]);

export const RANGES = [
  { key: "1D", label: "Last 24 hours" },
  { key: "1W", label: "Last 7 days" },
  { key: "1M", label: "Last 30 days" },
  { key: "3M", label: "Last 3 months" },
  { key: "6M", label: "Last 6 months" },
  { key: "1Y", label: "Last 12 months" },
  { key: "ALL", label: "All time" },
];

export const OVERLAYS = [
  { key: "potential", label: "Potential value", color: "#fe7701" },
  { key: "compare", label: "Compare with BTC", color: "#0379df" },
  { key: "volume", label: "Volume bars", color: "#d9d9d9" },
];

export const TRACK_OPTIONS = [
  { key: "connect", title: "Connect a wallet", sub: "MetaMask, Ledger, Trust — read-only balance sync", icon: a("ob-wallet.svg"), tag: "Popular", route: "connect-wallet" },
  { key: "import", title: "Import from exchange", sub: "Binance, Coinbase, Kraken via read-only API key", icon: a("swap-vert.svg"), route: "settings/api" },
  { key: "manual", title: "Add manually", sub: "Log a past trade so it’s tracked in P&L", icon: a("add.svg") },
];

export const EXPORT_FORMATS = [
  { key: "PDF", title: "PDF report", sub: "Charts + tables", icon: a("p-upload.svg") },
  { key: "CSV", title: "CSV", sub: "Raw data", icon: a("filter-list.svg") },
  { key: "XLSX", title: "XLSX", sub: "For Excel", icon: a("m-menu.svg") },
];

export const EXPORT_PARTS = [
  { key: "summary", title: "Summary & KPIs", sub: "Balance, profit, best performer", on: true, pages: 1 },
  { key: "chart", title: "Portfolio chart", sub: "Last 12 months · with potential line", on: true, pages: 1 },
  { key: "holdings", title: "Holdings & P&L", sub: "5 assets", on: true, pages: 2 },
  { key: "history", title: "Transaction history", sub: "214 trades", on: false, pages: 8 },
  { key: "tax", title: "Tax lots (cost basis)", sub: "FIFO", on: false, pages: 3 },
];

export const PERIODS = ["1M", "3M", "YTD", "1Y", "Custom"];
export const PERIOD_RANGE = {
  "1M": "Sep 15, 2026 – Oct 15, 2026",
  "3M": "Jul 15, 2026 – Oct 15, 2026",
  YTD: "Jan 01, 2026 – Oct 15, 2026",
  "1Y": "Oct 15, 2025 – Oct 15, 2026 · matches your chart",
  Custom: "Pick start and end dates",
};

// 04A · the gap between what you hold and what you would hold.
export const GAP = [
  { coin: "ETH", text: "Sold 1.2 ETH early · Jun 03", value: "−$5.1k" },
  { coin: "SOL", text: "Sold 14 SOL early · Jun 19", value: "−$2.3k" },
  { coin: "BTC", text: "Trading fees & slippage", value: "−$1.1k" },
];

// 05A · per-asset detail; BTC carries the designed numbers, others derive from the table row.
export const ASSET_DETAIL = {
  BTC: {
    cost: "$43,009.47",
    avg: "$8,093.39",
    pnl: "+$7,258.32",
    ret: "+16.87%",
    share: 40.42,
    target: 35,
    wallets: [
      { name: "Unified Trading", value: "$45,404.06", amount: "4.80000 BTC" },
      { name: "Funding", value: "$4,863.73", amount: "0.51415 BTC" },
    ],
    txs: [
      { kind: "swap", title: "Converted 0.1 BTC → ETH", sub: "Oct 15 · 1 BTC = 25.938 ETH", value: "−0.1 BTC" },
      { kind: "buy", title: "Bought 0.25 BTC", sub: "Mar 12 · $61,240.00", value: "+0.25 BTC", up: true },
      { kind: "in", title: "Received from Ledger", sub: "Jan 04 · Funding wallet", value: "+1.0 BTC", up: true },
    ],
  },
};

// 07A · current mix against targets, by asset.
export const TARGETS = [
  { key: "BTC", name: "Bitcoin", icon: a("t-btc.svg"), now: 40.2, target: 35, color: "#f7931a" },
  { key: "ETH", name: "Ethereum", icon: a("t-eth.svg"), now: 25.5, target: 30, color: "#627eea" },
  { key: "SOL", name: "Solana", icon: a("t-sol.svg"), now: 15.8, target: 15, color: "#0379df" },
  { key: "BNB", name: "BNB", icon: a("t-bnb.svg"), now: 8.7, target: 10, color: "#f3ba2f" },
  { key: "Others", name: "Others", icon: null, now: 9.8, target: 10, color: "#d9d9d9" },
];

export const BY_CHAIN = [
  { key: "Bitcoin", name: "Bitcoin", now: 40.2, target: 35, color: "#f7931a" },
  { key: "Ethereum", name: "Ethereum + L2s", now: 31.1, target: 35, color: "#627eea" },
  { key: "Solana", name: "Solana", now: 15.8, target: 15, color: "#9945ff" },
  { key: "BNB Chain", name: "BNB Chain", now: 12.9, target: 15, color: "#f3ba2f" },
];

export const BY_WALLET = [
  { key: "Unified", name: "Unified Trading", now: 83.2, target: 80, color: "#5720f5" },
  { key: "Funding", name: "Funding", now: 16.8, target: 20, color: "#0379df" },
];

export const ROW_ACTIONS = [
  { key: "buy", label: "Buy more", hint: "B", icon: a("add.svg"), route: "trade" },
  { key: "sell", label: "Sell", hint: "S", icon: a("arrow-downward.svg"), route: "trade" },
  { key: "convert", label: "Convert", hint: "C", icon: a("swap-vert.svg") },
  { key: "send", label: "Send", icon: a("call-made.svg"), route: "deposit" },
  { key: "receive", label: "Receive", icon: a("i-download.svg"), route: "deposit" },
  { sep: true },
  { key: "alert", label: "Set price alert", icon: a("notifications.svg"), route: "alerts" },
  { key: "txs", label: "View transactions", icon: a("history.svg"), route: "history" },
  { key: "markets", label: "Open in Markets", icon: a("call-made.svg"), route: "markets" },
  { sep: true },
  { key: "hide", label: "Hide from portfolio", danger: true },
];
