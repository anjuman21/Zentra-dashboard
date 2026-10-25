import React, { useEffect } from "react";
import { useFlow, closeFlow } from "../flows";
import * as Home from "./flows/HomeFlows";
import * as Pf from "./flows/PortfolioFlows";

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
