import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar, { MobileTopbar } from "./components/Navbar";
import MarketTrends from "./components/MarketTrends";
import Transactions from "./components/Transactions";
import { ConvertCard, Watchlist, Registration } from "./components/RightPanel";
import MobileNav from "./components/MobileNav";
import MobileMenu from "./components/MobileMenu";
import Portfolio from "./components/Portfolio";
import Markets from "./components/Markets";
import Trade from "./components/Trade";
import Analytics from "./components/Analytics";
import History from "./components/History";
import Stake from "./components/Stake";
import YieldFarming from "./components/YieldFarming";
import Automations from "./components/Automations";
import Alerts from "./components/Alerts";
import AiAssistant from "./components/AiAssistant";
import { SignUp, LogIn, VerifyEmail } from "./components/Auth";
import {
  QuickProfile,
  VerifyIntro,
  UploadId,
  Selfie,
  UnderReview,
  ConnectWallet,
  WalletConnected,
  Deposit,
  DepositPending,
  AllSet,
} from "./components/Onboarding";
import FinishSetup from "./components/FinishSetup";
import Help, { helpBack, helpTitle } from "./components/Help";
import Settings, { settingsBack, settingsTitle } from "./components/Settings";
import ErrorBoundary, { ScreenError } from "./components/ErrorBoundary";
import FlowHost from "./components/FlowHost";
import { openFlow } from "./flows";

function readTheme() {
  try {
    return localStorage.getItem("zentra-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

// Hash routes keep deep links working on static hosting (Vercel) without rewrites.
const PAGES = ["portfolio", "markets", "trade", "analytics", "history", "staking", "yield", "automations", "alerts", "ai", "help", "settings"];
// Onboarding screens are full-screen: no sidebar, navbar or mobile dock.
const ONBOARDING = {
  signup: SignUp,
  login: LogIn,
  "verify-email": VerifyEmail,
  profile: QuickProfile,
  "verify-identity": VerifyIntro,
  "verify-id": UploadId,
  "verify-selfie": Selfie,
  "verify-review": UnderReview,
  "connect-wallet": ConnectWallet,
  "wallet-connected": WalletConnected,
  deposit: Deposit,
  "deposit-pending": DepositPending,
  "all-set": AllSet,
};
const TITLES = { overview: "Home", portfolio: "Portfolio", markets: "Markets", trade: "Trade", analytics: "Analytics", history: "History", staking: "Stake", yield: "Yield Farming", automations: "Automations", alerts: "Alerts", ai: "Ask Noa", help: "Help & Docs", settings: "Settings", setup: "Finish setup", signup: "Sign up", login: "Log in", "verify-email": "Verify email", profile: "About you", "verify-identity": "Verify identity", "verify-id": "Upload your ID", "verify-selfie": "Take a selfie", "verify-review": "Under review", "connect-wallet": "Connect wallet", "wallet-connected": "Wallet connected", deposit: "First deposit", "deposit-pending": "Deposit on its way", "all-set": "All set" };
// A route is a page plus an optional sub-path, e.g. "help/article/withdrawal-pending".
const readRoute = () => {
  const route = window.location.hash.replace(/^#\//, "");
  const [head, ...rest] = route.split("/");
  if (PAGES.includes(head)) return { page: head, sub: rest.join("/") };
  return { page: ONBOARDING[route] || route === "setup" ? route : "overview", sub: "" };
};

export default function App() {
  const [theme, setTheme] = useState(readTheme);
  const [{ page, sub }, setRoute] = useState(readRoute);
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
    let last = window.location.hash;
    const onHash = () => {
      const now = window.location.hash;
      setRoute(readRoute());
      // Opening or closing a dialog route (e.g. #/settings/api/new) keeps the scroll position.
      if (!(now.startsWith(`${last}/`) || last.startsWith(`${now}/`))) window.scrollTo(0, 0);
      last = now;
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = `Zentra — ${page === "help" ? helpTitle(sub) : page === "settings" ? settingsTitle(sub) : TITLES[page]}`;
  }, [page, sub]);

  const back = page === "help" ? helpBack(sub) : page === "settings" ? settingsBack(sub) : null;

  const navigate = (route) => {
    setDrawerOpen(false);
    if (route) window.location.hash = route === "overview" ? "#/" : `#/${route}`;
  };

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeSetup = useCallback(() => {
    window.location.hash = "#/";
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ⌘D / Ctrl+D opens the Ask AI panel, as the shortcut hint on the Ask AI bar promises.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        openFlow("home.ai");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Onboarding = ONBOARDING[page];
  if (Onboarding)
    return (
      <ErrorBoundary resetKey={page} fallback={(error, retry) => <ScreenError error={error} onRetry={retry} />}>
        <Onboarding key={page} />
      </ErrorBoundary>
    );

  return (
    <div className={`app${page === "ai" ? " app--ai" : ""}`}>
      <Sidebar page={page} onNavigate={navigate} open={drawerOpen} onClose={() => setDrawerOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}

      <div className="main-area">
        <Navbar onMenu={() => setDrawerOpen(true)} />
        <MobileTopbar onMenu={() => setDrawerOpen(true)} back={back} onBack={() => back && navigate(back.route)} />

        <ErrorBoundary resetKey={`${page}/${sub}`} fallback={(error, retry) => <ScreenError error={error} onRetry={retry} />}>
        {page === "portfolio" ? (
          <Portfolio />
        ) : page === "markets" ? (
          <Markets />
        ) : page === "trade" ? (
          <Trade />
        ) : page === "analytics" ? (
          <Analytics />
        ) : page === "history" ? (
          <History />
        ) : page === "staking" ? (
          <Stake />
        ) : page === "yield" ? (
          <YieldFarming />
        ) : page === "automations" ? (
          <Automations />
        ) : page === "alerts" ? (
          <Alerts />
        ) : page === "ai" ? (
          <AiAssistant onBack={() => navigate("overview")} />
        ) : page === "help" ? (
          <Help sub={sub} />
        ) : page === "settings" ? (
          <Settings sub={sub} theme={theme} setTheme={setTheme} />
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
        </ErrorBoundary>
      </div>

      <MobileNav page={page === "setup" ? "overview" : page} onNavigate={navigate} />
      {page === "setup" && <FinishSetup onClose={closeSetup} />}
      <FlowHost />
      <MobileMenu page={page} onNavigate={navigate} open={drawerOpen} onClose={closeDrawer} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
