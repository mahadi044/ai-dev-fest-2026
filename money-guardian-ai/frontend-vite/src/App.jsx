import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Transactions from "./pages/Transactions";

function Dashboard() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <h2>Money Guardian</h2>
            <span>Financial Intelligence</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-label">OVERVIEW</p>

          <Link to="/" className="nav-item active">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/transactions" className="nav-item">
            <span>↔</span>
            Transactions
          </Link>

          <p className="nav-label">INTELLIGENCE</p>

          <button className="nav-item">
            <span>◈</span>
            Risk Guardian
          </button>

          <button className="nav-item">
            <span>◔</span>
            Money Insights
          </button>

          <button className="nav-item">
            <span>◇</span>
            What-If Simulator
          </button>

          <button className="nav-item">
            <span>✦</span>
            AI Assistant
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="settings">
            <span>⚙</span>
            Settings
          </button>

          <div className="profile">
            <div className="avatar">MM</div>

            <div className="profile-info">
              <strong>Mahadi Mukit</strong>
              <span>Personal account</span>
            </div>

            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Good evening, Mahadi</h1>
            <p className="subtitle">
              Here's your financial overview for today.
            </p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">⌕</button>

            <button className="icon-button notification">
              ♢
              <span></span>
            </button>

            <button className="date-button">
              <span>September 2026</span>
              <b>⌄</b>
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div>
            <span className="hero-label">TOTAL AVAILABLE BALANCE</span>

            <h2>৳84,520.00</h2>

            <div className="balance-change">
              <span>↗ 8.4%</span>
              <p>from last month</p>
            </div>
          </div>

          <div className="hero-right">
            <span>FINANCIAL HEALTH</span>

            <div className="health-score">
              <strong>82</strong>
              <small>/100</small>
            </div>

            <p>Healthy financial position</p>
          </div>
        </section>

        <section className="stat-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Monthly spending</span>
              <div className="stat-icon spending-icon">↘</div>
            </div>

            <h3>৳32,480</h3>

            <p>
              <strong className="positive">4.2% lower</strong> than last month
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Monthly savings</span>
              <div className="stat-icon savings-icon">↗</div>
            </div>

            <h3>৳18,750</h3>

            <p>
              <strong className="positive">12.6% higher</strong> than last month
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Risk score</span>
              <div className="stat-icon risk-icon">◈</div>
            </div>

            <h3>
              18 <small>/ 100</small>
            </h3>

            <p>
              <strong className="positive">Low risk</strong> · No critical alerts
            </p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel spending-panel">
            <div className="panel-header">
              <div>
                <h3>Spending overview</h3>
                <p>Track how your spending changes over time.</p>
              </div>

              <button className="select-button">
                Last 6 months
                <span>⌄</span>
              </button>
            </div>

            <div className="chart">
              <div className="chart-lines">
                <span>৳40k</span>
                <span>৳30k</span>
                <span>৳20k</span>
                <span>৳10k</span>
                <span>৳0</span>
              </div>

              <div className="bars">
                <div className="bar-group">
                  <div className="bar" style={{ height: "46%" }}></div>
                  <span>Apr</span>
                </div>

                <div className="bar-group">
                  <div className="bar" style={{ height: "64%" }}></div>
                  <span>May</span>
                </div>

                <div className="bar-group">
                  <div className="bar" style={{ height: "54%" }}></div>
                  <span>Jun</span>
                </div>

                <div className="bar-group">
                  <div className="bar" style={{ height: "78%" }}></div>
                  <span>Jul</span>
                </div>

                <div className="bar-group">
                  <div className="bar" style={{ height: "67%" }}></div>
                  <span>Aug</span>
                </div>

                <div className="bar-group current">
                  <div className="bar" style={{ height: "52%" }}></div>
                  <span>Sep</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel risk-panel">
            <div className="panel-header">
              <div>
                <h3>Risk Guardian</h3>
                <p>Transaction safety monitoring</p>
              </div>

              <span className="protected-badge">Protected</span>
            </div>

            <div className="risk-content">
              <div className="risk-ring">
                <strong>18</strong>
                <span>Low</span>
              </div>

              <div className="risk-description">
                <h4>Your account looks safe</h4>

                <p>
                  No unusual transaction patterns were detected recently.
                </p>
              </div>
            </div>

            <div className="risk-footer">
              <span>✓</span>

              <div>
                <strong>All recent transactions analyzed</strong>
                <p>Last checked 8 minutes ago</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <h3>Recent transactions</h3>
                <p>Your latest financial activity.</p>
              </div>

              <Link to="/transactions" className="text-button">
                View all →
              </Link>
            </div>

            <div className="transaction-list">
              <div className="transaction">
                <div className="transaction-icon food">F</div>

                <div className="transaction-details">
                  <strong>Food & Dining</strong>
                  <span>Today · 2:15 PM</span>
                </div>

                <strong className="transaction-amount negative">
                  −৳850
                </strong>
              </div>

              <div className="transaction">
                <div className="transaction-icon shopping">S</div>

                <div className="transaction-details">
                  <strong>Shopping</strong>
                  <span>Yesterday · 6:42 PM</span>
                </div>

                <strong className="transaction-amount negative">
                  −৳2,400
                </strong>
              </div>

              <div className="transaction">
                <div className="transaction-icon income">+</div>

                <div className="transaction-details">
                  <strong>Salary</strong>
                  <span>Sep 28 · 10:00 AM</span>
                </div>

                <strong className="transaction-amount positive">
                  +৳45,000
                </strong>
              </div>
            </div>
          </div>

          <div className="panel insight-panel">
            <div className="insight-heading">
              <div className="ai-mark">✦</div>

              <div>
                <h3>AI money insight</h3>
                <span>Personalized for you</span>
              </div>
            </div>

            <div className="insight-message">
              <p>
                Your <strong>food spending increased by 18%</strong> this
                month compared with your recent average.
              </p>

              <p>
                Reducing food expenses by around 20% could help you save
                approximately <strong>৳2,100</strong> more next month.
              </p>
            </div>

            <button className="insight-button">
              Explore my insights
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;