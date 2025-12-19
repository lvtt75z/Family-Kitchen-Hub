// src/axios.js
import axios from "axios";

import { isValidJWT } from "../utils/security";

const instance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Tự động thêm token vào header Authorization
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!isValidJWT(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(new Error("Invalid token format"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Nếu là FormData (upload file), xóa Content-Type để browser tự động set với boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi 401 (Unauthorized)
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token không hợp lệ hoặc đã hết hạn
      console.warn("Unauthorized: Token invalid or expired");

      // Xóa token và user data khỏi localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Chỉ redirect nếu không phải đang ở trang public (login/register/home)
      const currentPath = window.location.pathname;
      const publicPaths = ["/login", "/register", "/home", "/", "/verify-email", "/forgot-password"];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

      if (!isPublicPath) {
        // Redirect về trang login sau 1 giây để user thấy thông báo
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
