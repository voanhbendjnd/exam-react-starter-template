import React from 'react';
import { CONFIG } from '../config';

/**
 * Header Component dùng chung cho các màn hình theo đúng quy chuẩn Layout đề thi:
 * [ Logo                                         Date: dd/MM/yyyy ]
 */
export default function Header() {
  // Lấy ngày hiện tại định dạng dd/MM/yyyy
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return (
    <div
      className="d-flex justify-content-between align-items-center px-3 py-2 border mb-3 bg-white"
      style={{ borderBottom: '2px solid #333' }}
    >
      <div className="fw-bold fs-5 text-dark" style={{ minWidth: '100px' }}>
        Logo
      </div>
      <div className="fw-bold fs-5 text-dark" style={{ minWidth: '100px' }}>
        Restaurant
      </div>
      <div className="text-secondary small fw-medium">
        Date: {formattedDate}
      </div>
    </div>
  );
}

