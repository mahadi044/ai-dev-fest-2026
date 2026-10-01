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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>View, search and understand your financial activity.</p>
        </div>

        <button className="primary-button">
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Transaction Table */}
      <div className="transaction-box">
        {/* Toolbar */}
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

        {/* Table */}
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
                  {/* Transaction */}
                  <td>
                    <div className="transaction-name">
                      <div
                        className={`transaction-icon ${
                          transaction.amount > 0
                            ? "income"
                            : "expense"
                        }`}
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

                  {/* Category */}
                  <td>{transaction.category}</td>

                  {/* Date */}
                  <td>{transaction.date}</td>

                  {/* Amount */}
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

                  {/* Status */}
                  <td>
                    <span
                      className={`status-badge ${
                        transaction.status === "Review"
                          ? "review"
                          : "completed"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>

                  {/* Risk */}
                  <td>
                    <span
                      className={`risk-badge ${transaction.risk.toLowerCase()}`}
                    >
                      {transaction.risk}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      className="icon-button"
                      title="More options"
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
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
    </div>
  );
}

export default Transactions;