import { useState } from "react";

const transactions = [
  {
    id: 1,
    merchant: "Foodpanda",
    category: "Food",
    date: "Oct 01, 2026 • 08:42 PM",
    amount: -850,
    status: "Completed",
    risk: "Low",
  },
  {
    id: 2,
    merchant: "Daraz",
    category: "Shopping",
    date: "Oct 01, 2026 • 03:18 PM",
    amount: -4250,
    status: "Completed",
    risk: "Low",
  },
  {
    id: 3,
    merchant: "Salary Credit",
    category: "Income",
    date: "Oct 01, 2026 • 10:05 AM",
    amount: 45000,
    status: "Completed",
    risk: "Low",
  },
  {
    id: 4,
    merchant: "Unknown Merchant",
    category: "Transfer",
    date: "Sep 30, 2026 • 02:31 AM",
    amount: -20000,
    status: "Review",
    risk: "High",
  },
  {
    id: 5,
    merchant: "Shwapno",
    category: "Groceries",
    date: "Sep 29, 2026 • 07:24 PM",
    amount: -2350,
    status: "Completed",
    risk: "Low",
  },
  {
    id: 6,
    merchant: "bKash Transfer",
    category: "Transfer",
    date: "Sep 29, 2026 • 01:12 PM",
    amount: -1500,
    status: "Completed",
    risk: "Medium",
  },
];

function Transactions() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      transaction.merchant.toLowerCase().includes(searchText) ||
      transaction.category.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || transaction.category === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="transactions-page">

      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>View, search and understand your financial activity.</p>
        </div>

        <button className="primary-button">
          + Add Transaction
        </button>
      </div>

      <div className="transaction-summary">

        <div className="transaction-summary-card">
          <span>Total Transactions</span>
          <strong>128</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Income</span>
          <strong>৳85,500</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Spending</span>
          <strong>৳42,750</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Flagged Transactions</span>
          <strong>4</strong>
        </div>

      </div>

      <div className="transaction-box">

        <div className="transaction-toolbar">

          <div className="search-box">
            <span className="search-symbol">⌕</span>

            <input
              type="text"
              placeholder="Search merchant or category..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filter-area">
            <span className="filter-symbol">☰</span>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Income">Income</option>
              <option value="Transfer">Transfer</option>
              <option value="Groceries">Groceries</option>
            </select>
          </div>

        </div>

        <div className="transaction-table-wrapper">

          <table className="transaction-table">

            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.map((transaction) => (

                <tr key={transaction.id}>

                  <td>
                    <div className="transaction-name">

                      <div
                        className={
                          "transaction-icon " +
                          (transaction.amount > 0
                            ? "income"
                            : "expense")
                        }
                      >
                        {transaction.amount > 0 ? "↓" : "↑"}
                      </div>

                      <div>
                        <strong>{transaction.merchant}</strong>

                        <span>
                          Transaction #{transaction.id}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td>
                    {transaction.category}
                  </td>

                  <td>
                    {transaction.date}
                  </td>

                  <td
                    className={
                      transaction.amount > 0
                        ? "amount income-amount"
                        : "amount expense-amount"
                    }
                  >
                    {transaction.amount > 0 ? "+" : "-"}
                    ৳
                    {Math.abs(transaction.amount).toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={
                        "status-badge " +
                        (transaction.status === "Review"
                          ? "review"
                          : "completed")
                      }
                    >
                      {transaction.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        "risk-badge " +
                        transaction.risk.toLowerCase()
                      }
                    >
                      {transaction.risk}
                    </span>
                  </td>

                  <td>
                    <button
                      className="icon-button"
                      title="View risk analysis"
                      onClick={() =>
                        setSelectedTransaction(transaction)
                      }
                    >
                      •••
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredTransactions.length === 0 && (
            <div className="empty-state">
              <h3>No transactions found</h3>
              <p>
                Try changing your search or category filter.
              </p>
            </div>
          )}

        </div>

      </div>

      {selectedTransaction && (
        <div
          className="risk-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="risk-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="risk-modal-header">

              <div>
                <span className="risk-modal-label">
                  Transaction Risk Analysis
                </span>

                <h2>
                  {selectedTransaction.merchant}
                </h2>

                <p>
                  Transaction #{selectedTransaction.id}
                </p>
              </div>

              <button
                className="risk-modal-close"
                onClick={() => setSelectedTransaction(null)}
              >
                ×
              </button>

            </div>

            <div className="risk-score-card">

              <div>
                <span>AI Risk Score</span>

                <strong>
                  {selectedTransaction.risk === "High"
                    ? "91"
                    : selectedTransaction.risk === "Medium"
                    ? "58"
                    : "12"}

                  <small>/100</small>
                </strong>
              </div>

              <div
                className={
                  "large-risk-badge " +
                  selectedTransaction.risk.toLowerCase()
                }
              >
                {selectedTransaction.risk} Risk
              </div>

            </div>

            <div className="risk-info-grid">

              <div>
                <span>Amount</span>
                <strong>
                  ৳
                  {Math.abs(
                    selectedTransaction.amount
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Date & Time</span>
                <strong>
                  {selectedTransaction.date}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {selectedTransaction.category}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedTransaction.status}
                </strong>
              </div>

            </div>

            {selectedTransaction.risk === "High" ? (
              <>
                <div className="ai-explanation">

                  <div className="ai-explanation-title">
                    <span>AI</span>

                    <strong>
                      Why is this transaction risky?
                    </strong>
                  </div>

                  <ul>
                    <li>
                      Transaction happened at an unusual
                      time: 2:31 AM.
                    </li>

                    <li>
                      The receiver is new and has no
                      previous transaction history.
                    </li>

                    <li>
                      ৳20,000 is significantly higher than
                      your normal transaction amount.
                    </li>

                    <li>
                      The transaction was made from a
                      new device.
                    </li>
                  </ul>

                </div>

                <div className="risk-recommendation">

                  <div className="recommendation-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      Recommended Action
                    </strong>

                    <p>
                      Verify this transaction before
                      taking any further action.
                    </p>
                  </div>

                </div>
              </>
            ) : (
              <div className="safe-analysis">

                <strong>
                  No major risk signals detected.
                </strong>

                <p>
                  This transaction appears consistent
                  with your normal financial activity.
                </p>

              </div>
            )}

            <div className="risk-modal-footer">

              <button
                className="secondary-button"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </button>

              {selectedTransaction.risk === "High" && (
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

export default Transactions;