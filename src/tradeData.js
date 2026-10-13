// Content for the Trade page (Figma frame 96:4273, mobile 156:12432).
const a = (name) => `/assets/${name}`;

export const ticons = {
  chart: a("trade-chart.svg"),
  hline: a("chart-hline.svg"),
  vline: a("chart-vline.svg"),
  dot: a("chart-dot.svg"),
  waterfall: a("i-waterfall.svg"),
  timeline: a("i-timeline.svg"),
};

export const pair = {
  icon: a("t-btc.svg"),
  symbol: "BTC/USDT",
  name: "Bitcoin",
  price: "$96,183.23",
  sub: "$96,183.23",
  change: "+1.35%",
};

export const pairStats = [
  { label: "24h High", value: "$97,245.10" },
  { label: "24h Low", value: "$93,860.42" },
  { label: "24h Volume (BTC)", value: "$28,450.21" },
  { label: "24h Volume (USDT)", value: "$2.73B" },
];

export const yLabels = ["150b USD", "120b USD", "91b USD", "60b USD", "30b USD", "20b USD", "0 USD"];
export const xLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const X_ACTIVE = "Sep";

export const chartToggles = [
  { label: "Volume", on: true },
  { label: "TVL", on: false },
  { label: "Transaction", on: false },
];

export const orderTabs = ["Open orders (3)", "Order History", "Trade History"];

export const openOrders = [
  { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), type: "Limit", side: "Buy", price: "95,800.00", amount: "0.125 BTC", filled: "0.025 BTC (20%)", total: "1,197.50 USDT" },
  { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), type: "Limit", side: "Buy", price: "3,200.00", amount: "1.50 ETH", filled: "0.00 ETH (0%)", total: "4,800.00 USDT" },
  { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), type: "Limit", side: "Buy", price: "4,500.75", amount: "2.75 ETH", filled: "0.50 ETH (12.5%)", total: "3,200.00 USDT" },
  { name: "Cardano", symbol: "ADA", icon: a("t-ada.svg"), type: "Limit", side: "Sell", price: "2,980.40", amount: "0.95 ETH", filled: "1.20 ETH (30%)", total: "5,500.00 USDT" },
  { name: "Polkadot", symbol: "DOT", icon: a("t-dot.svg"), type: "Limit", side: "Sell", price: "180.50", amount: "10.00 SOL", filled: "2.00 SOL (20%)", total: "1,805.00 USDT" },
];

// Depth bars are the Figma widths out of the 268px book.
export const asks = [
  { price: "96,186.00", amount: "0.32000", total: "2.45600", depth: 268 },
  { price: "96,185.20", amount: "0.25000", total: "2.13600", depth: 211 },
  { price: "96,184.50", amount: "0.12500", total: "1.88600", depth: 190 },
  { price: "96,183.80", amount: "0.52000", total: "1.76100", depth: 155 },
  { price: "96,183.40", amount: "0.24100", total: "1.24100", depth: 103 },
];

export const bids = [
  { price: "96,182.90", amount: "0.35800", total: "0.35800", depth: 114 },
  { price: "96,182.10", amount: "0.41000", total: "0.76800", depth: 155 },
  { price: "96,181.30", amount: "0.25000", total: "1.01800", depth: 175 },
  { price: "96,180.50", amount: "0.36500", total: "1.38300", depth: 198 },
  { price: "96,179.70", amount: "0.52000", total: "1.90300", depth: 218 },
];

export const bookRatio = { buy: 56.32, sell: 43.68 };

export const AVAILABLE_USDT = 12456.21;
export const BTC_PRICE = 96183.23;
export const FEE_RATE = 0.001;
