import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import "./App.css";
import api from "./services/api";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Transactions from "./pages/Transactions";
import RiskGuardian from "./pages/RiskGuardian";
import MoneyInsights from "./pages/MoneyInsights";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import AIAssistant from "./pages/AI Assistant";

/* =========================================================
   AUTH / PROFILE HELPERS
========================================================= */

const GUEST_PROFILE = {
  name: "Guest",
  email: "",
};

function getAuthToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("moneyGuardianToken") ||
    ""
  );
}

function clearAuthStorage() {
  const authKeys = [
    "access_token",
    "token",
    "moneyGuardianToken",
    "moneyGuardianProfile",
  ];

  authKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
}

function getStoredProfile() {
  try {
    const saved = localStorage.getItem("moneyGuardianProfile");

    if (!saved) {
      return GUEST_PROFILE;
    }

    const parsed = JSON.parse(saved);

    return {
      ...GUEST_PROFILE,
      ...parsed,
    };
  } catch {
    return GUEST_PROFILE;
  }
}

function normalizeUserProfile(response) {
  const data = response?.data || {};

  const user =
    data?.user ||
    data?.account ||
    data?.profile ||
    data;

  const name =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "Your Profile";

  const email = user?.email || "";

  return {
    name,
    email,
  };
}

/* =========================================================
   GENERAL HELPERS
========================================================= */

function amountOf(transaction) {
  const possibleValues = [
    transaction?.amount,
    transaction?.value,
    transaction?.total,
  ];

  for (const value of possibleValues) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return Math.abs(number);
    }
  }

  return 0;
}

function getTransactionType(transaction) {
  const value = String(
    transaction?.type ||
      transaction?.transaction_type ||
      transaction?.category_type ||
      ""
  ).toLowerCase();

  if (
    value.includes("income") ||
    value.includes("credit") ||
    value.includes("deposit")
  ) {
    return "income";
  }

  if (
    value.includes("expense") ||
    value.includes("debit") ||
    value.includes("withdraw")
  ) {
    return "expense";
  }

  if (
    transaction?.is_income === true ||
    transaction?.income === true
  ) {
    return "income";
  }

  return "expense";
}

function formatMoney(value) {
  const number = Number(value) || 0;

  return `৳${number.toLocaleString("en-BD", {
    maximumFractionDigits: 0,
  })}`;
}

function formatCompactMoney(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `৳${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `৳${(number / 1000).toFixed(1)}K`;
  }

  return formatMoney(number);
}

function getTransactionName(transaction) {
  return (
    transaction?.name ||
    transaction?.title ||
    transaction?.description ||
    transaction?.merchant ||
    transaction?.merchant_name ||
    "Transaction"
  );
}

function getCategory(transaction) {
  return (
    transaction?.category ||
    transaction?.category_name ||
    transaction?.type ||
    "Other"
  );
}

function getTransactionDate(transaction) {
  return (
    transaction?.date ||
    transaction?.transaction_date ||
    transaction?.created_at ||
    transaction?.timestamp ||
    null
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRiskScore(transaction) {
  const possible = [
    transaction?.risk_score,
    transaction?.riskScore,
    transaction?.score,
  ];

  for (const value of possible) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return Math.max(0, Math.min(100, number));
    }
  }

  return 0;
}

function getRiskLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

function getInitials(name) {
  if (!name) return "GU";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeArray(response, keys = []) {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    dashboard: (
      <>
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
        />
      </>
    ),

    transactions: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
        <circle cx="18" cy="17" r="2" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.5-2.8 8.2-7 10-4.2-1.8-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),

    insights: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V3" />
      </>
    ),

    simulator: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M7 15l4-4 3 2 5-6" />
      </>
    ),

    assistant: (
      <>
        <path d="M12 3a7 7 0 0 0-7 7v3a3 3 0 0 0 3 3h1v-5H7" />
        <path d="M12 3a7 7 0 0 1 7 7v3a3 3 0 0 1-3 3h-1v-5h2" />
        <path d="M9 20h6" />
        <path d="M10 17v3" />
        <path d="M14 17v3" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H7v-2.4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L10 6.9l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    calendar: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </>
    ),

    arrowUp: (
      <>
        <path d="M12 19V5" />
        <path d="m6 11 6-6 6 6" />
      </>
    ),

    arrowDown: (
      <>
        <path d="M12 5v14" />
        <path d="m18 13-6 6-6-6" />
      </>
    ),

    wallet: (
      <>
        <path d="M4 7V5a2 2 0 0 1 2-2h12" />
        <path d="M4 7h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7h1z" />
        <path d="M16 14h.01" />
      </>
    ),

    sparkles: (
      <>
        <path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3z" />
        <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z" />
      </>
    ),

    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    login: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
      </>
    ),

    logout: (
      <>
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H5" />
        <path d="M14 4V3a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a1 1 0 0 0 1-1v-1" />
      </>
    ),
  };

  return (
    <svg {...common}>
      {icons[name] || icons.dashboard}
    </svg>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  profile,
  isAuthenticated,
  onOpenProfile,
  onLogin,
  onLogout,
}) {
  const location = useLocation();

  const navItems = [
    {
      label: "Overview",
      path: "/",
      icon: "dashboard",
    },
    {
      label: "Transactions",
      path: "/transactions",
      icon: "transactions",
    },
    {
      label: "Risk Guardian",
      path: "/risk-guardian",
      icon: "shield",
    },
    {
      label: "Money Insights",
      path: "/money-insights",
      icon: "insights",
    },
    {
      label: "What-If Simulator",
      path: "/what-if-simulator",
      icon: "simulator",
    },
    {
      label: "AI Assistant",
      path: "/ai-assistant",
      icon: "assistant",
    },
  ];

  return (
    <aside className="sidebar">
      <Link to="/" className="brand">
        <div className="brand-mark">
          <span>MG</span>
        </div>

        <div>
          <h2>Money Guardian</h2>
          <span>AI Finance</span>
        </div>
      </Link>

      <nav className="navigation">
        <div className="nav-label">MAIN MENU</div>

        {navItems.map((item) => {
          const active =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(
                  item.path
                );

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${
                active ? "active" : ""
              }`}
            >
              <Icon
                name={item.icon}
                size={18}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="settings">
        <button
          type="button"
          className="nav-item"
        >
          <Icon
            name="settings"
            size={18}
          />

          <span>Settings</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="profile"
          onClick={onOpenProfile}
          aria-label="Open profile"
        >
          <div className="avatar">
            {getInitials(
              profile?.name || "Guest"
            )}
          </div>

          <div className="profile-info">
            <strong>
              {isAuthenticated
                ? profile?.name ||
                  "Your Profile"
                : "Guest"}
            </strong>

            <span>
              {isAuthenticated
                ? "Personal account"
                : "Not signed in"}
            </span>
          </div>

          <span className="profile-more">
            •••
          </span>
        </button>
      </div>

      <div className="sidebar-auth">
        <button
          type="button"
          className={`auth-action ${
            isAuthenticated
              ? "auth-action-logout"
              : "auth-action-login"
          }`}
          onClick={
            isAuthenticated
              ? onLogout
              : onLogin
          }
        >
          <Icon
            name={
              isAuthenticated
                ? "logout"
                : "login"
            }
            size={17}
          />

          <span>
            {isAuthenticated
              ? "Logout"
              : "Login"}
          </span>
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  searchValue,
  setSearchValue,
  profile,
  isAuthenticated,
  onOpenProfile,
  onLogin,
}) {
  const today = new Date();

  const formattedDate =
    today.toLocaleDateString(
      "en-BD",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title-row">
          <h1>
            {getGreeting()},{" "}
            {isAuthenticated
              ? profile?.name?.split(
                  " "
                )[0] || "there"
              : "there"}
          </h1>
        </div>

        <p className="topbar-subtitle">
          {isAuthenticated
            ? "Your financial command center is ready."
            : "Explore Money Guardian. Sign in to access your financial data."}
        </p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Icon
            name="search"
            size={17}
          />

          <input
            type="text"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder={
              isAuthenticated
                ? "Search transactions..."
                : "Login to search transactions"
            }
            aria-label="Search transactions"
            disabled={!isAuthenticated}
          />
        </div>

        <button
          type="button"
          className="icon-button notification"
          aria-label="Notifications"
          disabled={!isAuthenticated}
        >
          <Icon
            name="bell"
            size={18}
          />
        </button>

        <div className="date-button">
          <Icon
            name="calendar"
            size={16}
          />

          <span>{formattedDate}</span>
        </div>

        <button
          type="button"
          className="profile-control"
          onClick={
            isAuthenticated
              ? onOpenProfile
              : onLogin
          }
          aria-label={
            isAuthenticated
              ? "Open profile"
              : "Login"
          }
        >
          <div className="profile-control-avatar">
            {getInitials(
              profile?.name ||
                "Guest"
            )}
          </div>

          <div className="profile-control-info">
            <strong>
              {isAuthenticated
                ? profile?.name ||
                  "Profile"
                : "Guest"}
            </strong>

            <span>
              {isAuthenticated
                ? "Personal"
                : "Sign in"}
            </span>
          </div>

          <span className="profile-chevron">
            ⌄
          </span>
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   PROFILE MODAL
========================================================= */

function ProfileModal({
  profile,
  setProfile,
  isAuthenticated,
  onClose,
  onLogin,
}) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
  });

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      email: profile?.email || "",
    });
  }, [profile]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function save() {
    if (!isAuthenticated) {
      return;
    }

    const cleanProfile = {
      name:
        form.name.trim() ||
        "Your Profile",
      email: form.email.trim(),
    };

    localStorage.setItem(
      "moneyGuardianProfile",
      JSON.stringify(
        cleanProfile
      )
    );

    setProfile(cleanProfile);
    onClose();
  }

  function handleOverlayClick(
    event
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={
        handleOverlayClick
      }
      role="presentation"
    >
      <div
        className="modal-card profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-description"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div className="modal-heading">
            <span className="modal-eyebrow">
              ACCOUNT
            </span>

            <h2 id="profile-modal-title">
              {isAuthenticated
                ? "Your Profile"
                : "Guest Profile"}
            </h2>

            <p id="profile-modal-description">
              {isAuthenticated
                ? "Manage the information shown in your dashboard."
                : "You are currently browsing Money Guardian as a guest."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        {isAuthenticated ? (
          <form
            className="profile-form"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <div className="profile-field">
              <label
                className="profile-field-label"
                htmlFor="profile-name"
              >
                Full name
              </label>

              <input
                id="profile-name"
                name="name"
                type="text"
                value={form.name}
                onChange={
                  handleChange
                }
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="profile-field">
              <label
                className="profile-field-label"
                htmlFor="profile-email"
              >
                Email
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={form.email}
                onChange={
                  handleChange
                }
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <div className="guest-profile-content">
            <div className="guest-profile-icon">
              <Icon
                name="login"
                size={28}
              />
            </div>

            <strong>
              No account is signed in
            </strong>

            <p>
              Login to see your account
              information and personal
              financial dashboard.
            </p>

            <button
              type="button"
              className="primary-button guest-login-button"
              onClick={() => {
                onClose();
                onLogin();
              }}
            >
              Login to account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  meta,
  tone = "blue",
  progress,
}) {
  return (
    <div
      className={`stat-card stat-${tone}`}
    >
      <div className="stat-top">
        <div className="stat-label">
          {label}
        </div>

        <div className="stat-icon">
          <Icon
            name={icon}
            size={19}
          />
        </div>
      </div>

      <strong>{value}</strong>

      {progress !== undefined ? (
        <div className="stat-progress">
          <div className="stat-progress-track">
            <span
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    progress
                  )
                )}%`,
              }}
            />
          </div>

          <span>
            {Math.round(progress)}%
            health score
          </span>
        </div>
      ) : (
        <p className="stat-meta">
          {meta}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   COMMAND CENTER
========================================================= */

function CommandCenter({
  monthlyIncome,
  monthlySpending,
  monthlySavings,
  savingsRate,
  spendingBreakdown,
  riskLevel,
  riskScore,
}) {
  const hasSpending =
    spendingBreakdown.length > 0;

  return (
    <section className="command-center">
      <div className="command-center-header">
        <div>
          <span className="section-eyebrow">
            FINANCIAL COMMAND CENTER
          </span>

          <h2>
            Your money, clearly organized.
          </h2>

          <p>
            A clear view of where your
            money is going and how
            you&apos;re doing.
          </p>
        </div>
      </div>

      <div className="command-center-grid">
        <div className="command-card">
          <div className="command-card-header">
            <span>Cash Flow</span>

            <div className="command-card-icon blue">
              <Icon
                name="wallet"
                size={18}
              />
            </div>
          </div>

          <strong>
            {formatMoney(
              monthlyIncome -
                monthlySpending
            )}
          </strong>

          <p>
            {monthlyIncome >
            monthlySpending
              ? "Positive monthly cash flow"
              : monthlyIncome ===
                monthlySpending
              ? "Income and spending are balanced"
              : "Spending is above income"}
          </p>

          <div className="cash-flow-mini">
            <span>
              Income{" "}
              <b>
                {formatCompactMoney(
                  monthlyIncome
                )}
              </b>
            </span>

            <span>
              Spending{" "}
              <b>
                {formatCompactMoney(
                  monthlySpending
                )}
              </b>
            </span>
          </div>
        </div>

        <div className="command-card">
          <div className="command-card-header">
            <span>
              Spending Breakdown
            </span>

            <div className="command-card-icon purple">
              <Icon
                name="insights"
                size={18}
              />
            </div>
          </div>

          {hasSpending ? (
            <div className="breakdown-list">
              {spendingBreakdown
                .slice(0, 3)
                .map((item) => (
                  <div
                    className="breakdown-item"
                    key={
                      item.category
                    }
                  >
                    <div className="breakdown-row">
                      <span>
                        {item.category}
                      </span>

                      <strong>
                        {formatMoney(
                          item.amount
                        )}
                      </strong>
                    </div>

                    <div className="breakdown-track">
                      <span
                        style={{
                          width: `${item.percent}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-mini">
              <span>
                No spending data yet
              </span>

              <small>
                Add transactions to
                see your breakdown.
              </small>
            </div>
          )}
        </div>

        <div className="command-card">
          <div className="command-card-header">
            <span>
              Saving Progress
            </span>

            <div className="command-card-icon green">
              <Icon
                name="arrowUp"
                size={18}
              />
            </div>
          </div>

          <strong>
            {formatMoney(
              monthlySavings
            )}
          </strong>

          <p>
            {monthlySavings > 0
              ? `${Math.round(
                  savingsRate
                )}% of income saved this month`
              : monthlySavings < 0
              ? "Your spending currently exceeds your income."
              : "No savings recorded this month yet."}
          </p>

          <div className="command-progress">
            <span
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    savingsRate
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="command-card">
          <div className="command-card-header">
            <span>
              Financial Signals
            </span>

            <div className="command-card-icon orange">
              <Icon
                name="shield"
                size={18}
              />
            </div>
          </div>

          <div
            className={`signal-status ${riskLevel.toLowerCase()}`}
          >
            <span className="signal-dot" />
            {riskLevel} Risk
          </div>

          <strong>
            {Math.round(
              riskScore
            )}%
          </strong>

          <p>
            {riskScore === 0
              ? "No risk signals detected yet."
              : "Based on your current transaction activity."}
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SPENDING CHART
========================================================= */

function SpendingChart({
  months,
}) {
  const max = Math.max(
    ...months.map(
      (item) => item.amount
    ),
    1
  );

  const width = 760;
  const height = 280;
  const paddingX = 42;
  const paddingTop = 22;
  const paddingBottom = 38;

  const chartWidth =
    width - paddingX * 2;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const points = months.map(
    (item, index) => {
      const x =
        months.length === 1
          ? width / 2
          : paddingX +
            (index /
              (months.length -
                1)) *
              chartWidth;

      const y =
        paddingTop +
        chartHeight -
        (item.amount / max) *
          chartHeight;

      return {
        ...item,
        x,
        y,
      };
    }
  );

  const linePath = points
    .map(
      (point, index) =>
        `${
          index === 0
            ? "M"
            : "L"
        } ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${
          points[
            points.length - 1
          ].x
        } ${
          height -
          paddingBottom
        } L ${points[0].x} ${
          height -
          paddingBottom
        } Z`
      : "";

  return (
    <div className="spending-chart">
      {months.length === 0 ? (
        <div className="chart-empty-state">
          <div className="chart-empty-icon">
            <Icon
              name="insights"
              size={22}
            />
          </div>

          <strong>
            No spending data yet
          </strong>

          <span>
            Add transactions to see
            your spending trend.
          </span>
        </div>
      ) : (
        <>
          <svg
            className="spending-chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Spending trend"
          >
            {[0, 25, 50, 75, 100].map(
              (percentage) => {
                const y =
                  paddingTop +
                  chartHeight -
                  (percentage /
                    100) *
                    chartHeight;

                return (
                  <line
                    key={
                      percentage
                    }
                    x1={
                      paddingX
                    }
                    x2={
                      width -
                      paddingX
                    }
                    y1={y}
                    y2={y}
                    className="chart-grid-line"
                  />
                );
              }
            )}

            <path
              d={areaPath}
              className="chart-area"
            />

            <path
              d={linePath}
              className="chart-line"
              fill="none"
            />

            {points.map(
              (point) => (
                <circle
                  key={
                    point.key
                  }
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="chart-point"
                />
              )
            )}
          </svg>

          <div className="chart-labels">
            {months.map(
              (item) => (
                <span
                  key={
                    item.key
                  }
                >
                  {item.label}
                </span>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   RISK CARD
========================================================= */

function RiskCard({
  riskScore,
  riskLevel,
  riskyTransactions,
  onOpenRisk,
}) {
  const score =
    Math.round(riskScore);

  return (
    <div className="panel risk-dashboard-card">
      <div className="panel-header">
        <div>
          <span className="panel-eyebrow">
            PROTECTION
          </span>

          <h2>
            Risk Guardian
          </h2>

          <p>
            AI-powered monitoring for
            unusual activity.
          </p>
        </div>

        <div
          className={`risk-status-badge ${riskLevel.toLowerCase()}`}
        >
          {riskLevel}
        </div>
      </div>

      <div className="risk-card-content">
        <div
          className="risk-ring"
          style={{
            "--risk-progress": `${score * 3.6}deg`,
          }}
        >
          <div className="risk-ring-inner">
            <strong>{score}</strong>

            <span>risk</span>
          </div>
        </div>

        <div className="risk-description">
          <strong>
            {score === 0
              ? "You're all clear"
              : score < 40
              ? "Your finances look stable"
              : score < 70
              ? "A few things need attention"
              : "Some activity needs review"}
          </strong>

          <p>
            {riskyTransactions.length ===
            0
              ? "No high-risk transactions have been detected."
              : `${
                  riskyTransactions.length
                } transaction${
                  riskyTransactions.length >
                  1
                    ? "s"
                    : ""
                } may need your attention.`}
          </p>
        </div>
      </div>

      <div className="risk-footer">
        <span>
          {
            riskyTransactions.length
          }{" "}
          flagged transaction
          {riskyTransactions.length !==
          1
            ? "s"
            : ""}
        </span>

        <button
          type="button"
          onClick={
            onOpenRisk
          }
        >
          Review Guardian
          <Icon
            name="arrowRight"
            size={16}
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function RecentTransactions({
  transactions,
  onViewAll,
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <span className="panel-eyebrow">
            ACTIVITY
          </span>

          <h2>
            Recent Transactions
          </h2>

          <p>
            Your latest financial
            activity.
          </p>
        </div>

        <button
          type="button"
          className="text-button"
          onClick={
            onViewAll
          }
        >
          View all
          <Icon
            name="arrowRight"
            size={15}
          />
        </button>
      </div>

      {transactions.length ===
      0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon
              name="transactions"
              size={22}
            />
          </div>

          <strong>
            No transactions yet
          </strong>

          <span>
            Your recent transactions
            will appear here once
            you add them.
          </span>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map(
            (
              transaction,
              index
            ) => {
              const type =
                getTransactionType(
                  transaction
                );

              const amount =
                amountOf(
                  transaction
                );

              return (
                <div
                  className="transaction"
                  key={
                    transaction?.id ||
                    transaction?.transaction_id ||
                    `${getTransactionName(
                      transaction
                    )}-${index}`
                  }
                >
                  <div className="transaction-main">
                    <div
                      className={`transaction-icon ${
                        type ===
                        "income"
                          ? "income"
                          : "expense"
                      }`}
                    >
                      <Icon
                        name={
                          type ===
                          "income"
                            ? "arrowDown"
                            : "arrowUp"
                        }
                        size={17}
                      />
                    </div>

                    <div className="transaction-details">
                      <strong>
                        {getTransactionName(
                          transaction
                        )}
                      </strong>

                      <span>
                        {getCategory(
                          transaction
                        )}{" "}
                        ·{" "}
                        {formatDate(
                          getTransactionDate(
                            transaction
                          )
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`transaction-amount ${
                      type ===
                      "income"
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {type ===
                    "income"
                      ? "+"
                      : "-"}
                    {formatMoney(
                      amount
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   AI INSIGHT
========================================================= */

function AIInsight({
  insight,
  question,
  setQuestion,
  answer,
  loading,
  onAsk,
  onOpenAssistant,
}) {
  return (
    <div className="panel ai-insight-panel">
      <div className="panel-header">
        <div>
          <span className="panel-eyebrow">
            AI MONEY INSIGHT
          </span>

          <h2>
            Smart guidance
          </h2>

          <p>
            Simple answers based on
            your financial activity.
          </p>
        </div>

        <div className="ai-mark">
          <Icon
            name="sparkles"
            size={19}
          />
        </div>
      </div>

      <div className="ai-insight-body">
        <div className="ai-insight-message">
          {answer ? (
            <p>{answer}</p>
          ) : insight ? (
            <p>{insight}</p>
          ) : (
            <p>
              Add a few transactions
              and Money Guardian AI
              will start highlighting
              useful patterns.
            </p>
          )}
        </div>

        <div className="ai-question">
          <input
            type="text"
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                onAsk();
              }
            }}
            placeholder="Ask about your money..."
          />

          <button
            type="button"
            onClick={onAsk}
            disabled={
              loading ||
              !question.trim()
            }
          >
            {loading
              ? "Thinking..."
              : "Ask AI"}
          </button>
        </div>

        <button
          type="button"
          className="open-ai-button"
          onClick={
            onOpenAssistant
          }
        >
          Open AI Assistant
          <Icon
            name="arrowRight"
            size={15}
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   GUEST DASHBOARD
========================================================= */

function GuestDashboard({
  onLogin,
}) {
  return (
    <section className="guest-dashboard">
      <div className="guest-dashboard-card">
        <div className="guest-dashboard-icon">
          <Icon
            name="wallet"
            size={30}
          />
        </div>

        <span className="section-eyebrow">
          MONEY GUARDIAN AI
        </span>

        <h2>
          Your financial dashboard
        </h2>

        <p>
          You can explore the
          dashboard without signing
          in. Your personal financial
          information will only appear
          after you log in to your
          account.
        </p>

        <button
          type="button"
          className="primary-button guest-dashboard-login"
          onClick={onLogin}
        >
          Login to your account
          <Icon
            name="arrowRight"
            size={16}
          />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  profile,
  isAuthenticated,
  onOpenProfile,
  onLogin,
}) {
  const navigate =
    useNavigate();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    riskResults,
    setRiskResults,
  ] = useState([]);

  const [
    insights,
    setInsights,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(
    isAuthenticated
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    aiLoading,
    setAiLoading,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!isAuthenticated) {
        if (!mounted) return;

        setTransactions([]);
        setRiskResults([]);
        setInsights([]);
        setLoading(false);
        setError("");

        return;
      }

      setLoading(true);
      setError("");

      try {
        const responses =
          await Promise.allSettled([
            api.get(
              "/transactions/"
            ),
            api.get("/risk/"),
            api.get("/insights/"),
          ]);

        if (!mounted) return;

        const transactionResponse =
          responses[0];

        const riskResponse =
          responses[1];

        const insightResponse =
          responses[2];

        if (
          transactionResponse.status ===
          "fulfilled"
        ) {
          setTransactions(
            normalizeArray(
              transactionResponse.value,
              [
                "transactions",
                "data",
                "results",
              ]
            )
          );
        } else {
          setTransactions([]);
        }

        if (
          riskResponse.status ===
          "fulfilled"
        ) {
          setRiskResults(
            normalizeArray(
              riskResponse.value,
              [
                "risk_results",
                "results",
                "risk",
                "data",
              ]
            )
          );
        } else {
          setRiskResults([]);
        }

        if (
          insightResponse.status ===
          "fulfilled"
        ) {
          setInsights(
            normalizeArray(
              insightResponse.value,
              [
                "insights",
                "results",
                "data",
              ]
            )
          );
        } else {
          setInsights([]);
        }

        const allFailed =
          responses.every(
            (result) =>
              result.status ===
              "rejected"
          );

        if (allFailed) {
          setError(
            "Unable to load financial data. Please check that the backend is running."
          );
        }
      } catch {
        if (mounted) {
          setError(
            "Something went wrong while loading your dashboard."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const calculations =
    useMemo(() => {
      const income =
        transactions
          .filter(
            (item) =>
              getTransactionType(
                item
              ) === "income"
          )
          .reduce(
            (sum, item) =>
              sum +
              amountOf(item),
            0
          );

      const spending =
        transactions
          .filter(
            (item) =>
              getTransactionType(
                item
              ) === "expense"
          )
          .reduce(
            (sum, item) =>
              sum +
              amountOf(item),
            0
          );

      const balance =
        income - spending;

      const savings =
        income - spending;

      const now =
        new Date();

      const currentMonth =
        now.getMonth();

      const currentYear =
        now.getFullYear();

      const currentMonthTransactions =
        transactions.filter(
          (item) => {
            const value =
              getTransactionDate(
                item
              );

            if (!value)
              return false;

            const date =
              new Date(value);

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return false;
            }

            return (
              date.getMonth() ===
                currentMonth &&
              date.getFullYear() ===
                currentYear
            );
          }
        );

      const monthlyIncome =
        currentMonthTransactions
          .filter(
            (item) =>
              getTransactionType(
                item
              ) === "income"
          )
          .reduce(
            (sum, item) =>
              sum +
              amountOf(item),
            0
          );

      const monthlySpending =
        currentMonthTransactions
          .filter(
            (item) =>
              getTransactionType(
                item
              ) === "expense"
          )
          .reduce(
            (sum, item) =>
              sum +
              amountOf(item),
            0
          );

      const monthlySavings =
        monthlyIncome -
        monthlySpending;

      const savingsRate =
        monthlyIncome > 0
          ? (monthlySavings /
              monthlyIncome) *
            100
          : 0;

      /* =====================================================
         FIX — INCLUDE ZERO RISK SCORES
         This prevents safe transactions from being excluded
         from the average risk calculation.
      ===================================================== */

      const riskScores =
        riskResults.map((item) =>
          getRiskScore(item)
        );

      const averageRiskScore =
        riskScores.length > 0
          ? riskScores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) /
            riskScores.length
          : 0;

      const transactionRiskScores =
        transactions
          .map((item) => ({
            ...item,
            calculatedRisk:
              getRiskScore(
                item
              ),
          }))
          .filter(
            (item) =>
              item.calculatedRisk >
              0
          );

      const riskyTransactions =
        transactionRiskScores.filter(
          (item) =>
            item.calculatedRisk >=
            40
        );

      const categoryMap = {};

      currentMonthTransactions
        .filter(
          (item) =>
            getTransactionType(
              item
            ) === "expense"
        )
        .forEach((item) => {
          const category =
            getCategory(item);

          categoryMap[
            category
          ] =
            (categoryMap[
              category
            ] || 0) +
            amountOf(item);
        });

      const categoryTotal =
        Object.values(
          categoryMap
        ).reduce(
          (sum, value) =>
            sum + value,
          0
        );

      const spendingBreakdown =
        Object.entries(
          categoryMap
        )
          .map(
            ([category, amount]) => ({
              category,
              amount,
              percent:
                categoryTotal > 0
                  ? Math.round(
                      (amount /
                        categoryTotal) *
                        100
                    )
                  : 0,
            })
          )
          .sort(
            (a, b) =>
              b.amount -
              a.amount
          );

      /* =====================================================
         FINANCIAL HEALTH
      ===================================================== */

      let healthScore = 0;

      if (transactions.length === 0) {
        healthScore = 0;
      } else if (
        income === 0 &&
        spending > 0
      ) {
        healthScore = 20;
      } else {
        const safeSavingsRate =
          Math.max(
            -100,
            Math.min(
              40,
              savingsRate
            )
          );

        healthScore =
          Math.max(
            0,
            Math.min(
              100,
              Math.round(
                60 +
                  safeSavingsRate *
                    0.75 -
                  averageRiskScore *
                    0.5
              )
            )
          );
      }

      const monthlySpendingByMonth =
        [];

      for (
        let index = 5;
        index >= 0;
        index -= 1
      ) {
        const date =
          new Date(
            currentYear,
            currentMonth -
              index,
            1
          );

        const month =
          date.getMonth();

        const year =
          date.getFullYear();

        const amount =
          transactions
            .filter(
              (item) => {
                if (
                  getTransactionType(
                    item
                  ) !==
                  "expense"
                ) {
                  return false;
                }

                const value =
                  getTransactionDate(
                    item
                  );

                if (!value)
                  return false;

                const itemDate =
                  new Date(value);

                if (
                  Number.isNaN(
                    itemDate.getTime()
                  )
                ) {
                  return false;
                }

                return (
                  itemDate.getMonth() ===
                    month &&
                  itemDate.getFullYear() ===
                    year
                );
              }
            )
            .reduce(
              (sum, item) =>
                sum +
                amountOf(item),
              0
            );

        monthlySpendingByMonth.push(
          {
            key: `${year}-${month}`,
            label:
              date.toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",
                }
              ),
            amount,
          }
        );
      }

      return {
        totalIncome:
          income,
        totalSpending:
          spending,
        totalBalance:
          balance,
        totalSavings:
          savings,

        monthlyIncome,
        monthlySpending,
        monthlySavings,
        savingsRate,

        averageRiskScore,
        riskLevel:
          getRiskLevel(
            averageRiskScore
          ),
        riskyTransactions,

        healthScore,
        spendingBreakdown,
        monthlySpendingByMonth,
      };
    }, [
      transactions,
      riskResults,
    ]);

  const filteredRecentTransactions =
    useMemo(() => {
      const query =
        searchValue
          .trim()
          .toLowerCase();

      const sorted = [
        ...transactions,
      ].sort((a, b) => {
        const dateA =
          new Date(
            getTransactionDate(
              a
            ) || 0
          ).getTime();

        const dateB =
          new Date(
            getTransactionDate(
              b
            ) || 0
          ).getTime();

        return (
          dateB - dateA
        );
      });

      if (!query) {
        return sorted.slice(
          0,
          5
        );
      }

      return sorted
        .filter((item) => {
          const searchable = [
            getTransactionName(
              item
            ),
            getCategory(item),
            getTransactionType(
              item
            ),
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        })
        .slice(0, 5);
    }, [
      transactions,
      searchValue,
    ]);

  const dynamicInsight =
    useMemo(() => {
      if (
        insights.length > 0
      ) {
        const first =
          insights[0];

        return (
          first?.message ||
          first?.insight ||
          first?.description ||
          first?.text ||
          "Your financial activity is being analyzed by Money Guardian AI."
        );
      }

      if (
        transactions.length ===
        0
      ) {
        return "Start by adding your first transaction. Money Guardian AI will turn your activity into useful financial insights.";
      }

      if (
        calculations.monthlySpending >
        calculations.monthlyIncome
      ) {
        return "Your spending is currently above your income this month. Consider reviewing your largest spending categories.";
      }

      if (
        calculations.savingsRate >=
        20
      ) {
        return "Great progress. Your current savings rate shows healthy room for building a stronger financial cushion.";
      }

      return "Your finances are being monitored. Keep adding transactions to unlock more personalized recommendations.";
    }, [
      insights,
      transactions,
      calculations,
    ]);

  async function askAI() {
    const cleanQuestion =
      question.trim();

    if (
      !isAuthenticated ||
      !cleanQuestion ||
      aiLoading
    ) {
      return;
    }

    setAiLoading(true);
    setAnswer("");

    try {
      const response =
        await api.post(
          "/assistant/",
          {
            question:
              cleanQuestion,
          }
        );

      setAnswer(
        response?.data
          ?.answer ||
          response?.data
            ?.response ||
          response?.data
            ?.message ||
          "I could not generate an answer right now."
      );
    } catch {
      setAnswer(
        "AI Assistant is currently unavailable. Please make sure the backend is running."
      );
    } finally {
      setAiLoading(
        false
      );
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Topbar
          searchValue={
            searchValue
          }
          setSearchValue={
            setSearchValue
          }
          profile={
            GUEST_PROFILE
          }
          isAuthenticated={
            false
          }
          onOpenProfile={
            () => {}
          }
          onLogin={onLogin}
        />

        <GuestDashboard
          onLogin={onLogin}
        />
      </>
    );
  }

  return (
    <>
      <Topbar
        searchValue={
          searchValue
        }
        setSearchValue={
          setSearchValue
        }
        profile={profile}
        isAuthenticated={
          true
        }
        onOpenProfile={
          onOpenProfile
        }
        onLogin={onLogin}
      />

      {error && (
        <div className="dashboard-alert">
          <div>
            <strong>
              Dashboard connection
              issue
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      )}

      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-eyebrow">
            TOTAL BALANCE
          </span>

          <div className="hero-balance">
            {formatMoney(
              calculations.totalBalance
            )}
          </div>

          <p>
            {calculations.totalBalance >=
            0
              ? "Available balance based on recorded transactions."
              : "Your recorded expenses currently exceed income."}
          </p>

          <div className="hero-metrics">
            <div>
              <span>
                Income
              </span>

              <strong>
                {formatMoney(
                  calculations.totalIncome
                )}
              </strong>
            </div>

            <div>
              <span>
                Spending
              </span>

              <strong>
                {formatMoney(
                  calculations.totalSpending
                )}
              </strong>
            </div>

            <div>
              <span>
                Saved
              </span>

              <strong>
                {formatMoney(
                  calculations.totalSavings
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="hero-health">
          <div
            className="hero-health-ring"
            style={{
              "--health-score":
                calculations.healthScore,
            }}
          >
            <div>
              <strong>
                {
                  calculations.healthScore
                }
              </strong>

              <span>
                Health
              </span>
            </div>
          </div>

          <span>
            Financial Health
          </span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard
          icon="wallet"
          label="Total Balance"
          value={formatMoney(
            calculations.totalBalance
          )}
          meta="Current recorded balance"
          tone="blue"
        />

        <StatCard
          icon="shield"
          label="Financial Health"
          value={`${calculations.healthScore}%`}
          progress={
            calculations.healthScore
          }
          tone="green"
        />

        <StatCard
          icon="arrowDown"
          label="Monthly Spending"
          value={formatMoney(
            calculations.monthlySpending
          )}
          meta="Current month"
          tone="orange"
        />

        <StatCard
          icon="arrowUp"
          label="Monthly Savings"
          value={formatMoney(
            calculations.monthlySavings
          )}
          meta={
            calculations.monthlyIncome > 0
              ? `${Math.round(
                  calculations.savingsRate
                )}% savings rate`
              : "No income recorded"
          }
          tone="purple"
        />
      </section>

      <CommandCenter
        monthlyIncome={
          calculations.monthlyIncome
        }
        monthlySpending={
          calculations.monthlySpending
        }
        monthlySavings={
          calculations.monthlySavings
        }
        savingsRate={
          calculations.savingsRate
        }
        spendingBreakdown={
          calculations.spendingBreakdown
        }
        riskLevel={
          calculations.riskLevel
        }
        riskScore={
          calculations.averageRiskScore
        }
      />

      <section className="content-grid">
        <div className="panel spending-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">
                SPENDING ANALYTICS
              </span>

              <h2>
                Spending Overview
              </h2>

              <p>
                Your spending trend over
                the last six months.
              </p>
            </div>

            <div className="panel-header-stat">
              <span>
                This month
              </span>

              <strong>
                {formatMoney(
                  calculations.monthlySpending
                )}
              </strong>
            </div>
          </div>

          <SpendingChart
            months={
              calculations.monthlySpendingByMonth
            }
          />
        </div>

        <RiskCard
          riskScore={
            calculations.averageRiskScore
          }
          riskLevel={
            calculations.riskLevel
          }
          riskyTransactions={
            calculations.riskyTransactions
          }
          onOpenRisk={() =>
            navigate(
              "/risk-guardian"
            )
          }
        />
      </section>

      <section className="bottom-grid">
        <RecentTransactions
          transactions={
            filteredRecentTransactions
          }
          onViewAll={() =>
            navigate(
              "/transactions"
            )
          }
        />

        <AIInsight
          insight={
            dynamicInsight
          }
          question={question}
          setQuestion={
            setQuestion
          }
          answer={answer}
          loading={
            aiLoading
          }
          onAsk={askAI}
          onOpenAssistant={() =>
            navigate(
              "/ai-assistant"
            )
          }
        />
      </section>

      {loading && (
        <div className="loading-indicator">
          <span className="loading-spinner" />
          Loading financial data...
        </div>
      )}
    </>
  );
}

/* =========================================================
   APP SHELL
========================================================= */

function AppShell() {
  const navigate =
    useNavigate();

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(() =>
    Boolean(
      getAuthToken()
    )
  );

  const [
    profile,
    setProfile,
  ] = useState(() =>
    getAuthToken()
      ? getStoredProfile()
      : GUEST_PROFILE
  );

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      if (!isAuthenticated) {
        if (mounted) {
          setProfile(
            GUEST_PROFILE
          );
        }

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        setIsAuthenticated(
          false
        );

        setProfile(
          GUEST_PROFILE
        );

        return;
      }

      try {
        const response =
          await api.get(
            "/auth/me"
          );

        if (!mounted) return;

        const currentProfile =
          normalizeUserProfile(
            response
          );

        setProfile(
          currentProfile
        );

        localStorage.setItem(
          "moneyGuardianProfile",
          JSON.stringify(
            currentProfile
          )
        );
      } catch (
        requestError
      ) {
        if (!mounted) return;

        const status =
          requestError
            ?.response
            ?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          clearAuthStorage();

          setIsAuthenticated(
            false
          );

          setProfile(
            GUEST_PROFILE
          );

          setProfileOpen(
            false
          );

          navigate(
            "/",
            {
              replace: true,
            }
          );
        }
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [
    isAuthenticated,
    navigate,
  ]);

  function openProfile() {
    setProfileOpen(true);
  }

  function closeProfile() {
    setProfileOpen(false);
  }

  function goToLogin() {
    setProfileOpen(false);

    navigate("/login");
  }

  function logout() {
    clearAuthStorage();

    setIsAuthenticated(
      false
    );

    setProfile(
      GUEST_PROFILE
    );

    setProfileOpen(
      false
    );

    navigate("/", {
      replace: true,
    });
  }

  return (
    <div className="app">
      <Sidebar
        profile={profile}
        isAuthenticated={
          isAuthenticated
        }
        onOpenProfile={
          openProfile
        }
        onLogin={goToLogin}
        onLogout={logout}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                profile={profile}
                isAuthenticated={
                  isAuthenticated
                }
                onOpenProfile={
                  openProfile
                }
                onLogin={
                  goToLogin
                }
              />
            }
          />

          <Route
            path="/transactions"
            element={
              <Transactions />
            }
          />

          <Route
            path="/risk-guardian"
            element={
              <RiskGuardian />
            }
          />

          <Route
            path="/money-insights"
            element={
              <MoneyInsights />
            }
          />

          <Route
            path="/what-if-simulator"
            element={
              <WhatIfSimulator />
            }
          />

          <Route
            path="/ai-assistant"
            element={
              <AIAssistant />
            }
          />
        </Routes>
      </main>

      {profileOpen && (
        <ProfileModal
          profile={profile}
          setProfile={
            setProfile
          }
          isAuthenticated={
            isAuthenticated
          }
          onClose={
            closeProfile
          }
          onLogin={
            goToLogin
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   ROOT APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/signup"
          element={
            <Signup />
          }
        />

        <Route
          path="/*"
          element={
            <AppShell />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}