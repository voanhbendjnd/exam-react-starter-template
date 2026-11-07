import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH XEM CHI TIẾT (VIEW DETAILS)
 * ====================================================================================
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val); // Nếu không phải ngày hợp lệ thì giữ nguyên chuỗi cũ

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };
  // Helper chuyển đổi ngày từ Backend ISO Date (2026-11-07T...) sang dd/MM/yyyy
  const formatDisplayDate = (val) => {
    if (!val) return '—';
    if (typeof val === 'string' && val.includes('T')) {
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

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi API GET /api/{entity}/{id}
        const data = await api.get(`${CONFIG.API.ENDPOINT_MAIN}/${id}`);
        // Xử lý dữ liệu an toàn nếu backend bọc trong { data: ... }
        const detailData = data?.data || data;
        setItem(detailData);
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

  // ----------------------------------------------------------------------------------
  // 🔹 [ĐIỂM DỄ THAY ĐỔI 1]: BÓC TÁCH CÁC TRƯỜNG DỮ LIỆU ĐỂ HIỂN THỊ
  // Nếu đề thi yêu cầu thêm trường nào thì bóc tách thêm ở đây:
  // ----------------------------------------------------------------------------------
  const name = item?.[CONFIG.FIELDS.NAME] || item?.name || '—';
  const manufacturer = item?.[CONFIG.FIELDS.MANUFACTURER] || item?.manufacturer || '—';
  const category =
    typeof item?.[CONFIG.FIELDS.CATEGORY] === 'object'
      ? item?.[CONFIG.FIELDS.CATEGORY]?.name || item?.[CONFIG.FIELDS.CATEGORY]?.categoryName
      : item?.[CONFIG.FIELDS.CATEGORY] || item?.categoryName || '—';
  const price = item?.[CONFIG.FIELDS.PRICE] ?? item?.price;
  const prodDate = formatDate(item?.[CONFIG.FIELDS.PROD_DATE]);
  const importDate = formatDate(item?.[CONFIG.FIELDS.IMPORT_DATE]);
  // const prodDate = formatDisplayDate(item?.[CONFIG.FIELDS.PROD_DATE] || item?.productionDate);
  // const importDate = formatDisplayDate(item?.[CONFIG.FIELDS.IMPORT_DATE] || item?.importDate);

  // 💡 VÍ DỤ NẾU ĐỀ CÓ THÊM TRƯỜNG "QUANTITY", "STATUS", "DESCRIPTION":
  // const quantity = item?.[CONFIG.FIELDS.QUANTITY] ?? item?.quantity ?? '—';
  // const description = item?.[CONFIG.FIELDS.DESCRIPTION] ?? item?.description ?? '—';

  return (
    <Container className="py-3" style={{ maxWidth: '800px' }}>
      {/* 1. Header: [ Logo ... Date: dd/MM/yyyy ] */}
      <Header />

      {/* 2. Khung View Details */}
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
              {/* DÒNG 1: TÊN ĐỐI TƯỢNG */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_NAME}:
                </Col>
                <Col xs={7} className="fw-bold text-dark">
                  {name}
                </Col>
              </Row>

              {/* DÒNG 2: NHÀ SẢN XUẤT / HÃNG */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_MANUFACTURER}:
                </Col>
                <Col xs={7} className="text-dark">
                  {manufacturer}
                </Col>
              </Row>

              {/* DÒNG 3: LOẠI / DANH MỤC */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Type / {CONFIG.LABELS.COL_CATEGORY}:
                </Col>
                <Col xs={7} className="text-dark">
                  {category}
                </Col>
              </Row>

              {/* DÒNG 4: GIÁ TIỀN */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_PRICE}:
                </Col>
                <Col xs={7} className="text-dark fw-bold">
                  {price !== undefined ? Number(price).toLocaleString() : '—'}
                </Col>
              </Row>

              {/* DÒNG 5: NGÀY SẢN XUẤT */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_PROD_DATE}:
                </Col>
                <Col xs={7} className="text-dark">
                  {prodDate}
                </Col>
              </Row>

              {/* DÒNG 6: NGÀY NHẬP */}
              <Row className="mb-4">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.LABELS.COL_IMPORT_DATE}:
                </Col>
                <Col xs={7} className="text-dark">
                  {importDate}
                </Col>
              </Row>

              {/* -------------------------------------------------------------------- */}
              {/* 🔹 [ĐIỂM DỄ THAY ĐỔI 2]: THÊM DÒNG HIỂN THỊ MỚI VÀO ĐÂY NẾU ĐỀ YÊU CẦU */}
              {/* Copy khối Row mẫu dưới đây:                                         */}
              {/* -------------------------------------------------------------------- */}
              {/*
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Quantity:
                </Col>
                <Col xs={7} className="text-dark">
                  {quantity}
                </Col>
              </Row>
              */}

              {/* NÚT QUAY LẠI TRANG DANH SÁCH */}
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
