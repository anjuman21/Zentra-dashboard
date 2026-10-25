// Content for Settings (Figma 703:77033, mobile 742:159251) and its flows S1–S6.
const a = (name) => `/assets/${name}`;

export const sicons = {
  profile: a("hp-article.svg"),
  shield: a("st-shield.svg"),
  shieldBlue: a("st-shield-blue.svg"),
  eye: a("st-eye.svg"),
  tune: a("st-tune.svg"),
  encrypted: a("st-encrypted.svg"),
  lock: a("st-lock.svg"),
  linked: a("st-linked.svg"),
  passkey: a("st-passkey.svg"),
  schedule: a("ob-schedule.svg"),
  ticket: a("sg-ticket.svg"),
  key: a("st-key.svg"),
  copy: a("st-copy.svg"),
  add: a("st-add.svg"),
  check: a("st-check.svg"),
  checkWhite: a("st-check-white.svg"),
  error: a("hp-error.svg"),
  errorRed: a("st-error-red.svg"),
  chevron: a("i-chevron-right-16.svg"),
  language: a("language.svg"),
  moon: a("dark-mode.svg"),
  help: a("ob-help.svg"),
  logout: a("logout.svg"),
  avatar: a("avatar.png"),
  dotGreen: a("hp-dot-green.svg"),
  dotOrange: a("hp-dot-orange.svg"),
};

// Desktop tabs; `route` is the sub-path under #/settings.
export const TABS = [
  { key: "profile", label: "Profile", icon: sicons.profile, route: "" },
  { key: "security", label: "Security", icon: sicons.shield, route: "security" },
  { key: "notifications", label: "Notifications", icon: sicons.eye, route: "notifications" },
  { key: "preferences", label: "Preferences", icon: sicons.tune, route: "preferences" },
  { key: "ai", label: "AI & privacy", icon: sicons.encrypted, route: "ai" },
  { key: "api", label: "API keys", icon: sicons.lock, route: "api" },
  { key: "linked", label: "Linked accounts", icon: sicons.linked, route: "linked" },
];

export const PROFILE = {
  name: "Itachi Uchiha",
  display: "itachi.u",
  email: "itachi.uchiha@gmail.com",
  phone: "+1 ••• ••• 4821",
  since: "Member since 2024",
};

export const LANGUAGES = ["English (United States)", "English (UK)", "বাংলা", "Español", "Deutsch"];
export const CURRENCIES = ["USD — US Dollar", "EUR — Euro", "GBP — British Pound", "BDT — Bangladeshi Taka"];
export const TIMEZONES = ["UTC−05:00 · New York", "UTC+00:00 · London", "UTC+06:00 · Dhaka", "UTC+09:00 · Tokyo"];

export const DEVICES = [
  { name: "MacBook Pro · Chrome", meta: "This device · now", current: true },
  { name: "iPhone 15 · Zentra app", meta: "Active 2 hours ago" },
];

export const ACTIVITY = [
  { title: "Sign-in from a new device", meta: "Chrome on Windows · Oct 18, 06:20 PM", warn: true },
  { title: "Withdrawal approved", meta: "2.5 ETH · Oct 19, 11:05 AM" },
  { title: "2FA code used", meta: "MacBook Pro · Oct 19, 09:58 AM" },
  { title: "Password changed", meta: "Jul 02, 2026" },
];

export const NOA_ACCESS = [
  { title: "Read your portfolio", meta: "“How is my portfolio ...” · Today 10:45 AM" },
  { title: "Read BTC price & your balance", meta: "“Should I buy BTC…” · Today 10:47 AM" },
  { title: "Read trade history", meta: "“Is my ADA stop loss too tight?” · Oct 16" },
];

export const NOA_PERMISSIONS = [
  { key: "portfolio", title: "Portfolio & balances", sub: "Used when you add it to a chat or ask about your portfolio", on: true },
  { key: "trades", title: "Trade history", sub: "Your last 90 days of trades, for reviews and tax questions", on: true },
  { key: "alerts", title: "Alerts & automations", sub: "Lets Noa explain why a rule fired or suggest a new one", on: false },
  { key: "improve", title: "Use my chats to improve Noa", sub: "Off by default. Chats are anonymised before review.", on: false },
];

export const NOA_PROMISES = [
  "Never trades or moves money for you",
  "Never shares your data with other users",
  "You can see and delete everything here",
];

// `ips` is the allowlist; perms decide the coloured chips.
export const API_KEYS = [
  { id: "tv", name: "TradingView bot", key: "zx_live_8f3a…c21d", perms: ["Read", "Trade"], ips: 2, used: "Last used 5 min ago", created: "Created Sep 02, 2026" },
  { id: "koinly", name: "Koinly tax report", key: "zx_live_41be…7a90", perms: ["Read"], ips: 0, used: "Last used Oct 01, 2026", created: "Created Jan 14, 2026" },
  {
    id: "py",
    name: "Old Python script",
    key: "zx_live_c07d…19f2",
    perms: ["Read", "Trade"],
    ips: 0,
    unused: 92,
    used: "Last used Jul 19, 2026",
    created: "Created Mar 03, 2025",
  },
];

export const KEY_SAFETY = [
  { text: "Give each app its own key", ok: true },
  { text: "Only allow what the app needs", ok: true },
  { text: "Add an IP allowlist", ok: false },
  { text: "Delete keys you don’t use", ok: false },
];

export const PERMISSIONS = [
  { key: "Read", sub: "View balances, orders and history" },
  { key: "Trade", sub: "Place and cancel orders" },
  { key: "Withdraw", sub: "Add an IP allowlist to turn this on" },
];

export const NOTIFICATIONS = [
  { key: "price", title: "Price alerts", sub: "When a coin hits a price you set", push: true, email: false },
  { key: "security", title: "Security", sub: "New sign-ins, password and 2FA changes", push: true, email: true },
  { key: "money", title: "Deposits & withdrawals", sub: "When money arrives or leaves your account", push: true, email: true },
  { key: "automations", title: "Automations", sub: "When a rule runs or fails", push: true, email: false },
  { key: "news", title: "Product news", sub: "New features and tips, about once a month", push: false, email: false },
];

export const LINKED = [
  { key: "google", name: "Google", sub: "itachi.uchiha@gmail.com · sign-in", icon: a("au-google.svg") },
  { key: "metamask", name: "MetaMask", sub: "0x71C7…976F · wallet", icon: a("ob-metamask.svg") },
];

// Passkey state is shared by the profile card, the security score and the mobile list.
const PASSKEY = "zentra-passkey";
export function hasPasskey() {
  try {
    return sessionStorage.getItem(PASSKEY) === "1";
  } catch {
    return false;
  }
}
export function savePasskey(on) {
  try {
    if (on) sessionStorage.setItem(PASSKEY, "1");
    else sessionStorage.removeItem(PASSKEY);
  } catch {
    /* storage unavailable */
  }
}
