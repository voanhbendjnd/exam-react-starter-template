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
 * Tự động thích ứng với bất kỳ đối tượng nào (Shoes, Employee, Book, Room...)
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
    extra: '',
    date1: '',
    date2: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Helper format ngày từ Backend (nếu là dạng ISO "2026-11-07T...") sang "dd/MM/yyyy"
  const formatDateToInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && (val.includes('T') || val.includes('-'))) {
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

  // 1. Tải danh mục và dữ liệu cũ của bản ghi cần sửa
  useEffect(() => {
    const fetchEditData = async () => {
      setLoadingInit(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(CONFIG.API_CATEGORY).catch(() => []),
          api.get(`${CONFIG.API_MAIN}/${id}`),
        ]);

        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || catRes?.data || []);
        setCategories(catList);

        const currentItem = itemRes?.data || itemRes;
        if (currentItem) {
          const catVal =
            currentItem[CONFIG.FIELD_CATEGORY] ||
            currentItem.departmentId ||
            currentItem.categoryId ||
            currentItem.departmentName ||
            currentItem.categoryName ||
            '';

          setFormData({
            name:
              currentItem[CONFIG.FIELD_NAME] ||
              currentItem.name ||
              currentItem.fullName ||
              currentItem.shoesName ||
              '',
            price:
              currentItem[CONFIG.FIELD_PRICE] ??
              currentItem.price ??
              currentItem.salary ??
              '',
            extra:
              currentItem[CONFIG.FIELD_EXTRA] ||
              currentItem.manufacturer ||
              currentItem.position ||
              currentItem.author ||
              '',
            date1: formatDateToInput(
              currentItem[CONFIG.FIELD_DATE1] ||
              currentItem.productionDate ||
              currentItem.startDate
            ),
            date2: formatDateToInput(
              currentItem[CONFIG.FIELD_DATE2] ||
              currentItem.importDate ||
              currentItem.dateOfBirth
            ),
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

  // 2. Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = `${CONFIG.ENTITY_NAME} Name is mandatory.`;
    }
    if (!String(formData.price).trim()) {
      newErrors.price = `${CONFIG.LABEL_PRICE || 'Price'} is mandatory.`;
    }
    if (!formData.extra.trim()) {
      newErrors.extra = `${CONFIG.LABEL_EXTRA || 'Field'} is mandatory.`;
    }
    if (!formData.date1.trim()) {
      newErrors.date1 = `${CONFIG.LABEL_DATE1 || 'Date'} is mandatory.`;
    }
    if (!formData.category) {
      newErrors.category = 'Category is mandatory.';
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
      const isNumCategory = !isNaN(Number(formData.category));
      const payload = {
        [CONFIG.FIELD_ID]: id,
        id: id,
        [CONFIG.FIELD_NAME]: formData.name.trim(),
        [CONFIG.FIELD_PRICE]: Number(formData.price),
        [CONFIG.FIELD_EXTRA]: formData.extra.trim(),
        [CONFIG.FIELD_DATE1]: convertDateToBackend(formData.date1),
        [CONFIG.FIELD_DATE2]: convertDateToBackend(formData.date2),
      };

      if (isNumCategory) {
        payload[CONFIG.PARAM_SEARCH_CAT || 'categoryId'] = Number(formData.category);
        payload.categoryId = Number(formData.category);
        payload.departmentId = Number(formData.category);
      } else {
        payload[CONFIG.FIELD_CATEGORY] = formData.category;
      }

      await api.put(`${CONFIG.API_MAIN}/${id}`, payload);

      sessionStorage.setItem('flashMessage', 'Updated successfully');
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
      <h4 className="fw-bold mb-3">Edit {CONFIG.ENTITY_NAME}</h4>

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
                {CONFIG.ENTITY_NAME} Name: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={formData.name}
                  isInvalid={!!errors.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* GIÁ / LƯƠNG */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABEL_PRICE || 'Price'}: <span className="text-danger">*</span>
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

            {/* THUỘC TÍNH PHỤ */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABEL_EXTRA || 'Manufacturer'}: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={formData.extra}
                  isInvalid={!!errors.extra}
                  onChange={(e) => handleChange('extra', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.extra}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* NGÀY 1 & NGÀY 2 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.LABEL_DATE1 || 'Date 1'}: <span className="text-danger">*</span>
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

            {/* DANH MỤC */}
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

            {/* NÚT THAO TÁC */}
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
                  Back
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </Container>
  );
}
