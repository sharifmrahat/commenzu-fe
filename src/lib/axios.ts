import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Simple token getter (you can replace with Redux selector later)
const getToken = () => localStorage.getItem("accessToken");

// Request: attach Bearer token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: unwrap data or throw normalized error
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message || err?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
