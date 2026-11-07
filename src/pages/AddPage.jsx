import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH THÊM MỚI (ADD PAGE)
 * ====================================================================================
 */
export default function AddPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);

  // ----------------------------------------------------------------------------------
  // 🔹 [ĐIỂM DỄ THAY ĐỔI 1]: STATE DỮ LIỆU CỦA FORM (FORM DATA)
  // Nếu đề thi yêu cầu thêm trường mới (VD: quantity, status, desc...), thêm vào đây:
  // ----------------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    manufacturer: '',
    productionDate: '',
    importDate: '',
    category: '',
    // quantity: '', // 💡 Ví dụ thêm số lượng
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Nạp dữ liệu danh mục & danh sách hiện có (để check trùng lặp)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, listRes] = await Promise.all([
          api.get(CONFIG.API.ENDPOINT_CATEGORY).catch(() => []),
          api.get(CONFIG.API.ENDPOINT_MAIN).catch(() => []),
        ]);

        // 🔥 Bóc tách an toàn cho cả dạng Spring Data JPA Page { content: [] }
        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || catRes?.data || []);
        setCategories(catList);
        if (catList.length > 0) {
          const firstCat = catList[0]?.categoryName || catList[0]?.name || catList[0]?.id || '';
          setFormData((prev) => ({ ...prev, category: prev.category || firstCat }));
        }

        const itemList = Array.isArray(listRes) ? listRes : (listRes?.content || listRes?.data || []);
        setExistingItems(itemList);
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu ban đầu:', err.message);
      }
    };

    fetchInitData();
  }, []);

  // Helper kiểm tra ngày đúng định dạng dd/MM/yyyy
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

  // ----------------------------------------------------------------------------------
  // 🔹 [ĐIỂM DỄ THAY ĐỔI 2]: HÀM VALIDATE DỮ LIỆU THEO BẢNG SCREEN DEFINITION CỦA ĐỀ
  // ----------------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};

    // 1. Tên: Bắt buộc, độ dài, cấm trùng lặp (No duplicate)
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} is mandatory and cannot be empty.`;
    } else if (trimmedName.length > CONFIG.VALIDATION.NAME_MAX_LENGTH) {
      newErrors.name = `${CONFIG.LABELS.COL_NAME} must not exceed ${CONFIG.VALIDATION.NAME_MAX_LENGTH} characters.`;
    } else if (CONFIG.VALIDATION.NAME_NO_DUPLICATE) {
      const isDuplicate = existingItems.some((item) => {
        const existingName = (item[CONFIG.FIELDS.NAME] || item.name || item.shoesName || '').trim();
        return existingName.toLowerCase() === trimmedName.toLowerCase();
      });
      if (isDuplicate) {
        newErrors.name = `${CONFIG.LABELS.COL_NAME} already exists. Duplicate name is not allowed.`;
      }
    }

    // 2. Giá: Bắt buộc, số dương, khoảng giá
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

    // 3. Nhà sản xuất / tác giả
    const trimmedManufacturer = formData.manufacturer.trim();
    if (!trimmedManufacturer) {
      newErrors.manufacturer = `${CONFIG.LABELS.COL_MANUFACTURER} is mandatory.`;
    } else if (trimmedManufacturer.length > CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH) {
      newErrors.manufacturer = `${CONFIG.LABELS.COL_MANUFACTURER} must not exceed ${CONFIG.VALIDATION.MANUFACTURER_MAX_LENGTH} characters.`;
    }

    // 4. Ngày sản xuất: Bắt buộc, format dd/MM/yyyy
    const prodDateStr = formData.productionDate.trim();
    if (!prodDateStr) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} is mandatory.`;
    } else if (prodDateStr.length !== 10 || !isValidDateFormat(prodDateStr)) {
      newErrors.productionDate = `${CONFIG.LABELS.COL_PROD_DATE} must follow format dd/MM/yyyy (e.g. 20/01/2025).`;
    }

    // 5. Ngày nhập: Không bắt buộc (Optional), nếu nhập phải đúng format dd/MM/yyyy
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

    // 💡 VÍ DỤ NẾU ĐỀ BẮT BUỘC NHẬP QUANTITY > 0:
    // if (!formData.quantity || Number(formData.quantity) <= 0) {
    //   newErrors.quantity = 'Quantity must be greater than 0.';
    // }

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

  // ----------------------------------------------------------------------------------
  // 🔹 [ĐIỂM DỄ THAY ĐỔI 3]: ĐÓNG GÓI PAYLOAD GỬI LÊN BACKEND KHI BẤM NÚT SAVE
  // ----------------------------------------------------------------------------------
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
      // ⚠️ Tự động convert ngày dd/MM/yyyy sang yyyy-MM-dd để Spring Boot nhận được
      const payload = {
        [CONFIG.FIELDS.NAME]: formData.name.trim(),
        [CONFIG.FIELDS.PRICE]: Number(formData.price),
        [CONFIG.FIELDS.MANUFACTURER]: formData.manufacturer.trim(),
        [CONFIG.FIELDS.PROD_DATE]: convertDateToBackend(formData.productionDate),
        [CONFIG.FIELDS.IMPORT_DATE]: convertDateToBackend(formData.importDate),
        [CONFIG.FIELDS.CATEGORY]: formData.category,
      };

      await api.post(CONFIG.API.ENDPOINT_MAIN, payload);

      // Lưu flash message vào sessionStorage để trang danh sách hiển thị
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
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Tiêu đề màn hình */}
      <h4 className="fw-bold mb-3">{CONFIG.LABELS.PAGE_ADD_TITLE}</h4>

      {alertError && (
        <Alert variant="danger" dismissible onClose={() => setAlertError('')}>
          {alertError}
        </Alert>
      )}

      {/* ---------------------------------------------------------------------------- */}
      {/* 🔹 [ĐIỂM DỄ THAY ĐỔI 4]: FORM CÁC Ô NHẬP LIỆU                                */}
      {/* Muốn thêm ô nhập liệu mới thì chỉ cần copy 1 khối <Form.Group as={Row}> dưới: */}
      {/* ---------------------------------------------------------------------------- */}
      <Card className="border border-secondary p-4 bg-white shadow-sm">
        <Form onSubmit={handleSubmit} noValidate>
          {/* Ô 1: TÊN ĐỐI TƯỢNG */}
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

          {/* Ô 2: GIÁ */}
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

          {/* Ô 3: NHÀ SẢN XUẤT / HÃNG */}
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

          {/* Ô 4 & 5: NGÀY SẢN XUẤT & NGÀY NHẬP */}
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

          {/* Ô 6: DANH MỤC PHỤ */}
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

          {/* 💡 VÍ DỤ NẾU ĐỀ CÓ THÊM Ô "SỐ LƯỢNG (QUANTITY)", COPY ĐOẠN NÀY:
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Quantity: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                type="number"
                placeholder="e.g. 50"
                value={formData.quantity}
                isInvalid={!!errors.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
            </Col>
          </Form.Group>
          */}

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
