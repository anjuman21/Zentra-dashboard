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

- `src/data.js`, `src/portfolioData.js` and `src/marketsData.js`: content, asset paths and chart geometry from the design
- `src/components/`: Sidebar, Navbar (+ mobile top bar), MarketTrends, Transactions, RightPanel (Convert, Watchlist, Registration), Portfolio, Markets, MobileNav, MobileMenu
- `src/styles.css`: design tokens (light/dark), layout and breakpoints (1280 / 1024 / 860 / 768)
