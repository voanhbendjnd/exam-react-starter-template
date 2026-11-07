import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * GENERIC ADD PAGE
 * Màn hình thêm mới bản ghi kèm hệ thống Validation linh hoạt
 */
export default function AddPage() {
  const navigate = useNavigate();

  // State danh mục và danh sách hiện có (để check trùng tên nếu cần)
  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    manufacturer: '',
    productionDate: '',
    importDate: '',
    category: '',
  });

  // State thông báo lỗi validation chi tiết
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, listRes] = await Promise.all([
          api.get(CONFIG.API.ENDPOINT_CATEGORY).catch(() => []),
          api.get(CONFIG.API.ENDPOINT_MAIN).catch(() => []),
        ]);

        const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
        setCategories(catList);
        if (catList.length > 0) {
          const firstCat = catList[0]?.categoryName || catList[0]?.name || catList[0]?.id || '';
          setFormData((prev) => ({ ...prev, category: prev.category || firstCat }));
        }

        const itemList = Array.isArray(listRes) ? listRes : listRes?.data || [];
        setExistingItems(itemList);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu ban đầu:', err.message);
      }
    };

    fetchInitData();
  }, []);

  // Kiểm tra định dạng ngày dd/MM/yyyy
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // 1. Tên thực thể: Bắt buộc, độ dài tối đa, kiểm tra trùng lặp
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} is mandatory and cannot be empty.`;
    } else if (trimmedName.length > CONFIG.VALIDATION.NAME_MAX_LENGTH) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} must not exceed ${CONFIG.VALIDATION.NAME_MAX_LENGTH} characters.`;
    } else if (CONFIG.VALIDATION.NAME_NO_DUPLICATE) {
      const isDuplicate = existingItems.some((item) => {
        const existingName = (item[CONFIG.FIELDS.NAME] || item.name || '').trim();
        return existingName.toLowerCase() === trimmedName.toLowerCase();
      });
      if (isDuplicate) {
        newErrors.name = `${CONFIG.LABELS.COL_NAME} already exists. Duplicate name is not allowed.`;
      }
    }

    // 2. Đơn giá: Bắt buộc, số trong khoảng cho phép
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
      } else if (priceStr.length > CONFIG.VALIDATION.PRICE_MAX_LENGTH) {
        newErrors.price = `Price length cannot exceed ${CONFIG.VALIDATION.PRICE_MAX_LENGTH} digits.`;
      }
    }

    // 3. Nhà sản xuất / tác giả: Bắt buộc, độ dài tối đa
    const trimmedManufacturer = formData.manufacturer.trim();
    if (!trimmedManufacturer) {
      newErrors.manufacturer = `${CONFIG.LABELS.COL_MANUFACTURER} is mandatory.`;
    } else if (trimmedManufacturer.length > CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH) {
      newErrors.manufacturer = `${CONFIG.LABELS.COL_MANUFACTURER} must not exceed ${CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH} characters.`;
    }

    // 4. Ngày sản xuất / ngày 1: Bắt buộc, định dạng dd/MM/yyyy
    const prodDateStr = formData.productionDate.trim();
    if (!prodDateStr) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} is mandatory.`;
    } else if (prodDateStr.length !== 10 || !isValidDateFormat(prodDateStr)) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} must follow format dd/MM/yyyy (e.g. 20/01/2025).`;
    }

    // 5. Ngày nhập / ngày 2: Không bắt buộc, nếu nhập phải đúng format
    const importDateStr = formData.importDate.trim();
    if (importDateStr) {
      if (importDateStr.length !== 10 || !isValidDateFormat(importDateStr)) {
        newErrors.importDate = `${CONFIG.LABELS.COL_IMPORT_DATE} must follow format dd/MM/yyyy (e.g. 25/01/2025).`;
      }
    }

    // 6. Danh mục: Bắt buộc
    if (!formData.category) {
      newErrors.category = `${CONFIG.LABELS.COL_CATEGORY} is mandatory. Please select one.`;
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

  // Submit tạo mới
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
        [CONFIG.FIELDS.NAME]: formData.name.trim(),
        [CONFIG.FIELDS.PRICE]: Number(formData.price),
        [CONFIG.FIELDS.MANUFACTURER]: formData.manufacturer.trim(),
        [CONFIG.FIELDS.PROD_DATE]: formData.productionDate.trim(),
        [CONFIG.FIELDS.IMPORT_DATE]: formData.importDate.trim() || null,
        [CONFIG.FIELDS.CATEGORY]: formData.category,
      };

      await api.post(CONFIG.API.ENDPOINT_MAIN, payload);

      // Lưu flash message vào sessionStorage để hiển thị khi chuyển về danh sách
      sessionStorage.setItem('flashMessage', CONFIG.MESSAGES.CREATE_SUCCESS);
      navigate('/');
    } catch (err) {
      setAlertError(`Failed to create record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* HEADER: Logo + Date: dd/MM/yyyy */}
      <Header />

      {/* TIÊU ĐỀ TRANG THÊM MỚI */}
      <h4 className="fw-bold mb-3">{CONFIG.LABELS.PAGE_ADD_TITLE}</h4>

      {alertError && (
        <Alert variant="danger" dismissible onClose={() => setAlertError('')}>
          {alertError}
        </Alert>
      )}

      <Card className="border border-secondary p-4 bg-white shadow-sm">
        <Form onSubmit={handleSubmit} noValidate>
          {/* 1. TÊN THỰC THỂ */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABELS.COL_NAME}: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter ${CONFIG.LABELS.COL_NAME.toLowerCase()}`}
                value={formData.name}
                maxLength={CONFIG.VALIDATION.NAME_MAX_LENGTH}
                isInvalid={!!errors.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* 2. ĐƠN GIÁ */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABELS.COL_PRICE}: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                type="number"
                placeholder="e.g. 500"
                value={formData.price}
                isInvalid={!!errors.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
              <Form.Text className="text-muted small">
                &gt; {CONFIG.VALIDATION.PRICE_MIN} and &lt; {CONFIG.VALIDATION.PRICE_MAX}
              </Form.Text>
            </Col>
          </Form.Group>

          {/* 3. NHÀ SẢN XUẤT / TÁC GIẢ */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABELS.COL_MANUFACTURER}: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter ${CONFIG.LABELS.COL_MANUFACTURER.toLowerCase()}`}
                value={formData.manufacturer}
                maxLength={CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH}
                isInvalid={!!errors.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.manufacturer}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* 4 & 5. NGÀY 1 & NGÀY 2 */}
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

          {/* 6. CATEGORY */}
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

          {/* NÚT THAO TÁC: [ Save ] [ Back ] */}
          <Row>
            <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
              <Button
                type="submit"
                variant="outline-primary"
                className="px-4"
                style={{ minWidth: '100px' }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : CONFIG.LABELS.BTN_SAVE}
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
      </Card>
    </Container>
  );
}

