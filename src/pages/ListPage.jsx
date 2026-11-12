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
 * 📄 MÀN HÌNH DANH SÁCH (LIST PAGE)
 * ------------------------------------------------------------------------------------
 * 👉 CÁC CỘT TRONG BẢNG ĐƯỢC VIẾT TƯỜNG MINH TRỰC TIẾP (KHÔNG DÙNG VÒNG FOR)
 * - Muốn thêm/bớt cột: Thêm thẻ <th> ở <thead> và thẻ <td> ở <tbody>
 * - Muốn ghép 2 biến từ server (VD: priceFrom - priceTo): Viết trực tiếp {item.priceFrom} - {item.priceTo}
 * ====================================================================================
 */
export default function ListPage() {
  const navigate = useNavigate();

  // 1. STATE DỮ LIỆU
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, text: '', variant: 'success' });

  // 2. STATE BỘ LỌC (FILTER)
  const [filterCategory, setFilterCategory] = useState('');
  const [filterName, setFilterName] = useState('');

  // 3. STATE PHÂN TRANG (Tương thích Server-side của Spring Boot)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = CONFIG.PAGE_SIZE || 5;

  // 4. STATE XÓA BẢN GHI
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Helper hiển thị thông báo Alert
  const showAlert = (text, variant = 'success') => {
    setAlertInfo({ show: true, text, variant });
    setTimeout(() => {
      setAlertInfo({ show: false, text: '', variant: 'success' });
    }, 3500);
  };

  // Helper format ngày nếu hiển thị trên bảng
  const formatDisplayDate = (val) => {
    if (!val) return '—';
    if (typeof val === 'string' && (val.includes('T') || (val.includes('-') && val.length === 10))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return val;
  };

  // ----------------------------------------------------------------------------------
  // 🔹 1. TẢI DANH MỤC PHỤ (Categories / Departments)
  // ----------------------------------------------------------------------------------
  const loadCategories = async () => {
    try {
      const data = await api.get(CONFIG.API_CATEGORY);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setCategories(list);
    } catch (err) {
      console.warn('Lỗi khi nạp danh mục phụ:', err.message);
    }
  };

  // ----------------------------------------------------------------------------------
  // 🔹 2. TẢI DỮ LIỆU & PHÂN TRANG (HYBRID SERVER-SIDE + CLIENT-SIDE FALLBACK)
  // ----------------------------------------------------------------------------------
  const loadData = async (page = 1, searchName = filterName, searchCat = filterCategory) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1, // Spring Boot đếm từ 0
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
        // Backend Spring Boot có phân trang Server-side (PageResponse / PageDTO)
        setItems(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements ?? (response.content ? response.content.length : 0));
      } else if (Array.isArray(response)) {
        // Backend trả về mảng thuần không phân trang -> Tự động cắt Client-side
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

  // ----------------------------------------------------------------------------------
  // 🔹 3. XỬ LÝ LỌC & RESET
  // ----------------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------------
  // 🔹 4. XỬ LÝ CHUYỂN TRANG
  // ----------------------------------------------------------------------------------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadData(newPage, filterName, filterCategory);
    }
  };

  // ----------------------------------------------------------------------------------
  // 🔹 5. XỬ LÝ XÓA BẢN GHI
  // ----------------------------------------------------------------------------------
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteModalShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const id = itemToDelete[CONFIG.FIELD_ID] || itemToDelete.id || itemToDelete.shoesId || itemToDelete.employeeId;
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

  return (
    <Container className="py-3" style={{ maxWidth: '980px' }}>
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Tiêu đề trang & Nút Refresh */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{CONFIG.ENTITY_NAME} List</h4>
        <Button variant="outline-secondary" size="sm" onClick={() => loadData(currentPage)} title="Tải lại dữ liệu">
          🔄 Refresh
        </Button>
      </div>

      {/* 3. Alert thông báo */}
      {alertInfo.show && (
        <Alert
          variant={alertInfo.variant}
          dismissible
          onClose={() => setAlertInfo({ show: false, text: '', variant: 'success' })}
        >
          {alertInfo.text}
        </Alert>
      )}

      {/* 4. KHUNG TÌM KIẾM & LỌC DỮ LIỆU */}
      <Form onSubmit={handleFilter} className="mb-4">
        {/* Dropdown Danh mục */}
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
                const catVal =
                  c.departmentId ||
                  c.categoryId ||
                  c.categoryName ||
                  c.departmentName ||
                  c.id ||
                  c.name ||
                  c;
                const catText =
                  c.departmentName ||
                  c.categoryName ||
                  c.name ||
                  c.title ||
                  c;
                return (
                  <option key={catVal} value={catVal}>
                    {catText}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>

        {/* Textbox Tìm tên + Cụm nút */}
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
            <Button
              type="submit"
              variant="outline-primary"
              size="sm"
              className="px-3"
              style={{ minWidth: '80px' }}
            >
              Filter
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="px-2"
              onClick={handleReset}
              title="Xóa bộ lọc"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="px-3"
              style={{ minWidth: '90px' }}
              onClick={() => navigate('/add')}
            >
              + Add New
            </Button>
          </Col>
        </Row>
      </Form>

      {/* ---------------------------------------------------------------------------- */}
      {/* 5. BẢNG HIỂN THỊ DỮ LIỆU - VIẾT RÕ RÀNG TRỰC TIẾP TỪNG CỘT (DỄ CUSTOM)       */}
      {/* ---------------------------------------------------------------------------- */}
      <h5 className="fw-bold mb-2">{CONFIG.ENTITY_NAME} List</h5>
      <div className="border border-secondary mb-2 bg-white">
        <Table hover responsive className="mb-0 text-center align-middle">
          <thead style={{ backgroundColor: '#cfe2ff' }}>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th className="text-start">{CONFIG.ENTITY_NAME} Name</th>
              <th>Category</th>
              <th>Manufacturer</th>
              <th>Price(đ)</th>

              {/* 💡 VÍ DỤ NẾU ĐỀ YÊU CẦU THÊM CỘT "Price Range" hoặc bất kỳ cột nào: */}
              {/* <th>Price Range(đ)</th> */}

              <th style={{ width: '180px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                {/* ⚠️ Nếu thêm cột ở trên thì tăng số colSpan tương ứng */}
                <td colSpan="6" className="py-4 text-muted">
                  Loading data from server...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-danger fw-bold">
                  No records found
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const id =
                  item[CONFIG.FIELD_ID] ||
                  item.id ||
                  item.shoesId ||
                  item.employeeId ||
                  index + 1;

                const name =
                  item[CONFIG.FIELD_NAME] ||
                  item.name ||
                  item.fullName ||
                  item.shoesName ||
                  item.title ||
                  '—';

                const cat =
                  typeof item[CONFIG.FIELD_CATEGORY] === 'object'
                    ? item[CONFIG.FIELD_CATEGORY]?.name || item[CONFIG.FIELD_CATEGORY]?.categoryName
                    : item[CONFIG.FIELD_CATEGORY] ||
                      item.departmentName ||
                      item.categoryName ||
                      item.category ||
                      '—';

                const manufacturer =
                  item.manufacturer ||
                  item.position ||
                  item.author ||
                  '—';

                const price =
                  item.price !== undefined
                    ? Number(item.price).toLocaleString()
                    : item.salary !== undefined
                    ? Number(item.salary).toLocaleString()
                    : '—';

                return (
                  <tr key={id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="text-start fw-medium">{name}</td>
                    <td>{cat}</td>
                    <td>{manufacturer}</td>
                    <td>{price}</td>

                    {/* 💡 VÍ DỤ GHÉP 2 BIẾN TỪ SERVER (priceFrom - priceTo):
                        Bạn có thể viết trực tiếp rất dễ dàng như sau:
                        <td>{item.priceFrom && item.priceTo ? `${item.priceFrom} - ${item.priceTo}` : '—'}</td>
                    */}

                    {/* CỘT THAO TÁC: DELETE | VIEW | EDIT */}
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
                      <Link
                        to={`/view/${id}`}
                        className="text-decoration-underline text-primary fw-medium me-1"
                      >
                        View
                      </Link>
                      <span className="text-muted"> | </span>
                      <Link
                        to={`/edit/${id}`}
                        className="text-decoration-underline text-success fw-medium ms-1"
                      >
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

      {/* 6. PHÂN TRANG VÀ ĐẾM DÒNG */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-1">
        <div className="text-muted small">
          Show <strong>{items.length}</strong> of <strong>{totalElements}</strong> records
        </div>
        <div>
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* 7. CONFIRMATION MODAL (CHỈ CẦN TRUYỀN NAME VÀO) */}
      <ConfirmationModal
        show={deleteModalShow}
        itemName={
          itemToDelete?.[CONFIG.FIELD_NAME] ||
          itemToDelete?.name ||
          itemToDelete?.shoesName ||
          itemToDelete?.fullName ||
          ''
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalShow(false)}
        loading={deleting}
      />
    </Container>
  );
}
