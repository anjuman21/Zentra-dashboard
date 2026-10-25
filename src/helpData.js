// Content for Help & Docs (Figma 689:67023, mobile 539:68030) and its flows H1–H5.
const a = (name) => `/assets/${name}`;

export const hicons = {
  flag: a("hp-flag.svg"),
  swap: a("hp-swap.svg"),
  candle: a("hp-candle.svg"),
  savings: a("hp-savings.svg"),
  bell: a("hp-bell.svg"),
  shield: a("hp-shield.svg"),
  article: a("hp-article.svg"),
  articleSm: a("hp-article-sm.svg"),
  dotGreen: a("hp-dot-green.svg"),
  dotOrange: a("hp-dot-orange.svg"),
  grid: a("hp-grid.svg"),
  error: a("hp-error.svg"),
  close: a("hp-close.svg"),
  history: a("hp-history.svg"),
  searchOff: a("hp-search-off.svg"),
  eth: a("hp-eth.svg"),
  check: a("hp-check.svg"),
  add: a("hp-add.svg"),
  send: a("hp-send.svg"),
  back: a("hp-back.svg"),
  chevron: a("i-chevron-right-16.svg"),
  more: a("more-horiz.svg"),
  search: a("search.svg"),
  mic: a("i-mic.svg"),
  northEast: a("i-north-east.svg"),
  orb: a("ai-orb.png"),
};

export const POPULAR_SEARCHES = ["Withdrawal limits", "Trading fees", "Two-factor (2FA)", "Staking rewards"];

export const TOPICS = [
  { id: "getting-started", title: "Getting started", desc: "Setup, verify, deposit.", count: 12, icon: hicons.flag },
  { id: "deposits", title: "Deposits & withdrawals", desc: "Networks, limits and delays", count: 18, icon: hicons.swap, small: true },
  { id: "trading", title: "Trading", desc: "Order types, fees and pairs", count: 15, icon: hicons.candle },
  { id: "staking", title: "Staking & yield", desc: "Rewards, lock periods and risks", count: 11, icon: hicons.savings },
  { id: "automations", title: "Automations & alerts", desc: "Rules, limits and notifications", count: 9, icon: hicons.bell },
  { id: "security", title: "Security", desc: "2FA, devices and phishing", count: 14, icon: hicons.shield },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id) || TOPICS[1];

// Every article the help centre can open; `snippet` is the line shown in search results.
export const ARTICLES = [
  {
    id: "withdrawal-pending",
    title: "Why is my withdrawal pending?",
    topic: "deposits",
    group: "Withdrawals",
    read: 3,
    views: "2.4k",
    snippet: "If you’ve hit your daily limit, the withdrawal waits until 00:00 UTC…",
  },
  {
    id: "withdrawal-limits",
    title: "Withdrawal limits by account level",
    topic: "deposits",
    group: "Withdrawals",
    read: 2,
    views: "1.1k",
    snippet: "Each level has a daily withdrawal limit. Level 2: $50,000 a day…",
  },
  { id: "cancel-withdrawal", title: "Cancel a withdrawal", topic: "deposits", group: "Withdrawals", read: 2, snippet: "You can cancel while the status is Pending…" },
  {
    id: "new-address",
    title: "Withdraw to a new address safely",
    topic: "deposits",
    group: "Withdrawals",
    read: 3,
    snippet: "New addresses are held for a short security review…",
  },
  {
    id: "limit-reset",
    title: "When does my daily withdrawal limit reset?",
    topic: "deposits",
    group: "Withdrawals",
    read: 1,
    snippet: "Daily limits reset at 00:00 UTC, whatever your time zone…",
  },
  {
    id: "sub-account-limits",
    title: "Withdrawal limits for sub-accounts",
    topic: "deposits",
    group: "Withdrawals",
    read: 2,
    snippet: "Sub-accounts share the main account’s daily limit…",
  },
  { id: "deposit-wallet", title: "Deposit crypto from another wallet", topic: "deposits", group: "Deposits", read: 3, snippet: "Copy your deposit address and pick the same network…" },
  { id: "deposit-missing", title: "My deposit hasn’t arrived", topic: "deposits", group: "Deposits", read: 4, snippet: "Check the confirmations on a block explorer…" },
  { id: "deposit-minimum", title: "Minimum deposit amounts", topic: "deposits", group: "Deposits", read: 1, snippet: "Amounts below the minimum aren’t credited…" },
  { id: "right-network", title: "Choose the right network", topic: "deposits", group: "Networks & fees", read: 3, snippet: "Sending on the wrong network can lose funds…" },
  { id: "network-fees", title: "Network fees explained", topic: "deposits", group: "Networks & fees", read: 4, views: "860", snippet: "Network fees go to miners and validators, not Zentra…" },
  {
    id: "raise-limit",
    title: "Raise your withdrawal limit",
    topic: "getting-started",
    group: "Verification",
    read: 3,
    snippet: "Verify your address to move to Level 3 and withdraw up to $250,000…",
  },
  { id: "trading-fees", title: "How trading fees are calculated", topic: "trading", group: "Fees", read: 4, snippet: "Maker and taker fees depend on your 30-day volume…" },
  { id: "setup-2fa", title: "Set up two-factor authentication", topic: "security", group: "2FA", read: 2, snippet: "Use an authenticator app (2FA) or a passkey for every sign-in…" },
  {
    id: "api-withdrawals",
    title: "Limits for API withdrawals",
    topic: "security",
    group: "API keys",
    read: 3,
    snippet: "API keys with withdraw permission share your account’s daily limit…",
  },
  { id: "staking-rewards", title: "How staking rewards are paid", topic: "staking", group: "Rewards", read: 3, snippet: "Rewards land every week and show in History…" },
];

// The topic page lists a few per group and links to the full count.
export const GROUP_TOTALS = { Withdrawals: 6, Deposits: 7, "Networks & fees": 5 };
export const GROUP_PREVIEW = { Withdrawals: 4, Deposits: 3, "Networks & fees": 2 };

export const articleById =(id) => ARTICLES.find((x) => x.id === id) || ARTICLES[0];

export const POPULAR_ARTICLES = ["withdrawal-pending", "trading-fees", "setup-2fa"];
export const MOST_READ = ["withdrawal-pending", "withdrawal-limits", "network-fees"];
export const RELATED = ["withdrawal-limits", "new-address", "network-fees"];

// H1 · the article body.
export const ARTICLE_BODY = {
  intro: "Most withdrawals arrive in under 10 minutes. If yours says Pending for longer, it’s usually one of these four reasons.",
  sections: [
    {
      id: "network",
      title: "The network is busy",
      text: "Withdrawals wait for network confirmations. ETH needs 12 (about 3 minutes); when the network is congested this can take up to 30 minutes.",
    },
    {
      id: "security",
      title: "A security check is running",
      text: "Large amounts or a new address can trigger a review of up to 1 hour. We’ll send you an alert if we need anything.",
    },
    { id: "limit", title: "You’ve hit your daily limit", text: "Level 2 accounts can withdraw up to $50,000 a day. The limit resets at 00:00 UTC." },
    { id: "maintenance", title: "Network maintenance", text: "Check System status — ETH withdrawals are delayed right now." },
  ],
  steps: [
    "Open History → Withdrawals and check the status",
    "Copy the transaction hash and look it up on a block explorer",
    "Still pending after 1 hour? Chat with support",
  ],
  warning: "Zentra Support will never ask for your 2FA code or password.",
  helpful: 142,
};

export const SYSTEM_STATUS = [
  { label: "Trading", status: "Operational", ok: true },
  { label: "Deposits", status: "Operational", ok: true },
  { label: "Withdrawals", status: "Delayed · ETH", ok: false },
  { label: "Staking", status: "Operational", ok: true },
];

export const TICKETS = [
  { id: "#ZX-4821", title: "Withdrawal pending", status: "In progress", tone: "blue" },
  { id: "#ZX-4410", title: "Fee refund request", status: "Resolved", tone: "green" },
];

export const RECENT_SEARCHES = ["withdrawal limit", "2fa reset", "staking apy", "fees"];

// H5 · the support conversation, ending with the agent typing.
export const CHAT = [
  { from: "me", text: "My 2.5 ETH withdrawal has been pending since yesterday at 6:32 PM." },
  { from: "agent", text: "Thanks — I can see it. It went to a new address, so it was held for a security review. I’ve approved it now." },
  { from: "agent", text: "It’s processing on the Ethereum network:" },
  { from: "agent", status: { title: "Approved · processing", sub: "Arrives in about 10 minutes" }, avatar: true },
  { from: "me", text: "Great, thank you!" },
];

export const TICKET_DETAIL = [
  ["Category", "Withdrawals"],
  ["Created", "Oct 18, 06:40 PM"],
  ["Priority", "High"],
  ["Agent", "Maya S."],
];

// Words shorter than three letters are ignored; every other word must start a word in the article.
export function searchArticles(query) {
  // Plurals match their singular ("limits" finds "limit").
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2)
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
  if (!words.length) return [];
  return ARTICLES.filter((x) => {
    const hay = `${x.title} ${x.snippet} ${topicById(x.topic).title}`.toLowerCase();
    const tokens = hay.split(/[^a-z0-9]+/);
    return words.every((w) => tokens.some((t) => t.startsWith(w)));
  });
}

export function searchTopics(query) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  if (!words.length) return [];
  return TOPICS.filter((t) => words.every((w) => `${t.title} ${t.desc}`.toLowerCase().includes(w)));
}
