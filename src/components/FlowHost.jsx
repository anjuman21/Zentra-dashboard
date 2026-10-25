import React, { useEffect } from "react";
import { useFlow, closeFlow } from "../flows";
import * as Home from "./flows/HomeFlows";
import * as Pf from "./flows/PortfolioFlows";
import * as Mk from "./flows/MarketsFlows";
import * as Tr from "./flows/TradeFlows";
import * as An from "./flows/AnalyticsFlows";
import * as Hi from "./flows/HistoryFlows";
import * as St from "./flows/StakeFlows";
import * as Yf from "./flows/YieldFlows";
import * as Au from "./flows/AutomationFlows";

// Every overlay the pages can open, by name.
const FLOWS = {
  "home.convert-review": Home.ConvertReview,
  "home.convert-success": Home.ConvertSuccess,
  "home.add-watch": Home.AddWatchlist,
  "home.coin": Home.CoinQuickView,
  "home.tx": Home.TxDetail,
  "home.ai": Home.AskAiPanel,
  "home.balances": Home.BalancesPopover,
  "home.profile": Home.ProfileMenu,
  "portfolio.add": Pf.AddAssets,
  "portfolio.manual": Pf.ManualTransaction,
  "portfolio.export": Pf.ExportPortfolio,
  "portfolio.range": Pf.RangeMenu,
  "portfolio.avp": Pf.ActualVsPotential,
  "portfolio.asset": Pf.AssetDetail,
  "portfolio.row": Pf.RowActions,
  "portfolio.alloc": Pf.AllocationDetails,
  "markets.filters": Mk.MarketFilters,
  "markets.coin": Mk.MarketCoin,
  "markets.row": Mk.MarketRowMenu,
  "markets.alert": Mk.PriceAlert,
  "markets.compare": Mk.CompareCoins,
  "markets.currency": Mk.CurrencyMenu,
  "markets.fg": Mk.FearGreedExplainer,
  "trade.pair": Tr.PairPicker,
  "trade.type": Tr.OrderTypeMenu,
  "trade.review": Tr.ReviewOrder,
  "trade.order": Tr.OpenOrderMenu,
  "trade.edit": Tr.EditOrder,
  "trade.chart": Tr.ChartSettings,
  "analytics.date": An.DateRange,
  "analytics.compare": An.CompareMenu,
  "analytics.export": An.ExportMenu,
  "analytics.cell": An.HeatCell,
  "analytics.month": An.MonthBreakdown,
  "analytics.asset": An.AssetAnalytics,
  "analytics.winrate": An.WinRate,
  "analytics.more": An.MoreMenu,
  "history.types": Hi.TypeFilter,
  "history.pick": Hi.PickMenu,
  "history.tx": Hi.TxReceipt,
  "history.export": Hi.ExportHistory,
  "history.status": Hi.StatusDetail,
  "history.fees": Hi.FeeBreakdown,
  "history.filters": Hi.MobileFilters,
  "stake.amount": St.StakeAmount,
  "stake.done": St.StakeDone,
  "stake.manage": St.ManageStake,
  "stake.unstake": St.Unstake,
  "stake.filter": St.StakeFilter,
  "stake.rewards": St.ClaimRewards,
  "stake.apy": St.ApyExplainer,
  "stake.breakdown": St.StakeBreakdown,
  "yield.add": Yf.AddLiquidity,
  "yield.position": Yf.PositionDetail,
  "yield.remove": Yf.RemoveLiquidity,
  "yield.claim": Yf.ClaimYield,
  "yield.oor": Yf.OutOfRange,
  "yield.risk": Yf.PoolRisk,
  "yield.range": Yf.YieldRange,
  "yield.menu": Yf.PositionMenu,
  "auto.create": Au.CreateAutomation,
  "auto.detail": Au.AutomationDetail,
  "auto.menu": Au.AutomationMenu,
  "auto.delete": Au.DeleteAutomation,
  "auto.failed": Au.FailedRun,
  "auto.health": Au.HealthBreakdown,
  "auto.receipt": Au.ExecutionReceipt,
};

export function registerFlows(map) {
  Object.assign(FLOWS, map);
}

export default function FlowHost() {
  const flow = useFlow();
  // Leaving the page closes whatever was open on it.
  useEffect(() => {
    window.addEventListener("hashchange", closeFlow);
    return () => window.removeEventListener("hashchange", closeFlow);
  }, []);
  const C = flow && FLOWS[flow.name];
  return C ? <C key={flow.name + JSON.stringify(flow.props)} {...flow.props} /> : null;
}
