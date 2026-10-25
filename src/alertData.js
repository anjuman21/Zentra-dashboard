// Content for the Alerts page (Figma frame 150:1974, mobile 170:14407).
import { openFlow } from "./flows";

const a = (name) => `/assets/${name}`;

export const alicons = {
  more: a("more-horiz.svg"),
};

export const alertTabs = ["All", "Unread", "Price", "Account", "System"];
export const alertTypes = ["Price", "Account", "Security", "System"];
export const alertAssets = ["BTC", "ETH", "SOL"];
export const alertStatuses = ["Unread", "Read"];

const BADGE = { Price: "purple", Security: "red", Account: "blue", Reward: "green", System: "purple" };
const row = (id, title, message, short, time, badge, type, asset, icon, unread, extra = {}) => ({ id, title, message, short, time, badge, tone: BADGE[badge], type, asset, icon: a(icon), unread, ...extra });

// type drives the tabs and filters; badge is the label shown on the row.
export const alerts = [
  row("btc-below", "BTC fell below $97,000", "Bitcoin (BTC) dropped below your $97,000 target. Now $96,183.23.", "BTC is below $97,000.", "Aug 18, 2026 • 10:42 AM", "Price", "Price", "BTC", "al-btc.svg", true, { rule: "btc-below", now: 96183.23, from: 97840.1, change: -1.69, window: "1h" }),
  row("eth-up", "ETH Price Increased", "Ethereum (ETH) is up by 4.21% in the last 1 hours", "ETH rose 4.21% in an hour.", "Aug 18, 2026 • 09:17 AM", "Price", "Price", "ETH", "al-up.svg", true, { rule: "eth-move", now: 3218.73, from: 3088.7, change: 4.21, window: "1h" }),
  row("eth-withdraw", "Large withdrawal Detected", "A withdrawal of 2.5 ETH (≈ $8,420) was sent to external wallet", "Withdrew 2.5 ETH to wallet.", "Aug 17, 2026 • 06:32 PM", "Security", "Security", "ETH", "al-wallet.svg", true),
  row("sol-down", "SOL price dropped", "Solana (SOL) fell by 6.12% in the last 3 hours", "SOL fell 6.12% in 3 hours.", "Aug 17, 2026 • 02:14 PM", "Price", "Price", "SOL", "al-down.svg", false, { rule: "sol-move", now: 187.4, from: 199.62, change: -6.12, window: "3h" }),
  row("maintenance", "System maintenance", "Scheduled maintenance will occur on Aug 20, 2026 (02:00 AM -  04:00 AM UTC)", "On Aug 20, 2026 (02:00 - 04:00)", "Aug 16, 2026 • 11:50 AM", "System", "System", null, "al-system.svg", false),
  row("btc-deposit", "Deposit Received", "You received 0.45 BTC (=$30,246) to your wallet.", "You received 0.45 BTC (=$30,246).", "Aug 15, 2026 • 08:23 PM", "Account", "Account", "BTC", "al-deposit.svg", false),
  row("eth-reward", "Staking reward", "You received 0.0125 ETH (=$42.16) as staking reward.", "You received 0.0125 ETH as a reward.", "Aug 14, 2026 • 03:12 PM", "Reward", "Account", "ETH", "al-reward.svg", false),
  row("market", "Market update", "Trading volume increased by 18.7% across all pairs.", "Trading volume rose 18.7%.", "Aug 13, 2026 • 10:05 AM", "System", "System", null, "al-market.svg", false),
];

// Rules that produce the alerts above.
export const alertRules = [
  { id: "btc-below", group: "Price", title: "BTC goes below $97,000", short: "BTC below $97,000", sub: "Fired today 10:42 AM · Once · finished", side: "Fired 10:42 AM · once", on: false, fired: true, icon: a("t-btc.svg"), coin: "BTC" },
  { id: "eth-move", group: "Price", title: "ETH moves ±4% in 1 hour", short: "ETH ±4% in 1 hour", sub: "Every time · last fired today 09:17 AM", side: "Every time · push", on: true, icon: a("t-eth.svg"), coin: "ETH" },
  { id: "sol-move", group: "Price", title: "SOL moves ±5% in 3 hours", short: "SOL ±5% in 3 hours", sub: "Every time · last fired Oct 18, 02:14 PM", side: "Every time · push", on: true, icon: a("t-sol.svg"), coin: "SOL" },
  { id: "withdrawals", group: "Account & security", title: "Withdrawals over $1,000", short: "Withdrawals over $1,000", sub: "In-app + push + email + SMS", side: "Push, email, SMS", on: true, locked: true, icon: a("al-wallet.svg") },
  { id: "devices", group: "Account & security", title: "Sign-in from a new device", short: "New-device sign-ins", sub: "In-app + push + email", side: "Push, email", on: true, locked: true, icon: a("hp-shield.svg") },
  { id: "staking", group: "Account & security", title: "Staking rewards", short: "Staking rewards", sub: "In-app · daily summary", side: "Daily summary", on: true, icon: a("al-reward.svg") },
  { id: "system", group: "System", title: "Maintenance & market updates", short: "Maintenance & market", sub: "In-app · email 24h before maintenance", side: "In-app, email", on: true, icon: a("al-system.svg") },
];

export const quickActions = [
  { label: "Create Price Alert", icon: a("qa-add.svg"), onClick: () => openFlow("alerts.create") },
  { label: "Manage Assets", icon: a("qa-wallet.svg"), onClick: () => (window.location.hash = "#/portfolio") },
  { label: "Notification settings", icon: a("qa-bell.svg"), onClick: () => openFlow("alerts.settings") },
  { label: "Alert history", icon: a("qa-history.svg"), onClick: () => openFlow("alerts.rules") },
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
