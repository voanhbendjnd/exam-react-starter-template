/**
 * ====================================================================================
 * BỘ SOURCE CODE CHUẨN THI PE REACT (100% ĐẠT CHUẨN QUY TẮC PHÒNG THI EOS)
 * ------------------------------------------------------------------------------------
 * Tuân thủ tuyệt đối quy định B.3:
 * - 3.2 & 3.3: Sử dụng React JS, React-Bootstrap, React-Router-DOM, Axios, Vite
 * - LƯU Ý QUAN TRỌNG: KHÔNG sử dụng bất kỳ thư viện ngoài nào khác!
 * - 3.6: Kết nối Backend REST API tại cổng 8080 (http://localhost:8080/api)
 * - 3.7: Ứng dụng chạy trên cổng 5173 (http://localhost:5173/)
 * ====================================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  InputGroup,
} from 'react-bootstrap';
import api from './api';

// ====================================================================================
// BƯỚC 1: KHI ĐI THI CHỈ CẦN ĐỔI CÁC TÊN TRƯỜNG DỮ LIỆU Ở ĐÂY CHO GIỐNG BACKEND ĐỀ BÀI!
// ====================================================================================
export const CONFIG = {
  // Đường dẫn API (Ví dụ: '/rooms', '/products', '/employees', '/students', '/books')
  API_ENDPOINT: '/rooms',

  // Tên các thuộc tính trong JSON Backend trả về:
  FIELD_ID: 'roomId',              // Đổi thành: 'id', 'productId', 'studentId'...
  FIELD_NAME: 'roomNumber',        // Đổi thành: 'name', 'productName', 'fullName'...
  FIELD_CATEGORY: 'roomType',      // Đổi thành: 'category', 'department', 'major'...
  FIELD_PRICE: 'roomPricePerDay',  // Đổi thành: 'price', 'salary', 'gpa'...
  FIELD_STATUS: 'roomStatus',      // Đổi thành: 'status', 'active', 'isAvailable'...
  FIELD_DESC: 'roomDetailDescription', // Đổi thành: 'description', 'notes', 'address'...
};

export default function MasterCrudPage() {
  // 1. STATE DỮ LIỆU
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, text: '', variant: 'success' });

  // 2. STATE TÌM KIẾM, LỌC & SẮP XẾP
  const [keyword, setKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DEFAULT'); // 'ASC' | 'DESC' | 'DEFAULT'

  // 3. STATE CHỌN 1 Ô (RADIO) & CHỌN NHIỀU Ô (CHECKBOX)
  const [selectedSingleId, setSelectedSingleId] = useState(null); // Chọn 1 ô (Radio)
  const [selectedMultiIds, setSelectedMultiIds] = useState([]);   // Chọn nhiều ô (Checkbox)

  // 4. STATE MODAL FORM THÊM MỚI / CHỈNH SỬA
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = Thêm mới; khác null = Sửa
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    status: 1,
    desc: '',
  });

  // ==================================================================================
  // NẠP DỮ LIỆU TỪ MÁY CHỦ (GET)
  // ==================================================================================
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.get(CONFIG.API_ENDPOINT);
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(list);
    } catch (err) {
      showAlert(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Nạp thêm danh mục nếu Backend có endpoint (ví dụ: /room-types hoặc /categories)
    api.get('/room-types')
      .then((res) => setCategories(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  const showAlert = (text, variant = 'success') => {
    setAlertInfo({ show: true, text, variant });
    setTimeout(() => setAlertInfo({ show: false, text: '', variant: 'success' }), 3500);
  };

  // ==================================================================================
  // GIẢI THUẬT TÌM KIẾM, LỌC & SẮP XẾP
  // ==================================================================================
  const filteredItems = items
    .filter((item) => {
      // 1. Tìm kiếm từ khóa
      const nameVal = String(item[CONFIG.FIELD_NAME] || '').toLowerCase();
      const descVal = String(item[CONFIG.FIELD_DESC] || '').toLowerCase();
      const matchKeyword =
        !keyword ||
        nameVal.includes(keyword.toLowerCase()) ||
        descVal.includes(keyword.toLowerCase());

      // 2. Lọc theo danh mục
      const catVal =
        typeof item[CONFIG.FIELD_CATEGORY] === 'object'
          ? item[CONFIG.FIELD_CATEGORY]?.roomTypeName || item[CONFIG.FIELD_CATEGORY]?.name
          : item[CONFIG.FIELD_CATEGORY];
      const matchCategory =
        filterCategory === 'ALL' || String(catVal) === String(filterCategory);

      // 3. Lọc theo trạng thái
      const statusVal = String(item[CONFIG.FIELD_STATUS]);
      const matchStatus =
        filterStatus === 'ALL' || statusVal === String(filterStatus);

      return matchKeyword && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      // 4. Sắp xếp giá
      const priceA = Number(a[CONFIG.FIELD_PRICE]) || 0;
      const priceB = Number(b[CONFIG.FIELD_PRICE]) || 0;
      if (sortOrder === 'ASC') return priceA - priceB;
      if (sortOrder === 'DESC') return priceB - priceA;
      return 0;
    });

  // ==================================================================================
  // XỬ LÝ CHỌN 1 Ô (RADIO) & CHỌN NHIỀU Ô (CHECKBOX)
  // ==================================================================================
  const handleSelectSingle = (id) => {
    setSelectedSingleId(id === selectedSingleId ? null : id);
  };

  const handleToggleCheckbox = (id) => {
    if (selectedMultiIds.includes(id)) {
      setSelectedMultiIds(selectedMultiIds.filter((item) => item !== id));
    } else {
      setSelectedMultiIds([...selectedMultiIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMultiIds(filteredItems.map((item) => item[CONFIG.FIELD_ID]));
    } else {
      setSelectedMultiIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMultiIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedMultiIds.length} mục đã chọn?`)) {
      return;
    }
    try {
      await Promise.all(
        selectedMultiIds.map((id) => api.delete(`${CONFIG.API_ENDPOINT}/${id}`))
      );
      showAlert(`Đã xóa thành công ${selectedMultiIds.length} mục!`, 'success');
      setSelectedMultiIds([]);
      loadData();
    } catch (err) {
      showAlert(`Lỗi khi xóa hàng loạt: ${err.message}`, 'danger');
    }
  };

  // ==================================================================================
  // XỬ LÝ THÊM MỚI (CREATE), CẬP NHẬT (UPDATE) & XÓA (DELETE)
  // ==================================================================================
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.roomTypeId || categories[0]?.id || 1,
      price: '',
      status: 1,
      desc: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const catId =
      typeof item[CONFIG.FIELD_CATEGORY] === 'object'
        ? item[CONFIG.FIELD_CATEGORY]?.roomTypeId || item[CONFIG.FIELD_CATEGORY]?.id
        : item[CONFIG.FIELD_CATEGORY];

    setFormData({
      name: item[CONFIG.FIELD_NAME] || '',
      categoryId: catId || 1,
      price: item[CONFIG.FIELD_PRICE] || '',
      status: item[CONFIG.FIELD_STATUS] !== undefined ? item[CONFIG.FIELD_STATUS] : 1,
      desc: item[CONFIG.FIELD_DESC] || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn reload trang

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên / số!');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Vui lòng nhập giá lớn hơn 0!');
      return;
    }

    const payload = {
      [CONFIG.FIELD_NAME]: formData.name.trim(),
      roomTypeId: Number(formData.categoryId),
      [CONFIG.FIELD_PRICE]: Number(formData.price),
      [CONFIG.FIELD_STATUS]: Number(formData.status),
      [CONFIG.FIELD_DESC]: formData.desc.trim(),
      roomMaxCapacity: 2,
    };

    try {
      if (editingItem) {
        // CẬP NHẬT (PUT)
        const id = editingItem[CONFIG.FIELD_ID];
        await api.put(`${CONFIG.API_ENDPOINT}/${id}`, payload);
        showAlert('Cập nhật dữ liệu thành công!', 'success');
      } else {
        // THÊM MỚI (POST)
        await api.post(CONFIG.API_ENDPOINT, payload);
        showAlert('Thêm mới bản ghi thành công!', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(`Thao tác thất bại: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này không?')) {
      return;
    }
    try {
      await api.delete(`${CONFIG.API_ENDPOINT}/${id}`);
      showAlert('Xóa bản ghi thành công!', 'success');
      loadData();
    } catch (err) {
      showAlert(`Xóa thất bại: ${err.message}`, 'danger');
    }
  };

  // ==================================================================================
  // GIAO DIỆN REACT-BOOTSTRAP (100% DÙNG REACT-BOOTSTRAP COMPONENT)
  // ==================================================================================
  return (
    <Container className="py-4">
      {/* 1. HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-primary mb-1">Hệ Thống Quản Lý Dữ Liệu</h3>
          <small className="text-muted">
            Tổng số: <strong>{filteredItems.length}</strong> kết quả (trên tổng số{' '}
            {items.length} bản ghi)
          </small>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <Button variant="outline-secondary" size="sm" onClick={loadData}>
            🔄 Làm mới
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            ➕ Thêm mới
          </Button>
        </div>
      </div>

      {/* 2. ALERT THÔNG BÁO */}
      {alertInfo.show && (
        <Alert variant={alertInfo.variant} dismissible onClose={() => setAlertInfo({ show: false })}>
          {alertInfo.text}
        </Alert>
      )}

      {/* 3. KHUNG TÌM KIẾM & LỌC DỮ LIỆU */}
      <div className="p-3 mb-3 bg-light rounded shadow-sm border">
        <Row className="g-2 align-items-center">
          <Col md={4}>
            <Form.Control
              size="sm"
              type="text"
              placeholder="🔍 Tìm kiếm theo tên hoặc mô tả..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">-- Tất cả danh mục --</option>
              {categories.map((c) => (
                <option key={c.roomTypeId || c.id} value={c.roomTypeName || c.name}>
                  {c.roomTypeName || c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select
              size="sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">-- Trạng thái --</option>
              <option value="1">Đang hoạt động</option>
              <option value="2">Tạm dừng</option>
              <option value="0">Đã khóa</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              size="sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="DEFAULT">Sắp xếp: Mặc định</option>
              <option value="ASC">Giá tăng dần ⬆️</option>
              <option value="DESC">Giá giảm dần ⬇️</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* 4. THANH THAO TÁC HÀNG LOẠT (BULK ACTIONS) */}
      {selectedMultiIds.length > 0 && (
        <Alert variant="info" className="py-2 d-flex justify-content-between align-items-center">
          <span>
            Đã chọn: <strong>{selectedMultiIds.length}</strong> mục
          </span>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSelectedMultiIds([])}
            >
              Bỏ chọn tất cả
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              🗑️ Xóa {selectedMultiIds.length} mục đã chọn
            </Button>
          </div>
        </Alert>
      )}

      {/* 5. THÔNG BÁO MỤC ĐANG CHỌN 1 Ô (RADIO) */}
      {selectedSingleId && (
        <Alert variant="warning" className="py-1 small mb-3">
          👉 <strong>Đang chọn 1 ô duy nhất:</strong> ID #{selectedSingleId} (
          {items.find((x) => x[CONFIG.FIELD_ID] === selectedSingleId)?.[CONFIG.FIELD_NAME]}
          )
        </Alert>
      )}

      {/* 6. BẢNG REACT-BOOTSTRAP TABLE */}
      <div className="border rounded shadow-sm bg-white overflow-hidden">
        <Table responsive hover bordered className="align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '40px' }} className="text-center">
                <Form.Check
                  type="checkbox"
                  checked={
                    filteredItems.length > 0 &&
                    filteredItems.every((it) =>
                      selectedMultiIds.includes(it[CONFIG.FIELD_ID])
                    )
                  }
                  onChange={handleSelectAll}
                  title="Chọn tất cả"
                />
              </th>
              <th style={{ width: '40px' }} className="text-center" title="Chọn 1 ô">
                🔘
              </th>
              <th style={{ width: '60px' }}>ID</th>
              <th>Tên / Số hiệu</th>
              <th>Danh mục / Phân loại</th>
              <th>Đơn giá / Lương</th>
              <th>Mô tả</th>
              <th style={{ width: '130px' }}>Trạng thái</th>
              <th style={{ width: '130px' }} className="text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">
                  Đang nạp dữ liệu từ máy chủ...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-danger">
                  Không tìm thấy bản ghi nào phù hợp!
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const id = item[CONFIG.FIELD_ID];
                const name = item[CONFIG.FIELD_NAME];
                const price = item[CONFIG.FIELD_PRICE];
                const status = item[CONFIG.FIELD_STATUS];
                const desc = item[CONFIG.FIELD_DESC];

                const catName =
                  typeof item[CONFIG.FIELD_CATEGORY] === 'object'
                    ? item[CONFIG.FIELD_CATEGORY]?.roomTypeName ||
                      item[CONFIG.FIELD_CATEGORY]?.name
                    : item[CONFIG.FIELD_CATEGORY] || 'N/A';

                const isChecked = selectedMultiIds.includes(id);
                const isRadio = selectedSingleId === id;

                return (
                  <tr
                    key={id}
                    className={
                      isRadio ? 'table-warning' : isChecked ? 'table-primary' : ''
                    }
                  >
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCheckbox(id)}
                      />
                    </td>
                    <td className="text-center">
                      <Form.Check
                        type="radio"
                        name="singleSelectRadio"
                        checked={isRadio}
                        onChange={() => handleSelectSingle(id)}
                      />
                    </td>
                    <td>
                      <strong>#{id}</strong>
                    </td>
                    <td className="fw-bold text-primary">{name}</td>
                    <td>
                      <Badge bg="secondary">{catName}</Badge>
                    </td>
                    <td className="text-danger fw-bold">
                      {Number(price).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="small text-muted">{desc || '—'}</td>
                    <td>
                      {status === 1 ? (
                        <Badge bg="success">Đang hoạt động</Badge>
                      ) : status === 2 ? (
                        <Badge bg="warning" text="dark">
                          Tạm dừng
                        </Badge>
                      ) : (
                        <Badge bg="danger">Đã khóa</Badge>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-primary"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          ✏️ Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => handleDeleteItem(id)}
                        >
                          🗑️ Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* ============================================================================== */}
      {/* 7. MODAL REACT-BOOTSTRAP THÊM MỚI & SỬA 2-IN-1 */}
      {/* ============================================================================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fs-5">
              {editingItem ? '✏️ Cập nhật thông tin' : '➕ Thêm mới bản ghi'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Tên / Số hiệu <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Phòng 101, Bàn số 2..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Danh mục / Phân loại</Form.Label>
              <Form.Select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option
                    key={c.roomTypeId || c.id}
                    value={c.roomTypeId || c.id}
                  >
                    {c.roomTypeName || c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Đơn giá (VNĐ) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Ví dụ: 500000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                min="0"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Trạng thái</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: Number(e.target.value) })
                }
              >
                <option value={1}>1 - Đang hoạt động (Active)</option>
                <option value={2}>2 - Tạm dừng (Inactive)</option>
                <option value={0}>0 - Đã khóa (Banned)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ghi chú thêm..."
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              💾 {editingItem ? 'Lưu cập nhật' : 'Tạo mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
