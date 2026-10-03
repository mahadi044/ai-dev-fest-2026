import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
});

// Automatically attach JWT token to every API request
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

// ==================== AUTH ====================

export const signup = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await api.post("/auth/login", loginData);

  // Save JWT token
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("moneyGuardianProfile");
};

// ==================== TRANSACTIONS ====================

export const getTransactions = async () => {
  const response = await api.get("/transactions/");
  return response.data;
};

export const createTransaction = async (transaction) => {
  const response = await api.post("/transactions/", transaction);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// ==================== ANALYSIS ====================

export const getRiskAnalysis = async () => {
  const response = await api.get("/risk/");
  return response.data;
};

export const getMoneyInsights = async () => {
  const response = await api.get("/insights/");
  return response.data;
};

export default api;