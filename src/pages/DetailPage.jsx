import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH XEM CHI TIẾT TỰ ĐỘNG THEO FIELD_1, FIELD_2, FIELD_3...
 * ====================================================================================
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatValue = (val) => {
    if (val === undefined || val === null || val === '') return '—';
    if (typeof val === 'string' && (val.includes('T') || (val.includes('-') && val.length === 10))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return String(val);
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

  const name =
    item?.[CONFIG.FIELD_NAME] ||
    item?.name ||
    item?.fullName ||
    item?.shoesName ||
    item?.title ||
    '—';

  const category =
    typeof item?.[CONFIG.FIELD_CATEGORY] === 'object'
      ? item?.[CONFIG.FIELD_CATEGORY]?.name || item?.[CONFIG.FIELD_CATEGORY]?.categoryName
      : item?.[CONFIG.FIELD_CATEGORY] ||
        item?.departmentName ||
        item?.categoryName ||
        '—';

  // Danh sách các trường linh hoạt được khai báo trong config
  const fieldsToShow = [
    { key: CONFIG.FIELD_1, label: CONFIG.LABEL_1 },
    { key: CONFIG.FIELD_2, label: CONFIG.LABEL_2 },
    { key: CONFIG.FIELD_3, label: CONFIG.LABEL_3 },
    { key: CONFIG.FIELD_4, label: CONFIG.LABEL_4 },
    { key: CONFIG.FIELD_5, label: CONFIG.LABEL_5 },
  ].filter((f) => Boolean(f.key && f.label));

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      <Header />

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
              {/* TÊN */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.ENTITY_NAME} Name:
                </Col>
                <Col xs={7} className="fw-bold text-dark">
                  {name}
                </Col>
              </Row>

              {/* DANH MỤC */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Category:
                </Col>
                <Col xs={7} className="text-dark">
                  {category}
                </Col>
              </Row>

              {/* CÁC TRƯỜNG LINH HOẠT FIELD_1, 2, 3, 4, 5 TỰ ĐỘNG HIỂN THỊ */}
              {fieldsToShow.map((f) => (
                <Row className="mb-2" key={f.key}>
                  <Col xs={5} className="text-end fw-medium text-secondary">
                    {f.label}:
                  </Col>
                  <Col xs={7} className="text-dark">
                    {formatValue(item?.[f.key])}
                  </Col>
                </Row>
              ))}

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
