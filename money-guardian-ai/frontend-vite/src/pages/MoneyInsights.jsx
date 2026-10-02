import { useState } from "react";

const insights = [
  {
    type: "warning",
    icon: "⚠️",
    title: "Late-Night Spending Detected",
    description:
      "You made a ৳20,000 transfer at 2:31 AM. Transactions at unusual hours can indicate higher financial risk.",
    value: "৳20,000",
    tag: "Needs Attention",
  },
  {
    type: "trend",
    icon: "📈",
    title: "Food Spending Increased",
    description:
      "Your food-related spending is higher than your recent average.",
    value: "+18%",
    tag: "Spending Trend",
  },
  {
    type: "saving",
    icon: "💰",
    title: "Savings Opportunity",
    description:
      "Reducing non-essential shopping by around ৳1,500 per month could increase your available savings.",
    value: "৳1,500",
    tag: "Potential Saving",
  },
];

function MoneyInsights() {
  const [selectedInsight, setSelectedInsight] = useState(null);

  return (
    <div className="money-insights-page">
      <div className="page-header">
        <div>
          <div className="protected-badge">✦ AI POWERED</div>
          <h1>Money Insights</h1>
          <p>
            AI-powered observations to help you understand your money better.
          </p>
        </div>
      </div>

      <div className="insights-summary-grid">
        <div className="insight-summary-card">
          <span className="summary-icon">◉</span>
          <div>
            <p>Financial Health</p>
            <h2>82<span>/100</span></h2>
          </div>
        </div>

        <div className="insight-summary-card">
          <span className="summary-icon">↗</span>
          <div>
            <p>Monthly Spending</p>
            <h2>৳28,950</h2>
          </div>
        </div>

        <div className="insight-summary-card">
          <span className="summary-icon">◇</span>
          <div>
            <p>Potential Savings</p>
            <h2>৳1,500</h2>
          </div>
        </div>
      </div>

      <div className="insights-main-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>AI Money Insights</h2>
              <p>Important patterns detected from your transactions.</p>
            </div>
            <span className="ai-status">● AI Active</span>
          </div>

          <div className="insight-list">
            {insights.map((insight, index) => (
              <div className={`money-insight-card ${insight.type}`} key={index}>
                <div className="insight-icon">{insight.icon}</div>

                <div className="insight-content">
                  <div className="insight-title-row">
                    <h3>{insight.title}</h3>
                    <span className="insight-tag">{insight.tag}</span>
                  </div>

                  <p>{insight.description}</p>

                  <button
                    className="insight-details-button"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    View Details →
                  </button>
                </div>

                <div className="insight-value">
                  {insight.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel money-score-panel">
          <div className="panel-header">
            <div>
              <h2>Money Health</h2>
              <p>Your current financial snapshot.</p>
            </div>
          </div>

          <div className="money-health-ring">
            <div>
              <strong>82</strong>
              <span>/100</span>
            </div>
          </div>

          <h3>Good Financial Health</h3>
          <p className="health-description">
            Your spending is currently manageable, but there are a few
            opportunities to improve your savings.
          </p>

          <div className="health-bars">
            <div className="health-bar-item">
              <div>
                <span>Spending Control</span>
                <strong>84%</strong>
              </div>
              <div className="health-bar">
                <span style={{ width: "84%" }}></span>
              </div>
            </div>

            <div className="health-bar-item">
              <div>
                <span>Savings</span>
                <strong>76%</strong>
              </div>
              <div className="health-bar">
                <span style={{ width: "76%" }}></span>
              </div>
            </div>

            <div className="health-bar-item">
              <div>
                <span>Risk Safety</span>
                <strong>90%</strong>
              </div>
              <div className="health-bar">
                <span style={{ width: "90%" }}></span>
              </div>
            </div>
          </div>
        </section>
      </div>

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
                  {selectedInsight.icon}
                </span>
                <h2>{selectedInsight.title}</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedInsight(null)}
              >
                ×
              </button>
            </div>

            <div className="insight-modal-body">
              <span className="insight-tag">{selectedInsight.tag}</span>

              <p>{selectedInsight.description}</p>

              <div className="insight-recommendation">
                <h3>💡 AI Recommendation</h3>

                <p>
                  Keep monitoring this pattern and review your spending
                  regularly. Small changes can improve your overall financial
                  health over time.
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