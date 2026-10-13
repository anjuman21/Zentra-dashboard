// Content for the Stake page (Figma frame 119:8900, mobile 170:7392).
const a = (name) => `/assets/${name}`;

export const sicons = {
  spark: a("stake-spark.svg"),
  check: a("i-check.svg"),
};

export const stakingAssets = [
  { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), apy: "4.32%", staked: "1.875 BTC", stakedUsd: "$5,495.63", rewards: "0.840 BTC", rewardsUsd: "$57,467.60", lock: "Flexible" },
  { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), apy: "3.45%", staked: "3.900 ETH", stakedUsd: "$11,423.78", rewards: "0.105 ETH", rewardsUsd: "$7,183.45", lock: "Flexible" },
  { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), apy: "2.67%", staked: "0.310 SOL", stakedUsd: "$909.34", rewards: "0.630 SOL", rewardsUsd: "$43,100.70", lock: "14 Days" },
  { name: "BNB", symbol: "BNB", icon: a("t-bnb.svg"), apy: "6.25%", staked: "2.980 BNB", stakedUsd: "$8,729.44", rewards: "0.420 BNB", rewardsUsd: "$28,733.80", lock: "1 Year" },
  { name: "XRP", symbol: "XRP", icon: a("t-xrp.svg"), apy: "3.85%", staked: "0.750 XRP", stakedUsd: "$2,197.50", rewards: "0.945 XRP", rewardsUsd: "$64,651.05", lock: "7 Days" },
  { name: "Cardano", symbol: "ADA", icon: a("t-ada.svg"), apy: "5.75%", staked: "4.600 ADA", stakedUsd: "$13,475.92", rewards: "1.050 ADA", rewardsUsd: "$71,834.50", lock: "90 Days" },
  { name: "Polkadot", symbol: "DOT", icon: a("t-dot.svg"), apy: "5.10%", staked: "1.120 DOT", stakedUsd: "$3,283.12", rewards: "0.735 DOT", rewardsUsd: "$50,284.15", lock: "30 Days" },
  { name: "Dogecoin", symbol: "DOGE", icon: a("t-doge.svg"), apy: "4.10%", staked: "0.540 DODGE", stakedUsd: "$1,582.09", rewards: "0.210 DODGE", rewardsUsd: "$14,366.90", lock: "60 Days" },
  { name: "Avalanche", symbol: "AVAX", icon: a("t-avax.svg"), apy: "3.32%", staked: "2.450 AVAX", stakedUsd: "$7,183.45", rewards: "0.525 AVAX", rewardsUsd: "$35,917.25", lock: "180 Days" },
  { name: "Chainlink", symbol: "LINK", icon: a("t-link.svg"), apy: "4.90%", staked: "3.300 LINK", stakedUsd: "$9,666.30", rewards: "0.315 LINK", rewardsUsd: "$21,550.35", lock: "Lifetime" },
];

export const LOCK_FILTERS = ["Flexible", "Locked"];

export const stakePortfolio = {
  value: "$124,456.21",
  change: "+5.32%",
  stats: [
    { label: "Active Stakes", value: "5" },
    { label: "Total Rewards", value: "$342.18" },
    { label: "Est. APY", value: "8.42%" },
  ],
};

export const rewards = [
  { symbol: "ETH", icon: a("w-eth.svg"), price: "$10.23", amount: "+0.0125 ETH", usd: "$38.21" },
  { symbol: "SOL", icon: a("w-sol.svg"), price: "$64.32", amount: "+2.450 SOL", usd: "$27.15" },
  { symbol: "DOT", icon: a("w-dot.svg"), price: "$18.45", amount: "+18.24 ADA", usd: "$38.21" },
  { symbol: "ADA", icon: a("w-ada.svg"), price: "$12.45", amount: "+3.12 DOT", usd: "$61.88" },
  { symbol: "BTC", icon: a("w-btc.svg"), price: "$28,400", amount: "+0.005 BTC", usd: "$142.00" },
  { symbol: "LTC", icon: a("w-ltc.svg"), price: "$85.22", amount: "+7.56 LTC", usd: "$644.67" },
];

export const activity = [
  { title: "Staked 2.450 ETH", date: "Aug 18, 2026", time: "12:34 PM" },
  { title: "Rewards Received", date: "Aug 21, 2026", time: "08:22 AM" },
  { title: "Unstaked 1.000 SOL", date: "Aug 23, 2026", time: "03:12 PM" },
  { title: "Staked 500 ADA", date: "Aug 31, 2026", time: "11:34 AM" },
];
