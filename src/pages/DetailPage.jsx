import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH XEM CHI TIẾT (VIEW DETAILS)
 * ------------------------------------------------------------------------------------
 * Tự động thích ứng với bất kỳ đối tượng nào (Shoes, Employee, Book, Room...)
 * ====================================================================================
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper format ngày hiển thị dd/MM/yyyy
  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`${CONFIG.API_MAIN}/${id}`);
        setItem(data?.data || data);
      } catch (err) {
        setError(`Failed to load details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  // Bóc tách thông minh các trường dữ liệu
  const name =
    item?.[CONFIG.FIELD_NAME] ||
    item?.name ||
    item?.fullName ||
    item?.shoesName ||
    item?.title ||
    '—';

  const extra =
    item?.[CONFIG.FIELD_EXTRA] ||
    item?.manufacturer ||
    item?.position ||
    item?.author ||
    item?.brand ||
    '—';

  const category =
    typeof item?.[CONFIG.FIELD_CATEGORY] === 'object'
      ? item?.[CONFIG.FIELD_CATEGORY]?.name || item?.[CONFIG.FIELD_CATEGORY]?.categoryName
      : item?.[CONFIG.FIELD_CATEGORY] ||
        item?.departmentName ||
        item?.categoryName ||
        item?.category ||
        '—';

  const price =
    item?.[CONFIG.FIELD_PRICE] ??
    item?.price ??
    item?.salary ??
    item?.cost;

  const date1 = formatDate(item?.[CONFIG.FIELD_DATE1] || item?.productionDate || item?.startDate);
  const date2 = formatDate(item?.[CONFIG.FIELD_DATE2] || item?.importDate || item?.dateOfBirth);

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Khung View Details */}
      <Card className="border border-dark shadow-sm">
        <Card.Header className="bg-white border-0 pt-3 ps-4">
          <h5 className="fw-bold text-uppercase">VIEW DETAILS</h5>
        </Card.Header>

        <Card.Body className="py-4 px-5">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Loading details...</div>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : !item ? (
            <Alert variant="warning">No details found for this record.</Alert>
          ) : (
            <div className="mx-auto" style={{ maxWidth: '500px' }}>
              {/* DÒNG 1: TÊN ĐỐI TƯỢNG */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.ENTITY_NAME} Name:
                </Col>
                <Col xs={7} className="fw-bold text-dark">
                  {name}
                </Col>
              </Row>

              {/* DÒNG 2: THUỘC TÍNH PHỤ (Manufacturer / Position / Author...) */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABEL_EXTRA || 'Manufacturer'}:
                </Col>
                <Col xs={7} className="text-dark">
                  {extra}
                </Col>
              </Row>

              {/* DÒNG 3: DANH MỤC (Category / Department...) */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Category:
                </Col>
                <Col xs={7} className="text-dark">
                  {category}
                </Col>
              </Row>

              {/* DÒNG 4: GIÁ TIỀN / LƯƠNG */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABEL_PRICE || 'Price(đ)'}:
                </Col>
                <Col xs={7} className="text-dark fw-bold">
                  {price !== undefined ? Number(price).toLocaleString() : '—'}
                </Col>
              </Row>

              {/* DÒNG 5: NGÀY 1 (Production date / Start date) */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABEL_DATE1 || 'Production date'}:
                </Col>
                <Col xs={7} className="text-dark">
                  {date1}
                </Col>
              </Row>

              {/* DÒNG 6: NGÀY 2 (Import Date / Date of birth) */}
              <Row className="mb-4">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABEL_DATE2 || 'Import Date'}:
                </Col>
                <Col xs={7} className="text-dark">
                  {date2}
                </Col>
              </Row>

              {/* NÚT QUAY LẠI TRANG DANH SÁCH */}
              <div className="text-center mt-4">
                <Button
                  variant="outline-primary"
                  className="px-4"
                  style={{ minWidth: '120px' }}
                  onClick={() => navigate('/')}
                >
                  Quay Lai
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
