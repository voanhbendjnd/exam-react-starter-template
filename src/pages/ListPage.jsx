import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import PaginationControl from '../components/PaginationControl';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH DANH SÁCH TỰ ĐỘNG THEO FIELD_1, FIELD_2, FIELD_3...
 * ====================================================================================
 */
export default function ListPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, text: '', variant: 'success' });

  // Bộ lọc
  const [filterCategory, setFilterCategory] = useState('');
  const [filterName, setFilterName] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = CONFIG.PAGE_SIZE || 5;

  // Xóa
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Helper hiển thị alert
  const showAlert = (text, variant = 'success') => {
    setAlertInfo({ show: true, text, variant });
    setTimeout(() => setAlertInfo({ show: false, text: '', variant: 'success' }), 3500);
  };

  // Helper format ngày nếu giá trị là dạng ISO hoặc Date
  const formatCellValue = (val) => {
    if (val === undefined || val === null || val === '') return '—';
    if (typeof val === 'string' && (val.includes('T') || (val.includes('-') && val.length === 10))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return String(val);
  };

  // 1. Tải danh mục
  const loadCategories = async () => {
    try {
      const data = await api.get(CONFIG.API_CATEGORY);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setCategories(list);
    } catch (err) {
      console.warn('Lỗi khi nạp danh mục phụ:', err.message);
    }
  };

  // 2. Tải dữ liệu & phân trang
  const loadData = async (page = 1, searchName = filterName, searchCat = filterCategory) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize,
      };

      if (searchName && searchName.trim()) {
        params[CONFIG.PARAM_SEARCH_NAME || 'name'] = searchName.trim();
      }
      if (searchCat) {
        params[CONFIG.PARAM_SEARCH_CAT || 'category'] = searchCat;
      }

      const response = await api.get(CONFIG.API_MAIN, { params });

      if (response && response.totalPages !== undefined) {
        setItems(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements ?? (response.content ? response.content.length : 0));
      } else if (Array.isArray(response)) {
        setTotalElements(response.length);
        setTotalPages(Math.ceil(response.length / pageSize) || 1);
        const startIndex = (page - 1) * pageSize;
        setItems(response.slice(startIndex, startIndex + pageSize));
      } else if (response?.data) {
        const listData = response.data;
        if (Array.isArray(listData)) {
          setTotalElements(listData.length);
          setTotalPages(Math.ceil(listData.length / pageSize) || 1);
          const startIndex = (page - 1) * pageSize;
          setItems(listData.slice(startIndex, startIndex + pageSize));
        } else {
          setItems(listData.content || []);
          setTotalPages(listData.totalPages || 1);
          setTotalElements(listData.totalElements || 0);
        }
      } else {
        setItems([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      showAlert(`Lỗi nạp dữ liệu: ${err.message}`, 'danger');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadData(1);

    const flash = sessionStorage.getItem('flashMessage');
    if (flash) {
      showAlert(flash, 'success');
      sessionStorage.removeItem('flashMessage');
    }
  }, []);

  const handleFilter = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    loadData(1, filterName, filterCategory);
  };

  const handleReset = () => {
    setFilterName('');
    setFilterCategory('');
    setCurrentPage(1);
    loadData(1, '', '');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadData(newPage, filterName, filterCategory);
    }
  };

  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteModalShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const id = itemToDelete[CONFIG.FIELD_ID] || itemToDelete.id;
    try {
      await api.delete(`${CONFIG.API_MAIN}/${id}`);
      setDeleteModalShow(false);
      setItemToDelete(null);
      showAlert('Deleted successfully', 'success');
      loadData(currentPage, filterName, filterCategory);
    } catch (err) {
      showAlert(`Lỗi khi xóa: ${err.message}`, 'danger');
    } finally {
      setDeleting(false);
    }
  };

  // 🔥 TÍNH TỔNG SỐ CỘT ĐỘNG (Để colSpan luôn tự khớp mà không bị lệch bảng)
  const dynamicCols = [
    CONFIG.FIELD_1 && CONFIG.LABEL_1,
    CONFIG.FIELD_2 && CONFIG.LABEL_2,
    CONFIG.FIELD_3 && CONFIG.LABEL_3,
    CONFIG.FIELD_4 && CONFIG.LABEL_4,
    CONFIG.FIELD_5 && CONFIG.LABEL_5,
  ].filter(Boolean);

  const totalCols = 3 + dynamicCols.length + 1; // # + Name + Category + [Dynamic Cols] + Action

  return (
    <Container className="py-3" style={{ maxWidth: '1000px' }}>
      <Header />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{CONFIG.ENTITY_NAME} List</h4>
        <Button variant="outline-secondary" size="sm" onClick={() => loadData(currentPage)} title="Tải lại dữ liệu">
          🔄 Refresh
        </Button>
      </div>

      {alertInfo.show && (
        <Alert variant={alertInfo.variant} dismissible onClose={() => setAlertInfo({ show: false, text: '', variant: 'success' })}>
          {alertInfo.text}
        </Alert>
      )}

      {/* FILTER SECTION */}
      <Form onSubmit={handleFilter} className="mb-4">
        <Row className="mb-2 align-items-center">
          <Col xs={3} sm={2} className="text-end fw-medium">
            Category:
          </Col>
          <Col xs={9} sm={5}>
            <Form.Select
              size="sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">-- All Categories --</option>
              {categories.map((c) => {
                const catVal = c.departmentId || c.categoryId || c.categoryName || c.departmentName || c.id || c.name || c;
                const catLabel = c.departmentName || c.categoryName || c.name || c.title || c;
                return (
                  <option key={catVal} value={catVal}>
                    {catLabel}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>

        <Row className="align-items-center">
          <Col xs={3} sm={2} className="text-end fw-medium">
            {CONFIG.ENTITY_NAME} Name:
          </Col>
          <Col xs={9} sm={5}>
            <Form.Control
              size="sm"
              type="text"
              placeholder={`Search by name...`}
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={5} className="mt-2 mt-sm-0 d-flex gap-2 justify-content-start">
            <Button type="submit" variant="outline-primary" size="sm" className="px-3" style={{ minWidth: '80px' }}>
              Filter
            </Button>
            <Button type="button" variant="outline-secondary" size="sm" className="px-2" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" variant="primary" size="sm" className="px-3" style={{ minWidth: '90px' }} onClick={() => navigate('/add')}>
              + Add New
            </Button>
          </Col>
        </Row>
      </Form>

      {/* TABLE TỰ ĐỘNG VẼ CỘT THEO CONFIG */}
      <h5 className="fw-bold mb-2">{CONFIG.ENTITY_NAME} List</h5>
      <div className="border border-secondary mb-2 bg-white">
        <Table hover responsive className="mb-0 text-center align-middle">
          <thead style={{ backgroundColor: '#cfe2ff' }}>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th className="text-start">{CONFIG.ENTITY_NAME} Name</th>
              <th>Category</th>
              {CONFIG.FIELD_1 && <th>{CONFIG.LABEL_1}</th>}
              {CONFIG.FIELD_2 && <th>{CONFIG.LABEL_2}</th>}
              {CONFIG.FIELD_3 && <th>{CONFIG.LABEL_3}</th>}
              {CONFIG.FIELD_4 && <th>{CONFIG.LABEL_4}</th>}
              {CONFIG.FIELD_5 && <th>{CONFIG.LABEL_5}</th>}
              <th style={{ width: '180px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalCols} className="py-4 text-muted">
                  Loading data from server...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-4 text-danger fw-bold">
                  No records found
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const id = item[CONFIG.FIELD_ID] || item.id || index + 1;
                const name = item[CONFIG.FIELD_NAME] || item.name || item.fullName || item.shoesName || item.title || '—';
                const cat =
                  typeof item[CONFIG.FIELD_CATEGORY] === 'object'
                    ? item[CONFIG.FIELD_CATEGORY]?.name || item[CONFIG.FIELD_CATEGORY]?.categoryName
                    : item[CONFIG.FIELD_CATEGORY] || item.departmentName || item.categoryName || '—';

                return (
                  <tr key={id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="text-start fw-medium">{name}</td>
                    <td>{cat}</td>
                    {CONFIG.FIELD_1 && <td>{formatCellValue(item[CONFIG.FIELD_1])}</td>}
                    {CONFIG.FIELD_2 && <td>{formatCellValue(item[CONFIG.FIELD_2])}</td>}
                    {CONFIG.FIELD_3 && <td>{formatCellValue(item[CONFIG.FIELD_3])}</td>}
                    {CONFIG.FIELD_4 && <td>{formatCellValue(item[CONFIG.FIELD_4])}</td>}
                    {CONFIG.FIELD_5 && <td>{formatCellValue(item[CONFIG.FIELD_5])}</td>}

                    <td>
                      <span
                        role="button"
                        className="text-decoration-underline text-danger fw-medium me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenDeleteDialog(item)}
                      >
                        Delete
                      </span>
                      <span className="text-muted"> | </span>
                      <Link to={`/view/${id}`} className="text-decoration-underline text-primary fw-medium me-1">
                        View
                      </Link>
                      <span className="text-muted"> | </span>
                      <Link to={`/edit/${id}`} className="text-decoration-underline text-success fw-medium ms-1">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* FOOTER PHÂN TRANG */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-1">
        <div className="text-muted small">
          Show <strong>{items.length}</strong> of <strong>{totalElements}</strong> records
        </div>
        <div>
          <PaginationControl currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

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
