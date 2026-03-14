import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRooms } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function RoomTypePage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const typeInfo = {
    estandar: {
      title: 'Habitaciones Estándar',
      description: 'Disfruta de la comodidad y funcionalidad en nuestras habitaciones estándar. Ideales para viajeros que buscan calidad y buen precio.',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#8B4513'
    },
    suite: {
      title: 'Suites de Lujo',
      description: 'Experimenta el lujo y la exclusividad en nuestras suites. Cada una cuenta con acabados premium y vistas espectaculares.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#DAA520'
    },
    familiar: {
      title: 'Habitaciones Familiares',
      description: 'Crea recuerdos inolvidables en nuestras espaciosas habitaciones familiares, diseñadas pensando en la comodidad de todos.',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#2E8B57'
    }
  };

  useEffect(() => {
    const loadRooms = async () => {
      const allRooms = await getRooms();
      const filteredRooms = allRooms.filter(r => r.type === type);
      setRooms(filteredRooms);
      setLoading(false);
    };
    loadRooms();
  }, [type]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleBooking = () => {
    if (!selectedRoom) {
      alert('Por favor selecciona una habitación');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/type/${type}` } });
      return;
    }

    navigate(`/rooms/${selectedRoom.id}`, {
      state: {
        checkIn,
        checkOut,
        guests
      }
    });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: '#8B4513' }} />
        <p>Cargando habitaciones...</p>
      </Container>
    );
  }

  const info = typeInfo[type] || {
    title: 'Habitaciones',
    description: '',
    image: '',
    color: '#8B4513'
  };

  return (
    <Container className="mt-5">
      {/* Encabezado del tipo */}
      <div 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${info.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '4rem 2rem',
          borderRadius: '10px',
          color: 'white',
          marginBottom: '3rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{info.title}</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>{info.description}</p>
      </div>

      {/* Buscador rápido */}
      <Card className="mb-4 p-4">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Fecha de entrada</Form.Label>
              <Form.Control
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Fecha de salida</Form.Label>
              <Form.Control
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Huéspedes</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="4"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button 
              variant="primary"
              style={{ backgroundColor: info.color, borderColor: info.color }}
              className="w-100"
              onClick={handleBooking}
              disabled={!selectedRoom}
            >
              {selectedRoom ? `Reservar habitación ${selectedRoom.number}` : 'Selecciona una habitación'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Lista de habitaciones disponibles */}
      <h2 className="mb-4">Habitaciones disponibles</h2>
      <Row>
        {rooms.map(room => (
          <Col md={6} lg={4} key={room.id} className="mb-4">
            <Card 
              className={`h-100 shadow-sm ${selectedRoom?.id === room.id ? 'border border-3' : ''}`}
              style={{ cursor: 'pointer', borderColor: selectedRoom?.id === room.id ? info.color : '' }}
              onClick={() => handleSelectRoom(room)}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title style={{ color: info.color }}>
                    Habitación #{room.number}
                  </Card.Title>
                  {room.status === 'available' ? (
                    <Badge bg="success">Disponible</Badge>
                  ) : (
                    <Badge bg="danger">No disponible</Badge>
                  )}
                </div>
                <Card.Text>
                  <strong>Piso:</strong> {room.floor}<br />
                  <strong>Capacidad:</strong> {room.capacity} personas<br />
                  <strong>Precio:</strong> ${room.price.toLocaleString()} COP/noche
                </Card.Text>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    style={{ color: info.color, borderColor: info.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/rooms/${room.id}`);
                    }}
                  >
                    Ver detalle
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default RoomTypePage;