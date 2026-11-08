import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';
import { V } from '../utils/validator';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH CHỈNH SỬA TỰ ĐỘNG THEO FIELD_1, FIELD_2, FIELD_3...
 * ====================================================================================
 */
export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const dynamicFields = [
    CONFIG.FIELD_1 && { key: CONFIG.FIELD_1, label: CONFIG.LABEL_1 },
    CONFIG.FIELD_2 && { key: CONFIG.FIELD_2, label: CONFIG.LABEL_2 },
    CONFIG.FIELD_3 && { key: CONFIG.FIELD_3, label: CONFIG.LABEL_3 },
    CONFIG.FIELD_4 && { key: CONFIG.FIELD_4, label: CONFIG.LABEL_4 },
    CONFIG.FIELD_5 && { key: CONFIG.FIELD_5, label: CONFIG.LABEL_5 },
  ].filter(Boolean);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alertError, setAlertError] = useState('');

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
    return val;
  };

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

          const initData = {
            name:
              currentItem[CONFIG.FIELD_NAME] ||
              currentItem.name ||
              currentItem.fullName ||
              currentItem.shoesName ||
              '',
            category: catVal,
          };

          dynamicFields.forEach((f) => {
            const rawVal = currentItem[f.key];
            initData[f.key] = isDateField(f.key) ? formatDateToInput(rawVal) : (rawVal ?? '');
          });

          setFormData(initData);
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

  // ----------------------------------------------------------------------------------
  // 🛡️ VALIDATE DÙNG BỘ QUY TẮC V
  // ----------------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};

    newErrors.name = V.required(formData.name, `${CONFIG.ENTITY_NAME} Name`);
    newErrors.category = V.required(formData.category, 'Category');

    dynamicFields.forEach((f) => {
      const val = formData[f.key];
      if (isDateField(f.key)) {
        newErrors[f.key] =
          (f.key === CONFIG.FIELD_3 ? V.required(val, f.label) : null) ||
          V.date(val, f.label);
      } else if (isNumberField(f.key)) {
        newErrors[f.key] = V.required(val, f.label) || V.positive(val, f.label);
      } else {
        newErrors[f.key] = V.required(val, f.label);
      }
    });

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
        [CONFIG.FIELD_ID]: id,
        id: id,
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
      <Header />
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
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3} className="text-sm-end fw-medium">
                {CONFIG.ENTITY_NAME} Name: <span className="text-danger">*</span>
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={formData.name || ''}
                  isInvalid={!!errors.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Col>
            </Form.Group>

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

            <Row>
              <Col sm={{ span: 8, offset: 3 }} className="d-flex gap-3">
                <Button type="submit" variant="primary" className="px-4" style={{ minWidth: '130px' }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline-secondary" className="px-4" style={{ minWidth: '100px' }} onClick={() => navigate('/')}>
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
