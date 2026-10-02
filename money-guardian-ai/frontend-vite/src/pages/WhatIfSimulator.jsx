import { useState } from "react";

function WhatIfSimulator() {
  const [monthlySaving, setMonthlySaving] = useState(3000);
  const [months, setMonths] = useState(6);

  const projectedSavings = monthlySaving * months;

  const healthImpact =
    projectedSavings >= 20000
      ? "Strong"
      : projectedSavings >= 10000
      ? "Positive"
      : "Moderate";

  return (
    <div className="what-if-page">
      <div className="page-header">
        <div>
          <div className="protected-badge">✦ AI POWERED</div>
          <h1>What-If Simulator</h1>
          <p>
            See how small changes in your spending and saving habits could
            affect your financial future.
          </p>
        </div>
      </div>

      <div className="what-if-grid">
        <section className="panel simulator-panel">
          <div className="panel-header">
            <div>
              <h2>Build Your Scenario</h2>
              <p>Adjust the values and see your projected savings.</p>
            </div>
          </div>

          <div className="simulator-form">
            <label>
              Monthly Saving
              <div className="input-with-symbol">
                <span>৳</span>
                <input
                  type="number"
                  min="0"
                  value={monthlySaving}
                  onChange={(e) =>
                    setMonthlySaving(Number(e.target.value))
                  }
                />
              </div>
            </label>

            <label>
              Time Period
              <div className="input-with-symbol">
                <input
                  type="number"
                  min="1"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                />
                <span>months</span>
              </div>
            </label>
          </div>

          <div className="scenario-preview">
            <span>Scenario</span>
            <strong>
              Save ৳{monthlySaving.toLocaleString()} every month
            </strong>
            <p>for {months} months</p>
          </div>
        </section>

        <section className="panel projection-panel">
          <div className="panel-header">
            <div>
              <h2>Projected Result</h2>
              <p>Your estimated savings from this scenario.</p>
            </div>
          </div>

          <div className="projection-value">
            <span>Projected Savings</span>
            <strong>৳{projectedSavings.toLocaleString()}</strong>
          </div>

          <div className="projection-stats">
            <div>
              <span>Monthly Saving</span>
              <strong>৳{monthlySaving.toLocaleString()}</strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>{months} months</strong>
            </div>

            <div>
              <span>Financial Impact</span>
              <strong>{healthImpact}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel ai-recommendation-panel">
        <div className="ai-recommendation-icon">✦</div>

        <div>
          <div className="protected-badge">AI RECOMMENDATION</div>
          <h2>Small changes can make a difference.</h2>

          <p>
            If you consistently save ৳{monthlySaving.toLocaleString()} every
            month, you could build approximately ৳
            {projectedSavings.toLocaleString()} in {months} months.
            Consider reducing unnecessary spending and keeping this amount
            aside regularly.
          </p>
        </div>
      </section>
    </div>
  );
}

export default WhatIfSimulator;
