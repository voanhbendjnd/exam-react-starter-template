/**
 * Form Đăng nhập sử dụng React-Bootstrap & React-Router-DOM
 * Tuân thủ quy tắc 3.2, 3.3 (Chỉ dùng React-Bootstrap, không dùng thư viện ngoài)
 */

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from './api';

export default function SimpleLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const token = res.token || res.accessToken || res.data?.token;
      if (token) {
        sessionStorage.setItem('token', token);
      }
      sessionStorage.setItem('user', JSON.stringify(res));

      if (onLoginSuccess) {
        onLoginSuccess(res);
      } else {
        navigate('/'); // Chuyển về trang CRUD bằng React-Router-DOM
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow border-0 p-4">
            <h4 className="text-center fw-bold text-primary mb-3">ĐĂNG NHẬP HỆ THỐNG</h4>

            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Email / Tên đăng nhập</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-bold"
                disabled={loading}
              >
                {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
