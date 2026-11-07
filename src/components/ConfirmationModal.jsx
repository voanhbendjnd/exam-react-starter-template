import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { CONFIG } from '../config';

/**
 * Screen 2: Confirmation Screen Generic
 * Hộp thoại xác nhận xóa đối tượng dùng chung cho mọi đề thi:
 * "Are you sure you want to delete [entity] "[name]"?"
 * [ Yes ]  [ Close ]
 */
export default function ConfirmationModal({ show, targetItem, onConfirm, onClose, loading = false }) {
  const itemName = targetItem
    ? targetItem[CONFIG.FIELDS.NAME] || targetItem.name || 'this item'
    : '';

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 fw-bold text-center w-100">
          {CONFIG.LABELS.PAGE_CONFIRM_TITLE}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4 fs-6">
        {CONFIG.MESSAGES.DELETE_CONFIRM(itemName)}
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-0 pb-4">
        <Button
          variant="secondary"
          className="px-4 me-3"
          onClick={onConfirm}
          disabled={loading}
          style={{ minWidth: '100px' }}
        >
          {loading ? 'Processing...' : CONFIG.LABELS.BTN_YES}
        </Button>
        <Button
          variant="secondary"
          className="px-4"
          onClick={onClose}
          disabled={loading}
          style={{ minWidth: '100px' }}
        >
          {CONFIG.LABELS.BTN_CLOSE}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
