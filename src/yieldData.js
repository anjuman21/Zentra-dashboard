// Content for the Yield Farming page (Figma frame 121:1021, mobile 170:9948).
const a = (name) => `/assets/${name}`;

const coin = {
  ETH: a("t-eth.svg"),
  USDC: a("t-usdc.svg"),
  SOL: a("t-sol.svg"),
  BTC: a("t-btc.svg"),
  USDT: a("t-usdt.svg"),
  ARB: a("t-arb.svg"),
  LINK: a("t-link.svg"),
  AVAX: a("t-avax.svg"),
  DOT: a("t-dot.svg"),
};
export const yieldCoins = coin;

// USD price per token, for splitting a deposit and valuing what comes back.
export const PRICES = { ETH: 3218.73, USDC: 1, USDT: 1, SOL: 187.4, BTC: 96183.23, ARB: 1.055, LINK: 22.19, AVAX: 36.24, DOT: 7.84 };

export const yicons = {
  chart: a("yield-chart.svg"),
  arrowRight: a("i-arrow-right.svg"),
};

export const yieldStats = [
  { key: "deposited", label: "Total Deposited", value: "$42,450.00", change: "+12.4%", spark: a("spark-balance.svg") },
  { key: "positions", label: "Active Positions", value: "4", change: "+1.00", spark: a("m-spark-vol.svg") },
  { key: "earned", label: "Total Earned", value: "$2,184.62", change: "+24.8%", spark: a("spark-profit.svg") },
  { key: "apy", label: "Average APY", value: "18.2%", change: "+2.66%", spark: a("m-spark-active.svg") },
];

// Your liquidity positions; the yield store (YieldFlows) keeps the live copy.
export const positions = [
  { pair: "ETH/USDC", label: "ETH/USDC", base: "ETH", quote: "USDC", deposited: 12500, baseAmt: 1.942, quoteAmt: 6250, value: 13482.36, valueChange: 7.82, rewards: 184.42, rewardToken: "USDC", apy: 12.4, apyChange: 1.2, since: "Jul 02, 2026", range: [2414, 4023] },
  { pair: "SOL/USDC", label: "SOL/ USDC", base: "SOL", quote: "USDC", deposited: 8750, baseAmt: 23.35, quoteAmt: 4375, value: 9482.17, valueChange: 8.39, rewards: 126.75, rewardToken: "USDC", apy: 21.6, apyChange: 3.4, since: "Jul 21, 2026", range: [140, 235] },
  { pair: "BTC/USDT", label: "BTC/USDT", base: "BTC", quote: "USDT", deposited: 15000, baseAmt: 0.078, quoteAmt: 7500, value: 16284.9, valueChange: 8.56, rewards: 223.1, rewardToken: "USDT", apy: 16.8, apyChange: 2.1, since: "Jun 14, 2026", range: [72000, 120000] },
  { pair: "ARB/ETH", label: "ARB/ETH", base: "ARB", quote: "ETH", deposited: 6200, baseAmt: 3647, quoteAmt: 0.963, value: 7142.72, valueChange: 15.19, rewards: 84.95, rewardToken: "USDC", apy: 28.3, apyChange: 4.7, since: "Aug 18, 2026", range: [2400, 2900], outOfRange: true },
].map((p) => ({ ...p, icons: [coin[p.base], coin[p.quote]] }));

export const pools = [
  { pair: "USDC/USDT", coins: ["USDC", "USDT"], risk: "Low Risk", level: 0, tvl: "$58.3M", apy: "5.2%", volume: "$12.4M", fee: "0.01%", age: 640, audits: "3 · CertiK, Trail of Bits", sub: "Two stablecoins" },
  { pair: "LINK/ETH", coins: ["LINK", "ETH"], risk: "Medium Risk", level: 1, tvl: "$21.6M", apy: "14.2%", volume: "$3.9M", fee: "0.3%", age: 518, audits: "2 · CertiK, OpenZeppelin", sub: "Two correlated tokens" },
  { pair: "AVAX/USDC", coins: ["AVAX", "USDC"], risk: "Modern Risk", level: 1, tvl: "$16.1M", apy: "19.5%", volume: "$4.1M", fee: "0.3%", age: 466, audits: "2 · CertiK, Halborn", sub: "A volatile token and a stablecoin" },
  { pair: "DOT/USDT", coins: ["DOT", "USDT"], risk: "High Risk", level: 2, tvl: "$8.7M", apy: "26.8%", volume: "$2.6M", fee: "1%", age: 412, audits: "2 · CertiK, OpenZeppelin", sub: "Two volatile tokens" },
].map((p) => ({ ...p, icons: p.coins.map((c) => coin[c]) }));

export const yieldMonths = ["Sep 19", "Sep 24", "Sep 29", "Oct 4", "Oct 9", "Oct 14", "Oct 19"];

export const farmingActivity = [
  { title: "Liquidity Added", pair: "ETH/USDC", date: "Aug 18, 2026", time: "12:34 PM", amount: "+$5,000.00" },
  { title: "Reward Claimed", pair: "SOL/USDC", date: "Aug 18, 2026", time: "12:34 PM", amount: "+$126.75" },
  { title: "Range Updated", pair: "ARB/ETH", date: "Aug 18, 2026", time: "12:34 PM", amount: "2.40k – 2.90k" },
];
