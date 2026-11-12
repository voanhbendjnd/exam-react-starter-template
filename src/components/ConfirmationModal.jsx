import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * ====================================================================================
 * 📄 CONFIRMATION MODAL (SCREEN 2)
 * ------------------------------------------------------------------------------------
 * 👉 DÙNG TEXT MẶC ĐỊNH RÕ RÀNG, DỄ TÙY BIẾN TRỰC TIẾP TRONG FILE NÀY:
 * - Tiêu đề: "Confirmation"
 * - Nội dung: Are you sure you want to delete "${itemName}"?
 * - Nút: [ Yes ]  [ Close ]
 * ====================================================================================
 */
export default function ConfirmationModal({
  show,
  onClose,
  onConfirm,
  itemName = '',
  title = 'Confirmation',
  message,
  loading = false,
}) {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold text-center w-100">
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4 fs-6">
        {/* 💡 Sửa text câu hỏi trực tiếp tại đây nếu đề yêu cầu chữ khác: */}
        {message || `Are you sure you want to delete "${itemName || 'this item'}"?`}
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-0 pb-4">
        <Button
          variant="secondary"
          className="px-4 me-3"
          onClick={onConfirm}
          disabled={loading}
          style={{ minWidth: '100px' }}
        >
          {loading ? 'Processing...' : 'Yes'}
        </Button>
        <Button
          variant="secondary"
          className="px-4"
          onClick={onClose}
          disabled={loading}
          style={{ minWidth: '100px' }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
