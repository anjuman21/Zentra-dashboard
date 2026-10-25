import React, { useEffect } from "react";
import { useFlow, closeFlow } from "../flows";
import * as Home from "./flows/HomeFlows";
import * as Pf from "./flows/PortfolioFlows";
import * as Mk from "./flows/MarketsFlows";
import * as Tr from "./flows/TradeFlows";

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
