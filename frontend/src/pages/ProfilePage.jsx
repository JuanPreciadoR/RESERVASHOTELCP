import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function ProfilePage() {
  // TODO: Obtener datos del usuario desde el contexto de autenticación
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h2 className="mb-4" style={{ color: '#8B4513' }}>Mi Perfil</h2>
              <p className="text-muted">Página en construcción - Próximamente</p>
              <p>Aquí verás tus datos personales y podrás editarlos.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;