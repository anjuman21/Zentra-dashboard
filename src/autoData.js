// Content for the Automations page (Figma frame 132:2711, mobile 170:11535).
const a = (name) => `/assets/${name}`;

export const auicons = {
  gauge: a("au-gauge.svg"),
};

export const autoStats = [
  { label: "Active Automations", value: "5/8", change: "+2 this week", spark: a("au-spark-1.svg") },
  { label: "Total Run", value: "142", change: "+18%", spark: a("au-spark-2.svg") },
  { label: "Success Rate", value: "96.5%", change: "5 failed", tone: "down", spark: a("m-spark-dom.svg") },
  { label: "Estimated Savings", value: "$284.32", change: "+12.6%", spark: a("au-spark-4.svg") },
];

export const SORTS = ["Last Run", "Next Run", "Name", "Status"];

const r = (name, desc, coin, trigger, triggerSub, action, pair, status, next, nextSub, order, rule) => ({
  name,
  desc,
  icon: a(`t-${coin.toLowerCase()}.svg`),
  trigger,
  triggerSub,
  action,
  asset: coin === "PORTFOLIO" ? "Portfolio" : coin,
  pair,
  assetIcon: coin === "PORTFOLIO" ? a("i-donut.svg") : a(`t-${coin.toLowerCase()}.svg`),
  status,
  next,
  nextSub,
  order,
  ...rule,
});

// Each rule also carries what it does in plain words and its recent runs (shown in the detail drawer).
export const automations = [
  r("BTC price alert & buy", "Buy BTC when price drop", "BTC", "Price <= $110,000", "(−4.3% from now)", "Buy $500", "/USDT", "Active", "When triggered", "Now $96,183", 3, {
    kind: "Price ≤",
    rule: "When BTC is at or below $110,000, buy 500 USDT of BTC at market. Max 2,000 USDT a week.",
    limits: "500 USDT per run · 2,000 USDT a week",
    created: "Jul 28, 2026",
    stats: { value: 1496.2, invested: 1500, runs: 3, holding: "0.01556 BTC", avg: "$96,410.00" },
    runs: [["Bought @ $96,183.23", "Oct 17, 2026 · 02:14 PM", "+0.00520 BTC", "500.00 USDT"], ["Bought @ $96,840.10", "Sep 30, 2026 · 09:02 AM", "+0.00516 BTC", "500.00 USDT"], ["Bought @ $96,208.50", "Sep 02, 2026 · 06:40 PM", "+0.00520 BTC", "500.00 USDT"]],
  }),
  r("Daily portfolio rebalance", "Keep target allocation", "ETH", "Daily at 09:00 AM", "(UTC)", "Rebalance", "6 assets", "Active", "Oct 20, 09:00 AM", "Daily", 2, {
    kind: "Schedule",
    rule: "Every day at 09:00 UTC, move holdings back to your target weights when any asset drifts more than 5%.",
    limits: "Max 10% of portfolio per run",
    created: "Jun 30, 2026",
    stats: { value: 39551.76, invested: 38200, runs: 64, holding: "6 assets", avg: "Drift 1.8%" },
    runs: [["Moved ETH → BTC", "Oct 19, 2026 · 09:00 AM", "$1,240", "Drift 5.4%"], ["No change needed", "Oct 18, 2026 · 09:00 AM", "$0", "Drift 2.1%"], ["Moved SOL → USDT", "Oct 17, 2026 · 09:00 AM", "$860", "Drift 6.2%"]],
  }),
  r("ETH DCA", "Buy ETH on schedule", "ETH", "Every 3 days", "(08:00 AM UTC)", "Buy $250", "/USDT", "Active", "Oct 21, 08:00 AM", "Every 3 Days", 5, {
    kind: "Schedule",
    rule: "Every 3 days at 08:00 UTC, buy 250 USDT of ETH at market. Skip a run if USDT is below 250.",
    limits: "250 USDT per run · no weekly cap",
    created: "Aug 06, 2026",
    stats: { value: 4455.37, invested: 4500, runs: 18, holding: "1.3842 ETH", avg: "$3,251.00" },
    runs: [["Bought @ $3,218.73", "Oct 18, 2026 · 08:00 AM", "+0.0777 ETH", "250.00 USDT"], ["Bought @ $3,078.20", "Oct 15, 2026 · 08:00 AM", "+0.0812 ETH", "250.00 USDT"], ["Bought @ $3,132.90", "Oct 12, 2026 · 08:00 AM", "+0.0798 ETH", "250.00 USDT"], ["Bought @ $3,105.60", "Oct 09, 2026 · 08:00 AM", "+0.0805 ETH", "250.00 USDT"]],
  }),
  r("Take profit strategy", "Sell when target reached", "SOL", "Price ≥ $215", "(+15% from $187)", "Sell 25%", "/USDT", "Active", "When triggered", "Now $187.40", 6, {
    kind: "Price ≥",
    rule: "When SOL reaches $215, sell 25% of your SOL at market. Runs once.",
    limits: "25% of holdings · once",
    created: "Sep 22, 2026",
    stats: { value: 4375, invested: 4375, runs: 0, holding: "23.35 SOL", avg: "Target $215" },
    runs: [],
  }),
  r("Stop loss protection", "Protect from downside", "ADA", "Price ≤ $1.06", "(−5% from $1.12)", "Sell all", "/USDT", "Paused", "Paused", "Since Oct 14", 7, {
    kind: "Price ≤",
    rule: "When ADA falls to $1.06, sell all 1,250 ADA at market.",
    limits: "1,250 ADA · once",
    created: "Sep 10, 2026",
    stats: { value: 1400, invested: 1400, runs: 0, holding: "1,250 ADA", avg: "Stop $1.06" },
    runs: [],
    protects: "1,250 ADA · $1,400.00",
  }),
  r("Auto compound", "Reinvest rewards", "BNB", "Daily at 11:00 PM", "(UTC)", "Compound", "Staking", "Active", "Oct 19, 11:00 PM", "Daily", 1, {
    kind: "Rewards",
    rule: "Every day at 23:00 UTC, restake any BNB staking rewards back into your BNB stake.",
    limits: "Rewards only",
    created: "Jul 12, 2026",
    stats: { value: 7333.9, invested: 7200, runs: 98, holding: "11.976 BNB", avg: "+0.021 BNB/day" },
    runs: [["Restaked rewards", "Oct 18, 2026 · 11:00 PM", "+0.0214 BNB", "Staking"], ["Restaked rewards", "Oct 17, 2026 · 11:00 PM", "+0.0211 BNB", "Staking"]],
  }),
  r("XRP price alert", "Notify on price change", "XRP", "Moves ±3%", "(from $2.42)", "Notify", "/USDT", "Paused", "Paused", "Since Oct 10", 8, {
    kind: "Price move",
    rule: "When XRP moves 3% either way from $2.42, send you a push notification.",
    limits: "Notify only",
    created: "Aug 30, 2026",
    stats: { value: 0, invested: 0, runs: 7, holding: "—", avg: "Last ±3.4%" },
    runs: [["Notified · −3.4%", "Oct 09, 2026 · 04:12 PM", "$2.34", "Push"]],
  }),
  r("Link Volatility trade", "Trade on high vloatility", "LINK", "Volatility > 5%", "(1h)", "Buy $300", "/USDT", "Failed", "Needs attention", "Failed at 08:12 AM", 4, {
    kind: "Volatility",
    rule: "When LINK moves more than 5% in an hour, buy 300 USDT of LINK at market.",
    limits: "300 USDT per run",
    created: "Sep 05, 2026",
    stats: { value: 1820.4, invested: 1800, runs: 9, holding: "82.04 LINK", avg: "$21.94" },
    runs: [["Didn’t run · not enough USDT", "Oct 19, 2026 · 08:12 AM", "0.00 USDT", "Failed"], ["Bought @ $21.40", "Oct 02, 2026 · 01:22 PM", "+14.02 LINK", "300.00 USDT"]],
  }),
];

export const health = {
  score: 72,
  label: "Good",
  stats: [
    { label: "Optimised Positions", value: "4/6" },
    { label: "Active Strategies", value: "5/7" },
    { label: "Est. Monthly Yield", value: "+$284.32" },
  ],
};

export const executions = [
  { title: "Daily rebalance", pair: "Moved ETH → BTC", date: "Aug 19, 2026", time: "10:34 AM", amount: "$1,240", status: "Success", icon: a("t-eth.svg"), auto: "Daily portfolio rebalance", order: "Rebalance · ETH → BTC", fill: "$3,218.73" },
  { title: "LINK volatility trade", pair: "Not enough USDT", date: "Aug 29, 2026", time: "09:34 AM", amount: "0.00 USDT", status: "Failed", icon: a("t-link.svg"), auto: "Link Volatility trade" },
  { title: "Auto compound", pair: "BNB staking rewards", date: "Aug 29, 2026", time: "08:12 AM", amount: "+0.0214 BNB", status: "Success", icon: a("t-bnb.svg"), auto: "Auto compound", order: "Restake · BNB", fill: "$612.35" },
  { title: "Daily rebalance", pair: "Moved SOL → USDT", date: "Aug 29, 2026", time: "06:41 AM", amount: "$860", status: "Success", icon: a("t-sol.svg"), auto: "Daily portfolio rebalance", order: "Rebalance · SOL → USDT", fill: "$187.40" },
  { title: "ETH DCA", pair: "Bought @ $3,218.73", date: "Aug 18, 2026", time: "12:50 PM", amount: "+0.0777 ETH", status: "Pending", icon: a("t-eth.svg"), auto: "ETH DCA", order: "Market buy · ETH/USDT", fill: "$3,218.73" },
  { title: "Auto compound", pair: "BNB staking rewards", date: "Aug 18, 2026", time: "12:55 PM", amount: "+0.0211 BNB", status: "Success", icon: a("t-bnb.svg"), auto: "Auto compound", order: "Restake · BNB", fill: "$612.35" },
];
