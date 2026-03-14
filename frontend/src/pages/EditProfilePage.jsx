import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/auth';

function EditProfilePage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    document: user?.document || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h2 style={{ color: '#8B4513' }} className="mb-4">Editar Perfil</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled // El email no se puede cambiar por ahora
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Documento</Form.Label>
                  <Form.Control
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  style={{ backgroundColor: '#8B4513' }}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditProfilePage;