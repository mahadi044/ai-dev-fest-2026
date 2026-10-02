import { useEffect, useState } from "react";
import { getRiskAnalysis } from "../services/api";

function RiskGuardian() {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRisk, setSelectedRisk] = useState(null);

  useEffect(() => {
    const loadRiskAnalysis = async () => {
      try {
        const data = await getRiskAnalysis();
        setRiskData(data.results || []);
      } catch (err) {
        setError("Failed to load risk analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadRiskAnalysis();
  }, []);

  const highRiskTransactions = riskData.filter(
    (transaction) => transaction.risk_level === "High"
  );

  const mediumRiskTransactions = riskData.filter(
    (transaction) => transaction.risk_level === "Medium"
  );

  const flaggedTransactions = riskData.filter(
    (transaction) =>
      transaction.risk_level === "High" ||
      transaction.risk_level === "Medium"
  );

  const averageRisk =
    riskData.length > 0
      ? Math.round(
          riskData.reduce(
            (total, transaction) => total + transaction.risk_score,
            0
          ) / riskData.length
        )
      : 0;

  const safePercentage = Math.max(0, 100 - averageRisk);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatAmount = (amount) =>
    `Tk ${Math.abs(amount).toLocaleString()}`;

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

      {loading && (
        <div className="empty-state">
          <h3>Analyzing transactions...</h3>
          <p>
            Please wait while Risk Guardian analyzes your financial activity.
          </p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h3>Unable to load risk analysis</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="risk-overview-grid">
            <div className="guardian-score-card">
              <div>
                <span className="card-label">OVERALL RISK SCORE</span>

                <div className="guardian-score">
                  <strong>{averageRisk}</strong>
                  <span>/100</span>
                </div>

                <div className="guardian-status">
                  <span>●</span>
                  {averageRisk >= 70
                    ? "High Risk"
                    : averageRisk >= 40
                    ? "Medium Risk"
                    : "Low Risk"}
                </div>

                <p>
                  Risk score is calculated from your analyzed transactions.
                </p>
              </div>

              <div className="guardian-ring">
                <div className="guardian-ring-inner">
                  <strong>{safePercentage}%</strong>
                  <span>Safe</span>
                </div>
              </div>
            </div>

            <div className="risk-stat-card">
              <span className="card-label">TRANSACTIONS ANALYZED</span>
              <strong>{riskData.length}</strong>
              <p>Transactions checked by Risk Guardian</p>
            </div>

            <div className="risk-stat-card warning-card">
              <span className="card-label">FLAGGED TRANSACTIONS</span>
              <strong>{flaggedTransactions.length}</strong>
              <p>
                {highRiskTransactions.length} high-risk and{" "}
                {mediumRiskTransactions.length} medium-risk transaction
                {mediumRiskTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </section>

          <section className="guardian-main-grid">
            <div className="panel guardian-alert-panel">
              <div className="panel-header">
                <div>
                  <h3>Attention required</h3>
                  <p>Transactions with unusual activity patterns.</p>
                </div>

                <span className="alert-count">
                  {highRiskTransactions.length} High Risk
                </span>
              </div>

              {highRiskTransactions.length > 0 ? (
                highRiskTransactions.slice(0, 1).map((transaction) => (
                  <div className="high-risk-card" key={transaction.id}>
                    <div className="high-risk-icon">!</div>

                    <div className="high-risk-info">
                      <div className="risk-title-row">
                        <div>
                          <h4>{transaction.merchant}</h4>

                          <span>
                            {transaction.category} |{" "}
                            {formatDate(transaction.transaction_date)}
                          </span>
                        </div>

                        <div className="risk-score-pill">
                          {transaction.risk_score} / 100
                        </div>
                      </div>

                      <p>
                        This transaction was flagged because the risk system
                        detected multiple unusual signals.
                      </p>

                      <button
                        className="review-button"
                        onClick={() => setSelectedRisk(transaction)}
                      >
                        Review transaction →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="safe-analysis">
                  <strong>No high-risk transactions detected.</strong>
                  <p>
                    Your current transaction activity does not contain any
                    high-risk transaction.
                  </p>
                </div>
              )}
            </div>

            <div className="panel guardian-ai-panel">
              <div className="ai-heading">
                <div className="ai-mark">✦</div>

                <div>
                  <h3>AI Risk Summary</h3>
                  <span>Based on current transaction analysis</span>
                </div>
              </div>

              <div className="ai-summary">
                <strong>
                  {highRiskTransactions.length === 0
                    ? "Your account is mostly safe."
                    : "Some transactions need your attention."}
                </strong>

                <p>
                  Risk Guardian analyzed {riskData.length} transaction
                  {riskData.length !== 1 ? "s" : ""} and detected{" "}
                  {flaggedTransactions.length} transaction
                  {flaggedTransactions.length !== 1 ? "s" : ""} requiring
                  additional attention.
                </p>
              </div>

              <div className="ai-summary-item">
                <span>✓</span>

                <div>
                  <strong>Normal activity</strong>

                  <p>
                    {riskData.length - flaggedTransactions.length} transaction
                    {riskData.length - flaggedTransactions.length !== 1
                      ? "s"
                      : ""}{" "}
                    currently show low-risk signals.
                  </p>
                </div>
              </div>

              <div className="ai-summary-item">
                <span>!</span>

                <div>
                  <strong>Needs attention</strong>

                  <p>
                    {flaggedTransactions.length} transaction
                    {flaggedTransactions.length !== 1 ? "s" : ""} require
                    additional review.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel risk-history-panel">
            <div className="panel-header">
              <div>
                <h3>Recent risk activity</h3>
                <p>Risk analysis of your latest transactions.</p>
              </div>
            </div>

            <div className="risk-history-list">
              {riskData.map((transaction) => (
                <div className="risk-history-row" key={transaction.id}>
                  <div className="risk-history-icon">
                    {transaction.risk_level === "High"
                      ? "!"
                      : transaction.risk_level === "Medium"
                      ? "•"
                      : "✓"}
                  </div>

                  <div className="risk-history-details">
                    <strong>{transaction.merchant}</strong>

                    <span>
                      {transaction.category} |{" "}
                      {formatDate(transaction.transaction_date)}
                    </span>
                  </div>

                  <strong className="risk-history-amount">
                    {formatAmount(transaction.amount)}
                  </strong>

                  <span
                    className={
                      "risk-badge " +
                      transaction.risk_level.toLowerCase()
                    }
                  >
                    {transaction.risk_level}
                  </span>

                  <strong className="risk-history-score">
                    {transaction.risk_score}/100
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
        </>
      )}

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
                  {selectedRisk.category} |{" "}
                  {formatDate(selectedRisk.transaction_date)}
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
                  {selectedRisk.risk_score}
                  <small>/100</small>
                </strong>
              </div>

              <div
                className={
                  "large-risk-badge " +
                  selectedRisk.risk_level.toLowerCase()
                }
              >
                {selectedRisk.risk_level} Risk
              </div>
            </div>

            <div className="risk-info-grid">
              <div>
                <span>Amount</span>

                <strong>
                  {formatAmount(selectedRisk.amount)}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{selectedRisk.category}</strong>
              </div>

              <div>
                <span>Risk Level</span>
                <strong>{selectedRisk.risk_level}</strong>
              </div>

              <div>
                <span>Analysis</span>
                <strong>Risk Pattern Detection</strong>
              </div>
            </div>

            <div className="ai-explanation">
              <div className="ai-explanation-title">
                <span>AI</span>

                <strong>
                  Why was this transaction flagged?
                </strong>
              </div>

              {selectedRisk.reasons.length > 0 ? (
                <ul>
                  {selectedRisk.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p>No major risk signals detected.</p>
              )}
            </div>

            <div className="risk-recommendation">
              <div className="recommendation-icon">!</div>

              <div>
                <strong>Recommended Action</strong>

                <p>
                  Review the transaction details carefully. AI provides an
                  alert and explanation; the final decision remains with you.
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

              {selectedRisk.risk_level === "High" && (
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