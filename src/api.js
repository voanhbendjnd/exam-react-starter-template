/**
 * FILE CẤU HÌNH KẾT NỐI REST API (TUÂN THỦ QUY TẮC THI PE: PORT 8080)
 * ------------------------------------------------------------------
 * Quy tắc 3.6: The application must be configured to connect to REST API run at port 8080
 */

import axios from 'axios';

// ĐÚNG CHUẨN ĐỀ THI: CỔNG 8080
const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Tự động đính kèm Bearer token nếu bài thi có yêu cầu đăng nhập
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động bóc tách response.data và bắt thông báo lỗi
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Có lỗi xảy ra khi gọi API';
    return Promise.reject(new Error(message));
  }
);

export default api;
