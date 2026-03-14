import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import RoomList from '../components/RoomList';

function HomePage() {
  return (
    <Container className="mt-4">
      {/* Hero section */}
      <Row className="mb-5 text-center">
        <Col>
          <h1 style={{ color: '#8B4513' }}>Hotel Casa Preciado</h1>
          <p className="lead">Tu refugio de lujo en la ciudad</p>
        </Col>
      </Row>

      {/* Buscador rápido (por ahora solo decorativo) */}
      <Row className="mb-5 justify-content-center">
        <Col md={8}>
          <Form className="d-flex gap-2">
            <Form.Control type="date" placeholder="Check-in" />
            <Form.Control type="date" placeholder="Check-out" />
            <Form.Control type="number" placeholder="Huéspedes" min="1" max="4" />
            <Button variant="primary" style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}>
              Buscar
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Lista de habitaciones */}
      <Row>
        <Col>          
          <RoomList />
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;