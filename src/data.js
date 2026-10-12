// Content and chart geometry taken from the Figma "Home page" frame (2030:306).
const a = (name) => `/assets/${name}`;

export const icons = {
  logo: a("logo.png"),
  menuOpen: a("menu-open.svg"),
  stars: a("stars.svg"),
  cmd: a("cmd.svg"),
  askAiGlow: a("ask-ai-glow.png"),
  activeDot: a("active-dot.svg"),
  progressDots: a("progress-dots.svg"),
  setupBg: a("setup-bg.jpg"),
  gift: a("gift.png"),
  clearDay: a("clear-day.svg"),
  darkMode: a("dark-mode.svg"),
  language: a("language.svg"),
  arrowDownNav: a("arrow-down-nav.svg"),
  search: a("search.svg"),
  filterList: a("filter-list.svg"),
  avatar: a("avatar.png"),
  dehaze: a("dehaze.svg"),
  arrowDown: a("arrow-down.svg"),
  graphLines: a("graph-lines.svg"),
  hoverLine: a("hover-line.svg"),
  dotOrange: a("dot-orange.svg"),
  dotGrey: a("dot-grey.svg"),
  dotBlue: a("dot-blue.svg"),
  legendBlue: a("legend-blue.svg"),
  legendOrange: a("legend-orange.svg"),
  legendGrey: a("legend-grey.svg"),
  convertBg: a("convert-bg.jpg"),
  btc: a("btc.svg"),
  eth: a("eth.svg"),
  swapVert: a("swap-vert.svg"),
  add: a("add.svg"),
  pip: a("pip.svg"),
  settings: a("settings.svg"),
  qr: a("qr.svg"),
  arrowDownward: a("arrow-downward.svg"),
  arrowUpward: a("arrow-upward.svg"),
  moreVert: a("more-vert.svg"),
  mMenu: a("m-menu.svg"),
  notifications: a("notifications.svg"),
  noaOrb: a("noa-orb.png"),
};

export const mainMenu = [
  { label: "Overview", icon: a("widgets.svg") },
  { label: "Portfolio", icon: a("assignment.svg") },
  { label: "Markets", icon: a("insert-chart.svg") },
  { label: "Trade", icon: a("repeat.svg") },
  { label: "Analytics", icon: a("finance-mode.svg") },
  { label: "History", icon: a("history.svg") },
];

export const financeOps = [
  { label: "Staking", icon: a("app-badging.svg") },
  { label: "Yield Farming", icon: a("filter-tilt-shift.svg") },
  { label: "Automations", icon: a("conversion-path.svg") },
  { label: "Alerts", icon: a("notifications.svg") },
];

export const footerLinks = [
  { label: "Help & Docs", icon: a("assignment.svg") },
  { label: "Settings", icon: a("insert-chart.svg") },
];

export const metrics = [
  { label: "Traffic", value: "982", change: "+5%", up: true },
  { label: "ROI", value: "+15%", change: "+3%", up: true },
  { label: "Conversions", value: "473", change: "+9%", up: true },
  { label: "Expenses", value: "$884", change: "-2%", up: false },
  { label: "CTR", value: "2.5%", change: "-0.2%", up: false },
  { label: "CPA", value: "$5.41", change: "-0.34%", up: false },
];

export const legend = [
  { label: "Market Cap", dot: icons.legendBlue, value: "+8.35%", tone: "blue" },
  { label: "BTC Price", dot: icons.legendOrange, value: "+5.21%", tone: "orange" },
  { label: "Volume", dot: icons.legendGrey, value: "$68.23B", tone: "grey" },
];

export const yAxis = ["20%", "10%", "0%", "-10%", "-20%"];
export const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const volumeBars = [
  19, 15, 11, 12, 16, 25, 21, 27, 28, 38, 32, 20, 25, 22, 18, 14, 11, 9, 13, 14, 12, 15, 20, 24, 19, 15, 12, 16, 21, 28,
  34, 28, 20, 22, 26, 21, 16, 12, 10, 9, 12, 17, 25, 22, 29, 35, 29, 23, 20, 25, 28, 21, 14, 17, 13, 11, 12, 15, 17, 21,
  25, 22, 30, 34, 29, 22, 16, 17, 13, 9, 10, 14, 17, 21, 24, 22, 19, 15, 16, 11, 8, 13, 16, 22, 17, 21, 28, 30, 26, 19,
  15, 19, 15, 11, 12, 9, 7, 10, 13, 17, 20, 23, 20, 17, 13, 9, 7, 5, 15, 24, 19, 13, 16, 17, 12, 10, 15, 23, 20, 25, 30,
  25, 19, 23, 20, 16, 14, 11, 8, 10, 14, 11, 14, 19, 24, 17, 13, 11, 13, 16, 21, 27, 33, 27, 20, 22, 25, 20, 15, 10, 11,
  7, 9, 12, 17, 21, 25, 19, 13, 9, 3,
];

// 125 ticks on the timeline ruler; the longer ones sit under each month label.
export const majorTicks = new Set([2, 22, 43, 62, 82, 102, 122]);
export const TICK_COUNT = 125;

export const graphTools = [
  { id: "select", icon: a("tool-select.svg") },
  { id: "location", icon: a("tool-location.svg") },
  { id: "shape", icon: a("tool-shape.svg") },
  { id: "format", icon: a("tool-format.svg") },
  { id: "target", icon: a("tool-target.svg") },
];

export const transactions = [
  {
    buy: { icon: a("t-eth.svg"), pair: "5.31415 ETH/BTC", sub: "14212.14 Market" },
    sell: { icon: a("t-eth.svg"), pair: "5.31415 ETH/BTC", sub: "14212.14 Market" },
    status: "Pending Review", progress: 113, barColor: "#5720f5", pct: "80%", rate: "-6%", up: false,
  },
  {
    buy: { icon: a("t-ltc.svg"), pair: "3.14159 LTC/ETH", sub: "0.025 Market" },
    sell: { icon: a("t-ltc.svg"), pair: "3.14159 LTC/ETH", sub: "0.025 Market" },
    status: "Completed", progress: "full", barColor: "#48b187", pct: "100%", rate: "+12%", up: true,
  },
  {
    buy: { icon: a("t-btc.svg"), pair: "2.71828 BTC/USD", sub: "58000.50 Market" },
    sell: { icon: a("t-btc.svg"), pair: "2.71828 BTC/USD", sub: "58000.50 Market" },
    status: "Not Started", progress: 4, barColor: "#5720f5", pct: "0%", rate: "+8%", up: true,
  },
  {
    buy: { icon: a("t-ada.svg"), pair: "0.57721 ADA/USD", sub: "1.20 Market" },
    sell: { icon: a("t-ada.svg"), pair: "0.57721 ADA/ETH", sub: "0.00032 Market" },
    status: "On Hold", progress: 113, barColor: "#f5cd20", pct: "30%", rate: "-3%", up: false,
  },
  {
    buy: { icon: a("t-doge.svg"), pair: "1.41421 DOGE/ETH", sub: "0.00045 Market" },
    sell: { icon: a("t-doge.svg"), pair: "1.41421 DOGE/USD", sub: "0.240 Market" },
    status: "Delayed", progress: 60, barColor: "#7d7d7d", pct: "45%", rate: "+15%", up: true, grey: true,
  },
  {
    buy: { icon: a("t-xrp.svg"), pair: "1.61803 XRP/BTC", sub: "0.000023 Market" },
    sell: { icon: a("t-xrp.svg"), pair: "1.61803 XRP/BTC", sub: "0.000023 Market" },
    status: "In Progress", progress: 99, barColor: "#5720f5", pct: "65%", rate: "+5%", up: true,
  },
];

export const watchlist = [
  { symbol: "BTC", icon: a("w-btc.svg"), last: "$96,183.23", change: "+12%", changePct: "-6%" },
  { symbol: "ETH", icon: a("w-eth.svg"), last: "$3,218.73", change: "-8%", changePct: "+12%" },
  { symbol: "SOL", icon: a("w-ltc.svg"), last: "$3,218.73", change: "-8%", changePct: "+12%" },
  { symbol: "BNB", icon: a("w-bnb.svg"), last: "$236.21", change: "+20%", changePct: "+8%" },
  { symbol: "XRP", icon: a("w-xrp.svg"), last: "$627.18", change: "+12%", changePct: "+8%" },
  { symbol: "ADA", icon: a("w-ada.svg"), last: "$1.12", change: "+5%", changePct: "+5%" },
];

export const convertTabs = ["Buy", "Sell", "Swap", "Convert"];

export const mobileNav = [
  { label: "Home", icon: a("m-home.svg") },
  { label: "Portfolio", icon: a("m-portfolio.svg") },
  { label: "swap", icon: a("m-swap.svg") },
  { label: "Markets", icon: a("m-markets.svg") },
  { label: "Trade", icon: a("m-trade.svg") },
];
