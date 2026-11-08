import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import { V } from '../utils/validator';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH THÊM MỚI TỰ ĐỘNG THEO FIELD_1, FIELD_2, FIELD_3...
 * ====================================================================================
 */
export default function AddPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);

  // Tạo danh sách các trường linh hoạt được cấu hình
  const dynamicFields = [
    CONFIG.FIELD_1 && { key: CONFIG.FIELD_1, label: CONFIG.LABEL_1 },
    CONFIG.FIELD_2 && { key: CONFIG.FIELD_2, label: CONFIG.LABEL_2 },
    CONFIG.FIELD_3 && { key: CONFIG.FIELD_3, label: CONFIG.LABEL_3 },
    CONFIG.FIELD_4 && { key: CONFIG.FIELD_4, label: CONFIG.LABEL_4 },
    CONFIG.FIELD_5 && { key: CONFIG.FIELD_5, label: CONFIG.LABEL_5 },
  ].filter(Boolean);

  // State Form động
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

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

  // Helper convert dd/MM/yyyy -> yyyy-MM-dd
  const convertDateToBackend = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  const isDateField = (key) => /date|dob/i.test(key);
  const isNumberField = (key) => /price|salary|cost|quantity|capacity/i.test(key);

  // ----------------------------------------------------------------------------------
  // 🛡️ HÀM VALIDATE DỮ LIỆU SIÊU TỐC DÙNG BỘ QUY TẮC V
  // 👉 Muốn thêm luật cho trường nào, chỉ cần ghép bằng dấu ||:
  //    VD: newErrors.email = V.required(val, 'Email') || V.email(val);
  // ----------------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};

    // 1. Tên: Bắt buộc + Cấm trùng lặp (No duplicate)
    newErrors.name =
      V.required(formData.name, `${CONFIG.ENTITY_NAME} Name`) ||
      V.noDuplicate(formData.name, existingItems, CONFIG.FIELD_NAME, CONFIG.ENTITY_NAME);

    // 2. Danh mục: Bắt buộc
    newErrors.category = V.required(formData.category, 'Category');

    // 3. Tự động áp dụng luật cho các trường FIELD_1, 2, 3...
    dynamicFields.forEach((f) => {
      const val = formData[f.key];
      if (isDateField(f.key)) {
        // Nếu là ngày chính (FIELD_3): Bắt buộc + Đúng format ngày
        newErrors[f.key] =
          (f.key === CONFIG.FIELD_3 ? V.required(val, f.label) : null) ||
          V.date(val, f.label);
      } else if (isNumberField(f.key)) {
        // Bắt buộc + Số dương > 0
        newErrors[f.key] = V.required(val, f.label) || V.positive(val, f.label);
      } else {
        // Text thường: Bắt buộc
        newErrors[f.key] = V.required(val, f.label);
      }
    });

    // 💡 NẾU ĐỀ THI CÓ THÊM TRƯỜNG TÙY BIẾN, BẠN CHỈ CẦN THÊM ĐÚNG 1 DÒNG DƯỚI ĐÂY:
    // newErrors.email = V.required(formData.email, 'Email') || V.email(formData.email);
    // newErrors.phone = V.required(formData.phone, 'Phone') || V.phone(formData.phone);

    // Dọn dẹp các trường hợp lệ (null/undefined)
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
      const isNumCategory = !isNaN(Number(formData.category));
      const payload = {
        [CONFIG.FIELD_NAME]: (formData.name || '').trim(),
      };

      dynamicFields.forEach((f) => {
        const val = formData[f.key];
        if (isDateField(f.key)) {
          payload[f.key] = convertDateToBackend(val);
        } else if (isNumberField(f.key)) {
          payload[f.key] = Number(val);
        } else {
          payload[f.key] = (val || '').trim();
        }
      });

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
      <Header />
      <h4 className="fw-bold mb-3">Add New {CONFIG.ENTITY_NAME}</h4>

      {alertError && (
        <Alert variant="danger" dismissible onClose={() => setAlertError('')}>
          {alertError}
        </Alert>
      )}

      <Card className="border border-secondary p-4 bg-white shadow-sm">
        <Form onSubmit={handleSubmit} noValidate>
          {/* Ô TÊN */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.ENTITY_NAME} Name: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter name`}
                value={formData.name || ''}
                isInvalid={!!errors.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* CÁC TRƯỜNG LINH HOẠT FIELD_1, 2, 3, 4, 5 TỰ ĐỘNG RENDER */}
          {dynamicFields.map((f) => {
            const isDate = isDateField(f.key);
            const isNum = isNumberField(f.key);

            return (
              <Form.Group as={Row} className="mb-3" key={f.key}>
                <Form.Label column sm={3} className="text-sm-end fw-medium">
                  {f.label}: <span className="text-danger">*</span>
                </Form.Label>
                <Col sm={isDate || isNum ? 4 : 8}>
                  <Form.Control
                    type={isNum ? 'number' : 'text'}
                    placeholder={isDate ? 'dd/MM/yyyy' : `Enter ${f.label.toLowerCase()}`}
                    maxLength={isDate ? 10 : undefined}
                    value={formData[f.key] || ''}
                    isInvalid={!!errors[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">{errors[f.key]}</Form.Control.Feedback>
                </Col>
              </Form.Group>
            );
          })}

          {/* DROPDOWN CATEGORY */}
          <Form.Group as={Row} className="mb-4">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Category: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={5}>
              <Form.Select
                value={formData.category || ''}
                isInvalid={!!errors.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">-- Select Category --</option>
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
              <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* BUTTONS */}
          <Row>
            <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
              <Button type="submit" variant="outline-primary" className="px-4" style={{ minWidth: '100px' }} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline-secondary" className="px-4" style={{ minWidth: '100px' }} onClick={() => navigate('/')}>
                Back
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
}
