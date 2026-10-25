// Content for the Stake page (Figma frame 119:8900, mobile 170:7392).
const a = (name) => `/assets/${name}`;

export const sicons = {
  spark: a("stake-spark.svg"),
  check: a("i-check.svg"),
};

// Prices, rates and lock terms per coin; what you hold lives in the stake store (stakeFlowData).
export const stakingAssets = [
  { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), apy: 4.32, price: 96183.23, lock: "Flexible", color: "#f7931a" },
  { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), apy: 3.45, price: 3218.73, lock: "Flexible", color: "#627eea" },
  { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), apy: 2.67, price: 187.4, lock: "14 Days", color: "#9945ff" },
  { name: "BNB", symbol: "BNB", icon: a("t-bnb.svg"), apy: 6.25, price: 612.35, lock: "1 Year", color: "#f3ba2f" },
  { name: "XRP", symbol: "XRP", icon: a("t-xrp.svg"), apy: 3.85, price: 2.41, lock: "7 Days", color: "#23292f" },
  { name: "Cardano", symbol: "ADA", icon: a("t-ada.svg"), apy: 5.75, price: 1.12, lock: "90 Days", color: "#d9d9d9" },
  { name: "Polkadot", symbol: "DOT", icon: a("t-dot.svg"), apy: 5.1, price: 7.84, lock: "30 Days", color: "#e6007a" },
  { name: "Dogecoin", symbol: "DOGE", icon: a("t-doge.svg"), apy: 4.1, price: 0.38, lock: "60 Days", color: "#c2a633" },
  { name: "Avalanche", symbol: "AVAX", icon: a("t-avax.svg"), apy: 3.32, price: 36.24, lock: "180 Days", color: "#e84142" },
  { name: "Chainlink", symbol: "LINK", icon: a("t-link.svg"), apy: 4.9, price: 22.19, lock: "Lifetime", color: "#2a5ada" },
];

export const stakeStats = [
  { label: "Total Staked", value: "$27,980.10", change: "+4.12%", spark: a("m-spark-cap.svg") },
  { label: "Rewards (30 days)", value: "$99.10", change: "+8.9%", spark: a("m-spark-vol.svg") },
  { label: "Avg. APY", value: "4.25%", change: "+0.12%", spark: a("m-spark-dom.svg") },
  { label: "Next Payout", value: "in 6h 12m", change: "daily", tone: "muted", spark: a("m-spark-active.svg") },
];

export const LOCK_FILTERS = ["Flexible", "Locked"];

export const rewards = [
  { symbol: "ETH", icon: a("w-eth.svg"), price: "$3,218.73", amount: "+0.0125 ETH", usd: "$40.23" },
  { symbol: "BNB", icon: a("w-bnb.svg"), price: "$612.35", amount: "+0.0828 BNB", usd: "$50.70" },
  { symbol: "DOT", icon: a("w-dot.svg"), price: "$7.84", amount: "+4.312 DOT", usd: "$33.81" },
  { symbol: "ADA", icon: a("w-ada.svg"), price: "$1.12", amount: "+9.81 ADA", usd: "$10.99" },
  { symbol: "BTC", icon: a("w-btc.svg"), price: "$96,183.23", amount: "+0.00021 BTC", usd: "$20.20" },
  { symbol: "ETH", icon: a("w-eth.svg"), price: "$3,218.73", amount: "+0.0094 ETH", usd: "$30.26" },
];

export const activity = [
  { title: "Staked 2.450 ETH", date: "Aug 18, 2026", time: "12:34 PM" },
  { title: "Rewards Received", date: "Aug 21, 2026", time: "08:22 AM" },
  { title: "Unstaked 1.000 SOL", date: "Aug 23, 2026", time: "03:12 PM" },
  { title: "Staked 500 ADA", date: "Aug 31, 2026", time: "11:34 AM" },
];
