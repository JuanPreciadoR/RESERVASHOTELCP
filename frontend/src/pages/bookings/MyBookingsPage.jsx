import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/bookings';
import { useAuth } from '../../contexts/AuthContext';

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const { isAuthenticated } = useAuth();

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    setCancelling(id);
    try {
      await cancelBooking(id);
      // Recargar la lista
      await loadBookings();
    } catch (err) {
      setError(err.message || 'Error al cancelar reserva');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      checked_in: 'primary',
      checked_out: 'secondary',
      cancelled: 'danger'
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      checked_in: 'Check-in realizado',
      checked_out: 'Finalizada',
      cancelled: 'Cancelada'
    };
    return <Badge bg={colors[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="warning">
          Debes iniciar sesión para ver tus reservas.
          <div className="mt-3">
            <Button as={Link} to="/login" variant="primary" style={{ backgroundColor: '#8B4513' }}>
              Iniciar Sesión
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando tus reservas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#8B4513' }} className="mb-4">Mis Reservas</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {bookings.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p className="mb-3">No tienes reservas aún.</p>
            <Button as={Link} to="/rooms" variant="primary" style={{ backgroundColor: '#8B4513' }}>
              Ver habitaciones disponibles
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={6} lg={4} key={booking.id} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title style={{ color: '#8B4513' }}>
                      {booking.room?.type} #{booking.room?.number}
                    </Card.Title>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <Card.Subtitle className="mb-2 text-muted">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </Card.Subtitle>
                  
                  <Card.Text>
                    <strong>Huéspedes:</strong> {booking.guests}<br />
                    <strong>Total:</strong>  COP
                  </Card.Text>
                  
                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={/my-bookings/}
                      variant="outline-primary"
                      size="sm"
                    >
                      Ver detalle
                    </Button>
                    
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? 'Cancelando...' : 'Cancelar'}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MyBookingsPage;