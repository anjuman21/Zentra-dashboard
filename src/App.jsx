import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar, { MobileTopbar } from "./components/Navbar";
import MarketTrends from "./components/MarketTrends";
import Transactions from "./components/Transactions";
import { ConvertCard, Watchlist, Registration } from "./components/RightPanel";
import MobileNav from "./components/MobileNav";
import MobileMenu from "./components/MobileMenu";
import Portfolio from "./components/Portfolio";

function readTheme() {
  try {
    return localStorage.getItem("zentra-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

// Hash routes keep deep links working on static hosting (Vercel) without rewrites.
const readPage = () => (window.location.hash === "#/portfolio" ? "portfolio" : "overview");

export default function App() {
  const [theme, setTheme] = useState(readTheme);
  const [page, setPage] = useState(readPage);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("zentra-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setPage(readPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = page === "portfolio" ? "Zentra — Portfolio" : "Zentra — Home";
  }, [page]);

  const navigate = (route) => {
    setDrawerOpen(false);
    if (route) window.location.hash = route === "overview" ? "#/" : `#/${route}`;
  };

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={navigate} open={drawerOpen} onClose={() => setDrawerOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

      <div className="main-area">
        <Navbar onMenu={() => setDrawerOpen(true)} />
        <MobileTopbar onMenu={() => setDrawerOpen(true)} />

        {page === "portfolio" ? (
          <Portfolio />
        ) : (
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
        )}
      </div>

      <MobileNav page={page} onNavigate={navigate} />
      <MobileMenu open={drawerOpen} onClose={closeDrawer} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
