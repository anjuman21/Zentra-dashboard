// Content for the Yield Farming page (Figma frame 121:1021, mobile 170:9948).
const a = (name) => `/assets/${name}`;

const coin = {
  ETH: a("t-eth.svg"),
  USDC: a("t-usdc.svg"),
  SOL: a("t-sol.svg"),
  BTC: a("t-btc.svg"),
  USDT: a("t-usdt.svg"),
  ARB: a("t-arb.svg"),
};

export const yicons = {
  chart: a("yield-chart.svg"),
  arrowRight: a("i-arrow-right.svg"),
};

export const yieldStats = [
  { key: "deposited", label: "Total Deposited", value: "$86,420.18", change: "+12.4%", spark: a("spark-balance.svg") },
  { key: "positions", label: "Active Positions", value: "4", change: "+1.00", spark: a("m-spark-vol.svg") },
  { key: "earned", label: "Total Earned", value: "$2,184.62", change: "+24.8%", spark: a("spark-profit.svg") },
  { key: "apy", label: "Average APY", value: "18.7%", change: "+2.66%", spark: a("m-spark-active.svg") },
];

export const positions = [
  { pair: "ETH/USDC", coins: ["ETH", "USDC"], deposited: "$12,500.00", split: "2.87 ETH + 6.210 USDC", value: "$13,482.36", valueChange: "+7.82%", rewards: "$184.42", rewardToken: "USDC", apy: "12.4%", apyChange: "+1.2%" },
  { pair: "SOL/ USDC", coins: ["SOL", "USDC"], deposited: "$8,750.00", split: "45.12 SOL + 2,340 USDC", value: "$9,482.17", valueChange: "+8.39%", rewards: "$126.75", rewardToken: "USDC", apy: "21.6%", apyChange: "+3.4%" },
  { pair: "BTC/USDT", coins: ["BTC", "USDT"], deposited: "$15,000.00", split: "0.25 BTC + 3650 USDT", value: "$16,284.90", valueChange: "+8.56%", rewards: "$223.10", rewardToken: "USDT", apy: "16.8%", apyChange: "+2.1%" },
  { pair: "ARB/ETH", coins: ["ARB", "ETH"], deposited: "$6,200.00", split: "4,860 ARB + 2.1 ETH", value: "$7,142.72", valueChange: "+15.19%", rewards: "$84.95", rewardToken: "USDC", apy: "28.3%", apyChange: "+4.7%" },
].map((p) => ({ ...p, icons: p.coins.map((c) => coin[c]) }));

export const pools = [
  { pair: "ETH/USDC", coins: ["ETH", "USDC"], risk: "Low Risk", tvl: "$24.8M", apy: "12.4%", volume: "$3.2M", fee: "0.3%" },
  { pair: "SOL/USDC", coins: ["SOL", "USDC"], risk: "Modern Risk", tvl: "$18.7M", apy: "21.6%", volume: "$4.8M", fee: "0.3%" },
  { pair: "BTC/USDT", coins: ["BTC", "USDT"], risk: "Modern Risk", tvl: "$32.4M", apy: "16.8%", volume: "$7.9M", fee: "0.3%" },
  { pair: "ARB/ETH", coins: ["ARB", "ETH"], risk: "Low Risk", tvl: "$10.6M", apy: "28.3%", volume: "$2.1M", fee: "0.3%" },
].map((p) => ({ ...p, icons: p.coins.map((c) => coin[c]) }));

export const yieldMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const pendingRewards = [
  { symbol: "USDC", pair: "ETH/USDC", icon: coin.USDC, usd: 86.24, amount: "= 86.24 USDC" },
  { symbol: "SOL", pair: "SOL/USDC", icon: coin.SOL, usd: 67.12, amount: "= 67.12 SOL" },
  { symbol: "ARB", pair: "ARB/ETH", icon: coin.ARB, usd: 42.36, amount: "= 42.36 ARB" },
  { symbol: "ETH", pair: "ETH/USDC", icon: coin.ETH, usd: 28.74, amount: "= 0.008 ETH" },
];

export const farmingActivity = [
  { title: "Liquidity Added", pair: "ETH/USDC", date: "Aug 18, 2026", time: "12:34 PM", amount: "+$5,000.00" },
  { title: "Reward Claimed", pair: "SOL/USDC", date: "Aug 18, 2026", time: "12:34 PM", amount: "+$126.75" },
  { title: "Position Rebalanced", pair: "ARB/ETH", date: "Aug 18, 2026", time: "12:34 PM", amount: "+$0.00" },
];
