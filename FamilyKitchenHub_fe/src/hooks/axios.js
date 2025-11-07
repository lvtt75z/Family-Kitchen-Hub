// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// Tự động thêm token vào header Authorization (nếu có trong localStorage)
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // chỗ này lấy token bạn lưu sau khi login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
