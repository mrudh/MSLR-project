import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url || "";
    if (err?.response?.status === 401 && !url.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
