import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { CONFIG } from '../config';
import Header from '../components/Header';

/**
 * ====================================================================================
 * 📄 MÀN HÌNH XEM CHI TIẾT (DETAIL PAGE)
 * ------------------------------------------------------------------------------------
 * 💡 KHÔNG DÙNG VÒNG LẶP / MAP ĐỘNG:
 * Mọi thông tin được viết thẳng bằng từng thẻ <Row> <Col> trực tiếp bên dưới.
 * Muốn đổi tên nhãn, đổi trường dữ liệu hoặc GHÉP BIẾN (VD: priceFrom - priceTo),
 * bạn chỉ cần sửa trực tiếp vào thẻ tương ứng!
 * ====================================================================================
 */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm hỗ trợ format hiển thị ngày (dd/mm/yyyy) hoặc số tiền
  const formatDate = (val) => {
    if (!val) return '—';
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

  const formatNumber = (val) => {
    if (val === undefined || val === null || val === '') return '—';
    const num = Number(val);
    return isNaN(num) ? String(val) : num.toLocaleString();
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

  // Trích xuất các trường cơ bản từ item
  const itemName =
    item?.[CONFIG.FIELD_NAME] ||
    item?.name ||
    item?.shoesName ||
    item?.fullName ||
    item?.title ||
    '—';

  const categoryName =
    typeof item?.[CONFIG.FIELD_CATEGORY] === 'object'
      ? item?.[CONFIG.FIELD_CATEGORY]?.name || item?.[CONFIG.FIELD_CATEGORY]?.categoryName
      : item?.[CONFIG.FIELD_CATEGORY] ||
        item?.departmentName ||
        item?.categoryName ||
        item?.category ||
        '—';

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
            <div className="mx-auto" style={{ maxWidth: '550px' }}>
              {/* ================================================================ */}
              {/* CÁC DÒNG HIỂN THỊ VIẾT TƯỜNG MINH TRỰC TIẾP (DỄ SỬA / THÊM BỚT)  */}
              {/* ================================================================ */}

              {/* 1. TÊN ENTITY */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  {CONFIG.ENTITY_NAME} Name:
                </Col>
                <Col xs={7} className="fw-bold text-dark">
                  {itemName}
                </Col>
              </Row>

              {/* 2. CATEGORY / PHÒNG BAN */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Category:
                </Col>
                <Col xs={7} className="text-dark">
                  {categoryName}
                </Col>
              </Row>

              {/* 3. FIELD 1: HÃNG SX / POSITION / TÁC GIẢ */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Manufacturer:
                </Col>
                <Col xs={7} className="text-dark">
                  {item?.manufacturer || item?.position || item?.author || '—'}
                </Col>
              </Row>

              {/* 4. FIELD 2: GIÁ TIỀN / LƯƠNG */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Price (đ):
                </Col>
                <Col xs={7} className="text-dark">
                  {formatNumber(item?.price ?? item?.salary)}
                </Col>
              </Row>

              {/* 💡 5. VÍ DỤ GHÉP 2 BIẾN TỪ SERVER (priceFrom - priceTo) */}
              {/* Server gửi riêng priceFrom và priceTo nhưng bạn muốn hiển thị gộp: */}
              {(item?.priceFrom !== undefined || item?.priceTo !== undefined) && (
                <Row className="mb-2">
                  <Col xs={5} className="text-end fw-medium text-secondary">
                    Price Range (đ):
                  </Col>
                  <Col xs={7} className="text-dark fw-semibold text-primary">
                    {formatNumber(item?.priceFrom)} - {formatNumber(item?.priceTo)}
                  </Col>
                </Row>
              )}

              {/* 6. FIELD 3: NGÀY SẢN XUẤT / NGÀY SINH / START DATE */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Production Date:
                </Col>
                <Col xs={7} className="text-dark">
                  {formatDate(item?.productionDate || item?.dob || item?.startDate)}
                </Col>
              </Row>

              {/* 7. FIELD 4: NGÀY NHẬP / NGÀY HẾT HẠN */}
              <Row className="mb-2">
                <Col xs={5} className="text-end fw-medium text-secondary">
                  Import Date:
                </Col>
                <Col xs={7} className="text-dark">
                  {formatDate(item?.importDate || item?.endDate)}
                </Col>
              </Row>

              {/* 8. FIELD 5: MÔ TẢ / GHI CHÚ */}
              {item?.description && (
                <Row className="mb-2">
                  <Col xs={5} className="text-end fw-medium text-secondary">
                    Description:
                  </Col>
                  <Col xs={7} className="text-dark">
                    {item?.description}
                  </Col>
                </Row>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* NÚT QUAY LẠI                                                     */}
              {/* ---------------------------------------------------------------- */}
              <div className="text-center mt-4 pt-2">
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
