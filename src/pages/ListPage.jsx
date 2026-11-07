import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import PaginationControl from '../components/PaginationControl';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH DANH SÁCH TỔNG HỢP (GENERIC LIST PAGE)
 * ------------------------------------------------------------------------------------
 * TÍCH HỢP ĐẦY ĐỦ CÁC TÍNH NĂNG MÀ ĐỀ THI PE CÓ THỂ RA:
 *  1. Xem danh sách & Phân trang (Pagination)
 *  2. Tìm kiếm & Lọc (Filter) + Nút Reset bộ lọc
 *  3. Sắp xếp dữ liệu (Sort theo Tên / Giá / ID)
 *  4. Xem chi tiết (View Details)
 *  5. Thêm mới (Add New)
 *  6. Cập nhật / Chỉnh sửa (Update / Edit)
 *  7. Xóa đơn lẻ (Single Delete) kèm Confirmation Screen
 *  8. Chọn nhiều ô (Multi-select Checkbox) & Xóa hàng loạt (Bulk Delete)
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

  // 3. STATE SẮP XẾP (SORT)
  // 💡 Hỗ trợ sắp xếp: 'NONE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC' | 'NAME_DESC'
  const [sortBy, setSortBy] = useState('NONE');

  // 4. STATE CHỌN NHIỀU Ô (MULTI-SELECT CHECKBOX)
  // 💡 Dành cho đề thi có yêu cầu chọn nhiều dòng để xóa hàng loạt
  const [selectedIds, setSelectedIds] = useState([]);

  // 5. STATE KẾT QUẢ VÀ PHÂN TRANG
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = CONFIG.PAGINATION.PAGE_SIZE;

  // 6. STATE CONFIRMATION MODAL CHO DELETE
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Helper hiển thị thông báo
  const showAlert = (text, variant = 'success') => {
    setAlertInfo({ show: true, text, variant });
    setTimeout(() => {
      setAlertInfo({ show: false, text: '', variant: 'success' });
    }, 3500);
  };

  // Helper format ngày hiển thị
  const formatDisplayDate = (val) => {
    if (!val) return '—';
    if (typeof val === 'string' && val.includes('T')) {
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
  // 🔹 NẠP DỮ LIỆU TỪ MÁY CHỦ
  // ----------------------------------------------------------------------------------
  const loadCategories = async () => {
    try {
      const data = await api.get(CONFIG.API.ENDPOINT_CATEGORY);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setCategories(list);
    } catch (err) {
      console.warn('Lỗi khi nạp danh mục phụ:', err.message);
    }
  };

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const data = await api.get(CONFIG.API.ENDPOINT_MAIN);
      // 🔥 Bóc tách an toàn cho mọi kiểu Spring Boot: Mảng trực tiếp, Page { content: [] }, { data: [] }
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
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

    // Hiển thị flash message (ví dụ sau khi thêm mới hoặc sửa thành công)
    const flash = sessionStorage.getItem('flashMessage');
    if (flash) {
      showAlert(flash, 'success');
      sessionStorage.removeItem('flashMessage');
    }
  }, []);

  // ----------------------------------------------------------------------------------
  // 🔹 TÌM KIẾM, LỌC & SẮP XẾP (FILTER & SORT)
  // ----------------------------------------------------------------------------------
  const handleFilter = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filterName.trim()) params.name = filterName.trim();
      if (filterCategory) params.category = filterCategory;

      let resultList = [];
      try {
        const searchRes = await api.get(CONFIG.API.ENDPOINT_SEARCH, { params });
        resultList = Array.isArray(searchRes) ? searchRes : (searchRes?.content || searchRes?.data || []);
      } catch (searchApiError) {
        // Fallback filter mảng client-side nếu backend không có endpoint search
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

      // Xử lý sắp xếp (Sort)
      if (sortBy === 'PRICE_ASC') {
        resultList.sort((a, b) => (Number(a[CONFIG.FIELDS.PRICE]) || 0) - (Number(b[CONFIG.FIELDS.PRICE]) || 0));
      } else if (sortBy === 'PRICE_DESC') {
        resultList.sort((a, b) => (Number(b[CONFIG.FIELDS.PRICE]) || 0) - (Number(a[CONFIG.FIELDS.PRICE]) || 0));
      } else if (sortBy === 'NAME_ASC') {
        resultList.sort((a, b) => String(a[CONFIG.FIELDS.NAME] || '').localeCompare(String(b[CONFIG.FIELDS.NAME] || '')));
      }

      setFilteredItems(resultList);
      setCurrentPage(1);
    } catch (err) {
      showAlert(`Lỗi khi lọc: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // 💡 [TÍNH NĂNG RESET BỘ LỌC]: Trở về dữ liệu ban đầu
  const handleResetFilter = () => {
    setFilterName('');
    setFilterCategory('');
    setSortBy('NONE');
    setFilteredItems(items);
    setCurrentPage(1);
  };

  // ----------------------------------------------------------------------------------
  // 🔹 [TÍNH NĂNG CHỌN NHIỀU & XÓA HÀNG LOẠT - BULK DELETE]
  // ----------------------------------------------------------------------------------
  const handleToggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCurrentIds = paginatedItems.map((it) => it[CONFIG.FIELDS.ID] || it.id);
      setSelectedIds(allCurrentIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) {
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) => api.delete(`${CONFIG.API.ENDPOINT_MAIN}/${id}`))
      );
      showAlert(`Deleted ${selectedIds.length} items successfully!`, 'success');
      setSelectedIds([]);
      await loadAllItems();
    } catch (err) {
      showAlert(`Lỗi xóa hàng loạt: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------------------
  // 🔹 XỬ LÝ XÓA 1 BẢN GHI (SINGLE DELETE)
  // ----------------------------------------------------------------------------------
  const handleOpenDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteModalShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const id = itemToDelete[CONFIG.FIELDS.ID] || itemToDelete.id;
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

  // Phân trang
  const totalRecords = filteredItems.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <Container className="py-3" style={{ maxWidth: '980px' }}>
      {/* 1. HEADER CHUẨN: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. TIÊU ĐỀ TRANG & NÚT REFRESH */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{CONFIG.LABELS.PAGE_LIST_TITLE}</h4>
        <Button variant="outline-secondary" size="sm" onClick={loadAllItems} title="Tải lại dữ liệu từ server">
          🔄 Refresh
        </Button>
      </div>

      {/* 3. ALERT THÔNG BÁO */}
      {alertInfo.show && (
        <Alert
          variant={alertInfo.variant}
          dismissible
          onClose={() => setAlertInfo({ show: false, text: '', variant: 'success' })}
        >
          {alertInfo.text}
        </Alert>
      )}

      {/* 4. KHUNG TÌM KIẾM, LỌC & SẮP XẾP */}
      <Form onSubmit={handleFilter} className="mb-4">
        {/* Hàng 1: Dropdown Danh mục */}
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

          {/* 💡 [TÍNH NĂNG SẮP XẾP / SORT]: Nếu đề yêu cầu có dropdown sort thì dùng ô này */}
          <Col xs={12} sm={5} className="mt-2 mt-sm-0">
            <Form.Select
              size="sm"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                // Tự động filter và sort lại khi chọn
                setTimeout(() => handleFilter(), 50);
              }}
            >
              <option value="NONE">Sort: Default</option>
              <option value="PRICE_ASC">Price: Low to High ⬆️</option>
              <option value="PRICE_DESC">Price: High to Low ⬇️</option>
              <option value="NAME_ASC">Name: A to Z</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Hàng 2: Textbox Tên + Các nút thao tác */}
        <Row className="align-items-center">
          <Col xs={3} sm={2} className="text-end fw-medium">
            {CONFIG.LABELS.COL_NAME}:
          </Col>
          <Col xs={9} sm={5}>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Search by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Col>
          {/* Cụm nút: Filter, Reset, Add New */}
          <Col xs={12} sm={5} className="mt-2 mt-sm-0 d-flex gap-2 justify-content-start">
            <Button
              type="submit"
              variant="outline-primary"
              size="sm"
              className="px-3"
              style={{ minWidth: '80px' }}
            >
              {CONFIG.LABELS.BTN_FILTER}
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="px-2"
              onClick={handleResetFilter}
              title="Xóa trắng bộ lọc"
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
              + {CONFIG.LABELS.BTN_ADD_NEW}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* 💡 [TÍNH NĂNG BULK ACTION]: Thanh thông báo khi có checkbox được tích chọn */}
      {selectedIds.length > 0 && (
        <Alert variant="warning" className="py-2 d-flex justify-content-between align-items-center">
          <span>
            Selected: <strong>{selectedIds.length}</strong> items
          </span>
          <div className="d-flex gap-2">
            <Button variant="outline-dark" size="sm" onClick={() => setSelectedIds([])}>
              Deselect All
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              🗑️ Delete Selected ({selectedIds.length})
            </Button>
          </div>
        </Alert>
      )}

      {/* 5. BẢNG HIỂN THỊ DỮ LIỆU */}
      <h5 className="fw-bold mb-2">{CONFIG.LABELS.PAGE_LIST_TITLE}</h5>
      <div className="border border-secondary mb-2 bg-white">
        <Table hover responsive className="mb-0 text-center align-middle">
          <thead style={{ backgroundColor: '#cfe2ff' }}>
            <tr>
              {/* 💡 CHECKBOX CHỌN TẤT CẢ (Nếu đề không yêu cầu có thể giữ nguyên hoặc comment lại) */}
              <th style={{ width: '40px' }}>
                <Form.Check
                  type="checkbox"
                  checked={
                    paginatedItems.length > 0 &&
                    paginatedItems.every((it) => selectedIds.includes(it[CONFIG.FIELDS.ID] || it.id))
                  }
                  onChange={handleSelectAll}
                  title="Select all"
                />
              </th>
              <th style={{ width: '60px' }}>{CONFIG.LABELS.COL_INDEX}</th>
              <th className="text-start">{CONFIG.LABELS.COL_NAME}</th>
              <th>{CONFIG.LABELS.COL_CATEGORY}</th>
              <th>{CONFIG.LABELS.COL_MANUFACTURER}</th>
              <th>{CONFIG.LABELS.COL_PRICE}</th>
              <th style={{ width: '190px' }}>{CONFIG.LABELS.COL_ACTION}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-4 text-muted">
                  Loading data from server...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-4 text-danger fw-bold">
                  {CONFIG.MESSAGES.NO_RECORDS_FOUND}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => {
                const id = item[CONFIG.FIELDS.ID] || item.id || index + 1;
                const name = item[CONFIG.FIELDS.NAME] || item.shoesName || item.name || '—';
                const cat =
                  typeof item[CONFIG.FIELDS.CATEGORY] === 'object'
                    ? item[CONFIG.FIELDS.CATEGORY]?.name || item[CONFIG.FIELDS.CATEGORY]?.categoryName
                    : item[CONFIG.FIELDS.CATEGORY] || item.categoryName || '—';
                const manufacturer = item[CONFIG.FIELDS.MANUFACTURER] || item.manufacturer || '—';
                const price = item[CONFIG.FIELDS.PRICE] ?? item.price;
                const isChecked = selectedIds.includes(id);

                return (
                  <tr key={id} className={isChecked ? 'table-warning' : ''}>
                    {/* Ô Checkbox từng dòng */}
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelectOne(id)}
                      />
                    </td>
                    <td>{startIndex + index + 1}</td>
                    <td className="text-start fw-medium">{name}</td>
                    <td>{cat}</td>
                    <td>{manufacturer}</td>
                    <td>{price !== undefined ? Number(price).toLocaleString() : '—'}</td>

                    {/* CỘT THAO TÁC: DELETE | VIEW | EDIT */}
                    <td>
                      {/* 1. ACTION DELETE */}
                      <span
                        role="button"
                        className="text-decoration-underline text-danger fw-medium me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenDeleteDialog(item)}
                      >
                        {CONFIG.LABELS.BTN_DELETE}
                      </span>
                      <span className="text-muted"> | </span>

                      {/* 2. ACTION VIEW */}
                      <Link
                        to={`/view/${id}`}
                        className="text-decoration-underline text-primary fw-medium me-1"
                      >
                        {CONFIG.LABELS.BTN_VIEW}
                      </Link>

                      {/* ------------------------------------------------------------ */}
                      {/* 💡 [TÍNH NĂNG UPDATE / EDIT]:                                 */}
                      {/* Dành cho đề thi yêu cầu nút Sửa để chuyển sang trang Edit:    */}
                      {/* ------------------------------------------------------------ */}
                      <span className="text-muted"> | </span>
                      <Link
                        to={`/edit/${id}`}
                        className="text-decoration-underline text-success fw-medium ms-1"
                      >
                        {CONFIG.LABELS.BTN_EDIT || 'Edit'}
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

      {/* 7. CONFIRMATION SCREEN MODAL */}
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
