import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH THÊM MỚI (ADD PAGE)
 * ------------------------------------------------------------------------------------
 * Tự động thích ứng với bất kỳ đối tượng nào (Shoes, Employee, Book, Room...)
 * ====================================================================================
 */
export default function AddPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);

  // State Form nhập liệu
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    extra: '',
    date1: '',
    date2: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Nạp danh mục & danh sách hiện có (để check trùng tên nếu có)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, listRes] = await Promise.all([
          api.get(CONFIG.API_CATEGORY).catch(() => []),
          api.get(CONFIG.API_MAIN).catch(() => []),
        ]);

        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || catRes?.data || []);
        setCategories(catList);
        if (catList.length > 0) {
          const firstCatVal =
            catList[0]?.departmentId ||
            catList[0]?.categoryId ||
            catList[0]?.categoryName ||
            catList[0]?.id ||
            '';
          setFormData((prev) => ({ ...prev, category: prev.category || firstCatVal }));
        }

        const itemList = Array.isArray(listRes) ? listRes : (listRes?.content || listRes?.data || []);
        setExistingItems(itemList);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu ban đầu:', err.message);
      }
    };

    fetchInitData();
  }, []);

  // Helper kiểm tra định dạng ngày dd/MM/yyyy
  const isValidDateFormat = (dateStr) => {
    if (!dateStr) return false;
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

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

  // Helper chuyển đổi dd/MM/yyyy -> yyyy-MM-dd cho Spring Boot
  const convertDateToBackend = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // 1. Tên
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = `${CONFIG.ENTITY_NAME} Name is mandatory.`;
    } else {
      // Check trùng tên
      const isDuplicate = existingItems.some((item) => {
        const existingName = (
          item[CONFIG.FIELD_NAME] ||
          item.name ||
          item.fullName ||
          item.shoesName ||
          ''
        ).trim();
        return existingName.toLowerCase() === trimmedName.toLowerCase();
      });
      if (isDuplicate) {
        newErrors.name = `${CONFIG.ENTITY_NAME} Name already exists. Duplicate is not allowed.`;
      }
    }

    // 2. Giá tiền / Lương
    const priceStr = String(formData.price).trim();
    if (!priceStr) {
      newErrors.price = `${CONFIG.LABEL_PRICE || 'Price'} is mandatory.`;
    } else {
      const numPrice = Number(priceStr);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = `${CONFIG.LABEL_PRICE || 'Price'} must be greater than 0.`;
      }
    }

    // 3. Thuộc tính phụ (Manufacturer / Position...)
    if (!formData.extra.trim()) {
      newErrors.extra = `${CONFIG.LABEL_EXTRA || 'Field'} is mandatory.`;
    }

    // 4. Ngày 1 (Bắt buộc, format dd/MM/yyyy)
    const d1Str = formData.date1.trim();
    if (!d1Str) {
      newErrors.date1 = `${CONFIG.LABEL_DATE1 || 'Date'} is mandatory.`;
    } else if (d1Str.length !== 10 || !isValidDateFormat(d1Str)) {
      newErrors.date1 = `Must follow format dd/MM/yyyy (e.g. 20/01/2025).`;
    }

    // 5. Ngày 2 (Nếu nhập phải đúng format dd/MM/yyyy)
    const d2Str = formData.date2.trim();
    if (d2Str && (d2Str.length !== 10 || !isValidDateFormat(d2Str))) {
      newErrors.date2 = `Must follow format dd/MM/yyyy (e.g. 25/01/2025).`;
    }

    // 6. Danh mục
    if (!formData.category) {
      newErrors.category = `Category is mandatory. Please select one.`;
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
      // Đóng gói payload tương thích cả 2 dạng: ID hoặc chuỗi Tên
      const isNumCategory = !isNaN(Number(formData.category));
      const payload = {
        [CONFIG.FIELD_NAME]: formData.name.trim(),
        [CONFIG.FIELD_PRICE]: Number(formData.price),
        [CONFIG.FIELD_EXTRA]: formData.extra.trim(),
        [CONFIG.FIELD_DATE1]: convertDateToBackend(formData.date1),
        [CONFIG.FIELD_DATE2]: convertDateToBackend(formData.date2),
      };

      // Tự động gán cả khóa ID lẫn Object danh mục
      if (isNumCategory) {
        payload[CONFIG.PARAM_SEARCH_CAT || 'categoryId'] = Number(formData.category);
        payload.categoryId = Number(formData.category);
        payload.departmentId = Number(formData.category);
      } else {
        payload[CONFIG.FIELD_CATEGORY] = formData.category;
      }

      await api.post(CONFIG.API_MAIN, payload);

      sessionStorage.setItem('flashMessage', `Created new ${CONFIG.ENTITY_NAME.toLowerCase()} successfully`);
      navigate('/');
    } catch (err) {
      setAlertError(`Failed to create record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Tiêu đề màn hình */}
      <h4 className="fw-bold mb-3">Add New {CONFIG.ENTITY_NAME}</h4>

      {alertError && (
        <Alert variant="danger" dismissible onClose={() => setAlertError('')}>
          {alertError}
        </Alert>
      )}

      <Card className="border border-secondary p-4 bg-white shadow-sm">
        <Form onSubmit={handleSubmit} noValidate>
          {/* Ô 1: TÊN ĐỐI TƯỢNG */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.ENTITY_NAME} name: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter name`}
                value={formData.name}
                isInvalid={!!errors.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* Ô 2: GIÁ TIỀN / LƯƠNG */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABEL_PRICE || 'Price'}: <span className="text-danger">*</span>
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
            </Col>
          </Form.Group>

          {/* Ô 3: THUỘC TÍNH PHỤ (Manufacturer / Position / Author...) */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABEL_EXTRA || 'Manufacturer'}: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter ${CONFIG.LABEL_EXTRA || 'details'}`}
                value={formData.extra}
                isInvalid={!!errors.extra}
                onChange={(e) => handleChange('extra', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.extra}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* Ô 4 & 5: NGÀY 1 & NGÀY 2 */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.LABEL_DATE1 || 'Date'}: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={3}>
              <Form.Control
                type="text"
                placeholder="dd/MM/yyyy"
                value={formData.date1}
                maxLength={10}
                isInvalid={!!errors.date1}
                onChange={(e) => handleChange('date1', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.date1}</Form.Control.Feedback>
            </Col>

            <Form.Label column sm={2} className="text-sm-end fw-medium">
              {CONFIG.LABEL_DATE2 || 'Date 2'}:
            </Form.Label>
            <Col sm={3}>
              <Form.Control
                type="text"
                placeholder="dd/MM/yyyy"
                value={formData.date2}
                maxLength={10}
                isInvalid={!!errors.date2}
                onChange={(e) => handleChange('date2', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.date2}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* Ô 6: DANH MỤC */}
          <Form.Group as={Row} className="mb-4">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Category: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={5}>
              <Form.Select
                value={formData.category}
                isInvalid={!!errors.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => {
                  const catVal =
                    c.departmentId ||
                    c.categoryId ||
                    c.categoryName ||
                    c.departmentName ||
                    c.id ||
                    c.name ||
                    c;
                  const catLabel =
                    c.departmentName ||
                    c.categoryName ||
                    c.name ||
                    c.title ||
                    c;
                  return (
                    <option key={catVal} value={catVal}>
                      {catLabel}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* CẶP NÚT: [ SAVE ] [ BACK ] */}
          <Row>
            <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
              <Button
                type="submit"
                variant="outline-primary"
                className="px-4"
                style={{ minWidth: '100px' }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                className="px-4"
                style={{ minWidth: '100px' }}
                onClick={() => navigate('/')}
              >
                Back
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
}
