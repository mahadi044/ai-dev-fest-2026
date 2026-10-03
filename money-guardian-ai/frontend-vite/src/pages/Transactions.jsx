import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTransactions,
  getRiskAnalysis,
  createTransaction,
  deleteTransaction,
} from "../services/api";

function Transactions() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [transactions, setTransactions] = useState([]);
  const [riskData, setRiskData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    merchant: "",
    category: "Food",
    amount: "",
    transaction_type: "Expense",
    status: "Completed",
    transaction_date: new Date()
      .toISOString()
      .slice(0, 16),
  });

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("moneyGuardianToken");

    setIsAuthenticated(Boolean(token));
  }, []);

  const loadTransactions = async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setRiskData([]);
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const [transactionResponse, riskResponse] =
        await Promise.all([
          getTransactions(),
          getRiskAnalysis(),
        ]);

      setTransactions(
        Array.isArray(transactionResponse)
          ? transactionResponse
          : []
      );

      setRiskData(
        Array.isArray(riskResponse?.results)
          ? riskResponse.results
          : []
      );
    } catch (err) {
      console.error(
        "Load transactions/risk error:",
        err
      );

      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("moneyGuardianToken");
        localStorage.removeItem("moneyGuardianProfile");

        setIsAuthenticated(false);
        setTransactions([]);
        setRiskData([]);
        setError("");
        return;
      }

      setError(
        "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [isAuthenticated]);

  /*
   * =========================================================
   * MERGE TRANSACTIONS WITH CALCULATED RISK
   * =========================================================
   *
   * Risk Guardian is the single source of truth for:
   * risk_score
   * risk_level
   * reasons
   */

  const formattedTransactions =
    transactions.map((transaction) => {
      const calculatedRisk =
        riskData.find(
          (risk) => risk.id === transaction.id
        );

      return {
        ...transaction,

        amount:
          Number(transaction?.amount) || 0,

        risk:
          calculatedRisk?.risk_level || "Low",

        riskScore:
          calculatedRisk?.risk_score ?? 0,

        riskReasons:
          calculatedRisk?.reasons || [],

        merchant:
          transaction?.merchant ||
          "Unknown merchant",

        category:
          transaction?.category ||
          "Other",

        status:
          transaction?.status ||
          "Completed",

        date: transaction?.transaction_date
          ? new Date(
              transaction.transaction_date
            ).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "Date unavailable",
      };
    });

  const filteredTransactions =
    formattedTransactions.filter(
      (transaction) => {
        const searchText =
          search.trim().toLowerCase();

        const matchesSearch =
          transaction.merchant
            .toLowerCase()
            .includes(searchText) ||
          transaction.category
            .toLowerCase()
            .includes(searchText);

        const matchesFilter =
          filter === "All" ||
          transaction.category === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  const totalIncome =
    transactions
      .filter(
        (transaction) =>
          Number(transaction?.amount) > 0
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount),
        0
      );

  const totalSpending =
    transactions
      .filter(
        (transaction) =>
          Number(transaction?.amount) < 0
      )
      .reduce(
        (total, transaction) =>
          total +
          Math.abs(
            Number(transaction.amount)
          ),
        0
      );

  /*
   * IMPORTANT:
   * Flagged count now uses calculated risk,
   * not database risk_level.
   */
  const flaggedTransactions =
    formattedTransactions.filter(
      (transaction) =>
        transaction.risk === "High" ||
        transaction.risk === "Medium"
    ).length;

  const handleAddTransaction =
    async (event) => {
      event.preventDefault();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (
        !newTransaction.merchant.trim() ||
        !newTransaction.amount
      ) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        const numericAmount =
          Number(newTransaction.amount);

        if (
          !Number.isFinite(numericAmount) ||
          numericAmount <= 0
        ) {
          setError(
            "Please enter a valid amount."
          );
          return;
        }

        const finalAmount =
          newTransaction.transaction_type ===
          "Expense"
            ? -Math.abs(numericAmount)
            : Math.abs(numericAmount);

        /*
         * Do NOT send risk_level.
         *
         * Backend risk_service.py will calculate
         * the actual risk from the transaction.
         */
        await createTransaction({
          merchant:
            newTransaction.merchant.trim(),

          category:
            newTransaction.category,

          amount: finalAmount,

          transaction_type:
            newTransaction.transaction_type,

          status:
            newTransaction.status,

          transaction_date:
            new Date(
              newTransaction.transaction_date
            ).toISOString(),
        });

        setShowAddModal(false);

        setNewTransaction({
          merchant: "",
          category: "Food",
          amount: "",
          transaction_type: "Expense",
          status: "Completed",
          transaction_date:
            new Date()
              .toISOString()
              .slice(0, 16),
        });

        await loadTransactions();
      } catch (err) {
        console.error(
          "Create transaction error:",
          err
        );

        const status =
          err?.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          setIsAuthenticated(false);

          localStorage.removeItem(
            "access_token"
          );
          localStorage.removeItem(
            "token"
          );
          localStorage.removeItem(
            "moneyGuardianToken"
          );
          localStorage.removeItem(
            "moneyGuardianProfile"
          );

          setError(
            "Your session has expired. Please login again."
          );

          return;
        }

        setError(
          "Failed to add transaction."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDeleteTransaction =
    async (id) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this transaction?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await deleteTransaction(id);

        setTransactions(
          (current) =>
            current.filter(
              (transaction) =>
                transaction.id !== id
            )
        );

        setRiskData(
          (current) =>
            current.filter(
              (transaction) =>
                transaction.id !== id
            )
        );

        if (
          selectedTransaction?.id === id
        ) {
          setSelectedTransaction(null);
        }
      } catch (err) {
        console.error(
          "Delete transaction error:",
          err
        );

        const status =
          err?.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          setIsAuthenticated(false);
          setTransactions([]);
          setRiskData([]);
          return;
        }

        setError(
          "Failed to delete transaction."
        );
      }
    };

  /* =========================================================
     GUEST VIEW
  ========================================================= */

  if (!isAuthenticated) {
    return (
      <div className="transactions-page">
        <div className="page-header">
          <div>
            <h1>Transactions</h1>
            <p>
              View, search and understand
              your financial activity.
            </p>
          </div>
        </div>

        <div className="guest-transactions-card">
          <div className="guest-transactions-icon">
            ⇄
          </div>

          <span className="section-eyebrow">
            ACCOUNT REQUIRED
          </span>

          <h2>
            Login to manage your
            transactions
          </h2>

          <p>
            Your transaction information
            is private and will appear
            here only after you sign in
            to your account.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate("/login")
            }
          >
            Login to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <h1>Transactions</h1>

          <p>
            View, search and understand
            your financial activity.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          + Add Transaction
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="transaction-summary">
        <div className="transaction-summary-card">
          <span>Total Transactions</span>

          <strong>
            {transactions.length}
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Income</span>

          <strong>
            ৳
            {totalIncome.toLocaleString()}
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Total Spending</span>

          <strong>
            ৳
            {totalSpending.toLocaleString()}
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Flagged Transactions</span>

          <strong>
            {flaggedTransactions}
          </strong>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="empty-state">
          <h3>
            Loading transactions...
          </h3>

          <p>
            Please wait while your
            financial data is loading.
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="empty-state">
          <h3>
            Unable to process transaction
          </h3>

          <p>{error}</p>

          {error.includes("session") && (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate("/login")
              }
            >
              Login again
            </button>
          )}
        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      {!loading &&
        !error && (
          <div className="transaction-box">
            <div className="transaction-toolbar">
              <div className="search-box">
                <span className="search-symbol">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search merchant or category..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="filter-area">
                <span className="filter-symbol">
                  ☰
                </span>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Categories
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Income">
                    Income
                  </option>

                  <option value="Transfer">
                    Transfer
                  </option>

                  <option value="Groceries">
                    Groceries
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Transport">
                    Transport
                  </option>

                  <option value="Other">
                    Other
                  </option>
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
                  {filteredTransactions.map(
                    (transaction) => (
                      <tr
                        key={
                          transaction.id
                        }
                      >
                        <td>
                          <div className="transaction-name">
                            <div
                              className={
                                "transaction-icon " +
                                (transaction.amount >
                                0
                                  ? "income"
                                  : "expense")
                              }
                            >
                              {transaction.amount >
                              0
                                ? "↓"
                                : "↑"}
                            </div>

                            <div>
                              <strong>
                                {
                                  transaction.merchant
                                }
                              </strong>

                              <span>
                                Transaction #
                                {
                                  transaction.id
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {
                            transaction.category
                          }
                        </td>

                        <td>
                          {
                            transaction.date
                          }
                        </td>

                        <td
                          className={
                            transaction.amount >
                            0
                              ? "amount income-amount"
                              : "amount expense-amount"
                          }
                        >
                          {transaction.amount >
                          0
                            ? "+"
                            : "-"}
                          ৳
                          {Math.abs(
                            transaction.amount
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={
                              "status-badge " +
                              (transaction.status ===
                              "Review"
                                ? "review"
                                : "completed")
                            }
                          >
                            {
                              transaction.status
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              "risk-badge " +
                              transaction.risk.toLowerCase()
                            }
                          >
                            {
                              transaction.risk
                            }
                          </span>
                        </td>

                        <td>
                          <div className="transaction-actions">
                            <button
                              className="icon-button"
                              title="View risk analysis"
                              onClick={() =>
                                setSelectedTransaction(
                                  transaction
                                )
                              }
                            >
                              •••
                            </button>

                            <button
                              className="delete-button"
                              title="Delete transaction"
                              onClick={() =>
                                handleDeleteTransaction(
                                  transaction.id
                                )
                              }
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredTransactions.length ===
                0 && (
                <div className="empty-state">
                  <h3>
                    No transactions found
                  </h3>

                  <p>
                    {transactions.length ===
                    0
                      ? "You have not added any transactions yet."
                      : "Try changing your search or category filter."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* =====================================================
          ADD TRANSACTION MODAL
      ===================================================== */}

      {showAddModal && (
        <div
          className="risk-modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >
          <div
            className="risk-modal add-transaction-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="risk-modal-header">
              <div>
                <span className="risk-modal-label">
                  New Transaction
                </span>

                <h2>Add Transaction</h2>

                <p>
                  Add a new financial
                  activity to your
                  account.
                </p>
              </div>

              <button
                type="button"
                className="risk-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddTransaction
              }
            >
              <div className="risk-info-grid add-transaction-grid">
                <div>
                  <span>Merchant</span>

                  <input
                    type="text"
                    placeholder="e.g. Foodpanda"
                    value={
                      newTransaction.merchant
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        merchant:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <span>Amount</span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={
                      newTransaction.amount
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <span>Category</span>

                  <select
                    value={
                      newTransaction.category
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        category:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Food">
                      Food
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Groceries">
                      Groceries
                    </option>

                    <option value="Transfer">
                      Transfer
                    </option>

                    <option value="Income">
                      Income
                    </option>

                    <option value="Bills">
                      Bills
                    </option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <span>
                    Transaction Type
                  </span>

                  <select
                    value={
                      newTransaction.transaction_type
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        transaction_type:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Expense">
                      Expense
                    </option>

                    <option value="Income">
                      Income
                    </option>
                  </select>
                </div>

                <div>
                  <span>Status</span>

                  <select
                    value={
                      newTransaction.status
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        status:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Review">
                      Review
                    </option>

                    <option value="Pending">
                      Pending
                    </option>
                  </select>
                </div>

                <div>
                  <span>Date & Time</span>

                  <input
                    type="datetime-local"
                    value={
                      newTransaction.transaction_date
                    }
                    onChange={(event) =>
                      setNewTransaction({
                        ...newTransaction,
                        transaction_date:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="risk-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          TRANSACTION DETAIL MODAL
      ===================================================== */}

      {selectedTransaction && (
        <div
          className="risk-modal-overlay"
          onClick={() =>
            setSelectedTransaction(null)
          }
        >
          <div
            className="risk-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="risk-modal-header">
              <div>
                <span className="risk-modal-label">
                  Transaction Risk Analysis
                </span>

                <h2>
                  {
                    selectedTransaction.merchant
                  }
                </h2>

                <p>
                  Transaction #
                  {
                    selectedTransaction.id
                  }
                </p>
              </div>

              <button
                type="button"
                className="risk-modal-close"
                onClick={() =>
                  setSelectedTransaction(null)
                }
              >
                ×
              </button>
            </div>

            <div className="risk-score-card">
              <div>
                <span>AI Risk Score</span>

                <strong>
                  {
                    selectedTransaction.riskScore
                  }

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
                    Number(
                      selectedTransaction.amount
                    )
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Date & Time</span>

                <strong>
                  {
                    selectedTransaction.date
                  }
                </strong>
              </div>

              <div>
                <span>Category</span>

                <strong>
                  {
                    selectedTransaction.category
                  }
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {
                    selectedTransaction.status
                  }
                </strong>
              </div>
            </div>

            <div className="ai-explanation">
              <div className="ai-explanation-title">
                <span>AI</span>

                <strong>
                  Why was this transaction
                  assigned this risk level?
                </strong>
              </div>

              {selectedTransaction.riskReasons
                .length > 0 ? (
                <ul>
                  {selectedTransaction.riskReasons.map(
                    (reason, index) => (
                      <li key={index}>
                        {reason}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No major risk signals
                  detected.
                </p>
              )}
            </div>

            {selectedTransaction.risk ===
              "High" && (
              <div className="risk-recommendation">
                <div className="recommendation-icon">
                  !
                </div>

                <div>
                  <strong>
                    Recommended Action
                  </strong>

                  <p>
                    Verify this
                    transaction before
                    taking further action.
                  </p>
                </div>
              </div>
            )}

            <div className="risk-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedTransaction(null)
                }
              >
                Close
              </button>

              {selectedTransaction.risk ===
                "High" && (
                <button
                  type="button"
                  className="verify-button"
                >
                  Verify Transaction
                </button>
              )}

              <button
                type="button"
                className="delete-button modal-delete-button"
                onClick={() =>
                  handleDeleteTransaction(
                    selectedTransaction.id
                  )
                }
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;