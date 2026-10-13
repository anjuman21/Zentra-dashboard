// Content for the AI assistant page (Figma frame 156:960, mobile 172:16929).
const a = (name) => `/assets/${name}`;

export const aiicons = {
  orb: a("ai-orb.png"),
  grid: a("ai-grid.svg"),
  paid: a("i-paid.svg"),
  mic: a("i-mic.svg"),
  send: a("i-north-east.svg"),
  chevron: a("i-chevron-right-16.svg"),
  back: a("i-arrow-left.svg"),
};

export const MODES = ["Market insight", "Portfolio", "Trading"];
export const MODELS = ["Cortex 5.0", "Cortex 4.5"];

export const suggestions = ["How is my portfolio doing?", "Should i buy BTC?", "Analyze my recent trades?", "Market trends?"];

export const recentChats = [
  { q: "Is it a good time to but Ethereum?", when: "5 hours ago" },
  { q: "What are the risks of Ethereum?", when: "6 hours ago" },
  { q: "How does Ethereum compare to Bitcoin?", when: "6 hours ago" },
  { q: "Will Ethereum 2.0 impact prices soon?", when: "6 hours ago" },
  { q: "Best exchanges to buy Ethereum safely?", when: "6 hours ago" },
  { q: "Predictions for Ethereum market in 2024?", when: "7 hours ago" },
  { q: "Will Ethereum 2.0 impact prices?", when: "9 hours ago" },
  { q: "How will DeFi impact Ethereum?", when: "9 hours ago" },
  { q: "Will regulatory changes impact Ethereum?", when: "10 hours ago" },
  { q: "Will Ethereum face new competition?", when: "12 hours ago" },
];

// Noa is a front-end demo: answers are canned, picked by keyword.
const replies = [
  [/portfolio/i, "Your portfolio is worth $124,458.94, up 4.35% this month. BTC and ETH make up most of it, so a quick rebalance into stablecoins could lower your risk."],
  [/btc|bitcoin/i, "BTC is trading near $68,000 after triggering your price alert. Momentum is positive, but consider splitting any buy into smaller orders (DCA) to manage volatility."],
  [/trade|trades/i, "You made 12 trades this week with a 75% win rate. Your best trade was ETH/USDT (+$420). Most losses came from short holds under an hour."],
  [/trend|market/i, "Total market cap is up 2.1% today. Layer-2 tokens and DeFi lead the gains, while meme coins are cooling off."],
  [/eth|ethereum/i, "ETH is up 4.21% in the last hour. Watch the $2,480 support level; staking yield is around 3.45% APY if you plan to hold."],
];

export function noaReply(text) {
  const hit = replies.find(([re]) => re.test(text));
  return hit ? hit[1] : "Good question! I can look at prices, your portfolio, trades and market trends. Try asking about a coin or your recent performance.";
}
