import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import PaginationControl from '../components/PaginationControl';

/**
 * GENERIC LIST PAGE
 * Dùng chung cho mọi đối tượng đề thi (Shoes, Products, Books, Rooms, Students...)
 */
export default function ListPage() {
  const navigate = useNavigate();

  // State danh sách & danh mục
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, text: '', variant: 'success' });

  // State bộ lọc (Filter)
  const [filterCategory, setFilterCategory] = useState('');
  const [filterName, setFilterName] = useState('');

  // State kết quả lọc
  const [filteredItems, setFilteredItems] = useState([]);

  // State phân trang (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = CONFIG.PAGINATION.PAGE_SIZE;

  // State dialog xác nhận xóa
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Hiển thị thông báo Alert
  const showAlert = (text, variant = 'success') => {
    setAlertInfo({ show: true, text, variant });
    setTimeout(() => {
      setAlertInfo({ show: false, text: '', variant: 'success' });
    }, 3500);
  };

  // 1. Tải danh sách Categories
  const loadCategories = async () => {
    try {
      const data = await api.get(CONFIG.API.ENDPOINT_CATEGORY);
      const list = Array.isArray(data) ? data : data?.data || [];
      setCategories(list);
    } catch (err) {
      console.warn('Lỗi khi nạp danh mục phụ:', err.message);
    }
  };

  // 2. Tải toàn bộ danh sách dữ liệu từ Backend
  const loadAllItems = async () => {
    setLoading(true);
    try {
      const data = await api.get(CONFIG.API.ENDPOINT_MAIN);
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
      setFilteredItems(list);
    } catch (err) {
      showAlert(`Lỗi nạp dữ liệu: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadAllItems();

    // Hiển thị thông báo flash nếu vừa chuyển từ trang Thêm mới
    const flash = sessionStorage.getItem('flashMessage');
    if (flash) {
      showAlert(flash, 'success');
      sessionStorage.removeItem('flashMessage');
    }
  }, []);

  // 3. Xử lý Lọc (Filter)
  const handleFilter = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filterName.trim()) params.name = filterName.trim();
      if (filterCategory) params.category = filterCategory;

      let resultList = [];
      try {
        // Thử gọi API Search nếu backend hỗ trợ
        const searchRes = await api.get(CONFIG.API.ENDPOINT_SEARCH, { params });
        resultList = Array.isArray(searchRes) ? searchRes : searchRes?.data || [];
      } catch (searchApiError) {
        // Tự động fallback filter trên mảng client-side nếu backend không có endpoint search
        resultList = items.filter((item) => {
          const nameVal = String(item[CONFIG.FIELDS.NAME] || '').toLowerCase();
          const matchName = !filterName.trim() || nameVal.includes(filterName.trim().toLowerCase());

          const catVal =
            typeof item[CONFIG.FIELDS.CATEGORY] === 'object'
              ? item[CONFIG.FIELDS.CATEGORY]?.name || item[CONFIG.FIELDS.CATEGORY]?.categoryName
              : item[CONFIG.FIELDS.CATEGORY];
          const matchCat =
            !filterCategory || String(catVal).toLowerCase() === String(filterCategory).toLowerCase();

          return matchName && matchCat;
        });
      }

      setFilteredItems(resultList);
      setCurrentPage(1);
    } catch (err) {
      showAlert(`Lỗi khi lọc: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // 4. Mở Confirmation Dialog khi click Delete
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteModalShow(true);
  };

  // 5. Xác nhận xóa bản ghi (gọi API DELETE)
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const id = itemToDelete[CONFIG.FIELDS.ID];
    try {
      await api.delete(`${CONFIG.API.ENDPOINT_MAIN}/${id}`);
      setDeleteModalShow(false);
      setItemToDelete(null);
      showAlert(CONFIG.MESSAGES.DELETE_SUCCESS, 'success');
      await loadAllItems();
    } catch (err) {
      showAlert(`Lỗi khi xóa: ${err.message}`, 'danger');
    } finally {
      setDeleting(false);
    }
  };

  // 6. Tính toán phân trang
  const totalRecords = filteredItems.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <Container className="py-3" style={{ maxWidth: '960px' }}>
      {/* HEADER: Logo + Date: dd/MM/yyyy */}
      <Header />

      {/* TIÊU ĐỀ TRANG DANH SÁCH */}
      <h4 className="fw-bold mb-3">{CONFIG.LABELS.PAGE_LIST_TITLE}</h4>

      {/* ALERT THÔNG BÁO */}
      {alertInfo.show && (
        <Alert
          variant={alertInfo.variant}
          dismissible
          onClose={() => setAlertInfo({ show: false, text: '', variant: 'success' })}
        >
          {alertInfo.text}
        </Alert>
      )}

      {/* KHUNG TÌM KIẾM & LỌC DỮ LIỆU */}
      <Form onSubmit={handleFilter} className="mb-4">
        <Row className="mb-2 align-items-center">
          <Col xs={3} sm={2} className="text-end fw-medium">
            {CONFIG.LABELS.COL_CATEGORY}:
          </Col>
          <Col xs={9} sm={5}>
            <Form.Select
              size="sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">-- All Categories --</option>
              {categories.map((c) => {
                const catValue = c.categoryName || c.name || c.id || c;
                const catLabel = c.categoryName || c.name || c;
                return (
                  <option key={c.id || catValue} value={catValue}>
                    {catLabel}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col xs={3} sm={2} className="text-end fw-medium">
            {CONFIG.LABELS.COL_NAME}:
          </Col>
          <Col xs={9} sm={5}>
            <Form.Control
              size="sm"
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={5} className="mt-2 mt-sm-0 d-flex gap-2 justify-content-start">
            <Button
              type="submit"
              variant="outline-primary"
              size="sm"
              className="px-3"
              style={{ minWidth: '90px' }}
            >
              {CONFIG.LABELS.BTN_FILTER}
            </Button>
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="px-3"
              style={{ minWidth: '90px' }}
              onClick={() => navigate('/add')}
            >
              {CONFIG.LABELS.BTN_ADD_NEW}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* DANH SÁCH BẢNG DỮ LIỆU */}
      <h5 className="fw-bold mb-2">{CONFIG.LABELS.PAGE_LIST_TITLE}</h5>
      <div className="border border-secondary mb-2 bg-white">
        <Table hover responsive className="mb-0 text-center align-middle">
          <thead style={{ backgroundColor: '#cfe2ff' }}>
            <tr>
              <th style={{ width: '60px' }}>{CONFIG.LABELS.COL_INDEX}</th>
              <th className="text-start">{CONFIG.LABELS.COL_NAME}</th>
              <th>{CONFIG.LABELS.COL_CATEGORY}</th>
              <th>{CONFIG.LABELS.COL_MANUFACTURER}</th>
              <th>{CONFIG.LABELS.COL_PRICE}</th>
              <th style={{ width: '150px' }}>{CONFIG.LABELS.COL_ACTION}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-4 text-muted">
                  Loading data from server...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-danger fw-bold">
                  {CONFIG.MESSAGES.NO_RECORDS_FOUND}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => {
                const id = item[CONFIG.FIELDS.ID] || index + 1;
                const name = item[CONFIG.FIELDS.NAME] || '—';
                const cat =
                  typeof item[CONFIG.FIELDS.CATEGORY] === 'object'
                    ? item[CONFIG.FIELDS.CATEGORY]?.name ||
                      item[CONFIG.FIELDS.CATEGORY]?.categoryName
                    : item[CONFIG.FIELDS.CATEGORY] || '—';
                const manufacturer = item[CONFIG.FIELDS.MANUFACTURER] || '—';
                const price = item[CONFIG.FIELDS.PRICE];

                return (
                  <tr key={id}>
                    <td>{startIndex + index + 1}</td>
                    <td className="text-start fw-medium">{name}</td>
                    <td>{cat}</td>
                    <td>{manufacturer}</td>
                    <td>{price !== undefined ? Number(price).toLocaleString() : '—'}</td>
                    <td>
                      <span
                        role="button"
                        className="text-decoration-underline text-primary fw-medium me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenDeleteDialog(item)}
                      >
                        {CONFIG.LABELS.BTN_DELETE}
                      </span>
                      <span className="text-muted"> | </span>
                      <Link
                        to={`/view/${id}`}
                        className="text-decoration-underline text-primary fw-medium ms-1"
                      >
                        {CONFIG.LABELS.BTN_VIEW}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* PHÂN TRANG VÀ ĐẾM DÒNG */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-1">
        <div className="text-muted small">
          Show <strong>{paginatedItems.length}</strong> of <strong>{totalRecords}</strong> records
        </div>
        <div>
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      <ConfirmationModal
        show={deleteModalShow}
        targetItem={itemToDelete}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalShow(false)}
        loading={deleting}
      />
    </Container>
  );
}

