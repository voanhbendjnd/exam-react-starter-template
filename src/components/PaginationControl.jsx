import React from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * Component Phân trang chuẩn React-Bootstrap
 * Hiển thị: Previous 1, 2, 3 ... Next
 */
export default function PaginationControl({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => onPageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Pagination className="mb-0 justify-content-end">
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Pagination.Prev>
      {items}
      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Pagination.Next>
    </Pagination>
  );
}

