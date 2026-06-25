// src/api/axiosConfig.js
import axios from "axios";

const API = axios.create({
  // ✅ ensure trailing /api (since Flask routes are like /api/auth/...)
  baseURL:
  process.env.REACT_APP_API_URL ||
  "https://thyroid-diagnosis-system.onrender.com/api",
  // ✅ don't fix "Content-Type" globally — let it auto-handle multipart/form-data
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // or true only if backend needs cookies (yours doesn’t)
});

// ✅ Automatically attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
