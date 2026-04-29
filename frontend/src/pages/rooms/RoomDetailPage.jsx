import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById } from '../../services/api';
import { createBooking } from '../../services/bookings';
import { useAuth } from '../../contexts/AuthContext';

function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado del formulario de reserva
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Cargar datos de la habitación
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await getRoomById(id);
        setRoom(data);
        setGuests(1);
      } catch (err) {
        setError('Error al cargar la habitación');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  // Manejar reserva
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    // Validar fechas
    if (!checkIn || !checkOut) {
      setBookingError('Debes seleccionar fechas de entrada y salida');
      return;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) {
      setBookingError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    if (guests < 1 || guests > room.capacity) {
      setBookingError(`Número de huéspedes inválido. Máximo: ${room.capacity}`);
      return;
    }

    // Verificar autenticación
    if (!isAuthenticated) {
      navigate('/login', { state: { from: /rooms/ } });
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        roomId: room.id,
        checkIn,
        checkOut,
        guests
      };
      
      await createBooking(bookingData);
      setBookingSuccess('¡Reserva creada exitosamente!');
      
      // Redirigir al detalle de la reserva después de 2 segundos
      setTimeout(() => {
        navigate(/my-bookings/);
      }, 2000);
      
    } catch (err) {
      setBookingError(err.message || 'Error al crear la reserva');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando habitación...</p>
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
      <Row>
        <Col md={7}>
          <Card>
            <Card.Body>
              <Card.Title style={{ color: '#8B4513', fontSize: '2rem' }}>
                {room.type} - #{room.number}
              </Card.Title>
              <Card.Subtitle className="mb-3 text-muted">
                Piso {room.floor} • Capacidad: {room.capacity} personas
              </Card.Subtitle>
              <Card.Text>
                <strong>Precio por noche:</strong>  COP
              </Card.Text>
              <Card.Text>{room.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card>
            <Card.Body>
              <Card.Title style={{ color: '#8B4513' }}>Reservar ahora</Card.Title>
              
              {bookingError && <Alert variant="danger">{bookingError}</Alert>}
              {bookingSuccess && <Alert variant="success">{bookingSuccess}</Alert>}
              
              <Form onSubmit={handleBooking}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de entrada</Form.Label>
                  <Form.Control
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fecha de salida</Form.Label>
                  <Form.Control
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Número de huéspedes</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={room.capacity}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    required
                  />
                  <Form.Text className="text-muted">
                    Máximo: {room.capacity} personas
                  </Form.Text>
                </Form.Group>

                {checkIn && checkOut && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <strong>Total estimado:</strong>
                    <h3 style={{ color: '#8B4513' }}>
                       COP
                    </h3>
                    <small>Por {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} noches</small>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  style={{ backgroundColor: '#8B4513', borderColor: '#8B4513' }}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Procesando...' : 'Reservar ahora'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RoomDetailPage;