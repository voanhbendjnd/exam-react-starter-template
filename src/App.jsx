/**
 * App Component - Điều hướng các màn hình bằng React-Router-DOM
 * Tuân thủ quy tắc 3.3 phòng thi EOS: React-Router-DOM
 * ------------------------------------------------------------------
 * Cấu trúc GENERIC dùng chung cho MỌI ĐỀ THI:
 *  - / : Trang danh sách
 *  - /add : Trang thêm mới
 *  - /view/:id : Trang xem chi tiết
 *  - /edit/:id : Trang chỉnh sửa (Update)
 *  - /single-crud : Màn hình dự phòng nếu đề thi yêu cầu Single-page Modal CRUD
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Các màn hình chính
import ListPage from './pages/ListPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import AddPage from './pages/AddPage.jsx';
import EditPage from './pages/EditPage.jsx';

// Màn hình dự phòng dạng Single Page Modal CRUD
import MasterCrudPage from './MasterCrudPage.jsx';
import SimpleLogin from './SimpleLogin.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* DẠNG 1: ĐỀ THI MULTI-PAGE (DÙNG CHUNG CHO MỌI THỰC THỂ)   */}
        {/* ========================================================= */}
        {/* 1. Trang danh sách chính */}
        <Route path="/" element={<ListPage />} />

        {/* 2. Trang thêm mới */}
        <Route path="/add" element={<AddPage />} />

        {/* 3. Trang xem chi tiết */}
        <Route path="/view/:id" element={<DetailPage />} />

        {/* 4. Trang chỉnh sửa / cập nhật (Update) */}
        <Route path="/edit/:id" element={<EditPage />} />

        {/* ========================================================= */}
        {/* DẠNG 2: ĐỀ THI SINGLE-PAGE TABLE MODAL CRUD             */}
        {/* ========================================================= */}
        <Route path="/single-crud" element={<MasterCrudPage />} />
        <Route path="/login" element={<SimpleLogin />} />

        {/* Fallback điều hướng về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
