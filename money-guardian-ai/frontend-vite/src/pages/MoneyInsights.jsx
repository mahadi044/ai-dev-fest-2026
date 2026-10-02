import { useEffect, useState } from "react";
import { getMoneyInsights } from "../services/api";

function MoneyInsights() {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await getMoneyInsights();

        setSummary(data.summary);
        setInsights(data.insights || []);
      } catch (err) {
        setError("Failed to load money insights.");
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const calculateFinancialHealth = () => {
    if (!summary || summary.total_income <= 0) {
      return 0;
    }

    const spendingRate =
      (summary.total_spending / summary.total_income) * 100;

    const savingsRate =
      (summary.savings / summary.total_income) * 100;

    let score = 100;

    /*
     * Spending above 50% reduces the score.
     */
    if (spendingRate > 50) {
      score -= (spendingRate - 50) * 0.8;
    }

    /*
     * Savings below 20% reduces the score.
     */
    if (savingsRate < 20) {
      score -= (20 - savingsRate) * 1.2;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const financialHealth = calculateFinancialHealth();

  const spendingControl =
    summary && summary.total_income > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 -
                (summary.total_spending / summary.total_income) * 100
            )
          )
        )
      : 0;

  const savingsScore =
    summary && summary.total_income > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (summary.savings / summary.total_income) * 100
            )
          )
        )
      : 0;

  /*
   * Risk Safety will later be connected
   * directly with Risk Guardian data.
   */
  const riskSafety = 90;

  /*
   * Convert health score to circle angle.
   * 100% = 360 degrees
   */
  const healthProgress = financialHealth * 3.6;

  const formatAmount = (amount) =>
    `Tk ${Number(amount || 0).toLocaleString("en-US")}`;

  const healthText =
    financialHealth >= 70
      ? "Good Financial Health"
      : financialHealth >= 40
      ? "Moderate Financial Health"
      : "Needs Improvement";

  return (
    <div className="money-insights-page">
      <div className="page-header">
        <div>
          <div className="protected-badge">
            AI POWERED
          </div>

          <h1>Money Insights</h1>

          <p>
            AI-powered observations to help you understand your money better.
          </p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h3>Analyzing your finances...</h3>

          <p>
            Please wait while Money Insights analyzes your transactions.
          </p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h3>Unable to load insights</h3>

          <p>{error}</p>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="insights-summary-grid">
            <div className="insight-summary-card">
              <span className="summary-icon">
                Health
              </span>

              <div>
                <p>Financial Health</p>

                <h2>
                  {financialHealth}
                  <span>/100</span>
                </h2>
              </div>
            </div>

            <div className="insight-summary-card">
              <span className="summary-icon">
                Spend
              </span>

              <div>
                <p>Monthly Spending</p>

                <h2>
                  {formatAmount(summary.total_spending)}
                </h2>
              </div>
            </div>

            <div className="insight-summary-card">
              <span className="summary-icon">
                Save
              </span>

              <div>
                <p>Current Savings</p>

                <h2>
                  {formatAmount(summary.savings)}
                </h2>
              </div>
            </div>
          </div>

          <div className="insights-main-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>AI Money Insights</h2>

                  <p>
                    Important patterns detected from your transactions.
                  </p>
                </div>

                <span className="ai-status">
                  AI Active
                </span>
              </div>

              <div className="insight-list">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <div
                      className={`money-insight-card ${
                        insight.type === "Spending Analysis"
                          ? "warning"
                          : insight.type === "Potential Saving"
                          ? "saving"
                          : "trend"
                      }`}
                      key={index}
                    >
                      <div className="insight-icon">
                        {insight.type === "Spending Analysis"
                          ? "!"
                          : insight.type === "Potential Saving"
                          ? "$"
                          : "%"}
                      </div>

                      <div className="insight-content">
                        <div className="insight-title-row">
                          <h3>{insight.title}</h3>

                          <span className="insight-tag">
                            {insight.type}
                          </span>
                        </div>

                        <p>{insight.description}</p>

                        <button
                          className="insight-details-button"
                          onClick={() =>
                            setSelectedInsight(insight)
                          }
                        >
                          View Details
                        </button>
                      </div>

                      <div className="insight-value">
                        {insight.type === "Spending Analysis"
                          ? formatAmount(summary.total_spending)
                          : formatAmount(summary.savings)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No insights available</h3>

                    <p>
                      More transaction data is needed to generate insights.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="panel money-score-panel">
              <div className="panel-header">
                <div>
                  <h2>Money Health</h2>

                  <p>
                    Your current financial snapshot.
                  </p>
                </div>
              </div>

              <div
                className="money-health-ring"
                style={{
                  "--health-angle": `${healthProgress}deg`,
                }}
              >
                <div>
                  <strong>{financialHealth}</strong>
                  <span>/100</span>
                </div>
              </div>

              <h3>{healthText}</h3>

              <p className="health-description">
                Your financial health is calculated from your current
                income, spending, and savings data.
              </p>

              <div className="health-bars">
                <div className="health-bar-item">
                  <div>
                    <span>Spending Control</span>

                    <strong>{spendingControl}%</strong>
                  </div>

                  <div className="health-bar">
                    <span
                      style={{
                        width: `${spendingControl}%`,
                      }}
                    ></span>
                  </div>
                </div>

                <div className="health-bar-item">
                  <div>
                    <span>Savings</span>

                    <strong>{savingsScore}%</strong>
                  </div>

                  <div className="health-bar">
                    <span
                      style={{
                        width: `${savingsScore}%`,
                      }}
                    ></span>
                  </div>
                </div>

                <div className="health-bar-item">
                  <div>
                    <span>Risk Safety</span>

                    <strong>{riskSafety}%</strong>
                  </div>

                  <div className="health-bar">
                    <span
                      style={{
                        width: `${riskSafety}%`,
                      }}
                    ></span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {selectedInsight && (
        <div
          className="insight-modal-overlay"
          onClick={() => setSelectedInsight(null)}
        >
          <div
            className="insight-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="insight-modal-header">
              <div>
                <span className="insight-modal-icon">
                  AI
                </span>

                <h2>{selectedInsight.title}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedInsight(null)}
              >
                X
              </button>
            </div>

            <div className="insight-modal-body">
              <span className="insight-tag">
                {selectedInsight.type}
              </span>

              <p>{selectedInsight.description}</p>

              <div className="insight-recommendation">
                <h3>AI Recommendation</h3>

                <p>
                  Keep monitoring this financial pattern and review your
                  spending regularly. Small changes can improve your overall
                  financial health over time.
                </p>
              </div>
            </div>

            <div className="insight-modal-footer">
              <button
                className="review-button"
                onClick={() => setSelectedInsight(null)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoneyInsights;