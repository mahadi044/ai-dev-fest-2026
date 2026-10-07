import axios from "axios";

// ============================================================
// API CONFIGURATION
// ============================================================

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AUTH TOKEN INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// AUTHENTICATION
// ============================================================

export const signup = async (userData) => {
  const { data } = await api.post("/auth/signup", userData);
  return data;
};

export const login = async (loginData) => {
  const { data } = await api.post("/auth/login", loginData);

  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("moneyGuardianProfile");
};

// ============================================================
// TRANSACTIONS
// ============================================================

export const getTransactions = async () => {
  const { data } = await api.get("/transactions/");
  return data;
};

export const createTransaction = async (transaction) => {
  const { data } = await api.post("/transactions/", transaction);
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};

// ============================================================
// RULE-BASED RISK ANALYSIS
// ============================================================

export const getRiskAnalysis = async () => {
  const { data } = await api.get("/risk/");
  return data;
};

// ============================================================
// AI / ML FINANCIAL RISK PREDICTION
// ============================================================

export const getRiskPrediction = async () => {
  const { data } = await api.get("/prediction/");
  return data;
};

// ============================================================
// WHAT-IF ML RISK PREDICTION
// ============================================================

export const getWhatIfRiskPrediction = async (monthlySaving) => {
  const { data } = await api.get("/prediction/what-if", {
    params: {
      monthly_saving: Number(monthlySaving),
    },
  });

  return data;
};

// ============================================================
// MONEY INSIGHTS
// ============================================================

export const getMoneyInsights = async () => {
  const { data } = await api.get("/insights/");
  return data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;

