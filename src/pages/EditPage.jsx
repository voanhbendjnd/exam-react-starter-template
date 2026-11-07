import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH CHỈNH SỬA / CẬP NHẬT (EDIT PAGE)
 * ------------------------------------------------------------------------------------
 * 💡 Dành cho các đề thi có yêu cầu chức năng UPDATE (PUT /api/{entity}/{id}):
 * - Tự động tải dữ liệu cũ theo ID từ URL (/edit/:id) đổ vào form
 * - Cho phép chỉnh sửa và validate hợp lệ
 * - Gọi API PUT để lưu cập nhật và quay về trang danh sách
 * ====================================================================================
 */
export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // State Form chỉnh sửa
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    manufacturer: '',
    productionDate: '',
    importDate: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Helper format ngày từ Backend (nếu là dạng ISO "2026-11-07T...") sang "dd/MM/yyyy"
  const formatDateToInput = (val) => {
    if (!val) return '';
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

  // 1. Tải danh mục và dữ liệu cũ của bản ghi cần sửa
  useEffect(() => {
    const fetchEditData = async () => {
      setLoadingInit(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(CONFIG.API.ENDPOINT_CATEGORY).catch(() => []),
          api.get(`${CONFIG.API.ENDPOINT_MAIN}/${id}`),
        ]);

        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || catRes?.data || []);
        setCategories(catList);

        const currentItem = itemRes?.data || itemRes;
        if (currentItem) {
          const catVal =
            typeof currentItem[CONFIG.FIELDS.CATEGORY] === 'object'
              ? currentItem[CONFIG.FIELDS.CATEGORY]?.name || currentItem[CONFIG.FIELDS.CATEGORY]?.categoryName
              : currentItem[CONFIG.FIELDS.CATEGORY] || currentItem.categoryName || '';

          setFormData({
            name: currentItem[CONFIG.FIELDS.NAME] || currentItem.shoesName || currentItem.name || '',
            price: currentItem[CONFIG.FIELDS.PRICE] ?? currentItem.price ?? '',
            manufacturer: currentItem[CONFIG.FIELDS.MANUFACTURER] || currentItem.manufacturer || '',
            productionDate: formatDateToInput(currentItem[CONFIG.FIELDS.PROD_DATE] || currentItem.productionDate),
            importDate: formatDateToInput(currentItem[CONFIG.FIELDS.IMPORT_DATE] || currentItem.importDate),
            category: catVal,
          });
        }
      } catch (err) {
        setAlertError(`Failed to load record details: ${err.message}`);
      } finally {
        setLoadingInit(false);
      }
    };

    if (id) {
      fetchEditData();
    }
  }, [id]);

  // Helper kiểm tra định dạng ngày dd/MM/yyyy
  const isValidDateFormat = (dateStr) => {
    if (!dateStr) return false;
    if (!CONFIG.VALIDATION.DATE_FORMAT_REGEX.test(dateStr)) return false;

    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  // 2. Validate form chỉnh sửa
  const validateForm = () => {
    const newErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} is mandatory.`;
    } else if (trimmedName.length > CONFIG.VALIDATION.NAME_MAX_LENGTH) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} must not exceed ${CONFIG.VALIDATION.NAME_MAX_LENGTH} characters.`;
    }

    const priceStr = String(formData.price).trim();
    if (CONFIG.VALIDATION.PRICE_REQUIRED && !priceStr) {
      newErrors.price = `${CONFIG.LABELS.COL_PRICE} is mandatory.`;
    } else if (priceStr) {
      const numPrice = Number(priceStr);
      if (isNaN(numPrice)) {
        newErrors.price = 'Price must be a valid number.';
      } else if (
        numPrice <= CONFIG.VALIDATION.PRICE_MIN ||
        numPrice >= CONFIG.VALIDATION.PRICE_MAX
      ) {
        newErrors.price = `Price must be greater than ${CONFIG.VALIDATION.PRICE_MIN} and less than ${CONFIG.VALIDATION.PRICE_MAX}.`;
      }
    }

    const trimmedManufacturer = formData.manufacturer.trim();
    if (!trimmedManufacturer) {
      newErrors.manufacturer = `${CONFIG.LABELS.COL_MANUFACTURER} is mandatory.`;
    }

    const prodDateStr = formData.productionDate.trim();
    if (!prodDateStr) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} is mandatory.`;
    } else if (prodDateStr.length !== 10 || !isValidDateFormat(prodDateStr)) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} must follow format dd/MM/yyyy.`;
    }

    const importDateStr = formData.importDate.trim();
    if (importDateStr && (importDateStr.length !== 10 || !isValidDateFormat(importDateStr))) {
      newErrors.importDate = `${CONFIG.LABELS.COL_IMPORT_DATE} must follow format dd/MM/yyyy.`;
    }

    if (!formData.category) {
      newErrors.category = `${CONFIG.LABELS.COL_CATEGORY} is mandatory.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Helper chuyển đổi dd/MM/yyyy -> yyyy-MM-dd cho Spring Boot Date deserializer
  const convertDateToBackend = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  // 3. Gửi cập nhật PUT lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertError('');

    const isValid = validateForm();
    if (!isValid) {
      setAlertError('Please correct the highlighted validation errors below.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        [CONFIG.FIELDS.ID]: id,
        [CONFIG.FIELDS.NAME]: formData.name.trim(),
        [CONFIG.FIELDS.PRICE]: Number(formData.price),
        [CONFIG.FIELDS.MANUFACTURER]: formData.manufacturer.trim(),
        [CONFIG.FIELDS.PROD_DATE]: convertDateToBackend(formData.productionDate),
        [CONFIG.FIELDS.IMPORT_DATE]: convertDateToBackend(formData.importDate),
        [CONFIG.FIELDS.CATEGORY]: formData.category,
      };

      // Gửi PUT request tới API
      await api.put(`${CONFIG.API.ENDPOINT_MAIN}/${id}`, payload);

      // Lưu flash message thành công và quay về danh sách
      sessionStorage.setItem('flashMessage', CONFIG.MESSAGES.UPDATE_SUCCESS);
      navigate('/');
    } catch (err) {
      setAlertError(`Failed to update record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Tiêu đề màn hình Sửa */}
      <h4 className="fw-bold mb-3">{CONFIG.LABELS.PAGE_EDIT_TITLE || `Edit ${CONFIG.ENTITY_NAME}`}</h4>

      {alertError && (
        <Alert variant="danger" dismissible onClose={() => setAlertError('')}>
          {alertError}
        </Alert>
      )}

      <Card className="border border-secondary p-4 bg-white shadow-sm">
        {loadingInit ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2 text-muted">Loading data...</div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            {/* TÊN */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_NAME}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={formData.name}
                  maxLength={CONFIG.VALIDATION.NAME_MAX_LENGTH}
                  isInvalid={!!errors.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* GIÁ */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_PRICE}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="number"
                  value={formData.price}
                  isInvalid={!!errors.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* NHÀ SẢN XUẤT */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_MANUFACTURER}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={formData.manufacturer}
                  maxLength={CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH}
                  isInvalid={!!errors.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.manufacturer}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* NGÀY SẢN XUẤT & NGÀY NHẬP */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_PROD_DATE}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={3}>
                <Form.Control
                  type="text"
                  placeholder="dd/MM/yyyy"
                  value={formData.productionDate}
                  maxLength={10}
                  isInvalid={!!errors.productionDate}
                  onChange={(e) => handleChange('productionDate', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.productionDate}</Form.Control.Feedback>
              </Col>

              <Form.Label column sm={2} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_IMPORT_DATE}:
              </Form.Label>
              <Col sm={3}>
                <Form.Control
                  type="text"
                  placeholder="dd/MM/yyyy"
                  value={formData.importDate}
                  maxLength={10}
                  isInvalid={!!errors.importDate}
                  onChange={(e) => handleChange('importDate', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.importDate}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* DANH MỤC */}
            <Form.Group as={Row} className="mb-4">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABELS.COL_CATEGORY}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={5}>
                <Form.Select
                  value={formData.category}
                  isInvalid={!!errors.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <option value="">-- Select {CONFIG.LABELS.COL_CATEGORY} --</option>
                  {categories.map((c) => {
                    const catVal = c.categoryName || c.name || c.id || c;
                    const catLabel = c.categoryName || c.name || c;
                    return (
                      <option key={c.id || catVal} value={catVal}>
                        {catLabel}
                      </option>
                    );
                  })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* NÚT THAO TÁC: [ SAVE CHANGES ] [ BACK ] */}
            <Row>
              <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4"
                  style={{ minWidth: '130px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="px-4"
                  style={{ minWidth: '100px' }}
                  onClick={() => navigate('/')}
                >
                  {CONFIG.LABELS.BTN_BACK}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </Container>
  );
}

