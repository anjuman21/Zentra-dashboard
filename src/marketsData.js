// Content for the Markets page (Figma frame 78:1922, mobile 156:10792).
const a = (name) => `/assets/${name}`;

export const micons = {
  tune: a("tune.svg"),
  chevronLeft: a("chevron-left.svg"),
  chevronRight: a("chevron-right.svg"),
  fearGreed: a("fg-gauge.svg"),
};

export const marketStats = [
  { label: "Global Market Cap", value: "$2.45T", change: "+3.25%", spark: a("m-spark-cap.svg") },
  { label: "24h Trading Volume", value: "$78.6B", change: "+12.45%", spark: a("m-spark-vol.svg") },
  { label: "BTC Dominance", value: "52.6%", change: "-0.35%", spark: a("m-spark-dom.svg") },
  { label: "Active Crypto", value: "12,856", change: "+3.45%", spark: a("m-spark-active.svg") },
];

export const marketTabs = ["All Cryptos", "Watchlists", "Top Gainers", "Top Losers", "New Listings"];

export const coins = [
  { name: "Bitcoin", symbol: "BTC", icon: a("t-btc.svg"), price: "$7.28", change24h: 12.34, change7d: 0.02, volume: "$1.23B", cap: "$2.83B", watch: true },
  { name: "Ethereum", symbol: "ETH", icon: a("t-eth.svg"), price: "$12.45", change24h: -3.21, change7d: 3.78, volume: "$987M", cap: "$5.45B", watch: true },
  { name: "Solana", symbol: "SOL", icon: a("t-sol.svg"), price: "$9.99", change24h: 0.13, change7d: 15.42, volume: "$2.34B", cap: "$3.67B", watch: true },
  { name: "BNB", symbol: "BNB", icon: a("t-bnb.svg"), price: "$15.60", change24h: 22.1, change7d: 22.15, volume: "$560M", cap: "$8.12B" },
  { name: "XRP", symbol: "XRP", icon: a("t-xrp.svg"), price: "$4.75", change24h: -8.76, change7d: 8.96, volume: "$1.75B", cap: "$1.89B" },
  { name: "Cardano", symbol: "ADA", icon: a("t-ada.svg"), price: "$20.00", change24h: 7.89, change7d: 10.34, volume: "$3.12B", cap: "$6.30B" },
  { name: "Polkadot", symbol: "DOT", icon: a("t-dot.svg"), price: "$2.14", change24h: 5.67, change7d: 24.35, volume: "$2.82B", cap: "$4.75B" },
  { name: "Dogecoin", symbol: "DOGE", icon: a("t-doge.svg"), price: "$1.75", change24h: 15.42, change7d: 18.23, volume: "$1.12B", cap: "$4.12B", isNew: true },
  { name: "Avalanche", symbol: "AVAX", icon: a("t-avax.svg"), price: "$0.89", change24h: -1.45, change7d: 13.21, volume: "$876.21M", cap: "$2.33B", isNew: true },
  { name: "Chainlink", symbol: "LINK", icon: a("t-link.svg"), price: "$462.35", change24h: 12.08, change7d: 12.08, volume: "$345.21M", cap: "$3.21B", isNew: true },
];

export const TOTAL_RESULTS = 100;
export const PAGE_SIZES = [10, 20, 50];

export const fearGreed = { value: 68, label: "Greed", yesterday: 62 };

export const trendingPairs = [
  { symbol: "BTC", icon: a("w-btc.svg"), value: "$96,183.23", change: "+12%" },
  { symbol: "ETH", icon: a("w-eth.svg"), value: "$3,218.73", change: "-8%" },
  { symbol: "SOL", icon: a("w-ltc.svg"), value: "$3,218.73", change: "-8%" },
  { symbol: "BNB", icon: a("w-bnb.svg"), value: "$236.21", change: "+20%" },
  { symbol: "XRP", icon: a("w-xrp.svg"), value: "$627.18", change: "+12%" },
  { symbol: "DOT", icon: a("w-dot.svg"), value: "$432.50", change: "-8%" },
  { symbol: "DOGE", icon: a("w-doge.svg"), value: "$789.34", change: "+23%" },
  { symbol: "ADA", icon: a("w-ada.svg"), value: "$1.12", change: "+5%" },
];
