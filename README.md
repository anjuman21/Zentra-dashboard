# Zentra Dashboard

React + Vite build of the Zentra dashboard from Figma (`zentra (Copy)`).

## Pages

- **Home** (`#/`), section `172:17745`
- **Portfolio** (`#/portfolio`), section `172:17746`
  - Desktop `53:2964` (1440 × 1024).
  - Mobile `156:10171` (402 px).
  - Below 1280 px the right column wraps under the main column. Below 768 px the stats become a 2 × 2 grid, the header buttons become icon-only, and the assets table scrolls sideways.

- **Markets** (`#/markets`), section `172:17747`
  - Desktop `78:1922` (1440 × 1024), mobile `156:10792` (402 px).
  - Tabs filter the coin list; pagination and rows-per-page are interactive. On phones the stats become 2 × 2, the tabs scroll sideways and the coin table scrolls horizontally.

- **Trade** (`#/trade`), section `172:17748`: pair header, price chart with switches and drawing tools, open orders, buy/sell form with a balance slider, and an order book.
- **Analytics** (`#/analytics`), section `172:17749`: KPIs, portfolio performance chart, PnL bars, a trades-by-time heatmap, performance and top assets.
- **History** (`#/history`), section `172:17750`: transaction table with type/asset/status filters and pagination, quick stats, balance trend and top assets.
- **Stake** (`#/staking`), section `172:17751`: staking assets with search and stake buttons, stake portfolio, rewards and recent activity.
- **Yield Farming** (`#/yield`), section `172:17753`: stats, farming positions, featured pools with "Add Liquidity", your-yield chart, pending rewards with "Claim All" and farming activity.
- **Automations** (`#/automations`), section `172:17754`: stats, the automations table (click a status pill to pause or resume a rule, "Sort by" cycles the order), automation health gauge and recent executions.
- **Alerts** (`#/alerts`), section `172:17755`: alert feed with list tabs and type/asset/status filters (clicking an unread alert marks it read), quick actions, alert summary and recent alerts.
- **Ask Noa** (`#/ai`), section `172:17756`: the AI assistant. Opened from the sidebar "Ask AI" bar, ⌘D / Ctrl+D, or "Ask Noa" on phones. Typing a question, a suggestion or a recent chat starts a demo conversation with canned answers. On phones Noa takes the whole screen with its own back button.

Sidebar and bottom-nav links switch pages through the URL hash, so deep links work on static hosting.

## Home page details

- **Desktop, light** (`2030:306`, 1440 × 1024) is the primary reference, matched to the pixel at 1440 px.
- **Desktop, dark** (`15:1091`) is the same layout with theme tokens, switched from the sidebar's Light/Dark Mode toggle (remembered in `localStorage`).
- **Mobile** (`156:6717`, 402 px) is the layout below 768 px: pill header, stacked cards, bottom nav and "Ask Noa".

All icons and images in `public/assets/` were exported straight from the Figma file.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs dist/
```

## Deploy (Vercel)

Import the repository in Vercel. It detects the Vite preset automatically (build `npm run build`, output `dist`).

## Structure

- `src/data.js` plus one data file per page (`portfolioData`, `marketsData`, `tradeData`, `analyticsData`, `historyData`, `stakeData`, `yieldData`, `autoData`, `alertData`, `aiData`): content, asset paths and chart geometry from the design
- `src/components/`: Sidebar, Navbar (+ mobile top bar), MarketTrends, Transactions, RightPanel (Convert, Watchlist, Registration), Portfolio, Markets, Trade, Analytics, History, Stake, YieldFarming, Automations, Alerts, AiAssistant, MobileNav, MobileMenu
- `src/styles.css`: design tokens (light/dark), layout and breakpoints (1280 / 1024 / 860 / 768)
