import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRooms } from '../../services/api';
import { createBooking } from '../../services/bookings';
import { useAuth } from '../../contexts/AuthContext';

function CreateBookingForGuestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const guest = location.state?.guest;
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    userId: guest?.id || ''
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      const data = await getRooms();
      setRooms(data.filter(r => r.status === 'available'));
      setLoading(false);
    };
    loadRooms();
  }, []);

  const handleRoomSelect = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    setSelectedRoom(room);
    setFormData({ ...formData, roomId });
  };

  const calculateTotal = () => {
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights * selectedRoom.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        roomId: parseInt(formData.roomId),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        userId: guest?.id // Solo se envía si es recepcionista
      };

      const result = await createBooking(bookingData);
      setSuccess('Reserva creada exitosamente');
      setTimeout(() => {
        navigate('/receptionist/bookings');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al crear reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (!['receptionist', 'admin'].includes(user?.role)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">No tienes permisos</Alert>
      </Container>
    );
  }

  if (!guest) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          No se ha seleccionado ningún huésped. 
          <Button variant="link" onClick={() => navigate('/receptionist/search')}>
            Buscar huésped
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 style={{ color: '#8B4513' }} className="mb-4">Crear Reserva para Huésped</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Huésped seleccionado:</h5>
          <p>
            <strong>Nombre:</strong> {guest.name}<br />
            <strong>Email:</strong> {guest.email}<br />
            <strong>Documento:</strong> {guest.document || 'N/A'}
          </p>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Habitación</Form.Label>
                  <Form.Select 
                    value={formData.roomId} 
                    onChange={(e) => handleRoomSelect(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una habitación</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.type} #{room.number} - {room.capacity} pers - 
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha entrada</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha salida</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Huéspedes</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 4}
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio por noche</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedRoom ? `$${selectedRoom.price.toLocateString()} COP` : ''}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Total estimado</Form.Label>
                  <Form.Control
                    type="text"
                    value={calculateTotal() ? `$${calculateTotal().toLocateString()} COP` : ''}
                    disabled
                    style={{ fontWeight: 'bold', color: '#8B4513' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button 
                type="submit"
                style={{ backgroundColor: '#8B4513' }}
                disabled={submitting}
              >
                {submitting ? 'Creando...' : 'Crear Reserva'}
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/receptionist/search')}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CreateBookingForGuestPage;