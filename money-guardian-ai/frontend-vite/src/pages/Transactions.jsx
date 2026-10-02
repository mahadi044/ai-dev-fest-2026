import { useEffect, useState } from "react";
import { getTransactions } from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const formattedTransactions = transactions.map((transaction) => ({
    ...transaction,
    risk: transaction.risk_level || "Low",
    date: new Date(transaction.transaction_date).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }));

  const filteredTransactions = formattedTransactions.filter((transaction) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      transaction.merchant.toLowerCase().includes(searchText) ||
      transaction.category.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || transaction.category === filter;

    return matchesSearch && matchesFilter;
  });

  const totalIncome = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalSpending = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  const flaggedTransactions = transactions.filter(
    (transaction) =>
      transaction.risk_level === "High" ||
      transaction.status === "Review"
  ).length;

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
          <strong>{transactions.length}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Income</span>
          <strong>৳{totalIncome.toLocaleString()}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Spending</span>
          <strong>৳{totalSpending.toLocaleString()}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Flagged Transactions</span>
          <strong>{flaggedTransactions}</strong>
        </div>

      </div>

      {loading && (
        <div className="empty-state">
          <h3>Loading transactions...</h3>
          <p>Please wait while your financial data is loading.</p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h3>Unable to load transactions</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
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
                      {transaction.amount > 0 ? "+" : "-"}৳
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
      )}

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
                      Transaction was flagged as high risk by the risk system.
                    </li>

                    <li>
                      The transaction amount is unusually high compared with normal activity.
                    </li>

                    <li>
                      The transaction status requires review.
                    </li>

                    <li>
                      Additional verification is recommended before taking action.
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
                      Verify this transaction before taking any further action.
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
                  This transaction appears consistent with your normal financial activity.
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
