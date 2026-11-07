import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * GENERIC DETAIL PAGE
 * Màn hình xem chi tiết thực thể (View Details)
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`${CONFIG.API.ENDPOINT_MAIN}/${id}`);
        setItem(data);
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

  const name = item?.[CONFIG.FIELDS.NAME] || '—';
  const manufacturer = item?.[CONFIG.FIELDS.MANUFACTURER] || '—';
  const category =
    typeof item?.[CONFIG.FIELDS.CATEGORY] === 'object'
      ? item?.[CONFIG.FIELDS.CATEGORY]?.name || item?.[CONFIG.FIELDS.CATEGORY]?.categoryName
      : item?.[CONFIG.FIELDS.CATEGORY] || '—';
  const price = item?.[CONFIG.FIELDS.PRICE];
  const prodDate = item?.[CONFIG.FIELDS.PROD_DATE] || '—';
  const importDate = item?.[CONFIG.FIELDS.IMPORT_DATE] || '—';

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* HEADER: Logo + Date: dd/MM/yyyy */}
      <Header />

      {/* KHUNG HIỂN THỊ VIEW DETAILS */}
      <Card className="border border-dark shadow-sm">
        <Card.Header className="bg-white border-0 pt-3 ps-4">
          <h5 className="fw-bold text-uppercase">{CONFIG.LABELS.PAGE_DETAIL_TITLE}</h5>
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
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_NAME}:
                </Col>
                <Col xs={7} className="fw-bold text-dark">
                  {name}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_MANUFACTURER}:
                </Col>
                <Col xs={7} className="text-dark">
                  {manufacturer}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Type / {CONFIG.LABELS.COL_CATEGORY}:
                </Col>
                <Col xs={7} className="text-dark">
                  {category}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_PRICE}:
                </Col>
                <Col xs={7} className="text-dark fw-bold">
                  {price !== undefined ? Number(price).toLocaleString() : '—'}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_PROD_DATE}:
                </Col>
                <Col xs={7} className="text-dark">
                  {prodDate}
                </Col>
              </Row>

              <Row className="mb-4">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_IMPORT_DATE}:
                </Col>
                <Col xs={7} className="text-dark">
                  {importDate}
                </Col>
              </Row>

              {/* NÚT QUAY LAI (BACK) */}
              <div className="text-center mt-4">
                <Button
                  variant="outline-primary"
                  className="px-4"
                  style={{ minWidth: '120px' }}
                  onClick={() => navigate('/')}
                >
                  {CONFIG.LABELS.BTN_BACK_VN}
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

