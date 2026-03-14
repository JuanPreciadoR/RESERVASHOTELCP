import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { searchGuests } from '../../services/admin';

function SearchGuestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const results = await searchGuests(query);
      setGuests(results);
    } catch (err) {
      setError(err.message || 'Error al buscar huéspedes');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleCreateBooking = (guest) => {
    navigate('/receptionist/create-booking', { state: { guest } });
  };

  if (!['receptionist', 'admin'].includes(user?.role)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">No tienes permisos para acceder a esta página.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#8B4513' }} className="mb-4">Buscar Huéspedes</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={10}>
                <Form.Group>
                  <Form.Label>Buscar por nombre, email o documento</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Carlos, 123456, carlos@email.com"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  type="submit" 
                  style={{ backgroundColor: '#8B4513' }}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {searched && !loading && (
        <Card>
          <Card.Body>
            <h5>Resultados ({guests.length})</h5>
            {guests.length === 0 ? (
              <p className="text-muted">No se encontraron huéspedes</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map(guest => (
                    <tr key={guest.id}>
                      <td>{guest.id}</td>
                      <td>{guest.name}</td>
                      <td>{guest.email}</td>
                      <td>{guest.document || '-'}</td>
                      <td>{guest.phone || '-'}</td>
                      <td>
                        <Button 
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleCreateBooking(guest)}
                        >
                          Crear reserva
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default SearchGuestsPage;