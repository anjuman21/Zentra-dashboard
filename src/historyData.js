// Content for the History page (Figma frame 105:8464, mobile 165:2905).
const a = (name) => `/assets/${name}`;

export const hicons = {
  trend: a("h-trend.svg"),
};

export const historyStats = [
  { key: "balance", label: "Total Balance", value: "$124,458.94", change: "+5.35%", spark: a("spark-balance.svg") },
  { key: "pnl", label: "Total Profit/Loss", value: "+$2,340.12", change: "+18.35%", spark: a("spark-change.svg") },
  { key: "trades", label: "Total Trades", value: "128", change: "+12.5%", spark: a("spark-profit.svg") },
  { key: "win", label: "Win Rate", value: "62.45%", change: "+8.2%", spark: a("spark-best.svg") },
];

export const TYPES = ["Buy", "Sell", "Deposit", "Withdraw", "Swap", "Stake", "Unstake"];
export const STATUSES = ["Complete", "Pending", "Failed"];

const coin = {
  BTC: a("t-btc.svg"),
  ETH: a("t-eth.svg"),
  USDT: a("t-usdt.svg"),
  SOL: a("t-sol.svg"),
  AVAX: a("t-avax.svg"),
  MATIC: a("t-matic.svg"),
};

export const transactions = [
  { date: "Aug 18, 2026", time: "06:45 AM", type: "Buy", asset: "BTC", amount: "0.025 BTC", price: "$68,230.45", total: "$1,705.76", status: "Complete" },
  { date: "Aug 19, 2026", time: "07:30 AM", type: "Sell", asset: "ETH", amount: "1.50 ETH", price: "$3,246.12", total: "$4,869.18", status: "Complete" },
  { date: "Aug 20, 2026", time: "08:15 AM", type: "Deposit", asset: "USDT", amount: "2,000 USDT", price: "$1.00", total: "$2,000.00", status: "Complete" },
  { date: "Aug 21, 2026", time: "09:00 AM", type: "Withdraw", asset: "SOL", amount: "50 SOL", price: "$142.36", total: "$7,118.00", status: "Complete" },
  { date: "Aug 22, 2026", time: "09:45 AM", type: "Swap", asset: "AVAX", amount: "0.5 AVAX", price: "$36.24", total: "$18.12", status: "Complete" },
  { date: "Aug 23, 2026", time: "10:30 AM", type: "Buy", asset: "MATIC", amount: "120 MATIC", price: "$0.72", total: "$86.40", status: "Complete" },
  { date: "Aug 24, 2026", time: "11:15 AM", type: "Sell", asset: "BTC", amount: "0.01 BTC", price: "$67,215.12", total: "$672.15", status: "Complete" },
  { date: "Aug 25, 2026", time: "12:00 PM", type: "Stake", asset: "ETH", amount: "0.5 ETH", price: "$3,102.45", total: "$1,551.23", status: "Complete" },
  { date: "Aug 26, 2026", time: "12:45 PM", type: "Unstake", asset: "SOL", amount: "25 SOL", price: "$138.76", total: "$3,469.00", status: "Complete" },
  { date: "Aug 27, 2026", time: "01:30 PM", type: "Deposit", asset: "USDT", amount: "500 USDT", price: "$1.00", total: "$500.00", status: "Complete" },
].map((t) => ({ ...t, icon: coin[t.asset] }));

export const ASSETS = Object.keys(coin);

export const quickStats = [
  { label: "Total Deposits", value: "$8,420.00", change: "+12.5%" },
  { label: "Total Withdrawals", value: "$5,230.00", change: "+8.3%" },
  { label: "Total Fees", value: "$124.56", change: "-2.1%" },
];

export const trendY = ["$2.6T", "$2.4T", "$2.2T", "$2.0T", "$1.8T"];
export const trendMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const historyTopAssets = [
  { asset: "BTC", icon: a("w-btc.svg"), value: "$16,783.42", change: "+5.32%" },
  { asset: "ETH", icon: a("w-eth.svg"), value: "$3,994.63", change: "+12.21%" },
  { asset: "SOL", icon: a("w-ltc.svg"), value: "$2,736.00", change: "+9.11%" },
  { asset: "AVAX", icon: a("w-avax.svg"), value: "$1,800.00", change: "+0.01%" },
  { asset: "MATIC", icon: a("w-matic.svg"), value: "$230.40", change: "+6.21%" },
];
