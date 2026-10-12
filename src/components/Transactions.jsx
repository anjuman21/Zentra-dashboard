import React from "react";
import { icons, transactions } from "../data";

function Pair({ data }) {
  return (
    <>
      <img src={data.icon} alt="" width="32" height="32" />
      <div className="tx-info">
        <p className="tx-info__pair">{data.pair}</p>
        <p className="tx-info__sub">{data.sub}</p>
      </div>
    </>
  );
}

export default function Transactions() {
  const last = transactions.length - 1;

  return (
    <div className="card tx-card">
      <div className="tx-card__header">
        <h2 className="card-title">Transactions</h2>
        <button type="button" className="chip view-more">
          View More
        </button>
      </div>
      <div className="tx-card__divider" />

      <div className="tx-table">
        <div className="tx-col tx-col--buy">
          <div className="tx-head">Buying Currency</div>
          <div className="tx-list">
            {transactions.map((t, i) => (
              <div key={i} className={`tx-cell${i === last ? " is-last" : ""}`}>
                <Pair data={t.buy} />
              </div>
            ))}
          </div>
        </div>

        <div className="tx-col tx-col--sell">
          <div className="tx-head">Sell Currency</div>
          <div className="tx-list">
            {transactions.map((t, i) => (
              <div key={i} className={`tx-cell${i === last ? " is-last" : ""}`}>
                <Pair data={t.sell} />
              </div>
            ))}
          </div>
        </div>

        <div className="tx-col tx-col--status">
          <div className="tx-head">Transaction Status</div>
          <div className="tx-list">
            {transactions.map((t, i) => (
              <div key={i} className={`tx-cell${i === last ? " is-last" : ""}`}>
                <p className="tx-status">{t.status}</p>
                <div className="tx-progress">
                  <span className={`tx-progress__track${t.grey || t.progress === "full" ? " is-grey" : ""}`}>
                    <span
                      className="tx-progress__bar"
                      style={{
                        background: t.barColor,
                        width: t.progress === "full" ? "100%" : t.progress,
                      }}
                    />
                  </span>
                  <span className="tx-progress__pct">{t.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tx-col tx-col--rate">
          <div className="tx-head">Sell Rate</div>
          <div className="tx-list">
            {transactions.map((t, i) => (
              <div key={i} className={`tx-cell${i === last ? " is-last" : ""}`}>
                <span className={t.up ? "rate up" : "rate down"}>{t.rate}</span>
                <img src={t.up ? icons.arrowUpward : icons.arrowDownward} alt="" width="18" height="18" />
              </div>
            ))}
          </div>
        </div>

        <div className="tx-col tx-col--action">
          <div className="tx-head" />
          <div className="tx-list">
            {transactions.map((t, i) => (
              <div key={i} className={`tx-cell${i === last ? " is-last" : ""}`}>
                <button type="button" className="icon-btn" aria-label="More actions">
                  <img className="mono" src={icons.moreVert} alt="" width="18" height="18" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
