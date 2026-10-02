import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const getTransactions = async () => {
  const response = await api.get("/transactions/");
  return response.data;
};

export const createTransaction = async (transaction) => {
  const response = await api.post("/transactions/", transaction);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete("/transactions/" + id);
  return response.data;
};

export const getRiskAnalysis = async () => {
  const response = await api.get("/risk/");
  return response.data;
};

export const getMoneyInsights = async () => {
  const response = await api.get("/insights/");
  return response.data;
};

export default api;