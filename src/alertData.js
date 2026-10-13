// Content for the Alerts page (Figma frame 150:1974, mobile 170:14407).
const a = (name) => `/assets/${name}`;

export const alicons = {
  more: a("more-horiz.svg"),
};

export const alertTabs = ["All Cryptos", "Watchlists", "Top Gainers", "Top Losers", "New Listings"];
export const alertTypes = ["All Types", "Price Alert", "Transaction", "System", "Reward", "Market"];
export const alertAssets = ["All Assets", "BTC", "ETH", "SOL"];
export const alertStatuses = ["All Status", "Unread", "Read"];

// tone picks the badge colour; tabs say which list tabs include the alert.
export const alerts = [
  {
    id: "btc-trigger",
    title: "BTC price alert Triggered",
    message: "Bitcoin (BTC) reached your target price of $68.000",
    short: "Bitcoin hit $68,000.",
    time: "Aug 18, 2026 • 10:42 AM",
    badge: "Triggered",
    type: "Price Alert",
    tone: "purple",
    asset: "BTC",
    icon: a("al-btc.svg"),
    unread: true,
    tabs: ["Watchlists", "Top Gainers"],
  },
  {
    id: "eth-up",
    title: "ETH Price Increased",
    message: "Ethereum (ETH) is up by 4.21% in the last 1 hours",
    short: "ETH rose 4.21% in an hour.",
    time: "Aug 18, 2026 • 09:17 AM",
    badge: "Price Alert",
    type: "Price Alert",
    tone: "green",
    asset: "ETH",
    icon: a("al-up.svg"),
    tabs: ["Watchlists", "Top Gainers"],
  },
  {
    id: "eth-withdraw",
    title: "Large withdrawal Detected",
    message: "A withdrawal of 2.5 ETH (≈ $8,420) was sent to external wallet",
    short: "Withdrew 2.5 ETH to wallet.",
    time: "Aug 17, 2026 • 06:32 PM",
    badge: "Transaction",
    type: "Transaction",
    tone: "blue",
    asset: "ETH",
    icon: a("al-wallet.svg"),
    tabs: ["Watchlists"],
  },
  {
    id: "sol-down",
    title: "SOL price dropped",
    message: "Solana (SOL) fell by 6.12% in the last 3 hours",
    short: "SOL fell 6.12% in 3 hours.",
    time: "Aug 17, 2026 • 02:14 PM",
    badge: "Price Alert",
    type: "Price Alert",
    tone: "red",
    asset: "SOL",
    icon: a("al-down.svg"),
    tabs: ["Watchlists", "Top Losers"],
  },
  {
    id: "maintenance",
    title: "System maintenance",
    message: "Scheduled maintenance will occur on Aug 20, 2026 (02:00 AM -  04:00 AM UTC)",
    short: "On Aug 20, 2026 (02:00 - 04:00)",
    time: "Aug 16, 2026 • 11:50 AM",
    badge: "System",
    type: "System",
    tone: "purple",
    asset: null,
    icon: a("al-system.svg"),
    tabs: [],
  },
  {
    id: "btc-deposit",
    title: "Deposit Received",
    message: "You received 0.45 BTC (=$30,246) to your wallet.",
    short: "You received 0.45 BTC (=$30,246) to your wallet.",
    time: "Aug 15, 2026 • 08:23 PM",
    badge: "Transaction",
    type: "Transaction",
    tone: "blue",
    asset: "BTC",
    icon: a("al-deposit.svg"),
    tabs: ["Watchlists"],
  },
  {
    id: "eth-reward",
    title: "Staking reward",
    message: "You received 0.0125 ETH (=$42.16) as staking reward.",
    short: "You received 0.0125 ETH (=$42.16) as staking reward.",
    time: "Aug 14, 2026 • 03:12 PM",
    badge: "Reward",
    type: "Reward",
    tone: "green",
    asset: "ETH",
    icon: a("al-reward.svg"),
    tabs: ["Watchlists"],
  },
  {
    id: "market",
    title: "Market update",
    message: "Trading volume increased by 18.7% across all pairs.",
    short: "Trading volume increased by 18.7% across all pairs.",
    time: "Aug 13, 2026 • 10:05 AM",
    badge: "Market",
    type: "Market",
    tone: "purple",
    asset: null,
    icon: a("al-market.svg"),
    tabs: ["New Listings"],
  },
];

export const quickActions = [
  { label: "Create Price Alert", icon: a("qa-add.svg") },
  { label: "Manage Assets", icon: a("qa-wallet.svg") },
  { label: "Notification settings", icon: a("qa-bell.svg") },
  { label: "Alert history", icon: a("qa-history.svg") },
];

export const alertSummary = [
  { label: "Total Alerts", value: 12, icon: a("sum-bell.svg") },
  { label: "Price", value: 6, icon: a("sum-price.svg") },
  { label: "Transaction", value: 3, icon: a("sum-tx.svg") },
  { label: "System", value: 3, icon: a("sum-system.svg") },
];

export const recentAlerts = [
  { title: "BTC reached $68,000", time: "09:34 AM", badge: "Triggered", tone: "purple", icon: a("ra-btc.svg") },
  { title: "ETH is up 4.21%", time: "09:17 AM", badge: "Price Alert", tone: "green", icon: a("ra-up.svg") },
  { title: "2.5 ETH withdrawal", time: "06:32 PM", badge: "Transaction", tone: "blue", icon: a("ra-tx.svg") },
  { title: "SOL dropped 6.12%", time: "02:14 PM", badge: "Price Alert", tone: "red", icon: a("ra-down.svg") },
  { title: "Staking reward received", time: "03:12 PM", badge: "Reward", tone: "green", icon: a("ra-reward.svg") },
  { title: "CryptoKitty #4521", time: "11:45 AM", badge: "NFT Alert", tone: "red", icon: a("ra-nft.svg") },
];
