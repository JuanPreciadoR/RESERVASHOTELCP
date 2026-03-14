import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { getBookingById } from '../../services/bookings';

function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la reserva');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

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

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando detalles de la reserva...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h2 style={{ color: '#8B4513' }}>Reserva #{booking.id}</h2>
                {getStatusBadge(booking.status)}
              </div>

              <Row>
                <Col md={6}>
                  <h5>Habitación</h5>
                  <p>
                    <strong>{booking.room?.type} #{booking.room?.number}</strong><br />
                    Piso {booking.room?.floor}<br />
                    Capacidad: {booking.room?.capacity} personas
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Fechas</h5>
                  <p>
                    <strong>Entrada:</strong> {new Date(booking.checkIn).toLocaleDateString()}<br />
                    <strong>Salida:</strong> {new Date(booking.checkOut).toLocaleDateString()}<br />
                    <strong>Huéspedes:</strong> {booking.guests}
                  </p>
                </Col>
              </Row>

              <hr />

              <Row>
                <Col md={6}>
                  <h5>Información del huésped</h5>
                  <p>
                    <strong>Nombre:</strong> {booking.user?.name}<br />
                    <strong>Email:</strong> {booking.user?.email}<br />
                    <strong>Documento:</strong> {booking.user?.document || 'N/A'}<br />
                    <strong>Teléfono:</strong> {booking.user?.phone || 'N/A'}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Facturación</h5>
                  {booking.invoice ? (
                    <div>
                      <p>
                        <strong>Subtotal:</strong>  COP<br />
                        <strong>IVA (19%):</strong>  COP<br />
                        <strong className="h5">Total:  COP</strong><br />
                        <small>Factura #{booking.invoice.id}</small>
                      </p>
                      <Button variant="outline-primary" size="sm">
                        Descargar PDF
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted">Factura no disponible</p>
                  )}
                </Col>
              </Row>

              <div className="mt-4 text-center">
                <Button as={Link} to="/my-bookings" variant="secondary">
                  Volver a mis reservas
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BookingDetailPage;