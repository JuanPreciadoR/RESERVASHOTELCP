import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Badge, Form, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBookings } from '../../services/admin';
import { checkIn, checkOut } from '../../services/bookings';

function AllBookingsPage() {
  const { user } = useAuth();
  console.log('Usuario en AllBookingsPage:', user); // ← DEPURACIÓN
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('Intentando cargar reservas con usuario:', user); // ← DEPURACIÓN
      const data = await getAllBookings(filters);
      setBookings(data);
    } catch (err) {
      console.error('Error detallado:', err); // ← DEPURACIÓN
      setError(err.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]); // Dependencia en user para recargar cuando cambie

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    loadBookings();
  };

  const openActionModal = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowModal(true);
  };

  const handleAction = async () => {
    if (!selectedBooking) return;
    
    setProcessing(true);
    try {
      if (actionType === 'checkin') {
        await checkIn(selectedBooking.id);
      } else {
        await checkOut(selectedBooking.id);
      }
      await loadBookings();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Error al procesar acción');
    } finally {
      setProcessing(false);
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
      checked_in: 'Check-in',
      checked_out: 'Check-out',
      cancelled: 'Cancelada'
    };
    return <Badge bg={colors[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Cargando información de usuario...
        </Alert>
      </Container>
    );
  }

  if (!['receptionist', 'admin'].includes(user?.role)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          No tienes permisos para acceder a esta página. Tu rol es: {user?.role}
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando reservas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4" fluid>
      <h2 style={{ color: '#8B4513' }} className="mb-4">Gestión de Reservas - Recepción</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Check-out</option>
                  <option value="cancelled">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha desde</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha hasta</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" style={{ backgroundColor: '#8B4513' }} onClick={applyFilters}>
                Aplicar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Huéspedes</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    {booking.user?.name}<br />
                    <small className="text-muted">{booking.user?.email}</small>
                  </td>
                  <td>{booking.room?.type} #{booking.room?.number}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>{booking.guests}</td>
                  <td></td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="success"
                        className="me-1"
                        onClick={() => openActionModal(booking, 'checkin')}
                      >
                        Check-in
                      </Button>
                    )}
                    {booking.status === 'checked_in' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openActionModal(booking, 'checkout')}
                      >
                        Check-out
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#8B4513' }}>
            {actionType === 'checkin' ? 'Confirmar Check-in' : 'Confirmar Check-out'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <p>¿Estás seguro de realizar el {actionType === 'checkin' ? 'check-in' : 'check-out'} de esta reserva?</p>
              <p>
                <strong>Huésped:</strong> {selectedBooking.user?.name}<br />
                <strong>Habitación:</strong> {selectedBooking.room?.type} #{selectedBooking.room?.number}<br />
                <strong>Fechas:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()} - {new Date(selectedBooking.checkOut).toLocaleDateString()}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant={actionType === 'checkin' ? 'success' : 'primary'}
            onClick={handleAction}
            disabled={processing}
          >
            {processing ? 'Procesando...' : (actionType === 'checkin' ? 'Confirmar Check-in' : 'Confirmar Check-out')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AllBookingsPage;