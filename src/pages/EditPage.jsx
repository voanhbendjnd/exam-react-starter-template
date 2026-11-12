import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import { V } from '../utils/validator';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH CHỈNH SỬA (EDIT PAGE)
 * ------------------------------------------------------------------------------------
 * 💡 CÁC Ô NHẬP LIỆU ĐƯỢC VIẾT TƯỜNG MINH TRỰC TIẾP (KHÔNG DÙNG MAP/LOOP ĐỘNG):
 * - Dễ dàng xem, thêm/bớt ô nhập liệu hoặc sửa trường dữ liệu
 * - Hỗ trợ check trùng lặp loại trừ ID hiện tại (V.noDuplicate(..., id))
 * ====================================================================================
 */
export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [existingItems, setExistingItems] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    price: '',
    priceFrom: '',
    priceTo: '',
    productionDate: '',
    importDate: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Chuyển Date từ backend (ISO hoặc yyyy-MM-dd) sang format input dd/MM/yyyy
  const formatDateToInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && (val.includes('T') || (val.includes('-') && val.length === 10))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    return String(val);
  };

  // Chuyển dd/MM/yyyy về yyyy-MM-dd để gửi cho Spring Boot
  const convertDateToBackend = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  useEffect(() => {
    const fetchEditData = async () => {
      setLoadingInit(true);
      try {
        const [catRes, itemRes, listRes] = await Promise.all([
          api.get(CONFIG.API_CATEGORY).catch(() => []),
          api.get(`${CONFIG.API_MAIN}/${id}`),
          api.get(CONFIG.API_MAIN, { params: { size: 1000 } }).catch(() => []),
        ]);

        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || catRes?.data || []);
        setCategories(catList);

        const allItems = Array.isArray(listRes) ? listRes : (listRes?.content || listRes?.data || []);
        setExistingItems(allItems);

        const currentItem = itemRes?.data || itemRes;
        if (currentItem) {
          const catVal =
            (typeof currentItem[CONFIG.FIELD_CATEGORY] === 'object'
              ? currentItem[CONFIG.FIELD_CATEGORY]?.id || currentItem[CONFIG.FIELD_CATEGORY]?.categoryId
              : currentItem[CONFIG.FIELD_CATEGORY]) ||
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
            category: catVal,
            manufacturer: currentItem.manufacturer || currentItem.position || currentItem.author || '',
            price: currentItem.price ?? currentItem.salary ?? '',
            priceFrom: currentItem.priceFrom ?? '',
            priceTo: currentItem.priceTo ?? '',
            productionDate: formatDateToInput(currentItem.productionDate || currentItem.dob || currentItem.startDate),
            importDate: formatDateToInput(currentItem.importDate || currentItem.endDate),
            description: currentItem.description || '',
          });
        }
      } catch (err) {
        setAlertError(`Lỗi tải dữ liệu: ${err.message}`);
      } finally {
        setLoadingInit(false);
      }
    };

    if (id) {
      fetchEditData();
    }
  }, [id]);

  // ----------------------------------------------------------------------------------
  // 🛡️ HÀM VALIDATE FORM KHI CHỈNH SỬA
  // ----------------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};

    // 1. Name: Bắt buộc + Cấm trùng (loại trừ chính ID đang sửa!)
    newErrors.name =
      V.required(formData.name, `${CONFIG.ENTITY_NAME} Name`) ||
      V.noDuplicate(formData.name, existingItems, CONFIG.FIELD_NAME, CONFIG.ENTITY_NAME, id);

    // 2. Category: Bắt buộc
    newErrors.category = V.required(formData.category, 'Category');

    // 3. Manufacturer: Bắt buộc
    if (formData.manufacturer !== undefined) {
      newErrors.manufacturer = V.required(formData.manufacturer, 'Manufacturer');
    }

    // 4. Price: Bắt buộc + Số dương > 0
    if (formData.price !== undefined && formData.price !== '') {
      newErrors.price = V.positive(formData.price, 'Price');
    }

    // 💡 Ví dụ nếu kiểm tra priceTo > priceFrom:
    if (formData.priceFrom && formData.priceTo) {
      newErrors.priceTo = V.compare(
        formData.priceTo,
        formData.priceFrom,
        '>',
        'Price To must be greater than Price From.'
      );
    }

    // 5. Production Date: Bắt buộc + Định dạng dd/MM/yyyy
    newErrors.productionDate =
      V.required(formData.productionDate, 'Production Date') ||
      V.date(formData.productionDate, 'Production Date');

    // 6. Import Date: Định dạng dd/MM/yyyy (nếu nhập)
    if (formData.importDate) {
      newErrors.importDate = V.date(formData.importDate, 'Import Date');
    }

    // Dọn các lỗi null/undefined
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
        [CONFIG.FIELD_ID || 'id']: isNaN(Number(id)) ? id : Number(id),
        [CONFIG.FIELD_NAME]: (formData.name || '').trim(),
        manufacturer: (formData.manufacturer || '').trim(),
        price: formData.price !== '' ? Number(formData.price) : undefined,
        productionDate: convertDateToBackend(formData.productionDate),
        importDate: convertDateToBackend(formData.importDate),
        description: (formData.description || '').trim(),
      };

      if (formData.priceFrom) payload.priceFrom = Number(formData.priceFrom);
      if (formData.priceTo) payload.priceTo = Number(formData.priceTo);

      if (isNumCategory) {
        payload.category = { categoryId: Number(formData.category) };
        payload.department = { departmentId: Number(formData.category) };
        payload[CONFIG.FIELD_CATEGORY] = Number(formData.category);
      } else {
        payload[CONFIG.FIELD_CATEGORY] = formData.category;
      }

      await api.put(`${CONFIG.API_MAIN}/${id}`, payload);

      sessionStorage.setItem('flashMessage', 'Updated successfully!');
      navigate('/');
    } catch (err) {
      setAlertError(`Failed to update: ${err.message || 'Server error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '850px' }}>
        <Header />
        <Spinner animation="border" variant="primary" className="my-5" />
        <div className="text-muted">Loading details for editing...</div>
      </Container>
    );
  }

  return (
    <Container className="py-3" style={{ maxWidth: '850px' }}>
      <Header />

      <Card className="p-4 border border-dark shadow-sm">
        <h5 className="fw-bold mb-4 text-uppercase">UPDATE {CONFIG.ENTITY_NAME}</h5>

        {alertError && <Alert variant="danger">{alertError}</Alert>}

        <Form onSubmit={handleSubmit} noValidate>
          {/* ================================================================= */}
          {/* 1. NAME FIELD                                                     */}
          {/* ================================================================= */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              {CONFIG.ENTITY_NAME} Name: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder={`Enter ${CONFIG.ENTITY_NAME.toLowerCase()} name`}
                value={formData.name || ''}
                isInvalid={!!errors.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* 2. MANUFACTURER FIELD                                             */}
          {/* ================================================================= */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Manufacturer: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                placeholder="Enter manufacturer"
                value={formData.manufacturer || ''}
                isInvalid={!!errors.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.manufacturer}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* 3. PRICE FIELD                                                    */}
          {/* ================================================================= */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Price (đ): <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={5}>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={formData.price || ''}
                isInvalid={!!errors.price}
                onChange={(e) => handleChange('price', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* 💡 4. VÍ DỤ NẾU ĐỀ CÓ PRICE RANGE (Price From - Price To)         */}
          {/* ================================================================= */}
          {/*
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Price Range:
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                type="number"
                placeholder="Price From"
                value={formData.priceFrom || ''}
                onChange={(e) => handleChange('priceFrom', e.target.value)}
              />
            </Col>
            <Col sm={4}>
              <Form.Control
                type="number"
                placeholder="Price To"
                value={formData.priceTo || ''}
                isInvalid={!!errors.priceTo}
                onChange={(e) => handleChange('priceTo', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.priceTo}</Form.Control.Feedback>
            </Col>
          </Form.Group>
          */}

          {/* ================================================================= */}
          {/* 5. PRODUCTION DATE (dd/MM/yyyy)                                   */}
          {/* ================================================================= */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Production Date: <span className="text-danger">*</span>
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                type="text"
                placeholder="dd/MM/yyyy"
                maxLength={10}
                value={formData.productionDate || ''}
                isInvalid={!!errors.productionDate}
                onChange={(e) => handleChange('productionDate', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.productionDate}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* 6. IMPORT DATE (dd/MM/yyyy)                                       */}
          {/* ================================================================= */}
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3} className="text-sm-end fw-medium">
              Import Date:
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                type="text"
                placeholder="dd/MM/yyyy"
                maxLength={10}
                value={formData.importDate || ''}
                isInvalid={!!errors.importDate}
                onChange={(e) => handleChange('importDate', e.target.value)}
              />
              <Form.Control.Feedback type="invalid">{errors.importDate}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* 7. DROPDOWN CATEGORY                                              */}
          {/* ================================================================= */}
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
                  const catVal =
                    c.departmentId ||
                    c.categoryId ||
                    c.categoryName ||
                    c.departmentName ||
                    c.id ||
                    c.name ||
                    c;
                  const catText =
                    c.departmentName || c.categoryName || c.name || c.title || c;
                  return (
                    <option key={catVal} value={catVal}>
                      {catText}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
            </Col>
          </Form.Group>

          {/* ================================================================= */}
          {/* NÚT UPDATE & BACK                                                 */}
          {/* ================================================================= */}
          <Row>
            <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
              <Button
                type="submit"
                variant="outline-primary"
                className="px-4"
                style={{ minWidth: '100px' }}
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update'}
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
