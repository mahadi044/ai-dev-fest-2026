import { useState } from "react";

const riskTransactions = [
  {
    id: 1,
    merchant: "Unknown Merchant",
    category: "Transfer",
    date: "Sep 30, 2026 • 02:31 AM",
    amount: 20000,
    score: 91,
    level: "High",
    reasons: [
      "Transaction happened at an unusual time: 2:31 AM.",
      "The receiver is new and has no previous transaction history.",
      "৳20,000 is significantly higher than your normal transaction amount.",
      "The transaction was made from a new device.",
    ],
  },
  {
    id: 2,
    merchant: "bKash Transfer",
    category: "Transfer",
    date: "Sep 29, 2026 • 01:12 PM",
    amount: 1500,
    score: 58,
    level: "Medium",
    reasons: [
      "Transaction amount is slightly above your usual transfer amount.",
      "Receiver activity is less frequent than normal.",
    ],
  },
  {
    id: 3,
    merchant: "Foodpanda",
    category: "Food",
    date: "Sep 28, 2026 • 08:42 PM",
    amount: 850,
    score: 12,
    level: "Low",
    reasons: [
      "Transaction time matches your normal activity.",
      "Amount is consistent with your previous food spending.",
    ],
  },
];

function RiskGuardian() {
  const [selectedRisk, setSelectedRisk] = useState(null);

  return (
    <div className="risk-guardian-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">AI SECURITY</span>
          <h1>Risk Guardian</h1>
          <p>
            Monitor your transactions and understand potential financial risks.
          </p>
        </div>

        <div className="protected-badge">
          ✓ Protected
        </div>
      </div>

      <section className="risk-overview-grid">
        <div className="guardian-score-card">
          <div>
            <span className="card-label">OVERALL RISK SCORE</span>

            <div className="guardian-score">
              <strong>18</strong>
              <span>/100</span>
            </div>

            <div className="guardian-status">
              <span>●</span>
              Low Risk
            </div>

            <p>
              Your recent financial activity looks consistent with
              your normal behavior.
            </p>
          </div>

          <div className="guardian-ring">
            <div className="guardian-ring-inner">
              <strong>82%</strong>
              <span>Safe</span>
            </div>
          </div>
        </div>

        <div className="risk-stat-card">
          <span className="card-label">TRANSACTIONS ANALYZED</span>
          <strong>128</strong>
          <p>All recent transactions checked by AI</p>
        </div>

        <div className="risk-stat-card warning-card">
          <span className="card-label">FLAGGED TRANSACTIONS</span>
          <strong>4</strong>
          <p>Transactions require additional attention</p>
        </div>
      </section>

      <section className="guardian-main-grid">
        <div className="panel guardian-alert-panel">
          <div className="panel-header">
            <div>
              <h3>Attention required</h3>
              <p>Transactions with unusual activity patterns.</p>
            </div>

            <span className="alert-count">1 High Risk</span>
          </div>

          <div className="high-risk-card">
            <div className="high-risk-icon">!</div>

            <div className="high-risk-info">
              <div className="risk-title-row">
                <div>
                  <h4>Unknown Merchant</h4>
                  <span>Transfer • Sep 30, 2026 • 02:31 AM</span>
                </div>

                <div className="risk-score-pill">
                  91 / 100
                </div>
              </div>

              <p>
                A ৳20,000 transfer was detected at an unusual time
                to a new receiver using a new device.
              </p>

              <button
                className="review-button"
                onClick={() => setSelectedRisk(riskTransactions[0])}
              >
                Review transaction →
              </button>
            </div>
          </div>
        </div>

        <div className="panel guardian-ai-panel">
          <div className="ai-heading">
            <div className="ai-mark">✦</div>

            <div>
              <h3>AI Risk Summary</h3>
              <span>Updated recently</span>
            </div>
          </div>

          <div className="ai-summary">
            <strong>Your account is mostly safe.</strong>

            <p>
              Most transactions match your normal spending behavior.
              One transaction has multiple unusual signals and should
              be verified.
            </p>
          </div>

          <div className="ai-summary-item">
            <span>✓</span>
            <div>
              <strong>Normal activity</strong>
              <p>124 transactions matched your usual patterns.</p>
            </div>
          </div>

          <div className="ai-summary-item">
            <span>!</span>
            <div>
              <strong>Needs attention</strong>
              <p>1 high-risk transaction requires verification.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel risk-history-panel">
        <div className="panel-header">
          <div>
            <h3>Recent risk activity</h3>
            <p>AI analysis of your latest transactions.</p>
          </div>
        </div>

        <div className="risk-history-list">
          {riskTransactions.map((transaction) => (
            <div className="risk-history-row" key={transaction.id}>
              <div className="risk-history-icon">
                {transaction.level === "High"
                  ? "!"
                  : transaction.level === "Medium"
                  ? "•"
                  : "✓"}
              </div>

              <div className="risk-history-details">
                <strong>{transaction.merchant}</strong>
                <span>
                  {transaction.category} · {transaction.date}
                </span>
              </div>

              <strong className="risk-history-amount">
                ৳{transaction.amount.toLocaleString()}
              </strong>

              <span
                className={
                  "risk-badge " + transaction.level.toLowerCase()
                }
              >
                {transaction.level}
              </span>

              <strong className="risk-history-score">
                {transaction.score}/100
              </strong>

              <button
                className="history-view-button"
                onClick={() => setSelectedRisk(transaction)}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedRisk && (
        <div
          className="risk-modal-overlay"
          onClick={() => setSelectedRisk(null)}
        >
          <div
            className="risk-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="risk-modal-header">
              <div>
                <span className="risk-modal-label">
                  AI Risk Analysis
                </span>

                <h2>{selectedRisk.merchant}</h2>

                <p>
                  {selectedRisk.category} · {selectedRisk.date}
                </p>
              </div>

              <button
                className="risk-modal-close"
                onClick={() => setSelectedRisk(null)}
              >
                ×
              </button>
            </div>

            <div className="risk-score-card">
              <div>
                <span>AI Risk Score</span>

                <strong>
                  {selectedRisk.score}
                  <small>/100</small>
                </strong>
              </div>

              <div
                className={
                  "large-risk-badge " +
                  selectedRisk.level.toLowerCase()
                }
              >
                {selectedRisk.level} Risk
              </div>
            </div>

            <div className="risk-info-grid">
              <div>
                <span>Amount</span>
                <strong>
                  ৳{selectedRisk.amount.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{selectedRisk.category}</strong>
              </div>

              <div>
                <span>Risk Level</span>
                <strong>{selectedRisk.level}</strong>
              </div>

              <div>
                <span>Analysis</span>
                <strong>AI Pattern Detection</strong>
              </div>
            </div>

            <div className="ai-explanation">
              <div className="ai-explanation-title">
                <span>AI</span>
                <strong>Why was this transaction flagged?</strong>
              </div>

              <ul>
                {selectedRisk.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="risk-recommendation">
              <div className="recommendation-icon">!</div>

              <div>
                <strong>Recommended Action</strong>

                <p>
                  Verify the transaction before taking any further
                  action. AI provides an alert and explanation; the
                  final decision remains with you.
                </p>
              </div>
            </div>

            <div className="risk-modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelectedRisk(null)}
              >
                Close
              </button>

              {selectedRisk.level === "High" && (
                <button className="verify-button">
                  Verify Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskGuardian;