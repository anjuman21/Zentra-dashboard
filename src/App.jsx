import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar, { MobileTopbar } from "./components/Navbar";
import MarketTrends from "./components/MarketTrends";
import Transactions from "./components/Transactions";
import { ConvertCard, Watchlist, Registration } from "./components/RightPanel";
import MobileNav from "./components/MobileNav";

function readTheme() {
  try {
    return localStorage.getItem("zentra-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function App() {
  const [theme, setTheme] = useState(readTheme);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("zentra-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

      <div className="main-area">
        <Navbar onMenu={() => setDrawerOpen(true)} />
        <MobileTopbar onMenu={() => setDrawerOpen(true)} />

        <main className="content">
          <section className="main-col">
            <MarketTrends />
            <Transactions />
          </section>
          <aside className="right-col">
            <ConvertCard />
            <Watchlist />
            <Registration />
          </aside>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
