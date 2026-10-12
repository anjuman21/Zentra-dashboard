# Zentra Home

React + Vite build of the Zentra dashboard **Home page** from Figma
(`zentra (Copy)`, section `172:17745`):

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

- `src/data.js`: content, asset paths and chart geometry from the design
- `src/components/`: Sidebar, Navbar (+ mobile top bar), MarketTrends, Transactions, RightPanel (Convert, Watchlist, Registration), MobileNav
- `src/styles.css`: design tokens (light/dark), layout and breakpoints (1280 / 1024 / 860 / 768)
