/**
 * App Component - Điều hướng bằng React-Router-DOM
 * Tuân thủ quy định 3.3: Sử dụng React-Router-DOM cho ứng dụng
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MasterCrudPage from './MasterCrudPage.jsx';
import SimpleLogin from './SimpleLogin.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định: Mở thẳng trang Master CRUD */}
        <Route path="/" element={<MasterCrudPage />} />

        {/* Đường dẫn đăng nhập nếu đề bài yêu cầu */}
        <Route path="/login" element={<SimpleLogin />} />

        {/* Mọi đường dẫn khác đều chuyển hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
